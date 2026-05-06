import { describe, test, expect, beforeAll, afterAll } from "bun:test"
import { spawn, type ChildProcess } from "node:child_process"
import {
  createProtocolConnection,
  StreamMessageReader,
  StreamMessageWriter,
  InitializeRequest,
  InitializedNotification,
  DidOpenTextDocumentNotification,
  HoverRequest,
  type ProtocolConnection,
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
        hover: { contentFormat: ["markdown", "plaintext"] },
        completion: { completionItem: { snippetSupport: false } },
        publishDiagnostics: { relatedInformation: true },
      },
    },
    rootUri: `file://${process.cwd()}`,
    workspaceFolders: null,
  })
  connection.sendNotification(InitializedNotification.type, {})
}

describe("Python LSP integration via Loom server", () => {
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

  test("hover on Python code returns type info from Pyright", async () => {
    const uri = "file:///test/python-hover.loom"
    const source = `[python]

# Mod

  x: int = 42
`

    connection.sendNotification(DidOpenTextDocumentNotification.type, {
      textDocument: {
        uri,
        languageId: "loom",
        version: 1,
        text: source,
      },
    })

    // Pyright needs time to start + initialize + analyze
    await new Promise((r) => setTimeout(r, 10000))

    const hover = await connection.sendRequest(HoverRequest.type, {
      textDocument: { uri },
      position: { line: 4, character: 2 },
    })

    expect(hover).not.toBeNull()
    if (hover) {
      const content =
        typeof hover.contents === "string"
          ? hover.contents
          : "value" in hover.contents
            ? hover.contents.value
            : ""
      expect(content).toContain("x")
    }
  }, 30000)

  test("TS hover still works alongside Python", async () => {
    const uri = "file:///test/ts-alongside.loom"
    const source = `[typescript]

# Greeting [Greet]

  const msg: string = "hello"
`

    connection.sendNotification(DidOpenTextDocumentNotification.type, {
      textDocument: {
        uri,
        languageId: "loom",
        version: 1,
        text: source,
      },
    })

    await new Promise((r) => setTimeout(r, 3000))

    const hover = await connection.sendRequest(HoverRequest.type, {
      textDocument: { uri },
      position: { line: 4, character: 8 },
    })

    expect(hover).not.toBeNull()
    if (hover) {
      const content =
        typeof hover.contents === "string"
          ? hover.contents
          : "value" in hover.contents
            ? hover.contents.value
            : ""
      expect(content).toContain("string")
    }
  }, 15000)
})
