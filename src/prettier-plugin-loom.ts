import { doc as prettierDoc } from "prettier"
import type { Plugin, AstPath, Doc, ParserOptions } from "prettier"

const { hardline, join } = prettierDoc.builders

// ── Language → Prettier parser mapping ──────────────────────────────────

const LANG_TO_PARSER: Record<string, string> = {
  typescript: "typescript",
  ts: "typescript",
  loom: "typescript",
  javascript: "babel",
  js: "babel",
  tsx: "typescript",
  jsx: "babel",
  json: "json",
  css: "css",
  html: "html",
}

// ── AST ─────────────────────────────────────────────────────────────────

interface LoomNode {
  type: string
  start: number
  end: number
  children?: ChildNode[]
}

interface RootNode extends LoomNode {
  type: "root"
  children: ChildNode[]
}

interface VerbatimNode extends LoomNode {
  type: "verbatim"
  value: string
}

interface CodeNode extends LoomNode {
  type: "code"
  language: string
  content: string
  indent: number
  raw: string
}

type ChildNode = VerbatimNode | CodeNode

// ── Parser ──────────────────────────────────────────────────────────────

const HEADING_BRACKET_RE = /^(#{1,6})\s+(.+?)\s+\[([^\]]*)\]\s*$/
const BRACKET_RE = /^\[([^\]]+)\]\s*$/
const FENCE_OPEN_RE = /^```(\w*)\s*$/
const FENCE_CLOSE_RE = /^```\s*$/
const TRANSCLUSION_RE = /\{\{[^}]+\}\}/
const INDENTED_BRACKET_RE = /^\s+\[(\w+)\]\s*$/

function parseLoom(text: string): RootNode {
  const children: ChildNode[] = []
  const lines = text.split("\n")
  let cursor = 0
  let language = ""

  let verbStart = 0
  let verbBuf: string[] = []

  let codeStart = 0
  let codeBuf: string[] = []
  let inFence = false

  function flushVerbatim() {
    if (verbBuf.length === 0) return
    const value = verbBuf.join("\n")
    children.push({
      type: "verbatim",
      value,
      start: verbStart,
      end: verbStart + value.length,
    })
    verbBuf = []
  }

  function flushCode() {
    if (codeBuf.length === 0) return
    while (codeBuf.length > 0 && codeBuf[codeBuf.length - 1].trim() === "") {
      verbBuf.unshift(codeBuf.pop()!)
    }
    if (codeBuf.length === 0) return

    const raw = codeBuf.join("\n")
    const nonEmpty = codeBuf.filter((l) => l.trim().length > 0)
    const minIndent =
      nonEmpty.length > 0
        ? Math.min(...nonEmpty.map((l) => l.match(/^(\s*)/)![0].length))
        : 0
    const content = codeBuf.map((l) => l.substring(minIndent)).join("\n")

    children.push({
      type: "code",
      language,
      content,
      indent: minIndent,
      raw,
      start: codeStart,
      end: codeStart + raw.length,
    })
    codeBuf = []
  }

  function pushVerbatim(line: string, offset: number) {
    flushCode()
    if (verbBuf.length === 0) verbStart = offset
    verbBuf.push(line)
  }

  function pushCode(line: string, offset: number) {
    flushVerbatim()
    if (codeBuf.length === 0) codeStart = offset
    codeBuf.push(line)
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineStart = cursor
    cursor += line.length + 1

    if (inFence) {
      if (FENCE_CLOSE_RE.test(line)) inFence = false
      pushVerbatim(line, lineStart)
      continue
    }
    if (FENCE_OPEN_RE.test(line)) {
      inFence = true
      pushVerbatim(line, lineStart)
      continue
    }

    const topBracket = line.match(BRACKET_RE)
    if (topBracket && !language) {
      language = topBracket[1].trim().toLowerCase()
      pushVerbatim(line, lineStart)
      continue
    }

    const hb = line.match(HEADING_BRACKET_RE)
    if (hb) {
      if (!language) language = hb[3].trim().toLowerCase()
      pushVerbatim(line, lineStart)
      continue
    }

    if (/^#{1,6}\s+/.test(line)) {
      pushVerbatim(line, lineStart)
      continue
    }

    const indentedBracket = line.match(INDENTED_BRACKET_RE)
    if (indentedBracket) {
      flushCode()
      language = indentedBracket[1].toLowerCase()
      pushVerbatim(line, lineStart)
      continue
    }

    if (/^\s{2,}/.test(line)) {
      pushCode(line, lineStart)
      continue
    }

    if (line.trim() === "") {
      if (codeBuf.length > 0) {
        codeBuf.push(line)
      } else {
        if (verbBuf.length === 0) verbStart = lineStart
        verbBuf.push(line)
      }
      continue
    }

    pushVerbatim(line, lineStart)
  }

  flushCode()
  flushVerbatim()

  return { type: "root", children, start: 0, end: text.length }
}

