import { spawn, type ChildProcess } from "node:child_process"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { mkdirSync, writeFileSync } from "node:fs"
import {
  createMessageConnection,
  StreamMessageReader,
  StreamMessageWriter,
  type MessageConnection,
} from "vscode-jsonrpc/node"
import type {
  InitializeParams,
  ServerCapabilities,
  Position,
  Hover,
  CompletionList,
  CompletionItem,
  Location,
  LocationLink,
  PublishDiagnosticsParams,
  Diagnostic,
} from "vscode-languageserver-protocol"
import {
  parse,
  type LoomDocument,
  type CodeBlock,
  type Section,
  type LspMapping,
} from "./loom"
import { Effect } from "effect"

// ── Language Server Config ─────────────────────────────────────────────

export interface LanguageServerConfig {
  readonly languageId: string
  readonly command: string
  readonly args: ReadonlyArray<string>
  readonly fileExtension: string
  readonly initializationOptions?: Record<string, unknown>
  readonly settings?: Record<string, unknown>
}

export const LANGUAGE_SERVERS: ReadonlyArray<LanguageServerConfig> = [
  {
    languageId: "scala",
    command: "metals",
    args: [],
    fileExtension: ".scala",
  },
  {
    languageId: "python",
    command: "pyright-langserver",
    args: ["--stdio"],
    fileExtension: ".py",
  },
]

const TS_FAMILY = new Set([
  "typescript", "ts", "javascript", "js", "tsx", "jsx",
  "html", "css", "json",
])

const COMMENT_PREFIX: Record<string, string> = {
  python: "#", ruby: "#", perl: "#", bash: "#", shell: "#",
  scala: "//", java: "//", go: "//", rust: "//", kotlin: "//",
  sql: "--", lua: "--", haskell: "--",
}

// ── Virtual Document ───────────────────────────────────────────────────

export interface VirtualDocument {
  readonly uri: string
  readonly filePath: string
  readonly content: string
  readonly languageId: string
  readonly mappings: ReadonlyArray<LspMapping>
}

export function buildVirtualDocuments(
  doc: LoomDocument,
  loomUri: string,
  source: string,
): Map<string, VirtualDocument> {
  const result = new Map<string, VirtualDocument>()
  const byLanguage = new Map<string, { blocks: CodeBlock[]; sections: Section[] }>()

  for (const section of doc.sections) {
    for (const block of section.blocks) {
      if (block.kind !== "code") continue
      if (TS_FAMILY.has(block.language)) continue
      if (!block.language) continue

      let entry = byLanguage.get(block.language)
      if (!entry) {
        entry = { blocks: [], sections: [] }
        byLanguage.set(block.language, entry)
      }
      entry.blocks.push(block)
      if (!entry.sections.includes(section)) {
        entry.sections.push(section)
      }
    }
  }

  const sourceLines = source.split("\n")

  for (const [languageId, { blocks }] of byLanguage) {
    const config = LANGUAGE_SERVERS.find((c) => c.languageId === languageId)
    const ext = config?.fileExtension ?? `.${languageId}`
    const commentPfx = COMMENT_PREFIX[languageId] ?? "//"

    const virtualLines: string[] = []
    const mappings: LspMapping[] = []

    let currentSourceLine = 0
    let virtualOffset = 0

    for (const block of blocks) {
      const blockStartLine = offsetToLine(source, block.span.start)
      const blockContent = block.content
      const blockLines = blockContent.split("\n")

      while (currentSourceLine < blockStartLine) {
        const commentLine = `${commentPfx} ${sourceLines[currentSourceLine] ?? ""}`
        virtualLines.push(commentLine)
        virtualOffset += commentLine.length + 1
        currentSourceLine++
      }

      const dedented = dedentBlock(blockLines)

      let sourceOffset = block.span.start
      for (let i = 0; i < dedented.lines.length; i++) {
        const line = dedented.lines[i]
        const originalLine = blockLines[i]
        mappings.push({
          sourceOffset: sourceOffset + dedented.indent,
          generatedOffset: virtualOffset,
          length: line.length,
        })
        virtualLines.push(line)
        virtualOffset += line.length + 1
        sourceOffset += originalLine.length + 1
        currentSourceLine++
      }
    }

    while (currentSourceLine < sourceLines.length) {
      virtualLines.push("")
      currentSourceLine++
    }

    const content = virtualLines.join("\n")
    const uriBase = loomUri.replace(/\.loom$/, "")
    const filePath = join(
      tmpdir(),
      "loom-virtual",
      `${uriBase.replace(/[^a-zA-Z0-9]/g, "_")}.virtual${ext}`,
    )

    result.set(languageId, {
      uri: `file://${filePath}`,
      filePath,
      content,
      languageId,
      mappings,
    })
  }

  return result
}

