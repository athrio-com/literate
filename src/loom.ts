import { readFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import type { Plugin } from "vite"
import { Effect, pipe } from "effect"

// ── AST Types ─────────────────────────────────────────────────────────────

export interface Span {
  readonly start: number
  readonly end: number
}

export interface Diagnostic {
  readonly message: string
  readonly span: Span
}

export interface LoomDocument {
  readonly language: string
  readonly metadata: ReadonlyArray<MetadataField>
  readonly sections: ReadonlyArray<Section>
  readonly loomSection: LoomSection | null
  readonly diagnostics: ReadonlyArray<Diagnostic>
}

interface SectionBase {
  readonly heading: string
  readonly headingLevel: number
  readonly span: Span
  readonly blocks: ReadonlyArray<Block>
}

export interface UntaggedSection extends SectionBase {
  readonly kind: "untagged"
  readonly tangle: string | null
}

export interface TaggedSection extends SectionBase {
  readonly kind: "tagged"
  readonly tag: string
  readonly tagSpan: Span
  readonly tangle: string | null
}

export interface TemplateSection extends SectionBase {
  readonly kind: "template"
  readonly tag: string
  readonly tagSpan: Span
  readonly params: ReadonlyArray<Param>
}

export type Section = UntaggedSection | TaggedSection | TemplateSection

export type Block = ProseBlock | CodeBlock | FencedBlock

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
  readonly span: Span
}

export interface MetadataField {
  readonly name: string
  readonly type: string
  readonly value: string
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

export interface LoomSection {
  readonly span: Span
  readonly free: boolean
  readonly blocks: ReadonlyArray<Block>
}

// ── Parser ────────────────────────────────────────────────────────────────

const BRACKET_RE = /^\[([^\]]+)\]\s*$/
const HEADING_BRACKET_RE = /^(#{1,6})\s+(.+?)\s+\[([^\]]*)\]\s*$/
const HEADING_UNCLOSED_RE = /^(#{1,6})\s+(.+?)\s+\[([^\]]*)\s*$/
const HEADING_RE = /^(#{1,6})\s+(.+?)\s*$/
const METADATA_RE =
  /^([a-zA-Z_]\w*)\s*:\s*([\w<>\[\]|& ]+?)\s*=\s*(.+?)\s*$/
const FENCE_OPEN_RE = /^```(\w*)\s*$/
const FENCE_CLOSE_RE = /^```\s*$/
const INDENTED_BRACKET_RE = /^\s+\[(\w+)\]\s*$/
const TEMPLATE_PARAM_RE =
  /\{\{(\w+):\s*([^=}]+?)(?:\s*=\s*([^}]+?))?\}\}/g

const PATH_RE = /[/.]/ // contains slash or dot → tangle path, not a tag

function parseBracketContents(raw: string): {
  tag: string | null
  tangle: string | null
} {
  const parts = raw.split(",").map((s) => s.trim())
  if (parts.length === 1) {
    if (PATH_RE.test(parts[0])) return { tag: null, tangle: parts[0] }
    return { tag: parts[0], tangle: null }
  }
  return { tag: parts[0], tangle: parts.slice(1).join(", ").trim() }
}

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

const TS_IDENT_RE = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/

function inferSection(
  heading: string,
  headingLevel: number,
  span: Span,
  blocks: ReadonlyArray<Block>,
  tag: string | null,
  tagSpan: Span | null,
  tangle: string | null,
  diagnostics: Diagnostic[],
): Section {
  const params = extractTemplateParams(blocks)

  if (tag !== null && tagSpan !== null && !TS_IDENT_RE.test(tag)) {
    diagnostics.push({
      message: `Tag "${tag}" is not a valid identifier`,
      span: tagSpan,
    })
  }

  if (params.length > 0) {
    if (tag === null || tagSpan === null) {
      diagnostics.push({
        message: "Template section requires a tag — add [Tag] to the heading",
        span: { start: span.start, end: span.start + heading.length + headingLevel + 1 },
      })
      return { kind: "untagged", heading, headingLevel, span, blocks, tangle }
    }
    if (tangle !== null) {
      diagnostics.push({
        message: "Template sections cannot have a tangle path — templates are virtual",
        span: tagSpan,
      })
    }
    return { kind: "template", heading, headingLevel, span, blocks, tag, tagSpan, params }
  }

  if (tag !== null && tagSpan !== null) {
    return { kind: "tagged", heading, headingLevel, span, blocks, tag, tagSpan, tangle }
  }

  return { kind: "untagged", heading, headingLevel, span, blocks, tangle }
}

function stripQuotes(s: string): string {
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    return s.slice(1, -1)
  }
  return s
}

