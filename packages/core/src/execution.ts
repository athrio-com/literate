/**
 * ExecutionLog — the event store (ADR-013).
 *
 * An append-only record of every Step invocation. Two implementations
 * ship in `@literate/core`:
 *
 * - `InMemoryExecutionLogLayer` — ephemeral, used by tests and by
 *   Steps run outside a session (e.g. the smoke suite).
 * - `fileBackedExecutionLogLayer(logPath)` — reads and writes the
 *   `## Execution Log` fenced block inside a session log markdown
 *   file via the injected `SessionStore` (ADR-013 §1). Lines inside
 *   the fence are JSONL — one `ExecutionRecord` per line. The
 *   free-form wire format sketched in ADR-013 §1 was flagged
 *   indicative; v0.1 commits to JSONL for lossless round-tripping.
 */
import { Context, Data, Effect, Layer, Option, Ref, Schema } from 'effect'
import type { InvocationKey, StepId } from './step.ts'
import { StepKind } from './step.ts'
import { SessionStore, type SessionStoreError } from './services.ts'

// ---------------------------------------------------------------------------
// ExecutionStatus, ExecutionRecord

export const ExecutionStatus = Schema.Literal(
  'completed',
  'gate-pending',
  'ai-pending',
  'external-pending',
  'failed',
  'suspended',
)
export type ExecutionStatus = Schema.Schema.Type<typeof ExecutionStatus>

export const ExecutionRecord = Schema.Struct({
  stepId: Schema.String,
  invocationKey: Schema.String,
  kind: StepKind,
  startedAt: Schema.String,
  completedAt: Schema.optional(Schema.String),
  status: ExecutionStatus,
  input: Schema.Unknown,
  output: Schema.optional(Schema.Unknown),
  error: Schema.optional(Schema.String),
  agent: Schema.optional(Schema.String),
  resolves: Schema.optional(Schema.String),
})
export type ExecutionRecord = Schema.Schema.Type<typeof ExecutionRecord>

// ---------------------------------------------------------------------------
// Errors

export class LogWriteError extends Data.TaggedError('LogWriteError')<{
  readonly reason: string
}> {}

// ---------------------------------------------------------------------------
// ExecutionLog — Tag + service interface

export interface ExecutionLogService {
  readonly find: (
    stepId: StepId,
    invocationKey: InvocationKey,
  ) => Effect.Effect<Option.Option<ExecutionRecord>>
  readonly append: (
    record: ExecutionRecord,
  ) => Effect.Effect<void, LogWriteError>
  readonly all: () => Effect.Effect<ReadonlyArray<ExecutionRecord>>
}

export class ExecutionLog extends Context.Tag('@literate/ExecutionLog')<
  ExecutionLog,
  ExecutionLogService
>() {}

// ---------------------------------------------------------------------------
// In-memory implementation

export const makeInMemoryExecutionLog: Effect.Effect<ExecutionLogService> =
  Effect.gen(function* () {
    const ref = yield* Ref.make<ReadonlyArray<ExecutionRecord>>([])
    const service: ExecutionLogService = {
      find: (stepId, invocationKey) =>
        Effect.map(Ref.get(ref), (records) => {
          const hit = records.find(
            (r) => r.stepId === stepId && r.invocationKey === invocationKey,
          )
          return hit ? Option.some(hit) : Option.none()
        }),
      append: (record) =>
        Ref.update(ref, (rs) => [...rs, record]),
      all: () => Ref.get(ref),
    }
    return service
  })

export const InMemoryExecutionLogLayer = Layer.effect(
  ExecutionLog,
  makeInMemoryExecutionLog,
)

// ---------------------------------------------------------------------------
// File-backed implementation — reads/writes the `## Execution Log`
// fenced block inside a session log markdown file (ADR-013 §1).
//
// Wire format: JSONL inside a ```exec fence. One `ExecutionRecord`
// per line, terminated by `\n`. The fenced section lives under a
// level-2 heading `## Execution Log`; the section extends from that
// heading to the next level-2 heading or end-of-file. If the section
// does not exist when `append` runs, it is appended to the file.

const EXECUTION_LOG_HEADING = '## Execution Log'
const EXECUTION_LOG_FENCE_OPEN = '```exec'
const EXECUTION_LOG_FENCE_CLOSE = '```'

const extractFenceBody = (markdown: string): string | null => {
  const headingIdx = markdown.indexOf(EXECUTION_LOG_HEADING)
  if (headingIdx === -1) return null
  const afterHeading = markdown.slice(
    headingIdx + EXECUTION_LOG_HEADING.length,
  )
  const fenceOpenRel = afterHeading.indexOf(EXECUTION_LOG_FENCE_OPEN)
  if (fenceOpenRel === -1) return null
  const bodyStartRel =
    fenceOpenRel + EXECUTION_LOG_FENCE_OPEN.length
  // Skip the newline immediately after the fence open marker.
  const bodyStart =
    afterHeading[bodyStartRel] === '\n' ? bodyStartRel + 1 : bodyStartRel
  const fenceCloseRel = afterHeading.indexOf(
    `\n${EXECUTION_LOG_FENCE_CLOSE}`,
    bodyStart,
  )
  if (fenceCloseRel === -1) return null
  return afterHeading.slice(bodyStart, fenceCloseRel)
}

const parseExecutionLogFence = (
  markdown: string,
): ReadonlyArray<ExecutionRecord> => {
  const body = extractFenceBody(markdown)
  if (body === null) return []
  const records: ExecutionRecord[] = []
  for (const line of body.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue
    try {
      records.push(JSON.parse(trimmed) as ExecutionRecord)
    } catch {
      // Malformed line; skip. A stricter validator is deferred until
      // the first malformed-log incident surfaces.
    }
  }
  return records
}

