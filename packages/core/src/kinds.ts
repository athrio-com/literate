/**
 * Concept, Trope, Variant — the algebraic metalanguage.
 *
 * A Concept is the *what* (a schema-backed prose declaration);
 * a Trope is the *how* (a Concept realisation bound to a Step).
 * Concept and Trope are co-primitive: every Concept presupposes
 * one or more Tropes, and a Trope realises exactly one Concept.
 * A Variant is an ADT case of a Concept — a refinement with its
 * own schema and prose, emitted under the same Concept tag.
 *
 * Mode and Disposition are Trope-level fields. A Concept does
 * not carry either directly; its effective Disposition is the
 * aggregate of its Tropes' Dispositions.
 *
 * See `corpus/manifests/protocol/algebra.md` (Concept-primary
 * substrate), `corpus/manifests/protocol/disposition-and-mode.md`
 * (Mode + Disposition semantics), and
 * `corpus/manifests/protocol/step-substrate.md` (Steps as atomic
 * Tropes) for the load-bearing prose.
 */
import { Schema } from 'effect'
import type { ParsedMdx } from './mdx.ts'
import type { AnyStep, ProseRef } from './step.ts'

// ---------------------------------------------------------------------------
// Disposition — the referential domain a Trope is disposed toward.
//
// Parametrised: closed `base` (three values), open `scope`/`prompt`/`prose`.
// A Trope's Disposition declares what subject matter the Trope is about;
// a Concept's effective Disposition is the aggregate of its Tropes'.

export const DispositionSchema = Schema.Struct({
  base: Schema.Literal('Product', 'Protocol', 'Infrastructure'),
  scope: Schema.optional(Schema.String),
  prompt: Schema.optional(Schema.String),
  prose: Schema.optional(Schema.String),
})

export type Disposition = Schema.Schema.Type<typeof DispositionSchema>

// ---------------------------------------------------------------------------
// Mode — the operational stance of a Trope's enactment.
//
// Closed three-value vocabulary: Exploring | Weaving | Tangling.
// Mandatory on atomic Tropes (Steps); optional on composite Tropes whose
// effective Mode is derived from their composing sub-Tropes.

export const ModeSchema = Schema.Union(
  Schema.Literal('Exploring'),
  Schema.Literal('Weaving'),
  Schema.Literal('Tangling'),
)

export type Mode = Schema.Schema.Type<typeof ModeSchema>

export const Mode = {
  Exploring: 'Exploring' as const,
  Weaving: 'Weaving' as const,
  Tangling: 'Tangling' as const,
} satisfies Record<string, Mode>

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
  readonly tropes: ReadonlyArray<AnyTrope>
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
  readonly tropes?: ReadonlyArray<AnyTrope> | undefined
}

export const concept = <D>(def: ConceptDefinition<D>): Concept<D> => ({
  _tag: 'Concept',
  id: def.id,
  version: def.version ?? '0.0.1',
  description: def.description,
  instanceSchema: def.instanceSchema,
  prose: def.prose,
  dependencies: def.dependencies ?? [],
  tropes: def.tropes ?? [],
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
  readonly disposition: Disposition
  readonly mode?: Mode
  readonly prose: ProseRef
  readonly proseSchema: Schema.Schema<ParsedMdx, any, never>
  readonly realise: AnyStep
  readonly dependencies: ReadonlyArray<AnyTrope>
  readonly variants: ReadonlyArray<AnyVariant>
}

export type AnyTrope = Trope<any>

export interface TropeDefinition<C extends AnyConcept> {
  readonly id: string
  readonly version?: string | undefined
  readonly realises: C
  readonly disposition: Disposition
  readonly mode?: Mode | undefined
  readonly prose: ProseRef
  readonly proseSchema: Schema.Schema<ParsedMdx, any, never>
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
  disposition: def.disposition,
  ...(def.mode !== undefined ? { mode: def.mode } : {}),
  prose: def.prose,
  proseSchema: def.proseSchema,
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
