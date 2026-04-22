/**
 * @adr ADR-001
 *
 * Canonical Trope realising the `category` Concept. Bundles the four
 * base members; consumers extend by adding their own Member values.
 */

import { proseFrom, type Trope } from '@literate/core'
import { CategoryConcept } from '@literate/concept-category'
import corpusTrope from '@literate/trope-corpus'
import tagsMember from './members/tags.ts'
import adrStatusMember from './members/adr-status.ts'
import goalStatusMember from './members/goal-status.ts'
import goalCategoryMember from './members/goal-category.ts'

export const categoryTrope: Trope<typeof CategoryConcept> = {
  _tag: 'Trope',
  id: 'category',
  version: '0.1.0',
  realises: CategoryConcept,
  prose: proseFrom(import.meta.url, './prose.mdx'),
  dependencies: [corpusTrope],
  subkinds: [],
  members: [tagsMember, adrStatusMember, goalStatusMember, goalCategoryMember],
}

export {
  tagsMember,
  adrStatusMember,
  goalStatusMember,
  goalCategoryMember,
}
export { BaseTag, baseTags } from './members/tags.ts'
export { ADRStatus } from './members/adr-status.ts'
export { GoalStatus } from './members/goal-status.ts'
export { GoalCategory, goalCategories } from './members/goal-category.ts'
export default categoryTrope
