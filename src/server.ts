import {
  createConnection,
  createServer,
  createTypeScriptProject,
} from "@volar/language-server/node"
import { dirname, resolve } from "node:path"
import { create as createTsServicePlugins } from "volar-service-typescript"
import type { LanguagePlugin, VirtualCode } from "@volar/language-core"
import type { CodeInformation } from "@volar/language-core"
import { URI as VscodeURI } from "vscode-uri"
import type { URI } from "vscode-uri"
import ts from "typescript"
import {
  Context,
  Effect,
  HashMap,
  Layer,
  ManagedRuntime,
  Option,
  Ref,
  pipe,
} from "effect"
import {
  parse,
  projectLsp,
  type LspProjection,
  type LspMapping,
  type Diagnostic as LoomDiag,
  type Span,
} from "./loom"
import {
  createSyntaxTokenPlugin,
  TreeSitterLive,
} from "./syntaxTokens"
import {
  createLanguageRouter,
  LANGUAGE_SERVERS,
  type LanguageRouter,
} from "./multiplexer"

// ── LoomDiagnosticStore service ─────────────────────────────────────────
// Stores loom-level diagnostics keyed by URI string. The connection
// interceptor merges these into every outgoing publishDiagnostics
// notification so they survive Volar's full-replacement publishes.

interface StoredDiagnostics {
  readonly source: string
  readonly diagnostics: ReadonlyArray<LoomDiag>
}

class LoomDiagnosticStore extends Context.Tag("LoomDiagnosticStore")<
  LoomDiagnosticStore,
  {
    readonly store: (
      uri: string,
      file: StoredDiagnostics,
    ) => Effect.Effect<void>
    readonly lookup: (
      uri: string,
    ) => Effect.Effect<Option.Option<StoredDiagnostics>>
    readonly ref: Ref.Ref<HashMap.HashMap<string, StoredDiagnostics>>
  }
>() {}

const LoomDiagnosticStoreLive = Layer.effect(
  LoomDiagnosticStore,
  Effect.gen(function* () {
    const ref = yield* Ref.make(
      HashMap.empty<string, StoredDiagnostics>(),
    )
    return {
      store: (uri: string, file: StoredDiagnostics) =>
        Ref.update(ref, HashMap.set(uri, file)),
      lookup: (uri: string) =>
        pipe(Ref.get(ref), Effect.map(HashMap.get(uri))),
      ref,
    }
  }),
)

// ── Pure helpers ────────────────────────────────────────────────────────

const toStorePath = (uri: URI | string): string =>
  typeof uri === "string" ? VscodeURI.parse(uri).path : uri.path

const spanToRange = (source: string, span: Span) => {
  const position = (offset: number) => {
    let line = 0
    let character = 0
    for (let i = 0; i < offset && i < source.length; i++) {
      if (source[i] === "\n") {
        line++
        character = 0
      } else {
        character++
      }
    }
    return { line, character }
  }
  return { start: position(span.start), end: position(span.end) }
}

const toLspDiagnostics = (
  source: string,
  diagnostics: ReadonlyArray<LoomDiag>,
) =>
  diagnostics.map((d) => ({
    range: spanToRange(source, d.span),
    severity: 1 as const,
    source: "loom",
    message: d.message,
  }))

// ── Virtual code helpers ────────────────────────────────────────────────

const FULL: CodeInformation = {
  verification: true,
  completion: true,
  semantic: true,
  navigation: true,
  structure: true,
  format: false,
}

function snapshot(text: string) {
  return {
    getText: (s: number, e: number) => text.substring(s, e),
    getLength: () => text.length,
    getChangeRange: () => undefined,
  }
}

const FRAME: CodeInformation = {
  verification: true,
  completion: true,
  semantic: true,
  navigation: true,
  structure: false,
  format: false,
}

// Frame filler — covers the full generated range so Volar's mapper
// never falls back to "any match" when tsc emits tokens for boilerplate
// (imports, generics, the `compose("")` placeholders, etc.). With every
// LSP feature disabled, Volar's per-feature filters reject tokens /
// hovers / diagnostics that fall on filler-only regions. Specific
// mappings — tag spans, tangle bodies, deps imports — overlap on top
// and win because their data passes the filter.
const FRAME_FILLER: CodeInformation = {
  verification: false,
  completion: false,
  semantic: false,
  navigation: false,
  structure: false,
  format: false,
}

const EMBEDDED: CodeInformation = {
  verification: false,
  completion: true,
  semantic: true,
  navigation: true,
  structure: false,
  format: false,
}

