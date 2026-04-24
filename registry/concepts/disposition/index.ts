/**
 * `concepts/disposition` — the Disposition Concept seed.
 *
 * Disposition names the *referential domain* a Trope, an authored
 * instance, or a session belongs to. `base` is closed (three values);
 * `scope`, `prompt`, `prose` are open optional fields. See
 * `concept.mdx` for the prose body and `README.md` for orientation.
 *
 * Distribution shape (ADR-025/026 + ADR-031): this file is a registry
 * seed at `registry/concepts/disposition/index.ts`. Tangled into a
 * consumer repo via `literate tangle concepts disposition`. Replaces
 * the `Modality` ADT from ADR-021 (superseded by ADR-031 — see
 * `corpus/decisions/ADR-031-disposition-supersedes-modality.md`).
 *
 * Upstream ADRs: ADR-001 (algebra), ADR-010 (Concepts unify Terms),
 * ADR-015 (TS + .md siblings), ADR-021 (Modality — superseded),
 * ADR-025/026 (registry seed shape), ADR-031 (Disposition supersedes
 * Modality).
 */
import { Schema } from 'effect'
import { concept, prose, type Concept } from '@literate/core'

const ConceptProse = prose(import.meta.url, './concept.mdx')

export const DispositionBase = Schema.Literal(
  'Product',
  'Protocol',
  'Infrastructure',
)
export type DispositionBase = Schema.Schema.Type<typeof DispositionBase>

export const DispositionSchema = Schema.Struct({
  base: DispositionBase,
  scope: Schema.optional(Schema.String),
  prompt: Schema.optional(Schema.String),
  prose: Schema.optional(Schema.String),
})
export type Disposition = Schema.Schema.Type<typeof DispositionSchema>

export const Disposition = {
  Product: { base: 'Product' as const },
  Protocol: { base: 'Protocol' as const },
  Infrastructure: { base: 'Infrastructure' as const },
} satisfies Record<string, Disposition>

export const DispositionConcept: Concept<Disposition> = concept({
  id: 'disposition',
  version: '0.1.0',
  description:
    'The referential domain a Trope, authored instance, or session belongs to. base ∈ {Product, Protocol, Infrastructure}; scope / prompt / prose are open optional fields. Supersedes ADR-021 Modality (terminology + shape).',
  instanceSchema: DispositionSchema,
  prose: ConceptProse,
})

export default DispositionConcept
