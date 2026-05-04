import {
  createConnection,
  createServer,
  createTypeScriptProject,
} from "@volar/language-server/node"
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
  type Diagnostic as LoomDiag,
  type Span,
} from "./loom"
import {
  createSyntaxTokenPlugin,
  TreeSitterLive,
} from "./syntaxTokens"

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

function buildMappings(projection: LspProjection) {
  if (projection.mappings.length === 0) {
    return [
      {
        sourceOffsets: [0],
        generatedOffsets: [0],
        lengths: [Math.min(projection.code.length, 1)],
        data: FULL,
      },
    ]
  }

  return projection.mappings.map((m) => ({
    sourceOffsets: [m.sourceOffset],
    generatedOffsets: [m.generatedOffset],
    lengths: [m.length],
    data: FULL,
  }))
}

// ── Language plugin (boundary adapter) ──────────────────────────────────

function createLoomPlugin(
  runtime: ManagedRuntime.ManagedRuntime<LoomDiagnosticStore, never>,
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

      return runtime.runSync(
        Effect.gen(function* () {
          const doc = yield* parse(source)
          const projection = yield* projectLsp(doc)
          const mappings = buildMappings(projection)

          const diagStore = yield* LoomDiagnosticStore
          yield* diagStore.store(uriString, {
            source,
            diagnostics: doc.diagnostics,
          })

          const tsCode: VirtualCode = {
            id: "ts",
            languageId: "typescript",
            snapshot: snapshot(projection.code),
            mappings,
            embeddedCodes: [],
          }

          return {
            id: "root",
            languageId: "loom",
            snapshot: snap,
            mappings: [],
            embeddedCodes: [tsCode],
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
      getServiceScript(root: VirtualCode) {
        if (!root.embeddedCodes) return undefined
        for (const code of root.embeddedCodes) {
          if (code.id === "ts") {
            return {
              code,
              extension: ".ts" as const,
              scriptKind: ts.ScriptKind.TS,
            }
          }
        }
        return undefined
      },
    },
  }
}

// ── Server (boundary wire) ──────────────────────────────────────────────

const connection = createConnection()
const server = createServer(connection)

const storeRuntime = ManagedRuntime.make(LoomDiagnosticStoreLive)
const treeSitterRuntime = ManagedRuntime.make(TreeSitterLive)

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

  const merged = [
    ...params.diagnostics.filter((d) => d.source !== "loom"),
    ...loomDiags,
  ]
  await originalSendDiagnostics({ ...params, diagnostics: merged })
}

connection.onInitialize((params) => {
  return server.initialize(
    params,
    createTypeScriptProject(ts, undefined, () => ({
      languagePlugins: [createLoomPlugin(storeRuntime)],
    })),
    [
      ...createTsServicePlugins(ts),
      createSyntaxTokenPlugin(treeSitterRuntime),
    ],
  )
})

connection.onInitialized(() => {
  server.initialized()
})

connection.listen()