function buildMappings(mappings: ReadonlyArray<LspMapping>, data: CodeInformation) {
  if (mappings.length === 0) {
    return [
      {
        sourceOffsets: [0],
        generatedOffsets: [0],
        lengths: [1],
        data,
      },
    ]
  }

  return mappings.map((m) => ({
    sourceOffsets: [m.sourceOffset],
    generatedOffsets: [m.generatedOffset],
    lengths: [m.sourceLength ?? m.length],
    ...(m.sourceLength != null ? { generatedLengths: [m.length] } : {}),
    data,
  }))
}

// Build frame mappings with a low-priority filler covering the whole
// generated range. The specific (semantic: true) mappings come AFTER
// the filler so Volar's findMatchingOffsets yields the specific match
// alongside the filler, and the per-feature filter (e.g.
// isSemanticTokensEnabled) keeps the specific one and drops the filler.
function buildFrameMappings(
  specific: ReadonlyArray<LspMapping>,
  generatedLength: number,
) {
  const fillerMapping = {
    sourceOffsets: [0],
    generatedOffsets: [0],
    lengths: [generatedLength],
    data: FRAME_FILLER,
  }
  if (specific.length === 0) return [fillerMapping]
  const real = specific.map((m) => ({
    sourceOffsets: [m.sourceOffset],
    generatedOffsets: [m.generatedOffset],
    lengths: [m.sourceLength ?? m.length],
    ...(m.sourceLength != null ? { generatedLengths: [m.length] } : {}),
    data: FRAME,
  }))
  return [fillerMapping, ...real]
}

// ── Language plugin (boundary adapter) ──────────────────────────────────

function createLoomPlugin(
  runtime: ManagedRuntime.ManagedRuntime<LoomDiagnosticStore, never>,
  documentSources: Map<string, string>,
  languageRouter: LanguageRouter,
  rootPath: string,
): LanguagePlugin<URI> {
  return {
    getLanguageId(uri) {
      if (uri.path.endsWith(".loom")) return "loom"
      return undefined
    },

    createVirtualCode(uri, languageId, snap) {
      if (languageId !== "loom") return undefined

      const source = snap.getText(0, snap.getLength())
      const uriString = uri.toString()

      documentSources.set(uriString, source)
      languageRouter.documentChanged(uriString, source)

      return runtime.runSync(
        Effect.gen(function* () {
          const doc = yield* parse(source)
          const projection = yield* projectLsp(doc, uri.path)

          for (const tangle of doc.tangles) {
            if (/\.(tsx?|jsx?|mts|cts)$/.test(tangle.path)) {
              tangleTargets.set(uri.path, resolve(rootPath, tangle.path))
              break
            }
          }

          const diagStore = yield* LoomDiagnosticStore
          yield* diagStore.store(uriString, {
            source,
            diagnostics: doc.diagnostics,
          })

          const frameCodes: VirtualCode[] = projection.frame && !process.env.LOOM_DISABLE_FRAME
            ? [
                {
                  id: "frame",
                  languageId: "typescript",
                  snapshot: snapshot(projection.frame.content),
                  mappings: buildFrameMappings(
                    projection.frame.mappings,
                    projection.frame.content.length,
                  ),
                  embeddedCodes: [],
                },
              ]
            : []

          const tangledCodes: VirtualCode[] = projection.tangledDocuments.map(
            (td) => ({
              id: td.id,
              languageId: td.languageId,
              snapshot: snapshot(td.content),
              mappings: buildMappings(td.mappings, FULL),
              embeddedCodes: [],
            }),
          )

          const embeddedCodes: VirtualCode[] = projection.embeddedBlocks.map(
            (block) => ({
              id: block.id,
              languageId: block.languageId,
              snapshot: snapshot(block.content),
              mappings: buildMappings(block.mappings, EMBEDDED),
              embeddedCodes: [],
            }),
          )

          return {
            id: "root",
            languageId: "loom",
            snapshot: snap,
            mappings: [],
            embeddedCodes: [...frameCodes, ...tangledCodes, ...embeddedCodes],
          }
        }),
      )
    },

    typescript: {
      extraFileExtensions: [
        {
          extension: "loom",
          isMixedContent: true,
          scriptKind: ts.ScriptKind.Deferred,
        },
      ],
      // Per spec, the FRAME is the de dicto Composition Program: the
      // Loom file's Effect.Service definition, the canonical TS module
      // surface for cross-loom `import { ServiceName } from "./X.loom"`
      // resolution. We return the frame as the primary service script
      // so tsc analyses heading-bracket tags, compose()/needs() args
      // inside Tangle bodies, and Dependencies imports.
      //
      // Free overrides the frame: when present, we route the Free
      // virtual code as the service script (it IS the Loom).
      getServiceScript(root: VirtualCode) {
        if (!root.embeddedCodes) return undefined
        for (const code of root.embeddedCodes) {
          if (code.id === "free") {
            return {
              code,
              extension: ".ts" as const,
              scriptKind: ts.ScriptKind.TS,
            }
          }
        }
        for (const code of root.embeddedCodes) {
          if (code.id === "frame") {
            return {
              code,
              extension: ".ts" as const,
              scriptKind: ts.ScriptKind.TS,
            }
          }
        }
        return undefined
      },
      // Tangled-N TS docs are the de re plane — resolved product code
      // for each Tangle, type-checked in tangle order. They aren't the
      // file's module surface (the frame is), so they live as
      // "extra" service scripts: tsc still has them in the TS program
      // and provides hover / diagnostics / semantic tokens, but
      // import resolution stays on the frame.
      getExtraServiceScripts(fileName: string, root: VirtualCode) {
        if (!root.embeddedCodes) return []
        const extras: Array<{
          fileName: string
          code: VirtualCode
          extension: ".ts" | ".js"
          scriptKind: ts.ScriptKind
        }> = []
        for (const code of root.embeddedCodes) {
          if (!code.id.startsWith("tangled-")) continue
          const isTs = code.languageId === "typescript" || code.languageId === "javascript"
          if (!isTs) continue
          extras.push({
            fileName: `${fileName}.${code.id}.ts`,
            code,
            extension: ".ts" as const,
            scriptKind: ts.ScriptKind.TS,
          })
        }
        return extras
      },
    },
  }
}