// ── Printer ─────────────────────────────────────────────────────────────

function reindent(formatted: string, indent: number): Doc {
  const prefix = " ".repeat(indent)
  const lines = formatted.split("\n")
  const docs: Doc[] = lines.map((l) => (l.trim() ? prefix + l : ""))
  return join(hardline, docs)
}

function print(path: AstPath<LoomNode>, _options: ParserOptions, print: (path: AstPath) => Doc): Doc {
  const node = path.node

  if (node.type === "root") {
    const root = node as RootNode
    const docs: Doc[] = []
    for (let i = 0; i < root.children.length; i++) {
      docs.push(path.call(print, "children", i) as Doc)
      if (i < root.children.length - 1) docs.push(hardline)
    }
    return docs
  }

  if (node.type === "verbatim") {
    return (node as VerbatimNode).value
  }

  if (node.type === "code") {
    return (node as CodeNode).raw
  }

  return ""
}

type TextToDoc = (text: string, options: { parser: string }) => Promise<Doc>
type EmbedPrint = (path: AstPath) => Doc

function embed(path: AstPath<LoomNode>, _options: ParserOptions) {
  const node = path.node
  if (node.type !== "code") return undefined

  const code = node as CodeNode
  const parser = LANG_TO_PARSER[code.language]
  if (!parser) return undefined
  if (TRANSCLUSION_RE.test(code.content)) return undefined

  return async (textToDoc: TextToDoc, _print: EmbedPrint) => {
    try {
      const hasYield = code.content.includes("yield")
      const toFormat = hasYield
        ? `function* _loom_() {\n${code.content}\n}\n`
        : code.content + "\n"

      const doc = await textToDoc(toFormat, { parser })
      const printed = prettierDoc.printer.printDocToString(doc, {
        printWidth: 80,
        tabWidth: 2,
        useTabs: false,
      } as any)
      let formatted = printed.formatted
      if (formatted.endsWith("\n")) formatted = formatted.slice(0, -1)

      if (hasYield) {
        const lines = formatted.split("\n")
        formatted = lines
          .slice(1, -1)
          .map((l) => (l.startsWith("  ") ? l.substring(2) : l))
          .join("\n")
      }

      return reindent(formatted, code.indent)
    } catch {
      return code.raw
    }
  }
}

// ── Plugin ──────────────────────────────────────────────────────────────

const plugin: Plugin = {
  languages: [
    {
      name: "Loom",
      parsers: ["loom"],
      extensions: [".loom"],
    },
  ],
  parsers: {
    loom: {
      parse: parseLoom as any,
      astFormat: "loom-ast",
      locStart: (node: LoomNode) => node.start,
      locEnd: (node: LoomNode) => node.end,
    },
  },
  printers: {
    "loom-ast": {
      print: print as any,
      embed: embed as any,
    },
  },
}

export const languages = plugin.languages
export const parsers = plugin.parsers
export const printers = plugin.printers
export default plugin
