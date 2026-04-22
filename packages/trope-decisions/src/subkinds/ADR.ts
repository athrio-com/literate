/**
 * @adr ADR-001
 *
 * The ADR subkind of the `decisions` Trope. Refines the
 * DecisionInstanceSchema by fixing `subkind: 'ADR'`.
 */

import { Schema } from 'effect'
import { proseFrom, type Subkind } from '@literate/core'
import {
  DecisionsConcept,
  DecisionStatus,
} from '@literate/concept-decisions'

export const ADRInstanceSchema = Schema.Struct({
  subkind: Schema.Literal('ADR'),
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
export type ADRInstance = Schema.Schema.Type<typeof ADRInstanceSchema>

export const ADRSubkind: Subkind<typeof DecisionsConcept, ADRInstance> = {
  _tag: 'Subkind',
  id: 'ADR',
  version: '0.1.0',
  realises: DecisionsConcept,
  instanceSchema: ADRInstanceSchema as never,
  prose: proseFrom(import.meta.url, './ADR.mdx'),
}

export default ADRSubkind
