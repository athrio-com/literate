/**
 * @adr ADR-001
 *
 * The `decisions` Concept — describes a decision record (e.g. an ADR):
 * append-only body with a mutable Status line, tagged with closed-set
 * tags drawn from a category.
 */

import { Schema } from 'effect'
import { proseFrom, type Concept } from '@literate/core'
import { CorpusConcept } from '@literate/concept-corpus'
import { CategoryConcept } from '@literate/concept-category'

export const DecisionStatus = Schema.Union(
  Schema.Literal('Open'),
  Schema.Literal('Accepted'),
  Schema.Literal('Deferred'),
  Schema.TemplateLiteral(Schema.Literal('Superseded by '), Schema.String),
)
export type DecisionStatus = Schema.Schema.Type<typeof DecisionStatus>

export const DecisionInstanceSchema = Schema.Struct({
  subkind: Schema.String,
  number: Schema.Number,
  slug: Schema.String,
  title: Schema.String,
  date: Schema.String,
  status: DecisionStatus,
  tags: Schema.Array(Schema.String),
  context: Schema.String,
  decision: Schema.String,
  consequences: Schema.String,
  deferred: Schema.optional(Schema.String),
})
export type DecisionInstance = Schema.Schema.Type<typeof DecisionInstanceSchema>

export const DecisionsConcept: Concept<DecisionInstance> = {
  _tag: 'Concept',
  id: 'decisions',
  version: '0.1.0',
  description:
    'Append-only records of architectural or structural choices. The reasoning chain is preserved; only the Status line is mutable.',
  instanceSchema: DecisionInstanceSchema,
  prose: proseFrom(import.meta.url, './concept.mdx'),
  dependencies: [CorpusConcept, CategoryConcept],
}

export default DecisionsConcept
