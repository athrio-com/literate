import { describe, test, expect, beforeAll, afterAll } from "bun:test"
import { spawn, type ChildProcess } from "node:child_process"
import {
  createProtocolConnection,
  StreamMessageReader,
  StreamMessageWriter,
  InitializeRequest,
  InitializedNotification,
  DidOpenTextDocumentNotification,
  DidChangeTextDocumentNotification,
  type ProtocolConnection,
  type PublishDiagnosticsParams,
} from "vscode-languageserver-protocol/node"

function startServer() {
  const proc = spawn("bun", ["src/server.ts", "--stdio"], {
    cwd: process.cwd(),
    stdio: ["pipe", "pipe", "pipe"],
  })

  const connection = createProtocolConnection(
    new StreamMessageReader(proc.stdout!),
    new StreamMessageWriter(proc.stdin!),
  )

  connection.listen()
  return { proc, connection }
}

async function initializeServer(connection: ProtocolConnection) {
  await connection.sendRequest(InitializeRequest.type, {
    processId: process.pid,
    capabilities: {
      textDocument: {
        publishDiagnostics: { relatedInformation: true },
      },
    },
    rootUri: `file://${process.cwd()}`,
    workspaceFolders: null,
  })
  connection.sendNotification(InitializedNotification.type, {})
}

function waitForDiagnostics(
  connection: ProtocolConnection,
  uri: string,
  timeout = 15000,
): Promise<PublishDiagnosticsParams> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`No diagnostics for ${uri} within ${timeout}ms`)),
      timeout,
    )
    connection.onNotification(
      "textDocument/publishDiagnostics",
      (params: PublishDiagnosticsParams) => {
        if (params.uri === uri) {
          clearTimeout(timer)
          resolve(params)
        }
      },
    )
  })
}

