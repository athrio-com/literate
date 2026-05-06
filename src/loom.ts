import { readFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import type { Plugin } from "vite"
import { Effect, pipe } from "effect"
import { Code } from "./core"

// ── AST Types ─────────────────────────────────────────────────────────────

export interface Span {
  readonly start: number
  readonly end: number
}

export interface Diagnostic {
  readonly message: string
  readonly span: Span
}

export type Block = ProseBlock | CodeBlock | FencedBlock | DirectiveBlock

export interface ProseBlock {
  readonly kind: "prose"
  readonly content: string
  readonly span: Span
}

export interface CodeBlock {
  readonly kind: "code"
  readonly language: string
  readonly content: string
  readonly span: Span
}

export interface FencedBlock {
  readonly kind: "fenced"
  readonly language: string | null
  readonly content: string
  readonly contentStart: number
  readonly span: Span
}

// ── Directives ───────────────────────────────────────────────────────────
// Loom markers inside code areas — recognised by the Loom system, not
// passed to the language server. [lang] switches and {{Tag as label}}
// transclusions belong to this category.

export type Directive =
  | { readonly kind: "transclusion"; readonly ref: string; readonly span: Span }

export interface DirectiveBlock {
  readonly kind: "directive"
  readonly directive: Directive
  readonly span: Span
}

export interface Param {
  readonly name: string
  readonly type: string
  readonly defaultValue: string | null
  readonly span: Span
  readonly nameSpan: Span
  readonly typeSpan: Span
}

// ── Content Sections ──────────────────────────────────────────────────────

interface SectionBase {
  readonly heading: string
  readonly headingSpan: Span
  readonly headingLevel: number
  readonly index: number
  readonly span: Span
  readonly blocks: ReadonlyArray<Block>
}

export interface UntaggedSection extends SectionBase {
  readonly kind: "untagged"
}

export interface TaggedSection extends SectionBase {
  readonly kind: "tagged"
  readonly tag: string
  readonly tagSpan: Span
  readonly params: ReadonlyArray<Param>
}

export type Section = UntaggedSection | TaggedSection

// ── Reserved: Tangle ──────────────────────────────────────────────────────

export interface TangleSection {
  readonly kind: "tangle"
  readonly tag: string
  readonly tagSpan: Span
  readonly path: string
  readonly pathSpan: Span
  readonly heading: string
  readonly headingSpan: Span
  readonly headingLevel: number
  readonly span: Span
  readonly blocks: ReadonlyArray<Block>
}

// ── Reserved: Dependencies ──────────────────────────────────────────────────────

export interface DependenciesSection {
  readonly kind: "dependencies"
  readonly span: Span
  readonly heading: string
  readonly headingSpan: Span
  readonly headingLevel: number
  readonly tag: string
  readonly tagSpan: Span
  readonly blocks: ReadonlyArray<Block>
}

// ── Reserved: Free (Loom) ─────────────────────────────────────────────────

export interface FreeSection {
  readonly kind: "free"
  readonly span: Span
  readonly heading: string
  readonly headingLevel: number
  readonly blocks: ReadonlyArray<Block>
}

// ── Document ──────────────────────────────────────────────────────────────

export interface LoomDocument {
  readonly serviceName: string | null
  readonly serviceNameSpan: Span | null
  readonly language: string
  readonly sections: ReadonlyArray<Section>
  readonly tangles: ReadonlyArray<TangleSection>
  readonly deps: DependenciesSection | null
  readonly free: FreeSection | null
  readonly diagnostics: ReadonlyArray<Diagnostic>
}

// ── Parser ────────────────────────────────────────────────────────────────

const BRACKET_RE = /^\[([^\]]+)\]\s*$/
const HEADING_BRACKET_RE = /^(#{1,6})\s+(.+?)\s+\[([^\]]*)\]\s*$/
const HEADING_UNCLOSED_RE = /^(#{1,6})\s+(.+?)\s+\[([^\]]*)\s*$/
const HEADING_RE = /^(#{1,6})\s+(.+?)\s*$/
const FENCE_OPEN_RE = /^```(\w*)\s*$/
const FENCE_CLOSE_RE = /^```\s*$/
const INDENTED_BRACKET_RE = /^\s+\[(\w+)\]\s*$/
const TEMPLATE_PARAM_RE =
  /\{\{(\w+):\s*([^=}]+?)(?:\s*=\s*([^}]+?))?\}\}/g
const TRANSCLUSION_RE = /\{\{([^}:]+)\}\}/g
const TRANSCLUSION_LINE_RE = /^\s*\{\{([^}:]+)\}\}\s*$/

const TS_IDENT_RE = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/

const RESERVED_HEADINGS: Record<string, true> = { Tangle: true }

function extractTemplateParams(blocks: ReadonlyArray<Block>): Param[] {
  const seen = new Map<string, Param>()
  for (const block of blocks) {
    if (block.kind !== "code") continue
    let m: RegExpExecArray | null
    const re = new RegExp(TEMPLATE_PARAM_RE.source, "gd")
    while ((m = re.exec(block.content)) !== null) {
      if (!seen.has(m[1])) {
        const indices = (m as RegExpExecArray & { indices: number[][] }).indices
        const base = block.span.start
        const nameStart = base + indices[1][0]
        const nameEnd = base + indices[1][1]
        const typeStart = base + indices[2][0]
        const typeEnd = base + indices[2][1]
        seen.set(m[1], {
          name: m[1],
          type: m[2].trim(),
          defaultValue: m[3]?.trim() ?? null,
          span: {
            start: base + m.index,
            end: base + m.index + m[0].length,
          },
          nameSpan: { start: nameStart, end: nameEnd },
          typeSpan: { start: typeStart, end: typeEnd },
        })
      }
    }
  }
  return [...seen.values()]
}