function parseImpl(source: string): LoomDocument {
  const lines = source.split(/\r?\n/)
  let cursor = 0

  let language = ""
  const documentMetadata: MetadataField[] = []
  const sections: Section[] = []
  const diagnostics: Diagnostic[] = []
  let loomSection: LoomSection | null = null

  type Mode = "top" | "loom-meta" | "section" | "loom" | "fenced"
  let mode: Mode = "top"

  let sectionHeading = ""
  let sectionLevel = 0
  let sectionStart = 0
  let sectionTag: string | null = null
  let sectionTagSpan: Span | null = null
  let sectionTangle: string | null = null
  let sectionBlocks: Block[] = []
  let sectionOpen = false

  let currentLoom: { start: number; free: boolean; blocks: Block[] } | null =
    null

  let fenceLanguage: string | null = null
  let fenceContent = ""
  let fenceStart = 0

  let codeLines: string[] = []
  let codeStartOffset = 0
  let codeEndOffset = 0
  let codeLanguage = ""

  let proseLines: string[] = []
  let proseStartOffset = 0
  let proseEndOffset = 0

  function finishSection(endOffset: number) {
    flushCode()
    flushProse()
    if (sectionOpen) {
      sections.push(
        inferSection(
          sectionHeading,
          sectionLevel,
          { start: sectionStart, end: endOffset },
          sectionBlocks,
          sectionTag,
          sectionTagSpan,
          sectionTangle,
          diagnostics,
        ),
      )
      sectionOpen = false
      sectionBlocks = []
    }
    if (currentLoom) {
      loomSection = {
        span: { start: currentLoom.start, end: endOffset },
        free: currentLoom.free,
        blocks: currentLoom.blocks,
      }
      currentLoom = null
    }
  }

  function pushBlock(block: Block) {
    if (currentLoom) {
      currentLoom.blocks.push(block)
    } else if (sectionOpen) {
      sectionBlocks.push(block)
    }
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

  function openSection(
    heading: string,
    level: number,
    start: number,
    tag: string | null,
    tagSpan: Span | null,
    tangle: string | null,
  ) {
    finishSection(start)
    sectionHeading = heading
    sectionLevel = level
    sectionStart = start
    sectionTag = tag
    sectionTagSpan = tagSpan
    sectionTangle = tangle
    sectionBlocks = []
    sectionOpen = true
    codeLanguage = language
    mode = "section"
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
          span: { start: fenceStart, end: lineEnd },
        })
        fenceContent = ""
        mode = currentLoom ? "loom" : "section"
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
      fenceContent = ""
      mode = "fenced"
      continue
    }

    // ── top-level brackets ────────────────────────────────────────
    const bracketMatch = line.match(BRACKET_RE)
    if (bracketMatch) {
      const raw = bracketMatch[1].trim()

      finishSection(lineStart)

      if (
        raw.toLowerCase() === "loom" ||
        raw.toLowerCase().startsWith("loom,")
      ) {
        const free = raw.toLowerCase().includes("free")
        currentLoom = { start: lineStart, free, blocks: [] }
        mode = "loom"
        continue
      }

      if (raw === "Loom") {
        mode = "loom-meta"
        continue
      }

      if (!language) {
        language = raw.toLowerCase()
        codeLanguage = language
        mode = "top"
        continue
      }

      continue
    }

    // ── headings ──────────────────────────────────────────────────
    const bracketHeading = line.match(HEADING_BRACKET_RE)
    if (bracketHeading && mode !== "loom-meta") {
      const raw = bracketHeading[3].trim()
      if (raw === "") {
        const bracketStart = line.lastIndexOf("[")
        diagnostics.push({
          message: "Empty brackets in heading — provide a tag name [Tag]",
          span: { start: lineStart + bracketStart, end: lineEnd },
        })
        openSection(
          bracketHeading[2],
          bracketHeading[1].length,
          lineStart,
          null,
          null,
          null,
        )
        continue
      }
      const parsed = parseBracketContents(raw)
      let tagSpan: Span | null = null
      if (parsed.tag) {
        const bracketStart = line.lastIndexOf("[")
        const tagOffset = lineStart + bracketStart + 1
        tagSpan = { start: tagOffset, end: tagOffset + parsed.tag.length }
      }
      openSection(
        bracketHeading[2],
        bracketHeading[1].length,
        lineStart,
        parsed.tag,
        tagSpan,
        parsed.tangle,
      )
      continue
    }

    const unclosedHeading = line.match(HEADING_UNCLOSED_RE)
    if (unclosedHeading && mode !== "loom-meta") {
      const raw = unclosedHeading[3].trim()
      const parsed = parseBracketContents(raw)
      let tagSpan: Span | null = null
      if (parsed.tag) {
        const bracketStart = line.lastIndexOf("[")
        const tagOffset = lineStart + bracketStart + 1
        tagSpan = { start: tagOffset, end: tagOffset + parsed.tag.length }
      }
      const bracketPos = line.lastIndexOf("[")
      diagnostics.push({
        message: "Unclosed bracket in heading — missing ]",
        span: { start: lineStart + bracketPos, end: lineEnd },
      })
      openSection(
        unclosedHeading[2],
        unclosedHeading[1].length,
        lineStart,
        parsed.tag,
        tagSpan,
        parsed.tangle,
      )
      continue
    }

    const headingMatch = line.match(HEADING_RE)
    if (headingMatch && mode !== "loom-meta") {
      openSection(
        headingMatch[2],
        headingMatch[1].length,
        lineStart,
        null,
        null,
        null,
      )
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

    // ── metadata section ──────────────────────────────────────────
    if (mode === "loom-meta") {
      const metaMatch = line.match(METADATA_RE)
      if (metaMatch) {
        documentMetadata.push({
          name: metaMatch[1],
          type: metaMatch[2].trim(),
          value: stripQuotes(metaMatch[3].trim()),
          span: { start: lineStart, end: lineEnd },
        })
      }
      continue
    }

    // ── loom section body ─────────────────────────────────────────
    if (mode === "loom" && currentLoom) {
      if (/^\s+/.test(line)) {
        const langSwitch = line.match(INDENTED_BRACKET_RE)
        if (langSwitch) {
          flushCode()
          codeLanguage = langSwitch[1].toLowerCase()
          continue
        }
        bufferCode(line, lineStart, lineEnd)
      } else {
        bufferProse(line, lineStart, lineEnd)
      }
      continue
    }

    // ── section body / top ────────────────────────────────────────
    if (!sectionOpen) {
      openSection("", 0, lineStart, null, null, null)
    }

    if (/^\s+/.test(line)) {
      const langSwitch = line.match(INDENTED_BRACKET_RE)
      if (langSwitch) {
        flushCode()
        codeLanguage = langSwitch[1].toLowerCase()
        continue
      }
      bufferCode(line, lineStart, lineEnd)
    } else {
      bufferProse(line, lineStart, lineEnd)
    }
  }

  finishSection(cursor)

  return { language, metadata: documentMetadata, sections, loomSection, diagnostics }
}