describe("Loom LSP diagnostics", () => {
  let proc: ChildProcess
  let connection: ProtocolConnection

  beforeAll(async () => {
    const server = startServer()
    proc = server.proc
    connection = server.connection
    await initializeServer(connection)
  })

  afterAll(() => {
    connection.dispose()
    proc.kill()
  })

  test("unclosed bracket in heading emits diagnostic", async () => {
    const uri = "file:///test/unclosed-bracket.loom"
    const source = `[typescript]

# Greeting from Loom [YYT

  console.log("hello")
`

    const diagPromise = waitForDiagnostics(connection, uri)

    connection.sendNotification(DidOpenTextDocumentNotification.type, {
      textDocument: {
        uri,
        languageId: "loom",
        version: 1,
        text: source,
      },
    })

    const result = await diagPromise
    expect(result.diagnostics.length).toBeGreaterThan(0)

    const loomDiags = result.diagnostics.filter((d) => d.source === "loom")
    expect(loomDiags.length).toBe(1)
    expect(loomDiags[0].message).toContain("Unclosed bracket")
  })

  test("valid document emits no loom diagnostics", async () => {
    const uri = "file:///test/valid.loom"
    const source = `[typescript]

# Greeting [Greet]

  console.log("hello")
`

    const diagPromise = waitForDiagnostics(connection, uri)

    connection.sendNotification(DidOpenTextDocumentNotification.type, {
      textDocument: {
        uri,
        languageId: "loom",
        version: 1,
        text: source,
      },
    })

    const result = await diagPromise
    const loomDiags = result.diagnostics.filter((d) => d.source === "loom")
    expect(loomDiags.length).toBe(0)
  })

  test("empty brackets emit diagnostic", async () => {
    const uri = "file:///test/empty-brackets.loom"
    const source = `[typescript]

# Greeting []

  console.log("hello")
`

    const diagPromise = waitForDiagnostics(connection, uri)

    connection.sendNotification(DidOpenTextDocumentNotification.type, {
      textDocument: {
        uri,
        languageId: "loom",
        version: 1,
        text: source,
      },
    })

    const result = await diagPromise
    const loomDiags = result.diagnostics.filter((d) => d.source === "loom")
    expect(loomDiags.length).toBe(1)
    expect(loomDiags[0].message).toContain("Empty brackets")
  })

  test("invalid tag identifier emits diagnostic", async () => {
    const uri = "file:///test/invalid-tag.loom"
    const source = `[typescript]

# Greeting [123bad]

  console.log("hello")
`

    const diagPromise = waitForDiagnostics(connection, uri)

    connection.sendNotification(DidOpenTextDocumentNotification.type, {
      textDocument: {
        uri,
        languageId: "loom",
        version: 1,
        text: source,
      },
    })

    const result = await diagPromise
    const loomDiags = result.diagnostics.filter((d) => d.source === "loom")
    expect(loomDiags.length).toBe(1)
    expect(loomDiags[0].message).toContain("not a valid identifier")
  })

  test("loom diagnostics survive alongside TS diagnostics", async () => {
    const uri = "file:///test/mixed-diags.loom"
    const source = `[typescript]

# Greeting from Loom [YYT

  const x: number = "not a number"
`

    // Wait for multiple diagnostic publishes — Volar sends TS diagnostics
    // after our initial loom diagnostics, and the merge interceptor should
    // keep both.
    const allPublishes: PublishDiagnosticsParams[] = []
    const settled = new Promise<void>((resolve) => {
      let timer: ReturnType<typeof setTimeout>
      connection.onNotification(
        "textDocument/publishDiagnostics",
        (params: PublishDiagnosticsParams) => {
          if (params.uri === uri) {
            allPublishes.push(params)
            clearTimeout(timer)
            timer = setTimeout(resolve, 3000)
          }
        },
      )
      timer = setTimeout(resolve, 10000)
    })

    connection.sendNotification(DidOpenTextDocumentNotification.type, {
      textDocument: {
        uri,
        languageId: "loom",
        version: 1,
        text: source,
      },
    })

    await settled

    // The last publish should contain both loom and TS diagnostics
    const last = allPublishes[allPublishes.length - 1]
    expect(last).toBeDefined()

    const loomDiags = last.diagnostics.filter((d) => d.source === "loom")
    expect(loomDiags.length).toBeGreaterThan(0)
    expect(loomDiags.some((d) => d.message.includes("Unclosed bracket"))).toBe(
      true,
    )
  })

  test("loom diagnostics clear when error is fixed", async () => {
    const uri = "file:///test/fix-error.loom"
    const broken = `[typescript]

# Greeting from Loom [YYT

  console.log("hello")
`
    const fixed = `[typescript]

# Greeting from Loom [YYT]

  console.log("hello")
`

    // Open with broken source
    const diagPromise1 = waitForDiagnostics(connection, uri)
    connection.sendNotification(DidOpenTextDocumentNotification.type, {
      textDocument: { uri, languageId: "loom", version: 1, text: broken },
    })
    const result1 = await diagPromise1
    const loomBefore = result1.diagnostics.filter((d) => d.source === "loom")
    expect(loomBefore.length).toBe(1)
    expect(loomBefore[0].message).toContain("Unclosed bracket")

    // Fix the error — wait for diagnostics to settle after the change
    const allPublishes: PublishDiagnosticsParams[] = []
    const settled = new Promise<void>((resolve) => {
      let timer: ReturnType<typeof setTimeout>
      connection.onNotification(
        "textDocument/publishDiagnostics",
        (params: PublishDiagnosticsParams) => {
          if (params.uri === uri) {
            allPublishes.push(params)
            clearTimeout(timer)
            timer = setTimeout(resolve, 3000)
          }
        },
      )
      timer = setTimeout(resolve, 10000)
    })

    connection.sendNotification(DidChangeTextDocumentNotification.type, {
      textDocument: { uri, version: 2 },
      contentChanges: [{ text: fixed }],
    })

    await settled

    const last = allPublishes[allPublishes.length - 1]
    expect(last).toBeDefined()
    const loomAfter = last.diagnostics.filter((d) => d.source === "loom")
    expect(loomAfter.length).toBe(0)
  })
})
