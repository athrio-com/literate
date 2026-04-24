/**
 * `concepts/adr` — the ADR Concept seed.
 *
 * The typed shape of an Architecture Decision Record: number,
 * title, status, tags, date, optional supersession refs. Composes
 * `adr-status` and `tag` as typed properties.
 *
 * The ADR *type* (this Concept) ships as a Protocol mechanism;
 * specific authored ADRs are project content (in the consumer's
 * `corpus/decisions/<...>.md`). LF's own accumulated ADRs live in
 * its own `corpus/decisions/`. The Schema is a passive type
 * surface at v0.1; a future `adr-flow` Trope can use it for typed
 * draft-and-gate flow.
 *
 * Distribution shape (ADR-025/026): registry seed at
 * `registry/concepts/adr/index.ts`. Tangled via
 * `literate tangle concepts adr`.
 *
 * Upstream ADRs: ADR-001 (algebra), ADR-010 (Concepts unify Terms),
 * ADR-015 (TS + .md siblings), ADR-025/026 (registry seed shape).
 */
import { Schema } from 'effect'
import { concept, prose, type Concept } from '@literate/core'

import { ADRStatusSchema } from '../adr-status/index.ts'
import { TagSchema } from '../tag/index.ts'

const ConceptProse = prose(import.meta.url, './concept.mdx')

export const ADRSchema = Schema.Struct({
  _tag: Schema.Literal('ADR'),
  number: Schema.Number,
  title: Schema.String,
  status: ADRStatusSchema,
  tags: Schema.Array(TagSchema),
  date: Schema.optional(Schema.String),
  supersedes: Schema.optional(Schema.Array(Schema.Number)),
  supersededBy: Schema.optional(Schema.Array(Schema.Number)),
})
export type ADR = Schema.Schema.Type<typeof ADRSchema>

export const ADRConcept: Concept<ADR> = concept({
  id: 'adr',
  version: '0.1.0',
  description:
    'The typed shape of an Architecture Decision Record: number, title, status (from adr-status), tags (Array of tag), optional date and supersession references. Composes adr-status and tag as typed properties. Schema is a passive type surface at v0.1.',
  instanceSchema: ADRSchema,
  prose: ConceptProse,
})

export default ADRConcept
