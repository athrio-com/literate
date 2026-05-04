import { Effect } from "effect"
import { parse, projectRuntime, projectSegments, projectTangle } from "./loom"

const source = `[typescript]

# Loom

Loom is a literate programming framework written
in TypeScript and Effect.

Every .loom file is parsed into an AST, then consumed
by three independent projections.

# Source positions

Every AST node carries byte offsets into the original
.loom source.

  export interface Span {
    readonly start: number
    readonly end: number
  }

# The document

A LoomDocument is the root AST node. The first \`[language]\`
bracket sets the dominant language for all untagged code.

  export interface LoomDocument {
    readonly language: string
    readonly sections: ReadonlyArray<Section>
  }

# Greeting [Greet, src/greet.ts]

A simple greeter that logs to console.

  console.{{mode: string = "log"}}("Hello {{name: string = "World"}}!")

More explanation at column 0 — this is prose.

  export function helper() {
    return true
  }

# SQL query builder [BuildQuery, src/db.ts]

Builds a parameterized SELECT query.

  [sql]
  SELECT * FROM {{table: string = "users"}}
  WHERE id = {{id: number = 1}}
  ORDER BY created_at DESC

Back to prose resets the language.

  export function wrapQuery() {
    return "wrapped"
  }

[loom]

This loom tangles itself.

  yield* This.Loom.emit("src/types.ts", This.sections("Source positions", "The document"))
`

const main = Effect.gen(function* () {
  const doc = yield* parse(source)

  console.log("=== PARSED AST ===")
  console.log(`Language: ${doc.language}`)
  console.log(`Sections: ${doc.sections.length}`)
  for (const s of doc.sections) {
    const tag = s.kind !== "untagged" ? s.tag : null
    const tangle = s.kind !== "template" ? s.tangle : null
    const kindLabel = tag ? `[${s.kind}: ${tag}]` : `[${s.kind}]`
    const tangleLabel = tangle ? ` → ${tangle}` : ""
    console.log(
      `  ${"#".repeat(s.headingLevel)} ${s.heading} ${kindLabel}${tangleLabel}`,
    )
    const params = s.kind === "template"
      ? s.params.map((p) => `${p.name}: ${p.type}`).join(", ")
      : "none"
    console.log(`    params: ${params || "none"}`)
    console.log(
      `    blocks: ${s.blocks.map((b) => (b.kind === "code" ? `code(${b.language})` : b.kind)).join(", ") || "none"}`,
    )
  }
  console.log(
    `Loom section: ${doc.loomSection ? (doc.loomSection.free ? "free" : "default") : "none"}`,
  )

  console.log("\n=== RUNTIME PROJECTION (de forma) ===")
  const runtime = yield* projectRuntime(doc)
  console.log(runtime.code)

  console.log("\n=== SEGMENTS PROJECTION (de re, virtual) ===")
  const segments = yield* projectSegments(doc)
  console.log(`Language: ${segments.language}`)
  for (const seg of segments.segments) {
    console.log(
      `  [${seg.id}] ${seg.languageId} (${seg.sectionTag ?? "untagged"})`,
    )
    console.log(
      `    "${seg.content.substring(0, 60)}${seg.content.length > 60 ? "..." : ""}"`,
    )
  }

  console.log("\n=== TANGLE PROJECTION (de re, physical) ===")
  const tangle = yield* projectTangle(doc, "example.loom")
  for (const f of tangle.files) {
    console.log(`  -> ${f.path}`)
    console.log(f.content)
  }
})

Effect.runSync(main)
