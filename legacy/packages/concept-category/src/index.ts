/**
 * @adr ADR-001
 *
 * The `category` Concept — a closed vocabulary with named members and
 * optional morphisms. Categories are how LF makes enumerated values
 * visible to authors and validators: before a value can be used in
 * prose or code, the value must be a declared member.
 */

import { Schema } from 'effect'
import { proseFrom, type Concept } from '@literate/core'
import { CorpusConcept } from '@literate/concept-corpus'

export const CategoryMember = Schema.Struct({
  id: Schema.String,
  description: Schema.optional(Schema.String),
})
export type CategoryMember = Schema.Schema.Type<typeof CategoryMember>

export const CategoryInstanceSchema = Schema.Struct({
  name: Schema.String,
  description: Schema.String,
  members: Schema.Array(CategoryMember),
  morphisms: Schema.optional(Schema.String),
  references: Schema.optional(Schema.Array(Schema.String)),
})
export type CategoryInstance = Schema.Schema.Type<typeof CategoryInstanceSchema>

export const CategoryConcept: Concept<CategoryInstance> = {
  _tag: 'Concept',
  id: 'category',
  version: '0.1.0',
  description:
    'A closed vocabulary with named members and optional morphisms. Member additions and removals pass the review gate; editorial revisions are ungated.',
  instanceSchema: CategoryInstanceSchema,
  prose: proseFrom(import.meta.url, './concept.mdx'),
  dependencies: [CorpusConcept],
}

export default CategoryConcept
