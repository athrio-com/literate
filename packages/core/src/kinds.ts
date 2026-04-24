/**
 * Concept, Trope, Variant, Modality — the algebraic metalanguage.
 *
 * A Concept is the *what* (a schema-backed prose declaration);
 * a Trope is the *how* (a Concept realisation bound to a Step);
 * a Variant is an ADT case of a Concept — a refinement with its
 * own schema and prose, emitted under the same Concept tag.
 * A Modality is the *mode of work* (protocol / weave / tangle /
 * unweave / untangle / attest), a general six-case ADT applied
 * to Tropes (required) and Concepts (optional).
 *
 * See ADR-001 (three-level algebra), ADR-009 (Tropes as packages),
 * ADR-010 (unify Terms into Concepts), ADR-011 (Step substrate),
 * ADR-015 (TypeScript composition + .md siblings), ADR-021
 * (Modality ADT) in `../../../corpus/decisions/`.
 */
import { Schema } from 'effect'
import type { AnyStep, ProseRef } from './step.ts'

// ---------------------------------------------------------------------------
// Modality — general six-case ADT (ADR-021).
//
// A tagged union of six unit variants. Each variant is a `{_tag: '...'}`
// struct — pattern-matchable via `switch (m._tag)` or `Match.type<Modality>()`
// from `effect/Match`. Payloads are deferred; adding a payload to a variant
// in a later revision is non-breaking as long as existing `_tag` values are
// preserved and the new fields are additive.

export const ModalitySchema = Schema.Union(
  Schema.Struct({ _tag: Schema.Literal('Protocol') }),
  Schema.Struct({ _tag: Schema.Literal('Weave') }),
  Schema.Struct({ _tag: Schema.Literal('Tangle') }),
  Schema.Struct({ _tag: Schema.Literal('Unweave') }),
  Schema.Struct({ _tag: Schema.Literal('Untangle') }),
  Schema.Struct({ _tag: Schema.Literal('Attest') }),
)

export type Modality = Schema.Schema.Type<typeof ModalitySchema>

// Ergonomic constructors. Grouped on a namespace-like const so call-sites
// read `Modality.Protocol` rather than assembling object literals.
export const Modality = {
  Protocol: { _tag: 'Protocol' } as const,
  Weave: { _tag: 'Weave' } as const,
  Tangle: { _tag: 'Tangle' } as const,
  Unweave: { _tag: 'Unweave' } as const,
  Untangle: { _tag: 'Untangle' } as const,
  Attest: { _tag: 'Attest' } as const,
} satisfies Record<string, Modality>

// ---------------------------------------------------------------------------
// Concept<D> — the "what": a schema-backed prose declaration.

export interface Concept<D = unknown> {
  readonly _tag: 'Concept'
  readonly id: string
  readonly version: string
  readonly description: string
  readonly instanceSchema: Schema.Schema<D, any, never>
  readonly prose: ProseRef
  readonly dependencies: ReadonlyArray<AnyConcept>
  readonly modality?: Modality
}

export type AnyConcept = Concept<any>

export type ConceptInstance<C> = C extends Concept<infer D> ? D : never

export interface ConceptDefinition<D> {
  readonly id: string
  readonly version?: string | undefined
  readonly description: string
  readonly instanceSchema: Schema.Schema<D, any, never>
  readonly prose: ProseRef
  readonly dependencies?: ReadonlyArray<AnyConcept> | undefined
  readonly modality?: Modality | undefined
}

export const concept = <D>(def: ConceptDefinition<D>): Concept<D> => ({
  _tag: 'Concept',
  id: def.id,
  version: def.version ?? '0.0.1',
  description: def.description,
  instanceSchema: def.instanceSchema,
  prose: def.prose,
  dependencies: def.dependencies ?? [],
  ...(def.modality !== undefined ? { modality: def.modality } : {}),
})

// ---------------------------------------------------------------------------
// Variant<C, D> — an ADT case of a Concept. The Concept is the sum; its
// Variants are the cases. Each Variant refines the Concept's instance
// space with its own Schema and carries its own prose.

export interface Variant<
  C extends AnyConcept = AnyConcept,
  D = ConceptInstance<C>,
> {
  readonly _tag: 'Variant'
  readonly id: string
  readonly version: string
  readonly realises: C
  readonly instanceSchema: Schema.Schema<D, any, never>
  readonly prose: ProseRef
}

export type AnyVariant = Variant<any, any>

export interface VariantDefinition<C extends AnyConcept, D> {
  readonly id: string
  readonly version?: string | undefined
  readonly realises: C
  readonly instanceSchema: Schema.Schema<D, any, never>
  readonly prose: ProseRef
}

export const variant = <C extends AnyConcept, D = ConceptInstance<C>>(
  def: VariantDefinition<C, D>,
): Variant<C, D> => ({
  _tag: 'Variant',
  id: def.id,
  version: def.version ?? '0.0.1',
  realises: def.realises,
  instanceSchema: def.instanceSchema,
  prose: def.prose,
})

// ---------------------------------------------------------------------------
// Trope<C> — the "how": a Concept realisation bound to a Step.

export interface Trope<C extends AnyConcept = AnyConcept> {
  readonly _tag: 'Trope'
  readonly id: string
  readonly version: string
  readonly realises: C
  readonly prose: ProseRef
  readonly realise: AnyStep
  readonly dependencies: ReadonlyArray<AnyTrope>
  readonly variants: ReadonlyArray<AnyVariant>
  readonly modality: Modality
}

export type AnyTrope = Trope<any>

export interface TropeDefinition<C extends AnyConcept> {
  readonly id: string
  readonly version?: string | undefined
  readonly realises: C
  readonly prose: ProseRef
  readonly realise: AnyStep
  readonly dependencies?: ReadonlyArray<AnyTrope> | undefined
  readonly variants?: ReadonlyArray<AnyVariant> | undefined
  readonly modality: Modality
}

export const trope = <C extends AnyConcept>(
  def: TropeDefinition<C>,
): Trope<C> => ({
  _tag: 'Trope',
  id: def.id,
  version: def.version ?? '0.0.1',
  realises: def.realises,
  prose: def.prose,
  realise: def.realise,
  dependencies: def.dependencies ?? [],
  variants: def.variants ?? [],
  modality: def.modality,
})

// ---------------------------------------------------------------------------
// Type guards

export const isConcept = (value: unknown): value is AnyConcept =>
  typeof value === 'object' &&
  value !== null &&
  (value as { _tag?: unknown })._tag === 'Concept'

export const isTrope = (value: unknown): value is AnyTrope =>
  typeof value === 'object' &&
  value !== null &&
  (value as { _tag?: unknown })._tag === 'Trope'

export const isVariant = (value: unknown): value is AnyVariant =>
  typeof value === 'object' &&
  value !== null &&
  (value as { _tag?: unknown })._tag === 'Variant'