const renderExecutionLogSection = (
  records: ReadonlyArray<ExecutionRecord>,
): string => {
  const body = records.map((r) => JSON.stringify(r)).join('\n')
  const inner = body.length === 0 ? '' : `${body}\n`
  return (
    `${EXECUTION_LOG_HEADING}\n\n` +
    `${EXECUTION_LOG_FENCE_OPEN}\n${inner}${EXECUTION_LOG_FENCE_CLOSE}\n`
  )
}

export const rewriteExecutionLogSection = (
  markdown: string,
  records: ReadonlyArray<ExecutionRecord>,
): string => {
  const section = renderExecutionLogSection(records)
  const headingIdx = markdown.indexOf(EXECUTION_LOG_HEADING)
  if (headingIdx === -1) {
    // No existing section — append.
    const separator = markdown.endsWith('\n\n')
      ? ''
      : markdown.endsWith('\n')
        ? '\n'
        : markdown.length === 0
          ? ''
          : '\n\n'
    return `${markdown}${separator}${section}`
  }
  // Replace the existing section. The section extends from the
  // heading to the next level-2 heading or EOF.
  const afterHeading = markdown.slice(
    headingIdx + EXECUTION_LOG_HEADING.length,
  )
  const nextHeadingRel = afterHeading.search(/\n## /)
  const sectionEnd =
    nextHeadingRel === -1
      ? markdown.length
      : headingIdx + EXECUTION_LOG_HEADING.length + nextHeadingRel + 1
  const prefix = markdown.slice(0, headingIdx)
  const suffix = markdown.slice(sectionEnd)
  return `${prefix}${section}${suffix}`
}

export const makeFileBackedExecutionLog = (
  logPath: string,
): Effect.Effect<ExecutionLogService, never, SessionStore> =>
  Effect.gen(function* () {
    const store = yield* SessionStore
    const readAll: () => Effect.Effect<ReadonlyArray<ExecutionRecord>> = () =>
      store.read(logPath).pipe(
        Effect.orElseSucceed(() => ''),
        Effect.map(parseExecutionLogFence),
      )
    const service: ExecutionLogService = {
      find: (stepId, invocationKey) =>
        Effect.map(readAll(), (records) => {
          const hit = records.find(
            (r) =>
              r.stepId === stepId && r.invocationKey === invocationKey,
          )
          return hit ? Option.some(hit) : Option.none()
        }),
      append: (record) =>
        Effect.gen(function* () {
          const content = yield* store.read(logPath).pipe(
            Effect.orElseSucceed(() => ''),
          )
          const existing = parseExecutionLogFence(content)
          const rewritten = rewriteExecutionLogSection(content, [
            ...existing,
            record,
          ])
          yield* store.write(logPath, rewritten)
        }).pipe(
          Effect.mapError(
            (e: SessionStoreError) =>
              new LogWriteError({
                reason: `SessionStore ${e.operation} failed at ${e.path}: ${e.reason}`,
              }),
          ),
        ),
      all: readAll,
    }
    return service
  })

export const fileBackedExecutionLogLayer = (
  logPath: string,
): Layer.Layer<ExecutionLog, never, SessionStore> =>
  Layer.effect(ExecutionLog, makeFileBackedExecutionLog(logPath))

/**
 * Persist the in-memory (or otherwise transient) `ExecutionLog`
 * records for the active session into `logPath`'s `## Execution Log`
 * fence. Used by the CLI to flush records captured during the
 * session-start flow (when the log path is not known until the
 * session is opened) into the newly-created log file.
 */
export const persistExecutionRecords = (
  logPath: string,
): Effect.Effect<
  void,
  LogWriteError,
  ExecutionLog | SessionStore
> =>
  Effect.gen(function* () {
    const log = yield* ExecutionLog
    const records = yield* log.all()
    const store = yield* SessionStore
    const current = yield* store.read(logPath).pipe(
      Effect.orElseSucceed(() => ''),
    )
    const rewritten = rewriteExecutionLogSection(current, records)
    yield* store.write(logPath, rewritten).pipe(
      Effect.mapError(
        (e) =>
          new LogWriteError({
            reason: `SessionStore ${e.operation} failed at ${e.path}: ${e.reason}`,
          }),
      ),
    )
  })

// ---------------------------------------------------------------------------
// InvocationKey derivation
//
// See ADR-013 §3. A stable-ish hash of (parentStepId || '', iteration,
// stepId, inputJSON). For v0.1 we derive it from stepId + JSON(input);
// loop / branch disambiguation (parentStepId + iteration) is deferred
// to the runtime harness.

import { InvocationKey as MakeInvocationKey } from './step.ts'

export const deriveInvocationKey = (
  stepId: StepId,
  input: unknown,
): InvocationKey => {
  const payload = `${stepId}::${safeStringify(input)}`
  const digest = simpleHash(payload).toString(36)
  return MakeInvocationKey(digest)
}

const safeStringify = (value: unknown): string => {
  try {
    return JSON.stringify(value, Object.keys(value as object ?? {}).sort())
  } catch {
    return String(value)
  }
}

// Non-cryptographic; stable enough for memoisation keys inside one
// process. A production implementation swaps in a proper hash.
const simpleHash = (s: string): number => {
  let h = 2166136261 // FNV-1a 32-bit offset
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}
