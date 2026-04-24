/**
 * StepContext services — ProseInvoke, AIInvoke, GateService.
 *
 * See ADR-002 (six Step kinds, services injected per kind) and ADR-014
 * (harness substrate).
 */
import { Context, Data, Effect, Layer, Ref, Schema } from 'effect'
import type { ProseRef } from './step.ts'
import { ProseLoadError } from './step.ts'
import type { GateDecision } from './gate.ts'

// ---------------------------------------------------------------------------
// ProseInput / ProseOutput (ADR-015 templating grammar)

export const ProseInput = Schema.Struct({
  range: Schema.optional(Schema.Tuple(Schema.Number, Schema.Number)),
  section: Schema.optional(Schema.String),
  vars: Schema.optional(
    Schema.Record({ key: Schema.String, value: Schema.String }),
  ),
})
export type ProseInput = Schema.Schema.Type<typeof ProseInput>

export const ProseOutput = Schema.Struct({
  text: Schema.String,
  source: Schema.String,
  range: Schema.Tuple(Schema.Number, Schema.Number),
})
export type ProseOutput = Schema.Schema.Type<typeof ProseOutput>

// ---------------------------------------------------------------------------
// Errors

export class AIInvokeError extends Data.TaggedError('AIInvokeError')<{
  readonly reason: string
}> {}

export class GateUnresolved extends Data.TaggedError('GateUnresolved')<{
  readonly reason: string
}> {}

// ---------------------------------------------------------------------------
// ProseInvoke — loads and templates prose

export interface ProseInvokeService {
  readonly render: (
    ref: ProseRef,
    input: ProseInput,
  ) => Effect.Effect<ProseOutput, ProseLoadError>
}

export class ProseInvoke extends Context.Tag('@literate/ProseInvoke')<
  ProseInvoke,
  ProseInvokeService
>() {}