export const parse = (source: string): Effect.Effect<LoomDocument> =>
  Effect.sync(() => parseImpl(source))

// ── Runtime Projection (de forma) ─────────────────────────────────────────

export interface RuntimeProjection {
  readonly code: string
  readonly name: string
}

function projectRuntimeImpl(doc: LoomDocument): RuntimeProjection {
  const out: string[] = []
  const name =
    doc.metadata.find((m) => m.name === "name")?.value ?? "LoomModule"

  out.push(`import { Effect } from "effect"`)
  out.push(``)

  for (const section of doc.sections) {
    switch (section.kind) {
      case "untagged": {
        const code = extractCodeContent([section])
        if (code.length > 0) {
          out.push(`export const blocks = [`)
          for (const c of code) out.push(`  ${toTemplateLiteral(c)},`)
          out.push(`] as const`)
          out.push(``)
        }
        break
      }
      case "tagged": {
        const bodyLines = extractCodeContent([section])
        const prose = extractProseContent([section])
        const docstring = formatDocstring(section.heading, prose)
        if (docstring) out.push(docstring)
        out.push(`export const ${section.tag} = () =>`)
        out.push(`  Effect.gen(function* () {`)
        for (const line of bodyLines) out.push(`    ${line}`)
        out.push(`  })`)
        out.push(``)
        break
      }
      case "template": {
        const bodyLines = extractCodeContent([section])
        const prose = extractProseContent([section])
        const docstring = formatDocstring(section.heading, prose)
        const paramsType = formatParamsType(section.params)
        const body = rewriteInterpolations(bodyLines, section.params)
        if (docstring) out.push(docstring)
        out.push(
          `export const ${section.tag} = (params: ${paramsType}) =>`,
        )
        out.push(`  Effect.gen(function* () {`)
        out.push(`    return ${body}`)
        out.push(`  })`)
        out.push(``)
        break
      }
    }
  }

  if (doc.loomSection) {
    const loomCode = doc.loomSection.blocks
      .filter((b): b is CodeBlock => b.kind === "code")
      .map((b) => b.content)

    out.push(`declare const This: {`)
    out.push(`  readonly Loom: {`)
    out.push(`    emit(path: string, content: string): Effect.Effect<void>`)
    out.push(`    needs(): Effect.Effect<void>`)
    out.push(`  }`)
    out.push(`  sections(...headings: string[]): string`)
    out.push(`}`)
    out.push(``)

    if (doc.loomSection.free) {
      for (const line of loomCode) out.push(line)
    } else {
      out.push(`export const program = Effect.gen(function* () {`)
      for (const line of loomCode) out.push(`  ${line}`)
      out.push(`})`)
    }
    out.push(``)
  }

  return { code: out.join("\n"), name }
}