// ── Server (boundary wire) ──────────────────────────────────────────────

const connection = createConnection()

const storeRuntime = ManagedRuntime.make(LoomDiagnosticStoreLive)
const treeSitterRuntime = ManagedRuntime.make(TreeSitterLive)
const router = createLanguageRouter(LANGUAGE_SERVERS)
const openDocumentSources = new Map<string, string>()
const tangleTargets = new Map<string, string>()
const volarDiagnostics = new Map<string, any[]>()
const documentLanguages = new Map<string, string>()
let capturedOpenHandler: ((params: any) => any) | null = null
let capturedCloseHandler: ((params: any) => any) | null = null

const WEB_LANGS = new Set([
  "typescript", "ts", "javascript", "js", "tsx", "jsx",
  "html", "css", "json",
])

function getLanguageAtCursor(
  uri: string,
  position: { line: number; character: number },
): string | null {
  const source = openDocumentSources.get(uri)
  if (!source) return null
  return router.getLanguageAtPosition(uri, source, position)
}

// ── Intercept handler registrations ────────────────────────────────────
// Volar registers its own handlers during server.initialize(). We wrap
// the registration methods so Volar's handlers are augmented with our
// routing logic rather than overwritten.

const origOnDidClose = connection.onDidCloseTextDocument.bind(connection)
connection.onDidCloseTextDocument = ((handler: any) => {
  const wrapped = (params: any) => {
    if (params.textDocument.uri.endsWith(".loom")) {
      openDocumentSources.delete(params.textDocument.uri)
      router.documentClosed(params.textDocument.uri)
      documentLanguages.delete(params.textDocument.uri)
      volarDiagnostics.delete(params.textDocument.uri)
    }
    return handler(params)
  }
  capturedCloseHandler = wrapped
  return origOnDidClose(wrapped)
}) as typeof connection.onDidCloseTextDocument

const origOnDidOpen = connection.onDidOpenTextDocument.bind(connection)
connection.onDidOpenTextDocument = ((handler: any) => {
  const wrapped = (params: any) => {
    if (params.textDocument.uri.endsWith(".loom")) {
      try {
        const doc = Effect.runSync(parse(params.textDocument.text))
        documentLanguages.set(params.textDocument.uri, doc.language)
      } catch { /* parse failure — track nothing */ }
    }
    return handler(params)
  }
  capturedOpenHandler = wrapped
  return origOnDidOpen(wrapped)
}) as typeof connection.onDidOpenTextDocument

function offsetFromPos(text: string, pos: { line: number; character: number }): number {
  let line = 0
  let offset = 0
  while (line < pos.line && offset < text.length) {
    if (text[offset] === "\n") line++
    offset++
  }
  return offset + pos.character
}