const sliceBySection = (text: string, slug: string): string | null => {
  const lines = text.split('\n')
  let inSection = false
  const out: string[] = []
  let sectionLevel = 0
  for (const line of lines) {
    const headingMatch = line.match(/^(#+)\s+(.*)$/)
    if (headingMatch) {
      const level = headingMatch[1]!.length
      const title = headingMatch[2]!.trim()
      const asSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      if (!inSection && asSlug === slug) {
        inSection = true
        sectionLevel = level
        continue
      }
      if (inSection && level <= sectionLevel) {
        break
      }
    }
    if (inSection) out.push(line)
  }
  return inSection ? out.join('\n') : null
}

const applyVars = (
  text: string,
  vars: Record<string, string> | undefined,
): string => {
  if (!vars) return text
  let out = text
  for (const [k, v] of Object.entries(vars)) {
    out = out.split(`{vars.${k}}`).join(v)
  }
  return out
}

export const makeProseInvoke: Effect.Effect<ProseInvokeService> =
  Effect.succeed({
    render: (ref, input) =>
      Effect.gen(function* () {
        const raw = yield* ref.load()
        let text = raw
        if (input.section) {
          text = sliceBySection(text, input.section) ?? text
        }
        const varsApplied = applyVars(text, input.vars)
        const rangeStart = input.range?.[0] ?? 0
        const rangeEnd = input.range?.[1] ?? varsApplied.length
        const sliced = varsApplied.slice(rangeStart, rangeEnd)
        return {
          text: sliced,
          source: ref.sourcePath,
          range: [rangeStart, Math.min(rangeEnd, varsApplied.length)] as [
            number,
            number,
          ],
        }
      }),
  })

export const LiveProseInvokeLayer = Layer.effect(ProseInvoke, makeProseInvoke)

// ---------------------------------------------------------------------------
// AIInvoke — stub that always fails in v0.1; live bindings in harness

export interface AIInvokeService {
  readonly run: <O>(
    prompt: string,
    outputSchema: Schema.Schema<O, any, never>,
  ) => Effect.Effect<O, AIInvokeError>
}

export class AIInvoke extends Context.Tag('@literate/AIInvoke')<
  AIInvoke,
  AIInvokeService
>() {}

export const StubAIInvokeLayer = Layer.succeed(AIInvoke, {
  run: <O>(
    _prompt: string,
    _outputSchema: Schema.Schema<O, any, never>,
  ): Effect.Effect<O, AIInvokeError> =>
    Effect.fail(
      new AIInvokeError({
        reason:
          'No AIInvoke binding; the harness must provide a live implementation',
      }),
    ),
})

// ---------------------------------------------------------------------------
// GateService — stub that always suspends (live CLI / chat binding in harness)

export interface GateServiceImpl {
  readonly present: <D>(
    draft: D,
    draftSchema: Schema.Schema<D, any, never>,
  ) => Effect.Effect<GateDecision<D>, GateUnresolved>
}

export class GateService extends Context.Tag('@literate/GateService')<
  GateService,
  GateServiceImpl
>() {}

export const StubGateServiceLayer = Layer.succeed(GateService, {
  present: <D>(
    _draft: D,
    _schema: Schema.Schema<D, any, never>,
  ): Effect.Effect<GateDecision<D>, GateUnresolved> =>
    Effect.fail(
      new GateUnresolved({
        reason:
          'No GateService binding; the harness must provide a live implementation',
      }),
    ),
})

// ---------------------------------------------------------------------------
// SessionStore — corpus-file I/O + timestamps used by workflow Tropes
// (session-start, session-end). Paths are relative to the repository root;
// the live binding (deferred to a later session) resolves against an
// injected root path. The in-memory factory below backs tests with a
// scripted file map and frozen timestamp.

export const Timestamp = Schema.Struct({
  iso: Schema.String,           // full ISO-8601 with sub-second precision
  logStamp: Schema.String,      // 'YYYY-MM-DDTHH:MM' — for Started:/Closed: fields
  filenameStamp: Schema.String, // 'YYYY-MM-DDTHHMM' — for filenames
})
export type Timestamp = Schema.Schema.Type<typeof Timestamp>

export class SessionStoreError extends Data.TaggedError('SessionStoreError')<{
  readonly operation: 'listDir' | 'read' | 'write' | 'rename' | 'now'
  readonly path: string
  readonly reason: string
}> {}

export interface SessionStoreService {
  readonly listDir: (
    relPath: string,
  ) => Effect.Effect<ReadonlyArray<string>, SessionStoreError>
  readonly read: (relPath: string) => Effect.Effect<string, SessionStoreError>
  readonly write: (
    relPath: string,
    content: string,
  ) => Effect.Effect<void, SessionStoreError>
  readonly rename: (
    oldRelPath: string,
    newRelPath: string,
  ) => Effect.Effect<void, SessionStoreError>
  readonly now: () => Effect.Effect<Timestamp>
}

export class SessionStore extends Context.Tag('@literate/SessionStore')<
  SessionStore,
  SessionStoreService
>() {}

const unboundOp =
  <Op extends SessionStoreError['operation']>(operation: Op) =>
  (path: string) =>
    Effect.fail(
      new SessionStoreError({
        operation,
        path,
        reason:
          'No SessionStore binding; the harness must provide a live (or in-memory) implementation',
      }),
    )

export const StubSessionStoreLayer = Layer.succeed(SessionStore, {
  listDir: unboundOp('listDir'),
  read: unboundOp('read'),
  write: (p, _content) => unboundOp('write')(p),
  rename: (o, n) => unboundOp('rename')(`${o}→${n}`),
  now: () =>
    Effect.succeed({
      iso: '1970-01-01T00:00:00.000Z',
      logStamp: '1970-01-01T00:00',
      filenameStamp: '1970-01-01T0000',
    }),
})

/**
 * Construct a working in-memory `SessionStoreService` backed by a
 * flat relative-path → content map and a frozen timestamp. Used by
 * unit tests of Protocol-mode Tropes; not intended as a production
 * binding.
 */
export const makeInMemorySessionStore = (initial: {
  readonly files: Record<string, string>
  readonly now: Timestamp
}): Effect.Effect<SessionStoreService> =>
  Effect.gen(function* () {
    const filesRef = yield* Ref.make<Record<string, string>>({
      ...initial.files,
    })
    const timeRef = yield* Ref.make<Timestamp>(initial.now)
    return {
      listDir: (relPath) =>
        Effect.flatMap(Ref.get(filesRef), (files) => {
          const prefix = relPath.endsWith('/') ? relPath : `${relPath}/`
          const direct = new Set<string>()
          for (const key of Object.keys(files)) {
            if (!key.startsWith(prefix)) continue
            const rest = key.slice(prefix.length)
            const slash = rest.indexOf('/')
            direct.add(slash === -1 ? rest : rest.slice(0, slash))
          }
          return Effect.succeed([...direct].sort())
        }),
      read: (relPath) =>
        Effect.flatMap(Ref.get(filesRef), (files) => {
          const content = files[relPath]
          if (content === undefined) {
            return Effect.fail(
              new SessionStoreError({
                operation: 'read',
                path: relPath,
                reason: 'not found in in-memory store',
              }),
            )
          }
          return Effect.succeed(content)
        }),
      write: (relPath, content) =>
        Ref.update(filesRef, (files) => ({ ...files, [relPath]: content })),
      rename: (oldPath, newPath) =>
        Effect.flatMap(Ref.get(filesRef), (files) => {
          if (!(oldPath in files)) {
            return Effect.fail(
              new SessionStoreError({
                operation: 'rename',
                path: `${oldPath}→${newPath}`,
                reason: 'source not found in in-memory store',
              }),
            )
          }
          const { [oldPath]: content, ...rest } = files
          return Ref.set(filesRef, { ...rest, [newPath]: content! })
        }),
      now: () => Ref.get(timeRef),
    }
  })

export const inMemorySessionStoreLayer = (initial: {
  readonly files: Record<string, string>
  readonly now: Timestamp
}): Layer.Layer<SessionStore> =>
  Layer.effect(SessionStore, makeInMemorySessionStore(initial))

// ---------------------------------------------------------------------------
// Scripted GateService — returns a queue of canned decisions in order.
// Used by unit tests of Protocol-mode Tropes that exercise gate paths;
// not intended as a production binding.

export const makeScriptedGateService = (
  decisions: ReadonlyArray<GateDecision<unknown>>,
): Effect.Effect<GateServiceImpl> =>
  Effect.gen(function* () {
    const queue = yield* Ref.make<ReadonlyArray<GateDecision<unknown>>>(
      decisions,
    )
    return {
      present: <D>(
        _draft: D,
        _schema: Schema.Schema<D, any, never>,
      ): Effect.Effect<GateDecision<D>, GateUnresolved> =>
        Effect.flatMap(Ref.get(queue), (current) => {
          if (current.length === 0) {
            return Effect.fail(
              new GateUnresolved({
                reason: 'scripted gate queue exhausted',
              }),
            )
          }
          const [head, ...rest] = current
          return Effect.as(
            Ref.set(queue, rest),
            head as unknown as GateDecision<D>,
          )
        }),
    }
  })

export const scriptedGateServiceLayer = (
  decisions: ReadonlyArray<GateDecision<unknown>>,
): Layer.Layer<GateService> =>
  Layer.effect(GateService, makeScriptedGateService(decisions))

// ---------------------------------------------------------------------------
// Terminal GateService — renders the draft to stdout and parses the
// Person's decision from stdin. The live CLI binding (S4) constructs a
// `TerminalIO` against `process.stdin` / `process.stdout` via
// `makeNodeTerminalIO`. Tests drive the same factory with a scripted
// IO via `makeScriptedTerminalIO`.

export interface TerminalIO {
  readonly readLine: () => Effect.Effect<string, GateUnresolved>
  readonly write: (s: string) => Effect.Effect<void>
}

const renderGateDraft = (draft: unknown): string => {
  try {
    return JSON.stringify(draft, null, 2)
  } catch {
    return String(draft)
  }
}

/**
 * Construct a live `GateServiceImpl` backed by a `TerminalIO`. The
 * rendered prompt is a simple JSON pretty-print of the draft plus a
 * fixed option menu; a schema-aware renderer is deferred. A response
 * that does not parse to one of Accept / Correct / Clarify / Reject
 * fails with `GateUnresolved` — the caller's `gateStep` translates
 * that to a `GatePending` suspend via ADR-017.
 */
export const makeTerminalGateService = (
  io: TerminalIO,
): Effect.Effect<GateServiceImpl> =>
  Effect.succeed({
    present: <D>(
      draft: D,
      _draftSchema: Schema.Schema<D, any, never>,
    ): Effect.Effect<GateDecision<D>, GateUnresolved> =>
      Effect.gen(function* () {
        yield* io.write('\n--- Review draft ---\n')
        yield* io.write(`${renderGateDraft(draft)}\n\n`)
        yield* io.write(
          'Options: [a]ccept, [c]orrect, [cl]arify, [r]eject\n> ',
        )
        const raw = yield* io.readLine()
        const choice = raw.trim().toLowerCase()
        if (choice === 'a' || choice === 'accept') {
          return { _tag: 'Accept', value: draft } as GateDecision<D>
        }
        if (choice === 'c' || choice === 'correct') {
          yield* io.write('Correction note: ')
          const note = (yield* io.readLine()).trim()
          return {
            _tag: 'Correct',
            value: draft,
            note,
          } as GateDecision<D>
        }
        if (choice === 'cl' || choice === 'clarify') {
          yield* io.write('Question: ')
          const question = (yield* io.readLine()).trim()
          return { _tag: 'Clarify', question } as GateDecision<D>
        }
        if (choice === 'r' || choice === 'reject') {
          yield* io.write('Rejection reason: ')
          const reason = (yield* io.readLine()).trim()
          return { _tag: 'Reject', reason } as GateDecision<D>
        }
        return yield* Effect.fail(
          new GateUnresolved({
            reason: `unrecognised gate response: ${JSON.stringify(choice)}`,
          }),
        )
      }),
  })

export const terminalGateServiceLayer = (
  io: TerminalIO,
): Layer.Layer<GateService> =>
  Layer.effect(GateService, makeTerminalGateService(io))

/**
 * Scripted `TerminalIO` for tests. `inputs` are returned from
 * `readLine()` in order; all `write()` arguments accumulate into the
 * `writes` array (mutable; readable after the program runs).
 * Exhausting the input queue fails subsequent reads with
 * `GateUnresolved` — the same error the live binding raises on EOF.
 */
export const makeScriptedTerminalIO = (
  inputs: ReadonlyArray<string>,
): { readonly io: TerminalIO; readonly writes: string[] } => {
  const writes: string[] = []
  const queue: string[] = [...inputs]
  const io: TerminalIO = {
    readLine: () =>
      queue.length === 0
        ? Effect.fail(
            new GateUnresolved({ reason: 'scripted stdin exhausted' }),
          )
        : Effect.sync(() => queue.shift()!),
    write: (s) =>
      Effect.sync(() => {
        writes.push(s)
      }),
  }
  return { io, writes }
}

// ---------------------------------------------------------------------------
// Default stub layers merged

export const DefaultStubLayers = Layer.mergeAll(
  LiveProseInvokeLayer,
  StubAIInvokeLayer,
  StubGateServiceLayer,
  StubSessionStoreLayer,
)
