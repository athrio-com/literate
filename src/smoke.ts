import { Effect } from "effect"
import { parse, projectLsp, projectRuntime, projectSegments, projectTangle } from "./loom"

const source = `[typescript]

# Loom

Loom is a literate programming framework written
in TypeScript and Effect.

Every .loom file is parsed into an AST, then consumed
by three independent projections.

# Source positions [Positions]

Every AST node carries byte offsets into the original
.loom source.

  export interface Span {
    readonly start: number
    readonly end: number
  }

# The document [Document]

A LoomDocument is the root AST node. The first \`[language]\`
bracket sets the dominant language for all untagged code.

  export interface LoomDocument {
    readonly language: string
    readonly sections: ReadonlyArray<Section>
  }

# Greeting [Greet]

A simple greeter that logs to console.

  console.{{mode: string = "log"}}("Hello {{name: string = "World"}}!")

More explanation at column 0 — this is prose.

  export function helper() {
    return true
  }

# SQL query builder [BuildQuery]

Builds a parameterized SELECT query.

  [sql]
  SELECT * FROM {{table: string = "users"}}
  WHERE id = {{id: number = 1}}
  ORDER BY created_at DESC

Back to prose resets the language.

  export function wrapQuery() {
    return "wrapped"
  }

# Tangle [TypesTs, src/types.ts]

This tangle composes the types module.

  compose(Positions, Document)

# Tangle [GreetTs, src/greet.ts]

This tangle composes the greeter.

  compose(Greet, BuildQuery)
`

const main = Effect.gen(function* () {
  const doc = yield* parse(source)

  console.log("=== PARSED AST ===")
  console.log("Language: " + doc.language)
  console.log("Content sections: " + doc.sections.length)
  for (const s of doc.sections) {
    const tag = s.kind === "tagged" ? s.tag : null
    const kindLabel = tag ? "[" + s.kind + ": " + tag + "]" : "[" + s.kind + "]"
    console.log(
      "  " + "#".repeat(s.headingLevel) + " " + s.heading + " " + kindLabel + " (index " + s.index + ")",
    )
    const params = s.kind === "tagged" && s.params.length > 0
      ? s.params.map((p) => p.name + ": " + p.type).join(", ")
      : "none"
    console.log("    params: " + params)
    console.log(
      "    blocks: " + (s.blocks.map((b) => (b.kind === "code" ? "code(" + b.language + ")" : b.kind)).join(", ") || "none"),
    )
  }

  console.log("\nTangle sections: " + doc.tangles.length)
  for (const t of doc.tangles) {
    console.log("  # Tangle [" + t.path + "]")
    console.log("    blocks: " + t.blocks.length)
  }

  console.log("Deps: " + (doc.deps ? "present" : "none"))
  console.log("Free: " + (doc.free ? "present" : "none"))
  console.log("Diagnostics: " + doc.diagnostics.length)
  for (const d of doc.diagnostics) {
    console.log("  ! " + d.message)
  }

  console.log("\n=== RUNTIME PROJECTION (de forma) ===")
  const runtime = yield* projectRuntime(doc)
  console.log(runtime.code)

  console.log("\n=== LSP PROJECTION (frame + tangled + embedded) ===")
  const lsp = yield* projectLsp(doc)
  if (lsp.frame) {
    console.log("Frame: " + lsp.frame.id + " (" + lsp.frame.languageId + ")")
    console.log("  mappings: " + lsp.frame.mappings.length)
    console.log("  content:\n" + lsp.frame.content)
  } else {
    console.log("Frame: none")
  }
  console.log("Tangled documents: " + lsp.tangledDocuments.length)
  for (const td of lsp.tangledDocuments) {
    console.log("  [" + td.id + "] " + td.languageId + " -> " + td.path)
    console.log("    mappings: " + td.mappings.length)
    console.log("    content (first 200 chars): " + td.content.substring(0, 200) + "...")
  }
  console.log("Embedded blocks: " + lsp.embeddedBlocks.length)
  for (const eb of lsp.embeddedBlocks) {
    console.log("  [" + eb.id + "] " + eb.languageId + ': "' + eb.content.substring(0, 60) + '"')
  }

  console.log("\n=== SEGMENTS PROJECTION (de re, virtual) ===")
  const segments = yield* projectSegments(doc)
  console.log("Language: " + segments.language)
  for (const seg of segments.segments) {
    console.log(
      "  [" + seg.id + "] " + seg.languageId + " (" + (seg.sectionTag ?? "untagged") + ")",
    )
    console.log(
      '    "' + seg.content.substring(0, 60) + (seg.content.length > 60 ? "..." : "") + '"',
    )
  }

  console.log("\n=== TANGLE PROJECTION (de re, physical) ===")
  const tangle = yield* projectTangle(doc, "example.loom")
  if (tangle.files.length === 0) {
    console.log("  (no files emitted)")
  }
  for (const f of tangle.files) {
    console.log("  -> " + f.path)
    console.log(f.content)
  }
})

Effect.runSync(main)
