/**
 * ExecutionLog — the event store (ADR-013).
 *
 * An append-only record of every Step invocation. In v0.1 we ship an
 * in-memory implementation; file-backed parsing of the `## Execution Log`
 * fenced block in a session log is deferred (ADR-013 §1 flagged the
 * wire format as indicative).
 */
import { Context, Data, Effect, Layer, Option, Ref, Schema } from 'effect'
import type { InvocationKey, StepId } from './step.ts'
import { StepKind } from './step.ts'

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
