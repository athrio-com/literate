/**
 * Suspend — the exit-the-turn signal.
 *
 * See ADR-013 (session log as event store) §4.
 */
import { Data, Schema } from 'effect'
import type { StepId, InvocationKey } from './step.ts'

// ---------------------------------------------------------------------------
// Pending payloads

export interface GatePending {
  readonly _tag: 'GatePending'
  readonly stepId: StepId
  readonly draft: unknown
  readonly draftSchemaId: string  // Schema identity for Person-facing rendering
  readonly options: ReadonlyArray<'Accept' | 'Correct' | 'Clarify' | 'Reject'>
}

export interface AIPending {
  readonly _tag: 'AIPending'
  readonly stepId: StepId
  readonly prompt: string
  readonly outputSchemaId: string
}

export interface ExternalPending {
  readonly _tag: 'ExternalPending'
  readonly stepId: StepId
  readonly resource: string
}

export type Pending = GatePending | AIPending | ExternalPending

// ---------------------------------------------------------------------------
// Suspend — tagged error the runtime catches to end a turn

export class Suspend extends Data.TaggedError('Suspend')<{
  readonly reason: 'gate' | 'ai' | 'external'
  readonly stepId: StepId
  readonly invocationKey: InvocationKey
  readonly payload: Pending
}> {}

// ---------------------------------------------------------------------------
// ReplayDivergence — raised when a replayed output disagrees with the log

export class ReplayDivergence extends Data.TaggedError('ReplayDivergence')<{
  readonly stepId: StepId
  readonly invocationKey: InvocationKey
  readonly recorded: unknown
  readonly computed: unknown
}> {}

// ---------------------------------------------------------------------------
// Schema for Pending — used when persisting to the log

export const PendingSchema = Schema.Union(
  Schema.Struct({
    _tag: Schema.Literal('GatePending'),
    stepId: Schema.String,
    draft: Schema.Unknown,
    draftSchemaId: Schema.String,
    options: Schema.Array(
      Schema.Literal('Accept', 'Correct', 'Clarify', 'Reject'),
    ),
  }),
  Schema.Struct({
    _tag: Schema.Literal('AIPending'),
    stepId: Schema.String,
    prompt: Schema.String,
    outputSchemaId: Schema.String,
  }),
  Schema.Struct({
    _tag: Schema.Literal('ExternalPending'),
    stepId: Schema.String,
    resource: Schema.String,
  }),
)
