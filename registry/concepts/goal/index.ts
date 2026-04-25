/**
 * `concepts/goal` — the Goal Concept seed.
 *
 * The typed shape of a session-Goal: number, title, status,
 * category, topic, upstream, optional scope / out-of-scope /
 * acceptance / notes. Composes `goal-status` and `goal-category`
 * as typed properties.
 *
 * The Goal *type* (this Concept) ships as a Protocol mechanism;
 * specific authored Goals are session content (in
 * `corpus/sessions/<...>.md` `## Goals` blocks). The Schema is a
 * passive type surface at v0.1 — the session-lifecycle Tropes
 * still operate over markdown directly. A future `goal-flow`
 * Trope can use the Schema for typed parsing.
 *
 * Distribution shape (ADR-025/026): registry seed at
 * `registry/concepts/goal/index.ts`. Tangled via
 * `literate tangle concepts goal`.
 *
 * Upstream LFMs: see corpus/manifests/protocol/algebra.md and
 *   sibling LFMs for the current-state declarations this seed
 *   realises.
 */
import { Schema } from 'effect'
import { concept, prose, type Concept } from '@literate/core'

import { GoalCategorySchema } from '../goal-category/index.ts'
import { GoalStatusSchema } from '../goal-status/index.ts'

const ConceptProse = prose(import.meta.url, './concept.mdx')

export const GoalSchema = Schema.Struct({
  _tag: Schema.Literal('Goal'),
  number: Schema.Number,
  title: Schema.String,
  status: GoalStatusSchema,
  category: GoalCategorySchema,
  topic: Schema.String,
  upstream: Schema.String,
  scope: Schema.optional(Schema.Array(Schema.String)),
  outOfScope: Schema.optional(Schema.Array(Schema.String)),
  acceptance: Schema.optional(Schema.Array(Schema.String)),
  notes: Schema.optional(Schema.String),
})
export type Goal = Schema.Schema.Type<typeof GoalSchema>

export const GoalConcept: Concept<Goal> = concept({
  id: 'goal',
  version: '0.1.0',
  description:
    'The typed shape of a session-Goal: number, title, status (from goal-status), category (from goal-category), topic, upstream, optional scope / out-of-scope / acceptance / notes. Composes goal-status and goal-category as typed properties. Schema is a passive type surface at v0.1.',
  instanceSchema: GoalSchema,
  prose: ConceptProse,
  dependencies: [],
})

export default GoalConcept