function parseImpl(source: string): LoomDocument {
  const lines = source.split(/\r?\n/)
  let cursor = 0

  let serviceName: string | null = null
  let serviceNameSpan: Span | null = null
  let language = ""
  const sections: Section[] = []
  const tangles: TangleSection[] = []
  let depsSection: DependenciesSection | null = null
  let freeSection: FreeSection | null = null
  const diagnostics: Diagnostic[] = []

  type Mode = "top" | "section" | "tangle" | "deps" | "free" | "fenced"
  let mode: Mode = "top"
  let sectionIndex = 0

  let sectionHeading = ""
  let sectionHeadingSpan: Span = { start: 0, end: 0 }
  let sectionLevel = 0
  let sectionStart = 0
  let sectionTag: string | null = null
  let sectionTagSpan: Span | null = null
  let sectionBlocks: Block[] = []
  let sectionOpen = false

  let tangleHeading = ""
  let tangleHeadingSpan: Span = { start: 0, end: 0 }
  let tangleLevel = 0
  let tangleTag = ""
  let tangleTagSpan: Span = { start: 0, end: 0 }
  let tanglePath = ""
  let tanglePathSpan: Span = { start: 0, end: 0 }
  let tangleStart = 0
  let tangleBlocks: Block[] = []
  let tangleOpen = false

  let depsHeading = ""
  let depsHeadingSpan: Span = { start: 0, end: 0 }
  let depsTag = ""
  let depsTagSpan: Span = { start: 0, end: 0 }
  let depsLevel = 0
  let depsStart = 0
  let depsBlocks: Block[] = []
  let depsOpen = false

  let freeHeading = ""
  let freeLevel = 0
  let freeStart = 0
  let freeBlocks: Block[] = []
  let freeOpen = false

  let fenceLanguage: string | null = null
  let fenceContent = ""
  let fenceStart = 0
  let fenceContentStart = 0
  let preFenceMode: Mode = "top"

  let codeLines: string[] = []
  let codeStartOffset = 0
  let codeEndOffset = 0
  let codeLanguage = ""

  let proseLines: string[] = []
  let proseStartOffset = 0
  let proseEndOffset = 0

  function pushBlock(block: Block) {
    if (tangleOpen) tangleBlocks.push(block)
    else if (depsOpen) depsBlocks.push(block)
    else if (freeOpen) freeBlocks.push(block)
    else if (sectionOpen) sectionBlocks.push(block)
  }

  function flushCode() {
    if (codeLines.length === 0) return
    while (codeLines.length > 0 && codeLines[codeLines.length - 1] === "")
      codeLines.pop()
    if (codeLines.length === 0) return
    pushBlock({
      kind: "code",
      language: codeLanguage,
      content: codeLines.join("\n"),
      span: { start: codeStartOffset, end: codeEndOffset },
    })
    codeLines = []
  }

  function flushProse() {
    if (proseLines.length === 0) return
    pushBlock({
      kind: "prose",
      content: proseLines.join("\n"),
      span: { start: proseStartOffset, end: proseEndOffset },
    })
    proseLines = []
  }

  function bufferCode(line: string, start: number, end: number) {
    flushProse()
    if (codeLines.length === 0) codeStartOffset = start
    codeLines.push(line)
    codeEndOffset = end
  }

  function bufferProse(line: string, start: number, end: number) {
    flushCode()
    codeLanguage = language
    if (proseLines.length === 0) proseStartOffset = start
    proseLines.push(line)
    proseEndOffset = end
  }

  function finishCurrent(endOffset: number) {
    flushCode()
    flushProse()

    if (sectionOpen) {
      const idx = ++sectionIndex
      const span: Span = { start: sectionStart, end: endOffset }

      if (!language && sectionTag !== null && sectionTagSpan !== null) {
        language = sectionTag.toLowerCase()
        codeLanguage = language
        serviceName = sectionHeading
        serviceNameSpan = sectionHeadingSpan
      } else if (sectionTag !== null && sectionTagSpan !== null) {
        if (!TS_IDENT_RE.test(sectionTag)) {
          diagnostics.push({
            message: `Tag "${sectionTag}" is not a valid identifier`,
            span: sectionTagSpan,
          })
        }
        if (sectionHeading in RESERVED_HEADINGS) {
          diagnostics.push({
            message: `"${sectionHeading}" is a reserved heading name`,
            span: sectionTagSpan,
          })
        }
        const params = extractTemplateParams(sectionBlocks)
        sections.push({
          kind: "tagged",
          heading: sectionHeading,
          headingSpan: sectionHeadingSpan,
          headingLevel: sectionLevel,
          index: idx,
          span,
          blocks: sectionBlocks,
          tag: sectionTag,
          tagSpan: sectionTagSpan,
          params,
        })
      } else {
        sections.push({
          kind: "untagged",
          heading: sectionHeading,
          headingSpan: sectionHeadingSpan,
          headingLevel: sectionLevel,
          index: idx,
          span,
          blocks: sectionBlocks,
        })
      }
      sectionOpen = false
      sectionBlocks = []
    }

    if (tangleOpen) {
      tangles.push({
        kind: "tangle",
        tag: tangleTag,
        tagSpan: tangleTagSpan,
        path: tanglePath,
        pathSpan: tanglePathSpan,
        heading: tangleHeading,
        headingSpan: tangleHeadingSpan,
        headingLevel: tangleLevel,
        span: { start: tangleStart, end: endOffset },
        blocks: tangleBlocks,
      })
      tangleOpen = false
      tangleBlocks = []
    }

    if (depsOpen) {
      if (depsSection !== null) {
        diagnostics.push({
          message: "Multiple Dependencies sections — only one is allowed",
          span: { start: depsStart, end: endOffset },
        })
      } else {
        depsSection = {
          kind: "dependencies",
          heading: depsHeading,
          headingSpan: depsHeadingSpan,
          tag: depsTag,
          tagSpan: depsTagSpan,
          headingLevel: depsLevel,
          span: { start: depsStart, end: endOffset },
          blocks: depsBlocks,
        }
      }
      depsOpen = false
      depsBlocks = []
    }

    if (freeOpen) {
      if (freeSection !== null) {
        diagnostics.push({
          message: "Multiple Free sections — only one is allowed",
          span: { start: freeStart, end: endOffset },
        })
      } else {
        freeSection = {
          kind: "free",
          heading: freeHeading,
          headingLevel: freeLevel,
          span: { start: freeStart, end: endOffset },
          blocks: freeBlocks,
        }
      }
      freeOpen = false
      freeBlocks = []
    }
  }

  function openSection(
    heading: string,
    headingSpan: Span,
    level: number,
    start: number,
    tag: string | null,
    tagSpan: Span | null,
  ) {
    finishCurrent(start)
    sectionHeading = heading
    sectionHeadingSpan = headingSpan
    sectionLevel = level
    sectionStart = start
    sectionTag = tag
    sectionTagSpan = tagSpan
    sectionBlocks = []
    sectionOpen = true
    codeLanguage = language
    mode = "section"
  }

  function openTangle(
    heading: string,
    headingSpan: Span,
    level: number,
    start: number,
    tag: string,
    path: string,
    tSpan: Span,
    pSpan: Span,
  ) {
    finishCurrent(start)
    tangleHeading = heading
    tangleHeadingSpan = headingSpan
    tangleLevel = level
    tangleStart = start
    tangleTag = tag
    tangleTagSpan = tSpan
    tanglePath = path
    tanglePathSpan = pSpan
    tangleBlocks = []
    tangleOpen = true
    codeLanguage = language
    mode = "tangle"
  }

  function openDeps(heading: string, headingSpan: Span, tag: string, tagSpan: Span, level: number, start: number) {
    finishCurrent(start)
    depsHeading = heading
    depsHeadingSpan = headingSpan
    depsTag = tag
    depsTagSpan = tagSpan
    depsLevel = level
    depsStart = start
    depsBlocks = []
    depsOpen = true
    codeLanguage = language
    mode = "deps"
  }

  function openFree(heading: string, level: number, start: number) {
    finishCurrent(start)
    freeHeading = heading
    freeLevel = level
    freeStart = start
    freeBlocks = []
    freeOpen = true
    mode = "free"
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineStart = cursor
    const lineEnd = cursor + line.length
    cursor = lineEnd + 1

    // ── fenced block ──────────────────────────────────────────────
    if (mode === "fenced") {
      if (FENCE_CLOSE_RE.test(line)) {
        pushBlock({
          kind: "fenced",
          language: fenceLanguage,
          content: fenceContent,
          contentStart: fenceContentStart,
          span: { start: fenceStart, end: lineEnd },
        })
        fenceContent = ""
        mode = preFenceMode
      } else {
        fenceContent += (fenceContent ? "\n" : "") + line
      }
      continue
    }

    const fenceMatch = line.match(FENCE_OPEN_RE)
    if (fenceMatch) {
      flushCode()
      flushProse()
      fenceLanguage = fenceMatch[1] || null
      fenceStart = lineStart
      fenceContentStart = lineEnd + 1
      fenceContent = ""
      preFenceMode = mode
      mode = "fenced"
      continue
    }

    // ── top-level brackets ────────────────────────────────────────
    // Convenience: [language] at file top sets the dominant language
    // without a title H-function. serviceName stays null.
    const bracketMatch = line.match(BRACKET_RE)
    if (bracketMatch && mode === "top") {
      const raw = bracketMatch[1].trim()
      if (!language) {
        language = raw.toLowerCase()
        codeLanguage = language
      }
      continue
    }

    // ── headings with brackets ────────────────────────────────────
    const bracketHeading = line.match(HEADING_BRACKET_RE)
    if (bracketHeading) {
      const level = bracketHeading[1].length
      const heading = bracketHeading[2]
      const bracket = bracketHeading[3].trim()
      const bracketStart = line.lastIndexOf("[")
      const bracketContentStart = lineStart + bracketStart + 1
      const hOff = lineStart + line.indexOf(heading, level)
      const hSpan: Span = { start: hOff, end: hOff + heading.length }

      if (bracket === "") {
        diagnostics.push({
          message: "Empty brackets in heading — provide a tag name [Tag]",
          span: { start: lineStart + bracketStart, end: lineEnd },
        })
        openSection(heading, hSpan, level, lineStart, null, null)
        continue
      }

      if (heading === "Tangle") {
        const commaIdx = bracket.indexOf(",")
        if (commaIdx < 0) {
          diagnostics.push({
            message: "Tangle bracket requires [Tag, path] — missing comma",
            span: { start: bracketContentStart, end: bracketContentStart + bracket.length },
          })
          const pathSpan: Span = {
            start: bracketContentStart,
            end: bracketContentStart + bracket.length,
          }
          openTangle(heading, hSpan, level, lineStart, bracket, bracket, pathSpan, pathSpan)
          continue
        }
        const tangleTag = bracket.substring(0, commaIdx).trim()
        const tanglePath = bracket.substring(commaIdx + 1).trim()
        const tagStart = bracketContentStart + bracket.indexOf(tangleTag)
        const tagSpan: Span = { start: tagStart, end: tagStart + tangleTag.length }
        const pathStart = bracketContentStart + bracket.indexOf(tanglePath, commaIdx)
        const pathSpan: Span = { start: pathStart, end: pathStart + tanglePath.length }
        if (!TS_IDENT_RE.test(tangleTag)) {
          diagnostics.push({
            message: `Tangle tag "${tangleTag}" is not a valid identifier`,
            span: tagSpan,
          })
        }
        openTangle(heading, hSpan, level, lineStart, tangleTag, tanglePath, tagSpan, pathSpan)
        continue
      }

      if (bracket === "Dependencies") {
        const tagSpan: Span = { start: bracketContentStart, end: bracketContentStart + bracket.length }
        openDeps(heading, hSpan, bracket, tagSpan, level, lineStart)
        continue
      }

      if (bracket === "Loom") {
        openFree(heading, level, lineStart)
        continue
      }

      if (heading === "Loom") {
        diagnostics.push({
          message: `Unknown Loom reserved tag "${bracket}" — expected Dependencies or Loom`,
          span: { start: bracketContentStart, end: bracketContentStart + bracket.length },
        })
        openSection(heading, hSpan, level, lineStart, bracket, {
          start: bracketContentStart,
          end: bracketContentStart + bracket.length,
        })
        continue
      }

      const tagSpan: Span = {
        start: bracketContentStart,
        end: bracketContentStart + bracket.length,
      }

      openSection(heading, hSpan, level, lineStart, bracket, tagSpan)
      continue
    }

    // ── unclosed bracket headings ─────────────────────────────────
    const unclosedHeading = line.match(HEADING_UNCLOSED_RE)
    if (unclosedHeading) {
      const level = unclosedHeading[1].length
      const heading = unclosedHeading[2]
      const bracket = unclosedHeading[3].trim()
      const bracketPos = line.lastIndexOf("[")
      const bracketContentStart = lineStart + bracketPos + 1
      const hOff = lineStart + line.indexOf(heading, level)
      const hSpan: Span = { start: hOff, end: hOff + heading.length }

      diagnostics.push({
        message: "Unclosed bracket in heading — missing ]",
        span: { start: lineStart + bracketPos, end: lineEnd },
      })

      const tagSpan: Span | null = bracket
        ? { start: bracketContentStart, end: bracketContentStart + bracket.length }
        : null

      openSection(heading, hSpan, level, lineStart, bracket || null, tagSpan)
      continue
    }

    // ── plain headings ────────────────────────────────────────────
    const headingMatch = line.match(HEADING_RE)
    if (headingMatch) {
      const heading = headingMatch[2]
      const level = headingMatch[1].length
      const hOff = lineStart + line.indexOf(heading, level)
      const hSpan: Span = { start: hOff, end: hOff + heading.length }
      if (heading === "Tangle") {
        diagnostics.push({
          message: "Tangle requires [Tag, path] — use # Tangle [IndexTs, src/index.ts]",
          span: { start: lineStart, end: lineEnd },
        })
      }
      openSection(heading, hSpan, level, lineStart, null, null)
      continue
    }

    // ── blank lines ───────────────────────────────────────────────
    if (line.trim() === "") {
      if (codeLines.length > 0) {
        codeLines.push("")
        codeEndOffset = lineEnd
      } else {
        flushProse()
      }
      continue
    }

    // ── tangle / deps body ──────────────────────────────────────────
    if (((mode as string) === "tangle" && tangleOpen) ||
        ((mode as string) === "deps" && depsOpen)) {
      if (/^\s+/.test(line)) {
        const langSwitch = line.match(INDENTED_BRACKET_RE)
        if (langSwitch) {
          flushCode()
          codeLanguage = langSwitch[1].toLowerCase()
          continue
        }
        const transclusionMatch = line.match(TRANSCLUSION_LINE_RE)
        if (transclusionMatch) {
          flushCode()
          const ref = transclusionMatch[1].trim()
          const innerStart = lineStart + line.indexOf("{{") + 2
          const innerEnd = lineStart + line.lastIndexOf("}}")
          pushBlock({
            kind: "directive",
            directive: {
              kind: "transclusion",
              ref,
              span: { start: innerStart, end: innerEnd },
            },
            span: { start: lineStart, end: lineEnd },
          })
          continue
        }
        bufferCode(line, lineStart, lineEnd)
      } else {
        bufferProse(line, lineStart, lineEnd)
      }
      continue
    }

    // ── free body ─────────────────────────────────────────────────
    if ((mode as string) === "free" && freeOpen) {
      if (/^\s+/.test(line)) {
        const langSwitch = line.match(INDENTED_BRACKET_RE)
        if (langSwitch) {
          flushCode()
          codeLanguage = langSwitch[1].toLowerCase()
          continue
        }
        const transclusionMatch = line.match(TRANSCLUSION_LINE_RE)
        if (transclusionMatch) {
          flushCode()
          const ref = transclusionMatch[1].trim()
          const innerStart = lineStart + line.indexOf("{{") + 2
          const innerEnd = lineStart + line.lastIndexOf("}}")
          pushBlock({
            kind: "directive",
            directive: {
              kind: "transclusion",
              ref,
              span: { start: innerStart, end: innerEnd },
            },
            span: { start: lineStart, end: lineEnd },
          })
          continue
        }
        bufferCode(line, lineStart, lineEnd)
      } else {
        bufferProse(line, lineStart, lineEnd)
      }
      continue
    }

    // ── section body / top ────────────────────────────────────────
    if (!sectionOpen && mode === "top") {
      openSection("", { start: lineStart, end: lineStart }, 0, lineStart, null, null)
    }

    if (/^\s+/.test(line)) {
      const langSwitch = line.match(INDENTED_BRACKET_RE)
      if (langSwitch) {
        flushCode()
        codeLanguage = langSwitch[1].toLowerCase()
        continue
      }
      const transclusionMatch = line.match(TRANSCLUSION_LINE_RE)
      if (transclusionMatch) {
        flushCode()
        const ref = transclusionMatch[1].trim()
        const innerStart = lineStart + line.indexOf("{{") + 2
        const innerEnd = lineStart + line.lastIndexOf("}}")
        pushBlock({
          kind: "directive",
          directive: {
            kind: "transclusion",
            ref,
            span: { start: innerStart, end: innerEnd },
          },
          span: { start: lineStart, end: lineEnd },
        })
        continue
      }
      bufferCode(line, lineStart, lineEnd)
    } else {
      bufferProse(line, lineStart, lineEnd)
    }
  }

  finishCurrent(cursor)

  // finishCurrent mutates these via closures — widen past TS narrowing
  const free = freeSection as FreeSection | null
  const deps = depsSection as DependenciesSection | null

  // ── Compile-time constraints ──────────────────────────────────
  if (free && tangles.length > 0) {
    diagnostics.push({
      message: "Free section present — Tangle sections are not allowed",
      span: free.span,
    })
  }
  if (free && deps) {
    diagnostics.push({
      message: "Free section present — Dependencies section is not allowed",
      span: free.span,
    })
  }

  for (const section of sections) {
    for (const block of section.blocks) {
      if (block.kind === "directive" && block.directive.kind === "transclusion") {
        const { ref, span } = block.directive
        const found =
          sections.some((s) => s.heading === ref) ||
          sections.some((s) => s.kind === "tagged" && s.tag === ref)
        if (!found) {
          diagnostics.push({
            message: `Transclusion references unknown section "${ref}"`,
            span,
          })
        }
      }
    }
  }

  return { serviceName, serviceNameSpan, language, sections, tangles, deps, free, diagnostics }
}

