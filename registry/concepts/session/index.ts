/**
 * `concepts/session` — the Session instance Concept seed.
 *
 * Declares the typed shape of an LF session: its log path + slug,
 * its `Status` lifecycle (`Planned | Open | Closed | Abandoned`),
 * its agent + timestamps, and the three optional cross-axis fields
 * (`disposition`, `mode`, `implications`) added by ADR-031, ADR-032,
 * and ADR-033 respectively. The three optional fields are
 * backward-compatible at v0.1 — existing session logs predate them
 * and remain valid under this Schema.
 *
 * Distinct from `session-start-procedure` and `session-end-procedure`
 * Concepts (which declare the contracts for the *operations* that
 * open and close a session). This Concept declares the shape of the
 * *session instance* itself.
 *
 * Distribution shape (ADR-025/026): registry seed at
 * `registry/concepts/session/index.ts`. Tangled into a consumer repo
 * via `literate tangle concepts session`.
 *
 * Upstream ADRs: ADR-001 (algebra), ADR-010 (Concepts unify Terms),
 * ADR-013 (session log as event store), ADR-014 (Protocol.continue
 * dispatches sessions), ADR-015 (TS + .md siblings), ADR-021
 * (Modality — superseded for session by ADR-031's Disposition),
 * ADR-031 (Disposition), ADR-032 (Mode + IMP-N), ADR-033
 * (Implication).
 */
import { Schema } from 'effect'
import { concept, prose, type Concept } from '@literate/core'

import { DispositionSchema } from '../disposition/index.ts'
import { ImplicationSchema } from '../implication/index.ts'
import { ModeSchema } from '../mode/index.ts'
import {
  SessionStatusSchema,
  SessionStatus,
} from '../session-status/index.ts'

const ConceptProse = prose(import.meta.url, './concept.mdx')

export { SessionStatusSchema, SessionStatus }
export type SessionStatus = Schema.Schema.Type<typeof SessionStatusSchema>

export const SessionSchema = Schema.Struct({
  _tag: Schema.Literal('Session'),
  path: Schema.String,
  slug: Schema.String,
  date: Schema.String,
  status: SessionStatusSchema,
  agent: Schema.optional(Schema.String),
  startedAt: Schema.optional(Schema.String),
  closedAt: Schema.optional(Schema.String),
  disposition: Schema.optional(DispositionSchema),
  mode: Schema.optional(ModeSchema),
  implications: Schema.optional(Schema.Array(ImplicationSchema)),
})
export type Session = Schema.Schema.Type<typeof SessionSchema>

export const SessionConcept: Concept<Session> = concept({
  id: 'session',
  version: '0.1.0',
  description:
    'The typed shape of an LF session instance: log path + slug, Status lifecycle (Planned | Open | Closed | Abandoned), agent + timestamps, and three optional cross-axis fields (disposition, mode, implications) added by ADR-031/032/033. The three optional fields are backward-compatible at v0.1; older session logs that predate them remain valid.',
  instanceSchema: SessionSchema,
  prose: ConceptProse,
})

export default SessionConcept
