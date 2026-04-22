/**
 * @adr ADR-001
 *
 * The algebra: Concept (interface), Trope (realisation), Subkind (refinement
 * within a Trope), Member (typed primitive within a collection-shaped Trope).
 *
 * Cross-references between Tropes are real TypeScript imports of these
 * objects — a missing dependency is a compile-time error, not a runtime
 * lookup failure.
 */

import type { Layer, Schema } from 'effect'

export type Prose = () => Promise<string>

export interface Concept<I = unknown> {
  readonly _tag: 'Concept'
  readonly id: string
  readonly version: string
  readonly description: string
  readonly instanceSchema: Schema.Schema<I, any>
  readonly prose: Prose
  readonly dependencies: ReadonlyArray<Concept<any>>
}

export type ConceptInstance<C> = C extends Concept<infer I> ? I : never

export interface Subkind<C extends Concept<any> = Concept<any>, I = ConceptInstance<C>> {
  readonly _tag: 'Subkind'
  readonly id: string
  readonly version: string
  readonly realises: C
  readonly instanceSchema: Schema.Schema<I, any>
  readonly prose: Prose
}

export interface Member<V = unknown> {
  readonly _tag: 'Member'
  readonly id: string
  readonly description: string
  readonly value: V
  readonly prose: Prose
}

export interface Trope<C extends Concept<any> = Concept<any>> {
  readonly _tag: 'Trope'
  readonly id: string
  readonly version: string
  readonly realises: C
  readonly prose: Prose
  readonly dependencies: ReadonlyArray<Trope<any>>
  readonly subkinds: ReadonlyArray<Subkind<any, any>>
  readonly members: ReadonlyArray<Member>
  readonly layer?: Layer.Layer<any, any, any>
}

export type AnyConcept = Concept<any>
export type AnyTrope = Trope<any>
export type AnySubkind = Subkind<any, any>

export const isConcept = (value: unknown): value is AnyConcept =>
  typeof value === 'object' &&
  value !== null &&
  (value as { _tag?: unknown })._tag === 'Concept'

export const isTrope = (value: unknown): value is AnyTrope =>
  typeof value === 'object' &&
  value !== null &&
  (value as { _tag?: unknown })._tag === 'Trope'

export const isSubkind = (value: unknown): value is AnySubkind =>
  typeof value === 'object' &&
  value !== null &&
  (value as { _tag?: unknown })._tag === 'Subkind'

export const isMember = (value: unknown): value is Member =>
  typeof value === 'object' &&
  value !== null &&
  (value as { _tag?: unknown })._tag === 'Member'