export const parse = (source: string): Effect.Effect<LoomDocument> =>
  Effect.sync(() => parseImpl(source))

// ── Shared helpers ───────────────────────────────────────────────────────

function extractCodeContent(sections: ReadonlyArray<Section>): string[] {
  return sections.flatMap((s) =>
    s.blocks
      .filter((b): b is CodeBlock => b.kind === "code")
      .map((b) => b.content),
  )
}

function sectionToCode(
  section: Section,
  doc: LoomDocument,
  visited?: Set<Section>,
  params?: Record<string, string>,
): Code {
  const seen = visited ?? new Set<Section>()
  if (seen.has(section)) return new Code({ content: "" })
  seen.add(section)

  const parts: string[] = []
  for (const block of section.blocks) {
    if (block.kind === "code") {
      parts.push(params ? substituteParams(block.content, params) : block.content)
    } else if (block.kind === "directive" && block.directive.kind === "transclusion") {
      const { ref } = block.directive
      const target =
        doc.sections.find((s) => s.heading === ref) ??
        doc.sections.find((s) => s.kind === "tagged" && s.tag === ref)
      if (target) {
        parts.push(sectionToCode(target, doc, seen).content)
      }
    }
  }

  return new Code({ content: parts.join("\n") })
}

// Replace {{name: type}} occurrences with the literal value bound to `name`.
function substituteParams(text: string, params: Record<string, string>): string {
  return text.replace(TEMPLATE_PARAM_RE, (whole, name: string) => {
    return Object.prototype.hasOwnProperty.call(params, name) ? params[name] : whole
  })
}

