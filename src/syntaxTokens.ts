import type {
  LanguageServicePlugin,
  SemanticToken,
} from "@volar/language-service"
import Parser from "web-tree-sitter"
import { resolve, dirname } from "path"
import { readdirSync } from "fs"
import { fileURLToPath } from "url"
import {
  Context,
  Effect,
  HashMap,
  Layer,
  ManagedRuntime,
  Pool,
  Ref,
  Scope,
  pipe,
} from "effect"

// ── Pure data ────────────────────────────────────────────────────────────

const TOKEN_TYPES = [
  "keyword",
  "string",
  "number",
  "operator",
  "regexp",
  "comment",
  "type",
  "variable",
  "property",
  "function",
]

const TS_KEYWORDS = new Set([
  "abstract",
  "as",
  "async",
  "await",
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "debugger",
  "declare",
  "default",
  "delete",
  "do",
  "else",
  "enum",
  "export",
  "extends",
  "finally",
  "for",
  "from",
  "function",
  "get",
  "if",
  "implements",
  "import",
  "in",
  "instanceof",
  "interface",
  "is",
  "keyof",
  "let",
  "module",
  "namespace",
  "new",
  "of",
  "override",
  "readonly",
  "return",
  "satisfies",
  "set",
  "static",
  "switch",
  "throw",
  "try",
  "type",
  "typeof",
  "var",
  "void",
  "while",
  "with",
  "yield",
])

// ── Pure helpers ─────────────────────────────────────────────────────────

function nodeToTokenType(node: Parser.SyntaxNode): string | undefined {
  const t = node.type
  const pt = node.parent?.type

  if (TS_KEYWORDS.has(t) && t === node.text) return "keyword"
  if (t === "true" || t === "false" || t === "null" || t === "undefined")
    return "keyword"

  if (t === "string_fragment" || t === '"' || t === "'") {
    if (pt === "string" || pt === "template_string") return "string"
  }
  if (t === "template_string" && node.childCount === 0) return "string"
  if (t === "`") return "string"

  if (t === "number" && pt !== "predefined_type") return "number"

  if (t === "regex_pattern" || t === "regex_flags") return "regexp"
  if (t === "/" && pt === "regex") return "regexp"

  if (t === "comment" || t === "line_comment" || t === "block_comment")
    return "comment"

  if (t === "=>" || t === "..." || t === "?." || t === "??" || t === "?.") return "operator"
  if (
    t === "+" ||
    t === "-" ||
    t === "*" ||
    t === "/" ||
    t === "%" ||
    t === "**"
  )
    if (pt !== "regex") return "operator"
  if (
    t === "=" ||
    t === "+=" ||
    t === "-=" ||
    t === "*=" ||
    t === "/=" ||
    t === "%=" ||
    t === "**="
  )
    return "operator"
  if (
    t === "==" ||
    t === "!=" ||
    t === "===" ||
    t === "!==" ||
    t === "<" ||
    t === ">" ||
    t === "<=" ||
    t === ">="
  )
    return "operator"
  if (t === "&&" || t === "||" || t === "!" || t === "~") return "operator"
  if (t === "&" || t === "|" || t === "^" || t === "<<" || t === ">>")
    return "operator"
  if (t === "++" || t === "--") return "operator"

  if (t === "type_identifier") return "type"
  if (t === "number" && pt === "predefined_type") return "type"
  if (t === "string" && pt === "predefined_type") return "type"
  if (t === "boolean" && pt === "predefined_type") return "type"
  if (t === "void" && pt === "predefined_type") return "type"
  if (t === "any" || t === "never" || t === "unknown" || t === "object")
    if (pt === "predefined_type") return "type"

  if (t === "property_identifier") return "property"

  return undefined
}

function walk(
  node: Parser.SyntaxNode,
  positionAt: (offset: number) => { line: number; character: number },
  legend: { tokenTypes: readonly string[] },
  tokens: SemanticToken[],
): void {
  if (node.childCount === 0) {
    const typeName = nodeToTokenType(node)
    if (typeName) {
      const typeIndex = legend.tokenTypes.indexOf(typeName)
      if (typeIndex !== -1) {
        const pos = positionAt(node.startIndex)
        const len = node.endIndex - node.startIndex
        tokens.push([pos.line, pos.character, len, typeIndex, 0])
      }
    }
  }
  for (let i = 0; i < node.childCount; i++) {
    walk(node.child(i)!, positionAt, legend, tokens)
  }
}

