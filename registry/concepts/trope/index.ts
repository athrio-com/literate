/**
 * `concepts/trope` — the Concept-of-Trope meta-seed.
 *
 * Without this seed, the meta-level is unreachable through the
 * `literate learn` verb: `learn trope` would not resolve. The
 * seed declares what a Trope *is* in LF's substrate — a Concept
 * realisation bound to a Step, carrying a Disposition and an
 * optional Mode — and binds that declaration to the runtime
 * `Trope<C>` interface from `@literate/core`.
 *
 * `instanceSchema` validates that an unknown value is a Trope
 * via the `isTrope` type guard plus shape checks against the
 * `Trope<C>` interface. The bound prose body in `concept.mdx`
 * declares the meta-types reflectively.
 *
 * See `corpus/manifests/protocol/algebra.md` (Concept-primary
 * substrate) for the load-bearing prose, and
 * `corpus/manifests/protocol/learn-and-coherence.md` for the
 * verb that resolves this seed.
 */
import { Schema } from 'effect'
import {
  concept,
  isTrope,
  prose,
  type AnyTrope,
  type Concept,
} from '@literate/core'

const ConceptProse = prose(import.meta.url, './concept.mdx')

/**
 * The meta-instance Schema: validates that an unknown value is a
 * runtime Trope value (`_tag: 'Trope'` plus the required fields).
 * Uses the `isTrope` type guard for the discriminant check; field
 * shape is checked structurally by Effect Schema.
 */
export const TropeInstanceSchema: Schema.Schema<AnyTrope> = Schema.declare(
  (u: unknown): u is AnyTrope => {
    if (!isTrope(u)) return false
    const o = u as Record<string, unknown>
    return (
      typeof o['id'] === 'string' &&
      typeof o['version'] === 'string' &&
      typeof o['realises'] === 'object' &&
      typeof o['disposition'] === 'object' &&
      typeof o['prose'] === 'object' &&
      typeof o['proseSchema'] === 'object' &&
      typeof o['realise'] === 'object' &&
      Array.isArray(o['dependencies']) &&
      Array.isArray(o['variants'])
    )
  },
  { identifier: 'Trope' },
)

export const ConceptOfTrope: Concept<AnyTrope> = concept({
  id: 'trope',
  version: '0.1.0',
  description:
    'The meta-Concept for Tropes: declares what a Trope is in LF\'s algebra. A Trope realises a Concept as typed composable monadic prose with a Step substrate; it carries a Disposition (mandatory) and a Mode (optional on composite Tropes; mandatory on atomic Steps). This seed is required for `literate learn trope` to resolve.',
  instanceSchema: TropeInstanceSchema,
  prose: ConceptProse,
})

export default ConceptOfTrope