function offsetToLine(source: string, offset: number): number {
  let line = 0
  for (let i = 0; i < offset && i < source.length; i++) {
    if (source[i] === "\n") line++
  }
  return line
}

function dedentBlock(lines: string[]): { lines: string[]; indent: number } {
  let minIndent = Infinity
  for (const line of lines) {
    if (line.trim() === "") continue
    const match = line.match(/^(\s*)/)
    if (match && match[1].length < minIndent) {
      minIndent = match[1].length
    }
  }
  if (!isFinite(minIndent)) minIndent = 0
  return {
    lines: lines.map((l) => l.slice(minIndent)),
    indent: minIndent,
  }
}

// ── Position Translation ───────────────────────────────────────────────

function positionToOffset(text: string, pos: Position): number {
  let line = 0
  let offset = 0
  while (line < pos.line && offset < text.length) {
    if (text[offset] === "\n") line++
    offset++
  }
  return offset + pos.character
}

function offsetToPosition(text: string, offset: number): Position {
  let line = 0
  let character = 0
  for (let i = 0; i < offset && i < text.length; i++) {
    if (text[i] === "\n") {
      line++
      character = 0
    } else {
      character++
    }
  }
  return { line, character }
}

export function translateToVirtual(
  sourceText: string,
  virtualText: string,
  mappings: ReadonlyArray<LspMapping>,
  pos: Position,
): Position | null {
  const sourceOffset = positionToOffset(sourceText, pos)

  for (const m of mappings) {
    if (sourceOffset >= m.sourceOffset && sourceOffset < m.sourceOffset + m.length) {
      const delta = sourceOffset - m.sourceOffset
      return offsetToPosition(virtualText, m.generatedOffset + delta)
    }
  }
  return null
}

export function translateFromVirtual(
  sourceText: string,
  virtualText: string,
  mappings: ReadonlyArray<LspMapping>,
  pos: Position,
): Position | null {
  const virtualOffset = positionToOffset(virtualText, pos)

  for (const m of mappings) {
    if (virtualOffset >= m.generatedOffset && virtualOffset < m.generatedOffset + m.length) {
      const delta = virtualOffset - m.generatedOffset
      return offsetToPosition(sourceText, m.sourceOffset + delta)
    }
  }
  return null
}

function translateDiagnosticRange(
  sourceText: string,
  virtualText: string,
  mappings: ReadonlyArray<LspMapping>,
  range: { start: Position; end: Position },
): { start: Position; end: Position } | null {
  const start = translateFromVirtual(sourceText, virtualText, mappings, range.start)
  const end = translateFromVirtual(sourceText, virtualText, mappings, range.end)
  if (!start || !end) return null
  return { start, end }
}

// ── Managed Server ─────────────────────────────────────────────────────

interface ManagedServer {
  readonly config: LanguageServerConfig
  process: ChildProcess
  connection: MessageConnection
  initialized: Promise<void>
  capabilities: ServerCapabilities
}

// ── Language Router ────────────────────────────────────────────────────

export class LanguageRouter {
  private servers = new Map<string, ManagedServer>()
  private virtualDocs = new Map<string, Map<string, VirtualDocument>>()
  private documentSources = new Map<string, string>()
  private externalDiagnostics = new Map<string, Diagnostic[]>()
  private configs: ReadonlyArray<LanguageServerConfig>
  private rootUri: string | null = null
  private onDiagnostics: ((params: PublishDiagnosticsParams) => void) | null = null

  constructor(configs: ReadonlyArray<LanguageServerConfig>) {
    this.configs = configs
  }

  initialize(rootUri: string | null) {
    this.rootUri = rootUri
  }

  setDiagnosticsHandler(handler: (params: PublishDiagnosticsParams) => void) {
    this.onDiagnostics = handler
  }