// ── TreeSitter service ──────────────────────────────────────────────────

export class TreeSitter extends Context.Tag("TreeSitter")<
  TreeSitter,
  {
    readonly getLanguage: (
      lang: string,
    ) => Effect.Effect<Parser.Language | null>
    readonly withParser: <A>(
      f: (parser: Parser) => A,
    ) => Effect.Effect<A, never, Scope.Scope>
  }
>() {}

export const TreeSitterLive = Layer.scoped(
  TreeSitter,
  Effect.gen(function* () {
    yield* Effect.promise(() => Parser.init())

    const grammarsDir = resolve(
      dirname(fileURLToPath(import.meta.url)),
      "../node_modules/tree-sitter-wasms/out",
    )
    const available = yield* Effect.sync(() =>
      new Set(
        readdirSync(grammarsDir)
          .filter((f) => f.endsWith(".wasm"))
          .map((f) => f.replace("tree-sitter-", "").replace(".wasm", "")),
      ),
    )

    const cache = yield* Ref.make(HashMap.empty<string, Parser.Language>())

    const pool = yield* Pool.make({
      acquire: Effect.sync(() => new Parser()),
      size: 4,
    })

    const getLanguage = (
      lang: string,
    ): Effect.Effect<Parser.Language | null> =>
      Effect.gen(function* () {
        const cached = yield* pipe(
          Ref.get(cache),
          Effect.map(HashMap.get(lang)),
        )
        if (cached._tag === "Some") return cached.value
        if (!available.has(lang)) return null
        const wasmPath = resolve(grammarsDir, `tree-sitter-${lang}.wasm`)
        const language = yield* Effect.promise(() =>
          Parser.Language.load(wasmPath),
        )
        yield* Ref.update(cache, HashMap.set(lang, language))
        return language
      })

    const withParser = <A>(
      f: (parser: Parser) => A,
    ): Effect.Effect<A, never, Scope.Scope> =>
      Effect.gen(function* () {
        const parser = yield* pool.get
        return f(parser)
      })

    return { getLanguage, withParser }
  }),
)

// ── Volar plugin (boundary adapter) ─────────────────────────────────────

const GRAMMAR_ALIAS: Record<string, string> = {
  typescript: "typescript",
  ts: "typescript",
  javascript: "javascript",
  js: "javascript",
  tsx: "tsx",
  jsx: "javascript",
  json: "json",
  css: "css",
  html: "html",
  python: "python",
  py: "python",
  go: "go",
  rust: "rust",
  rs: "rust",
  sql: "sql",
  scala: "scala",
  java: "java",
  c: "c",
  cpp: "cpp",
  ruby: "ruby",
  rb: "ruby",
  bash: "bash",
  sh: "bash",
  yaml: "yaml",
  yml: "yaml",
  toml: "toml",
  markdown: "markdown",
  md: "markdown",
}

export function createSyntaxTokenPlugin(
  runtime: ManagedRuntime.ManagedRuntime<TreeSitter, never>,
): LanguageServicePlugin {
  return {
    name: "loom-syntax-tokens",
    capabilities: {
      semanticTokensProvider: {
        legend: {
          tokenTypes: TOKEN_TYPES,
          tokenModifiers: [],
        },
      },
    },
    create() {
      return {
        async provideDocumentSemanticTokens(document, _range, legend) {
          return runtime.runPromise(
            Effect.scoped(
              Effect.gen(function* () {
                const ts = yield* TreeSitter

                const grammarName = GRAMMAR_ALIAS[document.languageId]
                if (!grammarName) return [] as SemanticToken[]

                const lang = yield* ts.getLanguage(grammarName)
                if (!lang) return [] as SemanticToken[]

                const text = document.getText()
                const tokens: SemanticToken[] = []

                yield* ts.withParser((parser) => {
                  parser.setLanguage(lang)
                  const tree = parser.parse(text)
                  walk(
                    tree.rootNode,
                    (offset) => document.positionAt(offset),
                    legend,
                    tokens,
                  )
                })

                tokens.sort((a, b) => a[0] - b[0] || a[1] - b[1])
                return tokens
              }),
            ),
          )
        },
      }
    },
  }
}
