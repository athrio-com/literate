// Probe script: spawn the LSP server, open a corpus .loom file, request
// semantic tokens, hover, and routing diagnostics. Used to investigate
// why syntax highlighting does/doesn't reach Embedded Code virtual codes.

import { spawn } from "node:child_process"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import {
  createProtocolConnection,
  StreamMessageReader,
  StreamMessageWriter,
  InitializeRequest,
  InitializedNotification,
  DidOpenTextDocumentNotification,
  SemanticTokensRequest,
  HoverRequest,
} from "vscode-languageserver-protocol/node"
import { Effect } from "effect"
import { parse, projectLsp } from "./loom"

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

async function run() {
  const root = resolve(process.cwd())
  const loomPath = resolve(root, "corpus/Loom.loom")
  const configsPath = resolve(root, "corpus/Configs.loom")
  const loomSource = readFileSync(loomPath, "utf-8")
  const configsSource = readFileSync(configsPath, "utf-8")

  // First: print our own LSP projection — what we declare to Volar.
  console.log("══ projectLsp(corpus/Loom.loom) ══════════════════")
  const doc = await Effect.runPromise(parse(loomSource))
  const projection = await Effect.runPromise(projectLsp(doc, loomPath))
  console.log("frame:", projection.frame ? `id=${projection.frame.id} lang=${projection.frame.languageId} mappings=${projection.frame.mappings.length}` : "<none>")
  for (const td of projection.tangledDocuments) {
    console.log(`tangled: id=${td.id} lang=${td.languageId} path=${td.path} mappings=${td.mappings.length}`)
  }
  for (const eb of projection.embeddedBlocks) {
    console.log(`embedded: id=${eb.id} lang=${eb.languageId} mappings=${eb.mappings.length}`)
  }
  console.log()

  if (projection.frame && process.env.DUMP_FRAME) {
    console.log("──── frame content ────")
    console.log(projection.frame.content)
    console.log("──── frame mappings (first 30) ────")
    for (const m of projection.frame.mappings.slice(0, 30)) {
      console.log(`  src=${m.sourceOffset} → gen=${m.generatedOffset} len=${m.length}`)
    }
    console.log()
  }
  if (process.env.DUMP_TANGLED) {
    for (const td of projection.tangledDocuments) {
      console.log(`──── ${td.id} content (${td.languageId}) ────`)
      console.log(td.content)
      console.log(`──── ${td.id} mappings ────`)
      for (const m of td.mappings) {
        console.log(`  src=${m.sourceOffset} → gen=${m.generatedOffset} len=${m.length}`)
      }
      console.log()
    }
  }

  // Now: spawn the LSP server, do the full open + tokens dance.
  const proc = spawn("bun", ["src/server.ts", "--stdio"], {
    cwd: root,
    stdio: ["pipe", "pipe", "pipe"],
    env: { ...process.env },
  })

  // Mirror server stderr so we can see warnings if any.
  proc.stderr?.on("data", (b: Buffer) => {
    process.stderr.write(`[server] ${b.toString()}`)
  })

  const conn = createProtocolConnection(
    new StreamMessageReader(proc.stdout!),
    new StreamMessageWriter(proc.stdin!),
  )
  conn.listen()

  await conn.sendRequest(InitializeRequest.type, {
    processId: process.pid,
    capabilities: {
      textDocument: {
        hover: { contentFormat: ["markdown", "plaintext"] },
        publishDiagnostics: { relatedInformation: true },
        semanticTokens: {
          requests: { full: true, range: false },
          tokenTypes: TOKEN_TYPES,
          tokenModifiers: [],
          formats: ["relative"],
        },
      },
    },
    rootUri: `file://${root}`,
    workspaceFolders: [{ uri: `file://${root}`, name: "loom" }],
  })
  conn.sendNotification(InitializedNotification.type, {})

  // Pre-load Configs.loom so cross-loom imports resolve.
  conn.sendNotification(DidOpenTextDocumentNotification.type, {
    textDocument: {
      uri: `file://${configsPath}`,
      languageId: "loom",
      version: 1,
      text: configsSource,
    },
  })

  conn.sendNotification(DidOpenTextDocumentNotification.type, {
    textDocument: {
      uri: `file://${loomPath}`,
      languageId: "loom",
      version: 1,
      text: loomSource,
    },
  })

  // Give the server time to project + register virtual codes.
  await new Promise((r) => setTimeout(r, 4000))

  console.log("══ semanticTokens for corpus/Loom.loom ═══════════")
  const tokens = await conn.sendRequest(SemanticTokensRequest.type, {
    textDocument: { uri: `file://${loomPath}` },
  })

  if (!tokens) {
    console.log("<server returned null>")
  } else {
    const data = (tokens as { data: number[] }).data
    console.log(`token count: ${data.length / 5}`)
    let prevLine = 0
    let prevChar = 0
    const lines = loomSource.split("\n")
    let emitted = 0
    for (let i = 0; i < data.length && emitted < 60; i += 5) {
      const dLine = data[i]
      const dChar = data[i + 1]
      const len = data[i + 2]
      const type = data[i + 3]
      const line = dLine === 0 ? prevLine : prevLine + dLine
      const ch = dLine === 0 ? prevChar + dChar : dChar
      const text = lines[line]?.substring(ch, ch + len) ?? ""
      console.log(`L${line}:${ch} +${len} type=${TOKEN_TYPES[type] ?? type} text=${JSON.stringify(text)}`)
      prevLine = line
      prevChar = ch
      emitted++
    }
    if (data.length / 5 > emitted) {
      console.log(`...(${data.length / 5 - emitted} more)`)
    }
  }

  console.log()
  console.log("══ hover at (line 19, char 4) — `app` in Greet section")
  // line 19 = "  app.get..." (0-indexed: line 18 in 0-indexed, but loom file is 1-indexed in ed)
  // Loom.loom line 19: "  app.get("/hello/:name?", (c) => {"
  const hover19 = await conn.sendRequest(HoverRequest.type, {
    textDocument: { uri: `file://${loomPath}` },
    position: { line: 18, character: 4 },
  })
  console.log(JSON.stringify(hover19, null, 2))

  console.log()
  console.log("══ hover at (line 60, char 10) — `App` reference in Tangle compose")
  const hover60 = await conn.sendRequest(HoverRequest.type, {
    textDocument: { uri: `file://${loomPath}` },
    position: { line: 59, character: 10 },
  })
  console.log(JSON.stringify(hover60, null, 2))

  console.log()
  console.log("══ hover at (line 14, char 22) — `[Greet]` tag in heading")
  // Loom.loom L14 (1-indexed) = L13 0-indexed: "# Greeting handler [Greet]"
  // [Greet] starts at char 19, the G of Greet at char 20 (0-indexed)
  const hoverGreetTag = await conn.sendRequest(HoverRequest.type, {
    textDocument: { uri: `file://${loomPath}` },
    position: { line: 13, character: 22 },
  })
  console.log(JSON.stringify(hoverGreetTag, null, 2))

  console.log()
  console.log("══ hover at (line 1, char 4) — title `HonoHello`")
  const hoverTitle = await conn.sendRequest(HoverRequest.type, {
    textDocument: { uri: `file://${loomPath}` },
    position: { line: 0, character: 4 },
  })
  console.log(JSON.stringify(hoverTitle, null, 2))

  console.log()
  console.log("══ hover at (line 67, char 8) — `ConfigLoom` in needs(ConfigLoom)")
  // Loom.loom L67 (1-indexed) = L66 0-indexed: "  needs(ConfigLoom)"
  const hoverNeeds = await conn.sendRequest(HoverRequest.type, {
    textDocument: { uri: `file://${loomPath}` },
    position: { line: 66, character: 10 },
  })
  console.log(JSON.stringify(hoverNeeds, null, 2))

  console.log()
  console.log("══ hover at (line 53, char 22) — `ConfigLoom` in `yield* ConfigLoom`")
  // Loom.loom L53 (1-indexed) = L52 0-indexed: "  const { PackageJson } = yield* ConfigLoom"
  const hoverYieldConfigLoom = await conn.sendRequest(HoverRequest.type, {
    textDocument: { uri: `file://${loomPath}` },
    position: { line: 52, character: 38 },
  })
  console.log(JSON.stringify(hoverYieldConfigLoom, null, 2))

  console.log()
  console.log("══ hover at (line 49, char 12) — `[PackageJson` Tangle tag")
  // Loom.loom L49 (1-indexed) = L48 0-indexed: "# Tangle [PackageJson, temp/hono/package.json]"
  const hoverPkgTangleTag = await conn.sendRequest(HoverRequest.type, {
    textDocument: { uri: `file://${loomPath}` },
    position: { line: 48, character: 12 },
  })
  console.log(JSON.stringify(hoverPkgTangleTag, null, 2))

  console.log()
  console.log("══ hover at (line 56, char 12) — `[IndexTs` Tangle tag")
  // Loom.loom L56 (1-indexed) = L55 0-indexed: "# Tangle [IndexTs, temp/hono/src/index.ts]"
  const hoverIdxTangleTag = await conn.sendRequest(HoverRequest.type, {
    textDocument: { uri: `file://${loomPath}` },
    position: { line: 55, character: 12 },
  })
  console.log(JSON.stringify(hoverIdxTangleTag, null, 2))

  console.log()
  console.log("══ hover at (line 39, char 22) — `[Imports]` tag")
  // Loom.loom L39 (1-indexed) = L38 0-indexed: "# Import as needed [Imports]"
  const hoverImportsTag = await conn.sendRequest(HoverRequest.type, {
    textDocument: { uri: `file://${loomPath}` },
    position: { line: 38, character: 22 },
  })
  console.log(JSON.stringify(hoverImportsTag, null, 2))

  console.log()
  console.log("══ hover at (line 53, char 28) — destructured `PackageJson` in tangle")
  // Loom.loom L53 (1-indexed): "  const { PackageJson } = yield* ConfigLoom"
  // 0-indexed: line 52. The `PackageJson` ident starts at col 12.
  const hoverDestructuredPkg = await conn.sendRequest(HoverRequest.type, {
    textDocument: { uri: `file://${loomPath}` },
    position: { line: 52, character: 14 },
  })
  console.log(JSON.stringify(hoverDestructuredPkg, null, 2))

  conn.dispose()
  proc.kill()
}

run().then(() => process.exit(0)).catch((e) => {
  console.error(e)
  process.exit(1)
})