  getLanguageAtPosition(
    uri: string,
    source: string,
    position: Position,
  ): string | null {
    const doc = Effect.runSync(parse(source))
    const offset = positionToOffset(source, position)

    for (const section of doc.sections) {
      for (const block of section.blocks) {
        if (block.kind === "code" && offset >= block.span.start && offset <= block.span.end) {
          return block.language
        }
      }
    }
    return null
  }

  isExternalLanguage(languageId: string): boolean {
    return !TS_FAMILY.has(languageId) && this.configs.some((c) => c.languageId === languageId)
  }

  getExternalDiagnostics(uri: string): ReadonlyArray<Diagnostic> {
    return this.externalDiagnostics.get(uri) ?? []
  }

  async documentOpened(uri: string, source: string): Promise<void> {
    this.documentSources.set(uri, source)
    const doc = Effect.runSync(parse(source))
    await this.updateVirtualDocuments(uri, doc, source)
  }

  async documentChanged(uri: string, source: string): Promise<void> {
    this.documentSources.set(uri, source)
    const doc = Effect.runSync(parse(source))
    await this.updateVirtualDocuments(uri, doc, source)
  }

  async documentClosed(uri: string): Promise<void> {
    const vdocs = this.virtualDocs.get(uri)
    if (vdocs) {
      for (const [, vdoc] of vdocs) {
        const server = this.servers.get(vdoc.languageId)
        if (server) {
          try {
            server.connection.sendNotification("textDocument/didClose", {
              textDocument: { uri: vdoc.uri },
            })
          } catch { /* server may be gone */ }
        }
      }
      this.virtualDocs.delete(uri)
    }
    this.documentSources.delete(uri)
    this.externalDiagnostics.delete(uri)
  }

  async hover(
    uri: string,
    position: Position,
  ): Promise<Hover | null> {
    const source = this.documentSources.get(uri)
    if (!source) return null

    const lang = this.getLanguageAtPosition(uri, source, position)
    if (!lang || !this.isExternalLanguage(lang)) return null

    const vdoc = this.virtualDocs.get(uri)?.get(lang)
    if (!vdoc) return null

    const virtualPos = translateToVirtual(source, vdoc.content, vdoc.mappings, position)
    if (!virtualPos) return null

    const server = await this.ensureServer(lang)
    if (!server) return null

    try {
      const result = await server.connection.sendRequest("textDocument/hover", {
        textDocument: { uri: vdoc.uri },
        position: virtualPos,
      }) as Hover | null
      if (result?.range) {
        const mapped = translateDiagnosticRange(source, vdoc.content, vdoc.mappings, result.range)
        if (mapped) return { ...result, range: mapped }
        const { range: _, ...rest } = result
        return rest as Hover
      }
      return result
    } catch {
      return null
    }
  }

  async completion(
    uri: string,
    position: Position,
  ): Promise<CompletionList | CompletionItem[] | null> {
    const source = this.documentSources.get(uri)
    if (!source) return null

    const lang = this.getLanguageAtPosition(uri, source, position)
    if (!lang || !this.isExternalLanguage(lang)) return null

    const vdoc = this.virtualDocs.get(uri)?.get(lang)
    if (!vdoc) return null

    const virtualPos = translateToVirtual(source, vdoc.content, vdoc.mappings, position)
    if (!virtualPos) return null

    const server = await this.ensureServer(lang)
    if (!server) return null

    try {
      const result = await server.connection.sendRequest("textDocument/completion", {
        textDocument: { uri: vdoc.uri },
        position: virtualPos,
      }) as CompletionList | CompletionItem[] | null
      if (!result) return result
      const mapItem = (item: CompletionItem): CompletionItem => {
        if (item.textEdit && "range" in item.textEdit) {
          const mapped = translateDiagnosticRange(source, vdoc.content, vdoc.mappings, item.textEdit.range)
          if (mapped) return { ...item, textEdit: { ...item.textEdit, range: mapped } }
        }
        return item
      }
      if (Array.isArray(result)) return result.map(mapItem)
      return { ...result, items: result.items.map(mapItem) }
    } catch {
      return null
    }
  }

