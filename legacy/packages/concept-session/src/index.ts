/**
 * @adr ADR-001
 *
 * The `session` Concept — describes a session log instance: header
 * metadata, gated `## Goals`, append-only `## Decisions Made` and
 * `## Work Done`, the `## Summary`, and optional Deferred / Discovered.
 */

import { Schema } from 'effect'
import { proseFrom, type Concept } from '@literate/core'
import { CorpusConcept } from '@literate/concept-corpus'

export const GoalStatus = Schema.Union(
  Schema.Literal('Active'),
  Schema.Literal('Completed'),
  Schema.TemplateLiteral(Schema.Literal('Superseded by Goal '), Schema.Number),
  Schema.Literal('Abandoned'),
)
export type GoalStatus = Schema.Schema.Type<typeof GoalStatus>

export const GoalCategory = Schema.Literal(
  'exploration',
  'feature',
  'bugfix',
  'refactor',
  'prose',
  'process',
  'migration',
)
export type GoalCategory = Schema.Schema.Type<typeof GoalCategory>

export const Goal = Schema.Struct({
  number: Schema.Number,
  topic: Schema.String,
  upstream: Schema.Array(Schema.String),
  scope: Schema.optional(Schema.Array(Schema.String)),
  outOfScope: Schema.optional(Schema.Array(Schema.String)),
  acceptance: Schema.optional(Schema.Array(Schema.String)),
  notes: Schema.optional(Schema.String),
  status: Schema.optional(GoalStatus),
  category: Schema.optional(GoalCategory),
})
export type Goal = Schema.Schema.Type<typeof Goal>

export const SessionStatus = Schema.Union(
  Schema.Literal('Planned'),
  Schema.Literal('Open'),
  Schema.TemplateLiteral(Schema.Literal('Closed ('), Schema.String),
  Schema.Literal('Abandoned'),
)
export type SessionStatus = Schema.Schema.Type<typeof SessionStatus>

export const PlanGoal = Schema.Struct({
  topic: Schema.String,
  upstream: Schema.Array(Schema.String),
  acceptance: Schema.Array(Schema.String),
})
export type PlanGoal = Schema.Schema.Type<typeof PlanGoal>

export const PlanEntry = Schema.Struct({
  slug: Schema.String,
  topic: Schema.String,
  dependsOn: Schema.optional(Schema.Array(Schema.String)),
  goals: Schema.Array(PlanGoal),
  realisedBy: Schema.optional(Schema.String),
})
export type PlanEntry = Schema.Schema.Type<typeof PlanEntry>

export const SessionInstanceSchema = Schema.Struct({
  date: Schema.String,
  started: Schema.optional(Schema.String),
  status: SessionStatus,
  chapter: Schema.optional(Schema.String),
  agent: Schema.String,
  plannedBy: Schema.optional(Schema.String),
  goals: Schema.Array(Goal),
  plan: Schema.optional(Schema.Array(PlanEntry)),
  decisionsMade: Schema.Array(Schema.String),
  workDone: Schema.Array(Schema.String),
  summary: Schema.optional(Schema.String),
  deferredDiscovered: Schema.optional(Schema.Array(Schema.String)),
})
export type SessionInstance = Schema.Schema.Type<typeof SessionInstanceSchema>

export const SessionConcept: Concept<SessionInstance> = {
  _tag: 'Concept',
  id: 'session',
  version: '0.1.0',
  description:
    'A bounded, logged, gated work unit. Sessions scope authoring under reviewed Goals and produce auditable logs.',
  instanceSchema: SessionInstanceSchema,
  prose: proseFrom(import.meta.url, './concept.mdx'),
  dependencies: [CorpusConcept],
}

export default SessionConcept
