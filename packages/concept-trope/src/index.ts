/**
 * @adr ADR-001
 *
 * The `trope` Concept — describes the realisation shape of a Trope.
 * Each Trope is a TypeScript module that exports a `Trope<C>` value
 * realising some Concept C; this Concept's instance schema describes
 * the metadata such a module declares.
 */

import { Schema } from 'effect'
import { proseFrom, type Concept } from '@literate/core'
import { ConceptConcept } from '@literate/concept-concept'

export const TropeDeclarationSchema = Schema.Struct({
  id: Schema.String,
  version: Schema.String,
  realises: Schema.String,
  dependencies: Schema.Array(Schema.String),
  subkinds: Schema.optional(Schema.Array(Schema.String)),
  members: Schema.optional(Schema.Array(Schema.String)),
})

export type TropeDeclaration = Schema.Schema.Type<typeof TropeDeclarationSchema>

export const TropeConcept: Concept<TropeDeclaration> = {
  _tag: 'Concept',
  id: 'trope',
  version: '0.1.0',
  description:
    'A composable realisation of a Concept; prose-first, with typed Schema, dependencies, subkinds, members, and an optional Effect Layer.',
  instanceSchema: TropeDeclarationSchema,
  prose: proseFrom(import.meta.url, './concept.mdx'),
  dependencies: [ConceptConcept],
}

export default TropeConcept