  async definition(
    uri: string,
    position: Position,
  ): Promise<Location | Location[] | LocationLink[] | null> {
    const source = this.documentSources.get(uri)
    if (!source) return null

    const lang = this.getLanguageAtPosition(uri, source, position)
    if (!lang || !this.isExternalLanguage(lang)) return null

    const vdoc = this.virtualDocs.get(uri)?.get(lang)
    if (!vdoc) return null

    const virtualPos = translateToVirtual(source, vdoc.content, vdoc.mappings, position)
    if (!virtualPos) return null

    const server = await this.ensureServer(lang)
    if (!server) return null

    try {
      const result = await server.connection.sendRequest("textDocument/definition", {
        textDocument: { uri: vdoc.uri },
        position: virtualPos,
      }) as Location | Location[] | LocationLink[] | null
      if (!result) return result
      const mapLocation = (loc: Location): Location => {
        if (loc.uri === vdoc.uri) {
          const mapped = translateDiagnosticRange(source, vdoc.content, vdoc.mappings, loc.range)
          if (mapped) return { uri, range: mapped }
        }
        return loc
      }
      if (Array.isArray(result)) {
        return result.map((r: any) =>
          "targetUri" in r ? r : mapLocation(r),
        )
      }
      if ("targetUri" in (result as any)) return result
      return mapLocation(result as Location)
    } catch {
      return null
    }
  }

  async shutdown(): Promise<void> {
    for (const [, server] of this.servers) {
      try {
        await server.connection.sendRequest("shutdown")
        server.connection.sendNotification("exit")
        server.connection.dispose()
        server.process.kill()
      } catch { /* best effort */ }
    }
    this.servers.clear()
    this.failedCommands.clear()
  }

  // ── Private ────────────────────────────────────────────────────────

  private async updateVirtualDocuments(
    loomUri: string,
    doc: LoomDocument,
    source: string,
  ): Promise<void> {
    const vdocs = buildVirtualDocuments(doc, loomUri, source)
    const prevDocs = this.virtualDocs.get(loomUri)
    this.virtualDocs.set(loomUri, vdocs)

    for (const [lang, vdoc] of vdocs) {
      mkdirSync(join(tmpdir(), "loom-virtual"), { recursive: true })
      writeFileSync(vdoc.filePath, vdoc.content)

      const server = await this.ensureServer(lang)
      if (!server) continue

      const prevVdoc = prevDocs?.get(lang)
      if (prevVdoc) {
        try {
          server.connection.sendNotification("textDocument/didChange", {
            textDocument: { uri: vdoc.uri, version: Date.now() },
            contentChanges: [{ text: vdoc.content }],
          })
        } catch { /* server may be gone */ }
      } else {
        try {
          server.connection.sendNotification("textDocument/didOpen", {
            textDocument: {
              uri: vdoc.uri,
              languageId: lang,
              version: 1,
              text: vdoc.content,
            },
          })
        } catch { /* server may be gone */ }
      }
    }

    if (prevDocs) {
      for (const [lang, prevVdoc] of prevDocs) {
        if (!vdocs.has(lang)) {
          const server = this.servers.get(lang)
          if (server) {
            try {
              server.connection.sendNotification("textDocument/didClose", {
                textDocument: { uri: prevVdoc.uri },
              })
            } catch { /* server may be gone */ }
          }
        }
      }
    }
  }

  private failedCommands = new Set<string>()

  private async ensureServer(languageId: string): Promise<ManagedServer | null> {
    if (this.failedCommands.has(languageId)) return null

    const existing = this.servers.get(languageId)
    if (existing) {
      try {
        await existing.initialized
        return existing
      } catch {
        this.servers.delete(languageId)
        this.failedCommands.add(languageId)
        return null
      }
    }

    const config = this.configs.find((c) => c.languageId === languageId)
    if (!config) return null

    const server = this.spawnServer(config)
    if (!server) return null

    try {
      await server.initialized
      return server
    } catch {
      return null
    }
  }