export const projectRuntime = (doc: LoomDocument): Effect.Effect<RuntimeProjection> =>
  Effect.sync(() => projectRuntimeImpl(doc))

function extractCodeContent(sections: ReadonlyArray<Section>): string[] {
  return sections.flatMap((s) =>
    s.blocks
      .filter((b): b is CodeBlock => b.kind === "code")
      .map((b) => b.content),
  )
}

function extractProseContent(sections: ReadonlyArray<Section>): string[] {
  return sections.flatMap((s) =>
    s.blocks
      .filter((b): b is ProseBlock => b.kind === "prose")
      .map((b) => b.content),
  )
}

function formatDocstring(heading: string, prose: string[]): string {
  const lines: string[] = []
  if (heading) lines.push(heading)
  if (prose.length) {
    if (lines.length) lines.push("")
    lines.push(...prose.flatMap((p) => p.split("\n")))
  }
  if (lines.length === 0) return ""
  return [`/**`, ...lines.map((l) => ` * ${l}`), ` */`].join("\n")
}

function formatParamsType(params: ReadonlyArray<Param>): string {
  if (params.length === 0) return "{}"
  const fields = params.map((p) => `${p.name}: ${p.type}`).join("; ")
  return `{ ${fields} }`
}

function rewriteInterpolations(
  bodyLines: string[],
  params: ReadonlyArray<Param>,
): string {
  const known = new Set(params.map((p) => p.name))
  const rewritten = bodyLines.map((line) =>
    line.replace(
      /\{\{(\w+):\s*[^=}]+?(?:\s*=\s*[^}]+?)?\}\}/g,
      (whole, ident) =>
        known.has(ident) ? `\${params.${ident}}` : whole,
    ),
  )
  const joined = rewritten.join("\n")
  return "`" + joined.replace(/`/g, "\\`") + "`"
}

function toTemplateLiteral(s: string): string {
  return "`" + s.replace(/`/g, "\\`") + "`"
}

