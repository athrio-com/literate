/**
 * Concept, Trope, Variant — the algebraic metalanguage.
 *
 * A Concept is the *what* (a schema-backed prose declaration);
 * a Trope is the *how* (a Concept realisation bound to a Step);
 * a Variant is an ADT case of a Concept — a refinement with its
 * own schema and prose, emitted under the same Concept tag.
 *
 * See ADR-001 (three-level algebra), ADR-009 (Tropes as packages),
 * ADR-010 (unify Terms into Concepts), ADR-011 (Step substrate),
 * ADR-015 (TypeScript composition + .md siblings) in
 * `../../../corpus/decisions/`.
 */
import type { Schema } from 'effect'
import type { AnyStep, ProseRef } from './step.ts'

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
}

export const concept = <D>(def: ConceptDefinition<D>): Concept<D> => ({
  _tag: 'Concept',
  id: def.id,
  version: def.version ?? '0.0.1',
  description: def.description,
  instanceSchema: def.instanceSchema,
  prose: def.prose,
  dependencies: def.dependencies ?? [],
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