function resolveNewText(uri: string, contentChanges: any[]): string | null {
  const full = contentChanges.find((c: any) => c.range === undefined)
  if (full) return full.text
  const prev = openDocumentSources.get(uri)
  if (!prev) return null
  let text = prev
  const sorted = [...contentChanges].sort((a: any, b: any) => {
    if (b.range.start.line !== a.range.start.line)
      return b.range.start.line - a.range.start.line
    return b.range.start.character - a.range.start.character
  })
  for (const change of sorted) {
    const start = offsetFromPos(text, change.range.start)
    const end = offsetFromPos(text, change.range.end)
    text = text.substring(0, start) + change.text + text.substring(end)
  }
  return text
}

// Language change detection: when the title H-function changes the document
// language, Volar's incremental virtual-code diff doesn't fully rebuild the
// TS service state. Synthesize close + reopen to force a clean rebuild.
const origOnDidChange = connection.onDidChangeTextDocument.bind(connection)
connection.onDidChangeTextDocument = ((handler: any) =>
  origOnDidChange((params: any) => {
    const uri = params.textDocument.uri
    if (uri.endsWith(".loom") && capturedCloseHandler && capturedOpenHandler) {
      const newText = resolveNewText(uri, params.contentChanges)
      if (newText) {
        try {
          const doc = Effect.runSync(parse(newText))
          const prevLang = documentLanguages.get(uri)
          if (prevLang && prevLang !== doc.language) {
            capturedCloseHandler({ textDocument: { uri } })
            capturedOpenHandler({
              textDocument: {
                uri,
                languageId: "loom",
                version: params.textDocument.version,
                text: newText,
              },
            })
            return
          }
        } catch { /* parse failure — fall through to normal handling */ }
      }
    }
    return handler(params)
  })) as typeof connection.onDidChangeTextDocument

const origOnHover = connection.onHover.bind(connection)
connection.onHover = ((handler: any) =>
  origOnHover(async (params: any, ...rest: any[]) => {
    const lang = getLanguageAtCursor(params.textDocument.uri, params.position)
    if (lang && !WEB_LANGS.has(lang) && router.isExternalLanguage(lang)) {
      const result = await router.hover(params.textDocument.uri, params.position)
      if (result) return result
    }
    return handler(params, ...rest)
  })) as typeof connection.onHover

const origOnCompletion = connection.onCompletion.bind(connection)
connection.onCompletion = ((handler: any) =>
  origOnCompletion(async (params: any, ...rest: any[]) => {
    const lang = getLanguageAtCursor(params.textDocument.uri, params.position)
    if (lang && !WEB_LANGS.has(lang) && router.isExternalLanguage(lang)) {
      const result = await router.completion(params.textDocument.uri, params.position)
      if (result) return result
    }
    return handler(params, ...rest)
  })) as typeof connection.onCompletion

const origOnDefinition = connection.onDefinition.bind(connection)
connection.onDefinition = ((handler: any) =>
  origOnDefinition(async (params: any, ...rest: any[]) => {
    const lang = getLanguageAtCursor(params.textDocument.uri, params.position)
    if (lang && !WEB_LANGS.has(lang) && router.isExternalLanguage(lang)) {
      const result = await router.definition(params.textDocument.uri, params.position)
      if (result) return result
    }
    return handler(params, ...rest)
  })) as typeof connection.onDefinition

const origOnShutdown = connection.onShutdown.bind(connection)
connection.onShutdown = ((handler: any) =>
  origOnShutdown(async (...args: any[]) => {
    await router.shutdown()
    return handler(...args)
  })) as typeof connection.onShutdown

// ── Volar setup ────────────────────────────────────────────────────────

const server = createServer(connection)

// Intercept outgoing diagnostics to merge in loom diagnostics.
// Volar's publishDiagnostics is full-replacement per URI — without
// this, TS diagnostics overwrite our loom diagnostics.
const originalSendDiagnostics = connection.sendDiagnostics.bind(connection)
connection.sendDiagnostics = async (params) => {
  const uri = params.uri
  const loomDiags = storeRuntime.runSync(
    Effect.gen(function* () {
      const diagStore = yield* LoomDiagnosticStore
      const opt = yield* diagStore.lookup(uri)
      if (Option.isSome(opt)) {
        return toLspDiagnostics(opt.value.source, opt.value.diagnostics)
      }
      return []
    }),
  )

  volarDiagnostics.set(uri, params.diagnostics.filter((d: any) => d.source !== "loom"))
  const externalDiags = router.getExternalDiagnostics(uri)

  const merged = [
    ...params.diagnostics.filter((d: any) => d.source !== "loom"),
    ...externalDiags,
    ...loomDiags,
  ]
  await originalSendDiagnostics({ ...params, diagnostics: merged })
}