// ── LSP Projection ───────────────────────────────────────────────────────

export interface LspMapping {
  readonly sourceOffset: number
  readonly generatedOffset: number
  readonly length: number
}

export interface LspProjection {
  readonly code: string
  readonly mappings: ReadonlyArray<LspMapping>
}

function projectLspImpl(doc: LoomDocument): LspProjection {
  let code = ""
  const mappings: LspMapping[] = []

  function emit(text: string) {
    code += text
  }

  function emitMapped(sourceOffset: number, content: string) {
    mappings.push({
      sourceOffset,
      generatedOffset: code.length,
      length: content.length,
    })
    code += content
  }

  function emitMappedIndented(
    sourceOffset: number,
    content: string,
    indent: string,
  ) {
    const lines = content.split("\n")
    let srcOff = sourceOffset
    for (const line of lines) {
      emit(indent)
      emitMapped(srcOff, line)
      emit("\n")
      srcOff += line.length + 1
    }
  }

  function emitProseBlock(block: ProseBlock) {
    for (const line of block.content.split("\n")) {
      emit(`// ${line}\n`)
    }
  }

  function emitCodeBlock(block: CodeBlock) {
    emitMapped(block.span.start, block.content)
    emit("\n")
  }

  function emitSection(section: Section) {
    switch (section.kind) {
      case "untagged":
        for (const block of section.blocks) {
          if (block.kind === "prose") emitProseBlock(block)
          else if (block.kind === "code") emitCodeBlock(block)
        }
        break
      case "tagged":
        emit(`export const `)
        emitMapped(section.tagSpan.start, section.tag)
        emit(` = () =>\n  Effect.gen(function* () {\n`)
        for (const block of section.blocks) {
          if (block.kind === "prose") emitProseBlock(block)
          else if (block.kind === "code") emitCodeBlock(block)
        }
        emit(`  })\n\n`)
        break
      case "template":
        emitTemplateSection(section)
        break
    }
  }

  function emitTemplateSection(section: TemplateSection) {
    const paramRE =
      /\{\{(\w+):\s*[^=}]+?(?:\s*=\s*[^}]+?)?\}\}/g

    emit(`export const `)
    emitMapped(section.tagSpan.start, section.tag)
    emit(` = (params: { `)
    for (let i = 0; i < section.params.length; i++) {
      const p = section.params[i]
      if (i > 0) emit("; ")
      emit(p.name)
      emit(": ")
      emitMapped(p.typeSpan.start, p.type)
    }
    emit(` }) =>\n`)
    emit(`  Effect.gen(function* () {\n`)
    emit(`    return \``)

    let firstBlock = true
    for (const block of section.blocks) {
      if (block.kind !== "code") continue
      if (!firstBlock) emit("\\n")
      firstBlock = false

      const content = block.content
      const re = new RegExp(paramRE.source, "g")
      let lastIndex = 0
      let m: RegExpExecArray | null
      while ((m = re.exec(content)) !== null) {
        if (m.index > lastIndex) {
          emitMapped(
            block.span.start + lastIndex,
            content.substring(lastIndex, m.index),
          )
        }
        emit("${params.")
        emitMapped(block.span.start + m.index + 2, m[1])
        emit("}")
        lastIndex = m.index + m[0].length
      }
      if (lastIndex < content.length) {
        emitMapped(block.span.start + lastIndex, content.substring(lastIndex))
      }
    }

    emit("`\n")
    emit(`  })\n\n`)
  }

  emit('import { Effect } from "effect"\n\n')

  for (const section of doc.sections) {
    emitSection(section)
  }

  if (doc.loomSection) {
    emit("\ndeclare const This: {\n")
    emit("  readonly Loom: {\n")
    emit("    emit(path: string, content: string): Effect.Effect<void>\n")
    emit("    needs(): Effect.Effect<void>\n")
    emit("  }\n")
    emit("  sections(...headings: string[]): string\n")
    emit("}\n\n")

    if (doc.loomSection.free) {
      for (const block of doc.loomSection.blocks) {
        if (block.kind === "code") emitCodeBlock(block)
        else if (block.kind === "prose") emitProseBlock(block)
      }
    } else {
      emit("export const program = Effect.gen(function* () {\n")
      for (const block of doc.loomSection.blocks) {
        if (block.kind === "code") {
          emitMappedIndented(block.span.start, block.content, "  ")
        } else if (block.kind === "prose") {
          for (const line of block.content.split("\n")) {
            emit(`  // ${line}\n`)
          }
        }
      }
      emit("})\n")
    }
  }

  return { code, mappings }
}