  private spawnServer(config: LanguageServerConfig): ManagedServer | null {
    let proc: ChildProcess
    try {
      proc = spawn(config.command, [...config.args], {
        stdio: ["pipe", "pipe", "pipe"],
      })
    } catch (e) {
      console.error(`[loom] Failed to spawn ${config.command}: ${e}`)
      this.failedCommands.add(config.languageId)
      return null
    }

    let dead = false
    proc.on("error", (e) => {
      dead = true
      console.error(`[loom] ${config.command} error: ${e.message}`)
      this.servers.delete(config.languageId)
      this.failedCommands.add(config.languageId)
    })

    if (!proc.stdin || !proc.stdout) {
      console.error(`[loom] No stdio for ${config.command}`)
      proc.kill()
      this.failedCommands.add(config.languageId)
      return null
    }

    const connection = createMessageConnection(
      new StreamMessageReader(proc.stdout),
      new StreamMessageWriter(proc.stdin),
    )

    connection.onError(([error]) => {
      console.error(`[loom] ${config.command} connection error: ${error.message}`)
    })

    connection.onClose(() => {
      this.servers.delete(config.languageId)
    })

    connection.listen()

    const server: ManagedServer = {
      config,
      process: proc,
      connection,
      capabilities: {},
      initialized: Promise.resolve(),
    }

    const initPromise = (async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
      if (dead) throw new Error(`${config.command} failed to start`)
      await this.initializeServer(server)
    })()

    initPromise.catch(() => {
      this.failedCommands.add(config.languageId)
      this.servers.delete(config.languageId)
      try { connection.dispose() } catch { /* already gone */ }
      try { proc.kill() } catch { /* already gone */ }
    })

    ;(server as { initialized: Promise<void> }).initialized = initPromise

    this.servers.set(config.languageId, server)

    proc.on("exit", (code) => {
      console.error(`[loom] ${config.command} exited with code ${code}`)
      this.servers.delete(config.languageId)
    })

    proc.stderr?.on("data", (data: Buffer) => {
      console.error(`[loom] ${config.command} stderr: ${data.toString().trim()}`)
    })

    this.setupDiagnosticsBridge(server)

    return server
  }

  private async initializeServer(server: ManagedServer): Promise<void> {
    const initParams: InitializeParams = {
      processId: process.pid,
      capabilities: {
        textDocument: {
          hover: { contentFormat: ["markdown", "plaintext"] },
          completion: {
            completionItem: { snippetSupport: false },
          },
          publishDiagnostics: { relatedInformation: true },
        },
      },
      rootUri: this.rootUri,
      workspaceFolders: this.rootUri
        ? [{ uri: this.rootUri, name: "workspace" }]
        : null,
      ...(server.config.initializationOptions
        ? { initializationOptions: server.config.initializationOptions }
        : {}),
    }

    try {
      const result = await server.connection.sendRequest("initialize", initParams)
      ;(server as { capabilities: ServerCapabilities }).capabilities =
        (result as { capabilities: ServerCapabilities }).capabilities ?? {}

      server.connection.sendNotification("initialized", {})

      if (server.config.settings) {
        server.connection.sendNotification("workspace/didChangeConfiguration", {
          settings: server.config.settings,
        })
      }
    } catch (e) {
      console.error(`[loom] Failed to initialize ${server.config.command}: ${e}`)
      throw e
    }
  }

  private setupDiagnosticsBridge(server: ManagedServer) {
    server.connection.onNotification(
      "textDocument/publishDiagnostics",
      (params: PublishDiagnosticsParams) => {
        if (!this.onDiagnostics) return

        for (const [loomUri, vdocs] of this.virtualDocs) {
          for (const [, vdoc] of vdocs) {
            if (vdoc.uri === params.uri || params.uri === vdoc.filePath) {
              const source = this.documentSources.get(loomUri)
              if (!source) continue

              const translated: Diagnostic[] = []
              for (const diag of params.diagnostics) {
                const range = translateDiagnosticRange(
                  source,
                  vdoc.content,
                  vdoc.mappings,
                  diag.range,
                )
                if (range) {
                  translated.push({
                    ...diag,
                    range,
                    source: diag.source ?? server.config.command,
                  })
                }
              }

              this.externalDiagnostics.set(loomUri, translated)
              this.onDiagnostics({
                uri: loomUri,
                diagnostics: translated,
              })
              return
            }
          }
        }
      },
    )
  }
}

export function createLanguageRouter(
  configs: ReadonlyArray<LanguageServerConfig> = LANGUAGE_SERVERS,
): LanguageRouter {
  return new LanguageRouter(configs)
}
