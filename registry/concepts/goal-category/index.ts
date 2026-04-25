/**
 * `concepts/goal-category` — the Goal Category Concept seed.
 *
 * Closed vocabulary of `Category:` values a session-Goal can carry.
 * Categories shape expectations for what "done" looks like and how
 * tight the upstream prose requirement is. Promoted from the legacy
 * `corpus/categories/goal-category.md` category file.
 *
 * Distribution shape (ADR-025/026): registry seed at
 * `registry/concepts/goal-category/index.ts`. Tangled via
 * `literate tangle concepts goal-category`.
 *
 * Upstream LFMs: see corpus/manifests/protocol/algebra.md and
 *   sibling LFMs for the current-state declarations this seed
 *   realises.
 */
import { Schema } from 'effect'
import { concept, prose, type Concept } from '@literate/core'

const ConceptProse = prose(import.meta.url, './concept.mdx')

export const GoalCategorySchema = Schema.Literal(
  'exploration',
  'feature',
  'bugfix',
  'refactor',
  'prose',
  'process',
  'migration',
  'decision-only',
)
export type GoalCategory = Schema.Schema.Type<typeof GoalCategorySchema>

export const GoalCategory = {
  exploration: 'exploration' as const,
  feature: 'feature' as const,
  bugfix: 'bugfix' as const,
  refactor: 'refactor' as const,
  prose: 'prose' as const,
  process: 'process' as const,
  migration: 'migration' as const,
  decisionOnly: 'decision-only' as const,
} satisfies Record<string, GoalCategory>

export const GoalCategoryConcept: Concept<GoalCategory> = concept({
  id: 'goal-category',
  version: '0.1.0',
  description:
    "Closed vocabulary of `Category:` values a session-Goal can carry. Each Goal carries exactly one category. Promoted from `corpus/categories/goal-category.md`; adds `decision-only` for Goals whose Acceptance is a single ADR with no code change.",
  instanceSchema: GoalCategorySchema,
  prose: ConceptProse,
})

export default GoalCategoryConcept
