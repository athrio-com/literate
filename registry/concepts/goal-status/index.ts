/**
 * `concepts/goal-status` — the Goal Status Concept seed.
 *
 * Closed vocabulary of `Status:` values a session-Goal can carry:
 * `Active`, `Completed`, `Abandoned`, or the open string family
 * `Superseded by Goal N`. Promoted from the legacy
 * `corpus/categories/goal-status.md` category file. Transitions
 * documented in prose; Schema-level enforcement deferred.
 *
 * Distribution shape (ADR-025/026): registry seed at
 * `registry/concepts/goal-status/index.ts`. Tangled via
 * `literate tangle concepts goal-status`.
 *
 * Upstream ADRs: ADR-001 (algebra), ADR-010 (Concepts unify Terms),
 * ADR-015 (TS + .md siblings), ADR-025/026 (registry seed shape).
 */
import { Schema } from 'effect'
import { concept, prose, type Concept } from '@literate/core'

const ConceptProse = prose(import.meta.url, './concept.mdx')

export const GoalStatusBaseSchema = Schema.Literal(
  'Active',
  'Completed',
  'Abandoned',
)
export type GoalStatusBase = Schema.Schema.Type<typeof GoalStatusBaseSchema>

export const SUPERSEDED_BY_GOAL_PATTERN = /^Superseded by Goal \d+/

const SupersededByLine = Schema.String.pipe(
  Schema.pattern(SUPERSEDED_BY_GOAL_PATTERN, {
    message: () => 'expected `Superseded by Goal N`',
  }),
)

export const GoalStatusSchema = Schema.Union(
  GoalStatusBaseSchema,
  SupersededByLine,
)
export type GoalStatus = Schema.Schema.Type<typeof GoalStatusSchema>

export const GoalStatus = {
  Active: 'Active' as const,
  Completed: 'Completed' as const,
  Abandoned: 'Abandoned' as const,
  supersededBy: (goalNumber: number): string =>
    `Superseded by Goal ${goalNumber}`,
}

export const isTerminalGoalStatus = (raw: string): boolean => {
  const v = raw.trim()
  if (v === 'Completed' || v === 'Abandoned') return true
  return SUPERSEDED_BY_GOAL_PATTERN.test(v)
}

export const GoalStatusConcept: Concept<GoalStatus> = concept({
  id: 'goal-status',
  version: '0.1.0',
  description:
    'Closed vocabulary of `Status:` values a session-Goal can carry: `Active`, `Completed`, `Abandoned`, or `Superseded by Goal N`. Promoted from the legacy `corpus/categories/goal-status.md` category file. The `session-end` Trope refuses close while any Goal remains `Active`.',
  instanceSchema: GoalStatusSchema,
  prose: ConceptProse,
})

export default GoalStatusConcept
