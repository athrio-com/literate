/**
 * @adr ADR-001
 *
 * The `concept` Concept — describes the declaration shape of a Concept
 * itself. Self-referential by construction: a Concept declaration carries
 * the same fields the Concept type prescribes.
 */

import { Schema } from 'effect'
import { proseFrom, type Concept } from '@literate/core'

export const ConceptDeclarationSchema = Schema.Struct({
  id: Schema.String,
  version: Schema.String,
  description: Schema.String,
  dependencies: Schema.Array(Schema.String),
})

export type ConceptDeclaration = Schema.Schema.Type<typeof ConceptDeclarationSchema>

export const ConceptConcept: Concept<ConceptDeclaration> = {
  _tag: 'Concept',
  id: 'concept',
  version: '0.1.0',
  description: 'The metalanguage entry for a kind of thing LF recognises.',
  instanceSchema: ConceptDeclarationSchema,
  prose: proseFrom(import.meta.url, './concept.mdx'),
  dependencies: [],
}

export default ConceptConcept