// Split a top-level argument list, respecting nesting in (), [], {}, and
// strings ('', "", ``). Returns trimmed args.
function splitTopLevelArgs(input: string): string[] {
  const args: string[] = []
  let depth = 0
  let quote: string | null = null
  let buf = ""
  for (let i = 0; i < input.length; i++) {
    const ch = input[i]
    if (quote) {
      buf += ch
      if (ch === "\\" && i + 1 < input.length) {
        buf += input[++i]
        continue
      }
      if (ch === quote) quote = null
      continue
    }
    if (ch === "'" || ch === '"' || ch === "`") {
      quote = ch
      buf += ch
      continue
    }
    if (ch === "(" || ch === "[" || ch === "{") {
      depth++
      buf += ch
      continue
    }
    if (ch === ")" || ch === "]" || ch === "}") {
      depth--
      buf += ch
      continue
    }
    if (ch === "," && depth === 0) {
      args.push(buf.trim())
      buf = ""
      continue
    }
    buf += ch
  }
  if (buf.trim().length > 0) args.push(buf.trim())
  return args
}

// Parse a `Tag.apply({ key: value, ... })` call. Returns the tag and a
// map of key → literal source text. Supports string, number, boolean,
// and identifier values. Returns null for unrecognised shapes.
const APPLY_CALL_RE = /^([A-Za-z_$][\w$]*)\.apply\s*\(\s*\{([\s\S]*)\}\s*\)\s*$/
function parseApplyCall(
  text: string,
): { tag: string; params: Record<string, string> } | null {
  const m = text.match(APPLY_CALL_RE)
  if (!m) return null
  const tag = m[1]
  const body = m[2]
  const entries = splitTopLevelArgs(body)
  const params: Record<string, string> = {}
  for (const entry of entries) {
    const colon = entry.indexOf(":")
    if (colon < 0) continue
    const key = entry.substring(0, colon).trim().replace(/^["'`]|["'`]$/g, "")
    const valueRaw = entry.substring(colon + 1).trim()
    params[key] = unquoteLiteral(valueRaw)
  }
  return { tag, params }
}

function unquoteLiteral(raw: string): string {
  if (raw.length >= 2) {
    const first = raw[0]
    const last = raw[raw.length - 1]
    if ((first === '"' || first === "'" || first === "`") && first === last) {
      return raw.slice(1, -1)
    }
  }
  return raw
}

const COMPOSE_CALL_RE = /\bcompose\s*\(\s*([\s\S]*?)\s*\)\s*\)?\s*$/m

function resolveTangleBody(tangle: TangleSection, doc: LoomDocument): Code {
  const codeContent = tangle.blocks
    .filter((b): b is CodeBlock => b.kind === "code")
    .map((b) => b.content)
    .join("\n")

  const composeArgs = extractComposeArgs(codeContent)
  if (composeArgs !== null) {
    const parts: string[] = []
    for (const arg of composeArgs) {
      if (TS_IDENT_RE.test(arg)) {
        const section = doc.sections.find(
          (s) => (s.kind === "tagged" && s.tag === arg) || s.heading === arg,
        )
        if (section) parts.push(sectionToCode(section, doc).content)
        continue
      }
      const apply = parseApplyCall(arg)
      if (apply) {
        const section = doc.sections.find(
          (s) =>
            (s.kind === "tagged" && s.tag === apply.tag) ||
            s.heading === apply.tag,
        )
        if (section) {
          parts.push(
            sectionToCode(section, doc, undefined, apply.params).content,
          )
        }
      }
    }
    return new Code({ content: parts.join("\n") })
  }

  const parts: string[] = []
  for (const block of tangle.blocks) {
    if (block.kind === "code") {
      parts.push(block.content)
    }
  }
  return new Code({ content: parts.join("\n") })
}

// Find the LAST `compose(...)` call in tangle body, respecting nesting.
function extractComposeArgs(text: string): string[] | null {
  const idx = text.lastIndexOf("compose(")
  if (idx < 0) return null
  const start = idx + "compose(".length
  let depth = 1
  let quote: string | null = null
  let i = start
  for (; i < text.length; i++) {
    const ch = text[i]
    if (quote) {
      if (ch === "\\" && i + 1 < text.length) { i++; continue }
      if (ch === quote) quote = null
      continue
    }
    if (ch === "'" || ch === '"' || ch === "`") { quote = ch; continue }
    if (ch === "(" || ch === "[" || ch === "{") { depth++; continue }
    if (ch === ")" || ch === "]" || ch === "}") {
      depth--
      if (depth === 0) break
    }
  }
  if (depth !== 0) return null
  return splitTopLevelArgs(text.substring(start, i))
}

const EXT_TO_LANG: Record<string, string> = {
  ts: "typescript", js: "javascript", tsx: "typescript", jsx: "javascript",
  py: "python", rs: "rust", go: "go", java: "java", scala: "scala",
  sql: "sql", html: "html", css: "css", json: "json",
}

function langFromPath(path: string): string | null {
  const dot = path.lastIndexOf(".")
  if (dot < 0) return null
  const ext = path.substring(dot + 1).toLowerCase()
  return EXT_TO_LANG[ext] ?? ext
}

// ── Runtime Projection (de forma) ─────────────────────────────────────────

export interface RuntimeProjection {
  readonly code: string
  readonly name: string
}

// TODO: currently resolves tangle references into concatenated section code
// for the Vite plugin loader. Per spec, should emit the frame code (the
// Effect Service composition). Split into projectRuntimeFrame (de forma) and
// projectRuntimeResolved (de re) when the Effect-based loader is implemented.
function projectRuntimeImpl(doc: LoomDocument): RuntimeProjection {
  const name = "LoomModule"

  if (doc.free) {
    const code = doc.free.blocks
      .filter((b): b is CodeBlock => b.kind === "code")
      .map((b) => b.content)
      .join("\n")
    return { code, name }
  }

  if (doc.tangles.length > 0) {
    const primary = doc.tangles.find((t) => {
      const lang = langFromPath(t.path)
      return lang === doc.language || lang === null
    }) ?? doc.tangles[0]
    return { code: resolveTangleBody(primary, doc).content, name }
  }

  const code = doc.sections
    .flatMap((s) => extractCodeContent([s]))
    .join("\n")
  return { code, name }
}

export const projectRuntime = (doc: LoomDocument): Effect.Effect<RuntimeProjection> =>
  Effect.sync(() => projectRuntimeImpl(doc))

// ── LSP Projection ───────────────────────────────────────────────────────

export interface LspMapping {
  readonly sourceOffset: number
  readonly generatedOffset: number
  readonly length: number
  readonly sourceLength?: number
}

export interface TangledDocument {
  readonly id: string
  readonly languageId: string
  readonly content: string
  readonly mappings: ReadonlyArray<LspMapping>
  readonly path: string
}

export interface EmbeddedBlock {
  readonly id: string
  readonly languageId: string
  readonly content: string
  readonly mappings: ReadonlyArray<LspMapping>
}

export interface LspProjection {
  readonly frame: TangledDocument | null
  readonly tangledDocuments: ReadonlyArray<TangledDocument>
  readonly embeddedBlocks: ReadonlyArray<EmbeddedBlock>
}

const TS_FAMILY = new Set([
  "typescript", "ts", "javascript", "js", "tsx", "jsx",
])

function emitCodeBlockMapped(
  block: CodeBlock,
  content: { value: string },
  mappings: LspMapping[],
) {
  const lines = block.content.split("\n")
  const nonEmpty = lines.filter((l) => l.trim().length > 0)
  const minIndent =
    nonEmpty.length > 0
      ? Math.min(...nonEmpty.map((l) => (l.match(/^(\s*)/) ?? [""])[0].length))
      : 0
  let sourceOffset = block.span.start
  for (const line of lines) {
    const stripped = line.length >= minIndent ? line.substring(minIndent) : ""
    if (stripped.length > 0) {
      mappings.push({
        sourceOffset: sourceOffset + Math.min(minIndent, line.length),
        generatedOffset: content.value.length,
        length: stripped.length,
      })
    }
    content.value += stripped + "\n"
    sourceOffset += line.length + 1
  }
}

function emitMapped(
  text: string,
  sourceOffset: number,
  buf: { value: string },
  mappings: LspMapping[],
) {
  if (text.length > 0) {
    mappings.push({
      sourceOffset,
      generatedOffset: buf.value.length,
      length: text.length,
    })
  }
  buf.value += text
}

// projectFrameImpl
//
// Emits the de dicto Composition Program — the `Effect.Service` class
// that describes HOW sections compose. This frame IS the Loom Service
// definition (per spec "Loom Services must use Effect.Service, not
// Context.Tag"): real implementation, real `.Default` Layer, real
// `dependencies` field. tsc analyses it for heading-bracket tags,
// compose()/needs() arguments, Tangle member references, and
// Dependencies imports.
//
// Per CLAUDE.md "Future Correction Points" we keep two terms distinct:
//   • Frame — this de dicto Composition Program. One per Loom file.
//   • Service script — Volar's TS module surface for cross-loom
//     `import` resolution (orthogonal concern, handled in server.ts).
//
// Layout (matches CLAUDE.md Appendix):
//
//     import { Code, Tangle, Template, compose, needs } from "@literate/core"
//     import { Effect } from "effect"
//
//     // Dependencies imports (real, line-precise)
//     import { ConfigLoom } from "./Configs"
//
//     // Top-level section consts. Backtick literals are de re — the
//     // author's literal section lines passed to compose(). Bare names
//     // inside compose() (e.g. transclusion targets) resolve to other
//     // top-level consts. Author Tangle bodies reference these by bare
//     // name and resolve via TS lexical scope.
//     const Imports: Effect.Effect<Code> = compose(
//       `import { Hono } from "hono"`,
//     )
//     const App: Effect.Effect<Code> = compose(
//       Imports,                              // {{Import as needed}}
//       ``,
//       `const app = new Hono()`,
//     )
//
//     // Top-level Tangle consts. Author body is verbatim except the
//     // trailing compose() expression, which is rewritten as
//     //   `const code = yield* <author compose(...)>`
//     // and the machinery appends
//     //   `return new Tangle({ tag, path, code })`
//     const IndexTs: Effect.Effect<Tangle> = Effect.gen(function* () {
//       const code = yield* compose(App, Greet, Health, Boot)
//       return new Tangle({ tag: "IndexTs", path: "...", code })
//     })
//
//     // The Service class. The body re-exposes every section / tangle
//     // as a `readonly` member so `[Tag]` heading-bracket spans can be
//     // source-mapped onto a class member identifier (per Appendix
//     // Rule 1) and so `yield* HonoHello` returns the same record. The
//     // `effect:` factory succeeds with that record.
//     class HonoHello extends Effect.Service<HonoHello>()("HonoHello", {
//       effect: Effect.succeed({ Imports, App, Greet, Health, Boot, PackageJson, IndexTs }),
//       dependencies: needs(ConfigLoom),
//     }) {
//       readonly stack = "Typescript"
//       readonly Imports = Imports
//       readonly App = App
//       readonly Greet = Greet
//       readonly Health = Health
//       readonly Boot = Boot
//       readonly PackageJson = PackageJson
//       readonly IndexTs = IndexTs
//     }
//
//     export { HonoHello }
//
// Source mappings emitted here:
//   • title heading text → class identifier (`class HonoHello`) and
//     the Self-generic position (`extends Effect.Service<HonoHello>`)
//   • [Tag] span of each tagged section → `readonly Tag` member ident
//     in the class body
//   • [Tag, path] tag span of each Tangle → `readonly Tag` member ident
//     in the class body
//   • Tangle body code lines → the body of that Tangle's
//     `Effect.gen(function* () {…})`, line-precise via emitCodeBlockMapped
//   • Dependencies body lines → real `import` statements + the
//     `dependencies: needs(...)` line of the Effect.Service factory
//   • Section body code lines → backtick template-literal compose() args
//     in the section's top-level const definition
//   • {{Tag}} transclusion line span → bare identifier compose() arg
//     in the section's top-level const definition
function projectFrameImpl(doc: LoomDocument): TangledDocument | null {
  if (doc.free) return null

  const buf = { value: "" }
  const mappings: LspMapping[] = []
  const serviceName = doc.serviceName ?? "LoomModule"

  function emit(text: string) {
    buf.value += text
  }

  function emitWithMapping(text: string, sourceOffset: number) {
    if (text.length > 0) {
      mappings.push({
        sourceOffset,
        generatedOffset: buf.value.length,
        length: text.length,
      })
    }
    buf.value += text
  }

  // Resolve a transclusion ref (heading title or tag) to the tag name
  // of an existing top-level const, or null if not found. The reference
  // text in the .loom is matched against tagged sections by tag first,
  // then by heading title.
  const taggedByName = new Map<string, TaggedSection>()
  for (const s of doc.sections) {
    if (s.kind === "tagged") {
      taggedByName.set(s.tag, s)
      taggedByName.set(s.heading, s)
    }
  }
  function resolveTransclusion(ref: string): TaggedSection | null {
    return taggedByName.get(ref) ?? null
  }

  // Emit a single backtick template literal whose content is `text`,
  // with backticks and ${ escaped. The mapping covers the inner
  // characters (between the backticks), so hover on a token inside the
  // backtick lands on the .loom line at the matching offset.
  function emitBacktickLine(text: string, sourceOffset: number) {
    emit("`")
    const escaped = text.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${")
    if (escaped.length > 0) {
      // Use sourceLength=text.length because the in-source span is the
      // raw line, and the generated span is the escaped form.
      mappings.push({
        sourceOffset,
        generatedOffset: buf.value.length,
        length: escaped.length,
        sourceLength: text.length,
      })
    }
    buf.value += escaped
    emit("`")
  }

  // Emit a section's blocks as compose() arguments. Code block lines
  // become backtick template literals; transclusion directives become
  // bare identifier references to the target's top-level const. For
  // parameterized templates, `{{name: type}}` placeholders inside code
  // lines are rewritten to `${name}` so the destructured params resolve.
  function emitSectionAsCompose(section: TaggedSection) {
    const isTemplate = section.params.length > 0
    const args: Array<{
      kind: "string" | "ref"
      text: string
      sourceOffset: number
    }> = []

    for (const block of section.blocks) {
      if (block.kind === "code") {
        const lines = block.content.split("\n")
        const nonEmpty = lines.filter((l) => l.trim().length > 0)
        const minIndent = nonEmpty.length > 0
          ? Math.min(...nonEmpty.map((l) => (l.match(/^(\s*)/) ?? [""])[0].length))
          : 0
        let sourceOffset = block.span.start
        for (const line of lines) {
          const stripped = line.length >= minIndent ? line.substring(minIndent) : ""
          const lineSourceOffset = sourceOffset + Math.min(minIndent, line.length)
          // Skip [json] etc. language switch lines — those are loom
          // directives, not de re content. The parser flushes the
          // current code block on encountering them, so they only
          // appear here if a language switch was the only line in a
          // sub-block; defensively skip.
          if (/^\[\w+\]\s*$/.test(stripped)) {
            sourceOffset += line.length + 1
            continue
          }
          // Rewrite template params: `{{name: type}}` → `${name}`.
          // Only inside template sections.
          let outLine = stripped
          if (isTemplate) {
            outLine = stripped.replace(TEMPLATE_PARAM_RE, (_m, name) => `\${${name}}`)
          }
          args.push({ kind: "string", text: outLine, sourceOffset: lineSourceOffset })
          sourceOffset += line.length + 1
        }
      } else if (block.kind === "directive" && block.directive.kind === "transclusion") {
        const target = resolveTransclusion(block.directive.ref)
        if (target) {
          args.push({
            kind: "ref",
            text: target.tag,
            sourceOffset: block.directive.span.start,
          })
        } else {
          // Unresolved transclusion — emit empty string so compose()
          // signature stays valid; parser already raised a diagnostic.
          args.push({ kind: "string", text: "", sourceOffset: block.span.start })
        }
      }
    }

    emit("compose(")
    if (args.length === 0) {
      emit('""')
    } else {
      emit("\n")
      for (const arg of args) {
        emit("  ")
        if (arg.kind === "string") {
          emitBacktickLine(arg.text, arg.sourceOffset)
        } else {
          emitWithMapping(arg.text, arg.sourceOffset)
        }
        emit(",\n")
      }
    }
    emit(")")
  }

  // Emit a tangle's author body inside an Effect.gen — author lines
  // line-precise mapped, the trailing `compose(...)` expression
  // rewritten to `const code = yield* compose(...)`, then a
  // machinery `return new Tangle({tag, path, code})` appended.
  function emitTangleBody(tangle: TangleSection) {
    emit("Effect.gen(function* () {\n")

    // Collect author body lines from code blocks (with stripped
    // common indent and per-line source mappings). We need to find
    // the line that starts the trailing compose() call so we can
    // prefix it with `const code = yield* `.
    const allLines: Array<{ text: string; sourceOffset: number }> = []
    for (const block of tangle.blocks) {
      if (block.kind !== "code") continue
      const lines = block.content.split("\n")
      const nonEmpty = lines.filter((l) => l.trim().length > 0)
      const minIndent = nonEmpty.length > 0
        ? Math.min(...nonEmpty.map((l) => (l.match(/^(\s*)/) ?? [""])[0].length))
        : 0
      let sourceOffset = block.span.start
      for (const line of lines) {
        const stripped = line.length >= minIndent ? line.substring(minIndent) : ""
        allLines.push({
          text: stripped,
          sourceOffset: sourceOffset + Math.min(minIndent, line.length),
        })
        sourceOffset += line.length + 1
      }
    }

    // Strip leading/trailing blank lines.
    while (allLines.length > 0 && allLines[0].text.trim() === "") allLines.shift()
    while (allLines.length > 0 && allLines[allLines.length - 1].text.trim() === "") allLines.pop()

    // Locate the LAST line whose trimmed text starts with `compose(`.
    let composeLineIdx = -1
    for (let i = allLines.length - 1; i >= 0; i--) {
      if (allLines[i].text.trimStart().startsWith("compose(")) {
        composeLineIdx = i
        break
      }
    }

    if (composeLineIdx < 0) {
      // No compose() found — emit the body verbatim, then a fallback
      // empty Tangle. Author is responsible if their body doesn't
      // produce code.
      for (const { text, sourceOffset } of allLines) {
        if (text.length > 0) {
          mappings.push({
            sourceOffset,
            generatedOffset: buf.value.length + 2,
            length: text.length,
          })
        }
        emit("  " + text + "\n")
      }
      emit(`  return new Tangle({ tag: ${JSON.stringify(tangle.tag)}, path: ${JSON.stringify(tangle.path)}, code: new Code({ content: "" }) })\n`)
      emit("})")
      return
    }

    // Emit lines BEFORE the compose() verbatim with line-precise mapping.
    for (let i = 0; i < composeLineIdx; i++) {
      const { text, sourceOffset } = allLines[i]
      emit("  ")
      if (text.length > 0) {
        mappings.push({
          sourceOffset,
          generatedOffset: buf.value.length,
          length: text.length,
        })
        buf.value += text
      }
      emit("\n")
    }

    // Emit the compose() line(s) prefixed with `const code = yield* `.
    // We know the LAST line containing `compose(` — but compose() may
    // span multiple lines. Emit from composeLineIdx to end.
    emit("  const code = yield* ")
    for (let i = composeLineIdx; i < allLines.length; i++) {
      const { text, sourceOffset } = allLines[i]
      if (i > composeLineIdx) emit("  ")
      if (text.length > 0) {
        mappings.push({
          sourceOffset,
          generatedOffset: buf.value.length,
          length: text.length,
        })
        buf.value += text
      }
      emit("\n")
    }

    emit(`  return new Tangle({ tag: ${JSON.stringify(tangle.tag)}, path: ${JSON.stringify(tangle.path)}, code })\n`)
    emit("})")
  }

  // ── Module preamble ───────────────────────────────────────────────
  emit('import { Code, Tangle, Template, compose, needs } from "@literate/core"\n')
  emit('import { Effect } from "effect"\n')

  // ── Dependencies (from # This Loom [Dependencies]) ─────────────────
  // Real `import` statements at module level — line-precise mapped so
  // hovers and go-to-def on import names route through the real TS
  // module resolver. The `needs(...)` line is held back to feed into
  // the Effect.Service factory's `dependencies` field.
  let depsNeedsLine: { source: number; text: string } | null = null
  if (doc.deps) {
    for (const block of doc.deps.blocks) {
      if (block.kind !== "code") continue
      const lines = block.content.split("\n")
      const nonEmpty = lines.filter((l) => l.trim().length > 0)
      const minIndent = nonEmpty.length > 0
        ? Math.min(...nonEmpty.map((l) => (l.match(/^(\s*)/) ?? [""])[0].length))
        : 0
      let sourceOffset = block.span.start
      for (const line of lines) {
        const stripped = line.length >= minIndent ? line.substring(minIndent) : ""
        const trimmed = stripped.trim()
        const lineSourceOffset = sourceOffset + Math.min(minIndent, line.length)
        if (trimmed.startsWith("import")) {
          emitWithMapping(stripped, lineSourceOffset)
          emit("\n")
        } else if (trimmed.startsWith("needs(")) {
          depsNeedsLine = { source: lineSourceOffset, text: stripped }
        }
        sourceOffset += line.length + 1
      }
    }
  }
  emit("\n")

  const taggedSections = doc.sections.filter(
    (s): s is TaggedSection => s.kind === "tagged",
  )

  // ── Top-level section consts ──────────────────────────────────────
  // Each tagged section becomes a top-level const. Bare-name resolution
  // for compose() references inside Tangle bodies relies on these.
  for (const section of taggedSections) {
    emit("const ")
    emit(section.tag)
    if (section.params.length > 0) {
      const params = section.params
        .map((p) => `${p.name}: ${p.type}`)
        .join("; ")
      const args = section.params.map((p) => p.name).join(", ")
      emit(`: Template<{ ${params} }> = Template.make<{ ${params} }>(({ ${args} }) => `)
      emitSectionAsCompose(section)
      emit(")\n")
    } else {
      emit(`: Effect.Effect<Code> = `)
      emitSectionAsCompose(section)
      emit("\n")
    }
  }
  if (taggedSections.length > 0) emit("\n")

  // ── Top-level Tangle consts ───────────────────────────────────────
  // No explicit type annotation: tangle bodies may `yield* ImportedService`
  // which adds the service to the inferred Effect R-channel. Pinning R
  // to `never` would force tsc to report a type error inside the frame
  // and Volar would surface that as a spurious diagnostic on the .loom
  // file. Inferred typing keeps R = whatever services the tangle
  // actually depends on, which is the truthful shape.
  for (const tangle of doc.tangles) {
    emit("const ")
    emit(tangle.tag)
    emit(" = ")
    emitTangleBody(tangle)
    emit("\n")
  }
  if (doc.tangles.length > 0) emit("\n")

  // ── Effect.Service class (from # ServiceName [Language]) ──────────
  // Title heading text → class identifier. Generic Self refers to the
  // class being defined.
  const serviceNameSourceOffset = doc.serviceNameSpan?.start
    ?? (doc.sections.length > 0 ? doc.sections[0].headingSpan.start : 0)

  emit("class ")
  emitWithMapping(serviceName, serviceNameSourceOffset)
  emit(` extends Effect.Service<`)
  emitWithMapping(serviceName, serviceNameSourceOffset)
  emit(`>()(${JSON.stringify(serviceName)}, {\n`)

  // The `effect:` factory yields the full members record so `yield*
  // ServiceName` produces the typed shape consumers expect. Using
  // Effect.succeed keeps the factory pure — we don't need to *run*
  // tangles here; the runtime does that at the end of the world.
  const allMembers = [
    ...taggedSections.map((s) => s.tag),
    ...doc.tangles.map((t) => t.tag),
  ]
  if (allMembers.length > 0) {
    emit(`  effect: Effect.succeed({ ${allMembers.join(", ")} }),\n`)
  } else {
    emit("  effect: Effect.succeed({}),\n")
  }

  // ── dependencies: needs(...) — from # This Loom [Dependencies] ────
  if (depsNeedsLine !== null) {
    emit("  dependencies: ")
    emitWithMapping(depsNeedsLine.text, depsNeedsLine.source)
    emit(",\n")
  } else {
    emit("  dependencies: [],\n")
  }
  emit("}) {\n")

  // ── Class body — readonly stack + readonly tag aliases ────────────
  // [Tag] heading-bracket spans map to the LEFT identifier in
  // `readonly Tag = Tag`. The right side resolves to the top-level
  // const, so the alias carries the real Effect<Code> / Template<P> /
  // Effect<Tangle> type onto the class member.
  if (doc.language) {
    emit(`  readonly stack = ${JSON.stringify(doc.language)}\n`)
  }
  for (const section of taggedSections) {
    emit("  readonly ")
    emitWithMapping(section.tag, section.tagSpan.start)
    emit(` = ${section.tag}\n`)
  }
  for (const tangle of doc.tangles) {
    emit("  readonly ")
    emitWithMapping(tangle.tag, tangle.tagSpan.start)
    emit(` = ${tangle.tag}\n`)
  }
  emit("}\n\n")

  emit(`export { ${serviceName} }\n`)

  return {
    id: "frame",
    languageId: "typescript",
    content: buf.value,
    mappings,
    path: "",
  }
}

function projectLspImpl(doc: LoomDocument, sourcePath?: string): LspProjection {
  const tangledDocuments: TangledDocument[] = []
  const embeddedBlocks: EmbeddedBlock[] = []
  let embeddedSeq = 0
  const allTangledSections = new Set<Section>()

  const augmented = sourcePath ? resolveDependenciesSections(doc, sourcePath) : doc

  function findSection(name: string): Section | undefined {
    return augmented.sections.find((s) => s.heading === name) ??
      augmented.sections.find((s) => s.kind === "tagged" && s.tag === name)
  }

  if (doc.free) {
    let content = ""
    const mappings: LspMapping[] = []
    for (const block of doc.free.blocks) {
      if (block.kind === "code") {
        mappings.push({
          sourceOffset: block.span.start,
          generatedOffset: content.length,
          length: block.content.length,
        })
        content += block.content + "\n"
      }
    }
    tangledDocuments.push({
      id: "free",
      languageId: doc.language || "typescript",
      content,
      mappings,
      path: "",
    })
  } else {
    for (const tangle of doc.tangles) {
      const buf = { value: "" }
      const mappings: LspMapping[] = []
      const visited = new Set<Section>()
      const lang = langFromPath(tangle.path) ?? doc.language

      // Section boundary guard. tsc tokens that span the join between
      // two concatenated sections in a tangled-N doc would otherwise be
      // source-mapped to a span crossing the .loom prose between them
      // — visible as bizarre tokens on prose lines. A blank line +
      // language-specific terminator gives tsc / json a hard structural
      // break so tokens cannot span it.
      const sectionSeparator = (() => {
        switch (lang) {
          case "json":
            // JSON has no statement separator; an empty line is enough
            // to terminate previous values for tokenization purposes.
            return "\n"
          default:
            return "\n;\n"
        }
      })()

      // Only emit a separator between TOP-LEVEL composed sections, not
      // recursively for transclusions inside a section's body — those
      // should flow inline so their imports/types are available.
      function emitSection(section: Section) {
        if (visited.has(section)) return
        visited.add(section)
        allTangledSections.add(section)
        for (const block of section.blocks) {
          if (block.kind === "code") {
            emitCodeBlockMapped(block, buf, mappings)
          } else if (block.kind === "directive" && block.directive.kind === "transclusion") {
            const target = findSection(block.directive.ref)
            if (target) emitSection(target)
          }
        }
      }

      let isFirst = true
      for (const block of tangle.blocks) {
        if (block.kind !== "code") continue
        const m = block.content.match(/compose\(([^)]+)\)/)
        if (m) {
          for (const name of m[1].split(",").map((s) => s.trim()).filter(Boolean)) {
            if (!TS_IDENT_RE.test(name)) continue
            const section = findSection(name)
            if (section && !visited.has(section)) {
              if (!isFirst) buf.value += sectionSeparator
              emitSection(section)
              isFirst = false
            }
          }
        }
      }

      tangledDocuments.push({
        id: `tangled-${tangledDocuments.length}`,
        languageId: lang,
        content: buf.value,
        mappings,
        path: tangle.path,
      })
    }

    // Untangled sections: embedded codes for Tree-sitter syntax
    // highlighting only (per spec "Untangled sections: Tree-sitter
    // syntax tokens only"). Each block becomes its own embedded
    // VirtualCode with line-precise mappings — same shape as the
    // tangled / frame paths so Volar's source mapper can position
    // tokens accurately back to .loom positions.
    for (const section of doc.sections) {
      if (allTangledSections.has(section)) continue
      for (const block of section.blocks) {
        if (block.kind === "code") {
          const buf = { value: "" }
          const mappings: LspMapping[] = []
          emitCodeBlockMapped(block, buf, mappings)
          embeddedBlocks.push({
            id: `embedded-${embeddedSeq++}`,
            languageId: block.language,
            content: buf.value,
            mappings,
          })
        } else if (block.kind === "fenced" && block.language) {
          // Fenced blocks already arrive without leading-fence chrome;
          // we only need to wire the contentStart offset to position 0.
          const fencedLines = block.content.split("\n")
          const mappings: LspMapping[] = []
          let sourceOffset = block.contentStart
          let generatedOffset = 0
          for (const line of fencedLines) {
            if (line.length > 0) {
              mappings.push({
                sourceOffset,
                generatedOffset,
                length: line.length,
              })
            }
            generatedOffset += line.length + 1
            sourceOffset += line.length + 1
          }
          embeddedBlocks.push({
            id: `embedded-${embeddedSeq++}`,
            languageId: block.language,
            content: block.content,
            mappings,
          })
        }
      }
    }
  }

  const frame = projectFrameImpl(doc)
  return { frame, tangledDocuments, embeddedBlocks }
}

export const projectLsp = (doc: LoomDocument, sourcePath?: string): Effect.Effect<LspProjection> =>
  Effect.sync(() => projectLspImpl(doc, sourcePath))

// ── Segments Projection (de re, virtual) ──────────────────────────────────

export interface Segment {
  readonly id: string
  readonly languageId: string
  readonly content: string
  readonly span: Span
  readonly sectionHeading: string
  readonly sectionKind: Section["kind"]
  readonly sectionTag: string | null
}

export interface SegmentsProjection {
  readonly language: string
  readonly segments: ReadonlyArray<Segment>
}

function projectSegmentsImpl(doc: LoomDocument): SegmentsProjection {
  const segments: Segment[] = []
  let counter = 0

  for (const section of doc.sections) {
    const tag = section.kind === "tagged" ? section.tag : null

    for (const block of section.blocks) {
      if (block.kind === "code") {
        segments.push({
          id: `code-${counter++}`,
          languageId: block.language,
          content: block.content,
          span: block.span,
          sectionHeading: section.heading,
          sectionKind: section.kind,
          sectionTag: tag,
        })
      }
      if (block.kind === "fenced" && block.language) {
        segments.push({
          id: `fenced-${counter++}`,
          languageId: block.language,
          content: block.content,
          span: block.span,
          sectionHeading: section.heading,
          sectionKind: section.kind,
          sectionTag: tag,
        })
      }
    }
  }

  return { language: doc.language, segments }
}

export const projectSegments = (doc: LoomDocument): Effect.Effect<SegmentsProjection> =>
  Effect.sync(() => projectSegmentsImpl(doc))

// ── Tangle Projection (de re, physical) ───────────────────────────────────

export interface FileOutput {
  readonly path: string
  readonly content: string
}

export interface TangleProjection {
  readonly files: ReadonlyArray<FileOutput>
  readonly diagnostics: ReadonlyArray<string>
}

function stripCommonIndent(text: string): string {
  const lines = text.split("\n")
  const nonEmpty = lines.filter((l) => l.trim().length > 0)
  if (nonEmpty.length === 0) return text
  const minIndent = Math.min(
    ...nonEmpty.map((l) => l.match(/^(\s*)/)![0].length),
  )
  if (minIndent === 0) return text
  return lines.map((l) => l.substring(minIndent)).join("\n")
}

function projectTangleImpl(doc: LoomDocument, sourcePath: string): TangleProjection {
  const diagnostics: string[] = []

  if (doc.free) {
    return { files: [], diagnostics: ["Free section present — tangle is author-controlled"] }
  }

  if (doc.tangles.length === 0) {
    return { files: [], diagnostics }
  }

  const augmented = resolveDependenciesSections(doc, sourcePath)
  const files: FileOutput[] = []

  for (const tangle of doc.tangles) {
    const code = resolveTangleBody(tangle, augmented)
    files.push({
      path: tangle.path,
      content: stripCommonIndent(code.content),
    })
  }

  return { files, diagnostics }
}

function resolveDependenciesSections(doc: LoomDocument, sourcePath: string): LoomDocument {
  if (!doc.deps) return doc
  const imported: Section[] = []
  for (const block of doc.deps.blocks) {
    if (block.kind !== "code") continue
    const importRe = /import\s+\{([^}]+)\}\s+from\s+["']([^"']+)["']/g
    let m: RegExpExecArray | null
    while ((m = importRe.exec(block.content)) !== null) {
      const bindings = m[1].split(",").map((s) => s.trim()).filter(Boolean)
      const fromPath = m[2]
      const ext = fromPath.endsWith(".loom") ? "" : ".loom"
      const depPath = resolve(dirname(sourcePath), fromPath + ext)
      let depSource: string
      try {
        depSource = readFileSync(depPath, "utf-8")
      } catch {
        continue
      }
      const depDoc = parseImpl(depSource)
      for (const name of bindings) {
        const section = depDoc.sections.find(
          (s) => (s.kind === "tagged" && s.tag === name) || s.heading === name,
        )
        if (section) {
          imported.push(section)
        } else if (name === depDoc.serviceName) {
          for (const s of depDoc.sections) {
            if (s.kind === "tagged") imported.push(s)
          }
        }
      }
    }
  }
  if (imported.length === 0) return doc
  return { ...doc, sections: [...doc.sections, ...imported] }
}

