/**
 * @adr ADR-001
 *
 * Goal Category closed vocabulary. Member of the `category` Trope.
 */

import { Schema } from 'effect'
import { proseFrom, type Member } from '@literate/core'

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

export const goalCategories = [
  'exploration',
  'feature',
  'bugfix',
  'refactor',
  'prose',
  'process',
  'migration',
] as const satisfies ReadonlyArray<GoalCategory>

export const goalCategoryMember: Member<{
  readonly schema: typeof GoalCategory
  readonly values: typeof goalCategories
}> = {
  _tag: 'Member',
  id: 'goal-category',
  description: 'Closed set of Category values a session-Goal can carry.',
  value: { schema: GoalCategory, values: goalCategories },
  prose: proseFrom(import.meta.url, './goal-category.mdx'),
}

export default goalCategoryMember
