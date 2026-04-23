/**
 * GateDecision<D> — the typed output of every gate Step (ADR-017).
 */
import { Schema } from 'effect'

export type GateDecision<D> =
  | { readonly _tag: 'Accept'; readonly value: D }
  | { readonly _tag: 'Correct'; readonly value: D; readonly note: string }
  | { readonly _tag: 'Clarify'; readonly question: string }
  | { readonly _tag: 'Reject'; readonly reason: string }

export const GateDecisionSchema = <D, I>(valueSchema: Schema.Schema<D, I>) =>
  Schema.Union(
    Schema.Struct({
      _tag: Schema.Literal('Accept'),
      value: valueSchema,
    }),
    Schema.Struct({
      _tag: Schema.Literal('Correct'),
      value: valueSchema,
      note: Schema.String,
    }),
    Schema.Struct({
      _tag: Schema.Literal('Clarify'),
      question: Schema.String,
    }),
    Schema.Struct({
      _tag: Schema.Literal('Reject'),
      reason: Schema.String,
    }),
  )