export const projectLsp = (doc: LoomDocument): Effect.Effect<LspProjection> =>
  Effect.sync(() => projectLspImpl(doc))

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
    const tag =
      section.kind === "tagged" || section.kind === "template"
        ? section.tag
        : null

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

function projectTangleImpl(
  doc: LoomDocument,
  sourcePath: string,
): TangleProjection {
  const diagnostics: string[] = []

  if (doc.loomSection) {
    return {
      files: [
        {
          path: deriveDefaultPath(sourcePath, doc.language),
          content: [
            `// Tangle controlled by [loom] section.`,
            `// Run \`loom tangle ${sourcePath}\` to execute.`,
          ].join("\n"),
        },
      ],
      diagnostics,
    }
  }

  const files: FileOutput[] = []
  const defaultPath = deriveDefaultPath(sourcePath, doc.language)
  const defaultCode: string[] = []

  for (const section of doc.sections) {
    switch (section.kind) {
      case "template":
        break
      case "tagged": {
        const code = section.blocks
          .filter((b): b is CodeBlock => b.kind === "code")
          .map((b) => b.content)
        if (code.length > 0) {
          const path = section.tangle ?? defaultPath
          files.push({ path, content: code.join("\n") })
        }
        break
      }
      case "untagged": {
        const code = section.blocks
          .filter((b): b is CodeBlock => b.kind === "code")
          .map((b) => b.content)
        if (section.tangle) {
          files.push({ path: section.tangle, content: code.join("\n") })
        } else {
          defaultCode.push(...code)
        }
        break
      }
    }
  }

  if (defaultCode.length > 0) {
    files.unshift({ path: defaultPath, content: defaultCode.join("\n") })
  }

  return { files, diagnostics }
}

export const projectTangle = (
  doc: LoomDocument,
  sourcePath: string,
): Effect.Effect<TangleProjection> =>
  Effect.sync(() => projectTangleImpl(doc, sourcePath))

function deriveDefaultPath(sourcePath: string, language: string): string {
  const extMap: Record<string, string> = {
    typescript: "ts",
    javascript: "js",
    scala: "scala",
    python: "py",
    rust: "rs",
    go: "go",
    java: "java",
    html: "html",
    css: "css",
    sql: "sql",
    json: "json",
  }
  const ext = extMap[language.toLowerCase()] ?? language
  return sourcePath.replace(/\.loom$/, `.loom.${ext}`)
}

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