connection.onInitialize((params) => {
  router.initialize(params.rootUri ?? null)

  router.setDiagnosticsHandler((diagParams) => {
    const loomDiags = storeRuntime.runSync(
      Effect.gen(function* () {
        const diagStore = yield* LoomDiagnosticStore
        const opt = yield* diagStore.lookup(diagParams.uri)
        if (Option.isSome(opt)) {
          return toLspDiagnostics(opt.value.source, opt.value.diagnostics)
        }
        return []
      }),
    )

    const storedVolar = volarDiagnostics.get(diagParams.uri) ?? []
    originalSendDiagnostics({
      uri: diagParams.uri,
      diagnostics: [...storedVolar, ...diagParams.diagnostics, ...loomDiags],
    })
  })

  const rootPath = params.rootUri
    ? VscodeURI.parse(params.rootUri).path
    : process.cwd()

  const initResult = server.initialize(
    params,
    createTypeScriptProject(ts, undefined, () => ({
      languagePlugins: [createLoomPlugin(storeRuntime, openDocumentSources, router, rootPath)],
      setup({ project }) {
        const host = project.typescript?.languageServiceHost
        if (!host) return

        const fallbackHost: ts.ModuleResolutionHost = {
          fileExists: (f) => ts.sys.fileExists(f),
          readFile: (f) => ts.sys.readFile(f),
          directoryExists: (d) => ts.sys.directoryExists(d),
          realpath: ts.sys.realpath ? (f) => ts.sys.realpath!(f) : undefined,
          getCurrentDirectory: () => host.getCurrentDirectory?.() ?? process.cwd(),
        }

        function tryLoomResolve(specifier: string, fromFile: string): ts.ResolvedModuleFull | undefined {
          if (!specifier.startsWith(".")) return undefined
          if (specifier.endsWith(".loom")) {
            const direct = resolve(dirname(fromFile), specifier)
            if (ts.sys.fileExists(direct)) {
              return { resolvedFileName: direct, extension: ".ts" as ts.Extension, isExternalLibraryImport: false }
            }
          }
          const candidate = resolve(dirname(fromFile), specifier + ".loom")
          if (ts.sys.fileExists(candidate)) {
            return { resolvedFileName: candidate, extension: ".ts" as ts.Extension, isExternalLibraryImport: false }
          }
          return undefined
        }

        const origResolveLiterals = host.resolveModuleNameLiterals
        if (origResolveLiterals) {
          host.resolveModuleNameLiterals = (moduleLiterals, containingFile, ...rest) => {
            const results = origResolveLiterals(moduleLiterals, containingFile, ...rest)
            if (!containingFile.endsWith(".loom")) return results
            if (results.every((r) => r.resolvedModule)) return results
            const target = tangleTargets.get(containingFile)
            const options = host.getCompilationSettings()
            return results.map((r, i) => {
              if (r.resolvedModule) return r
              const specifier = moduleLiterals[i].text
              const loom = tryLoomResolve(specifier, containingFile)
              if (loom) return { resolvedModule: loom }
              if (target) return ts.resolveModuleName(specifier, target, options, fallbackHost)
              return r
            })
          }
        }

        const origResolveNames = host.resolveModuleNames
        if (origResolveNames) {
          host.resolveModuleNames = (moduleNames, containingFile, ...rest) => {
            const results = origResolveNames(moduleNames, containingFile, ...rest)
            if (!containingFile.endsWith(".loom")) return results
            if (results.every((r) => !!r)) return results
            const target = tangleTargets.get(containingFile)
            const options = host.getCompilationSettings()
            return results.map((r, i) => {
              if (r) return r
              const loom = tryLoomResolve(moduleNames[i], containingFile)
              if (loom) return loom
              if (target) return ts.resolveModuleName(moduleNames[i], target, options, fallbackHost).resolvedModule
              return r
            })
          }
        }
      },
    })),
    [
      ...createTsServicePlugins(ts),
      createSyntaxTokenPlugin(treeSitterRuntime),
    ],
  )
  return initResult
})

connection.onInitialized(() => {
  server.initialized()
})

connection.listen()