export const projectTangle = (
  doc: LoomDocument,
  sourcePath: string,
): Effect.Effect<TangleProjection> =>
  Effect.sync(() => projectTangleImpl(doc, sourcePath))

// ── Vite Plugin ───────────────────────────────────────────────────────────

const LOOM_EXT = /\.loom$/

export function loom(): Plugin {
  return {
    name: "vite-plugin-loom",
    enforce: "pre",

    resolveId(source, importer) {
      if (!LOOM_EXT.test(source)) return null
      if (importer) {
        return resolve(dirname(importer), source)
      }
      return source
    },

    load(id) {
      if (!LOOM_EXT.test(id)) return null

      const source = readFileSync(id, "utf-8")
      return Effect.runSync(pipe(
        parse(source),
        Effect.flatMap(projectRuntime),
        Effect.map(({ code }) => ({ code, map: null })),
      ))
    },

    config() {
      return {
        optimizeDeps: {
          extensions: [".loom"],
          esbuildOptions: {
            loader: { ".loom": "ts" },
          },
        },
        esbuild: {
          include: /\.(ts|loom)$/,
          loader: "ts",
        },
      }
    },

    handleHotUpdate({ file, server }) {
      if (LOOM_EXT.test(file)) {
        const module = server.moduleGraph.getModuleById(file)
        if (module) {
          server.moduleGraph.invalidateModule(module)
          return [module]
        }
      }
    },
  }
}
