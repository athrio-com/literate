/**
 * `concepts/concept` — the Concept-of-Concept meta-seed.
 *
 * Without this seed, the meta-level is unreachable through the
 * `literate learn` verb: `learn concept` would not resolve. The
 * seed declares what a Concept *is* in LF's substrate — typed
 * essence paired with prose — and binds that declaration to the
 * runtime `Concept<D>` interface from `@literate/core`.
 *
 * `instanceSchema` validates that an unknown value is a Concept
 * via the `isConcept` type guard plus shape checks against the
 * `Concept<D>` interface. The bound prose body in `concept.mdx`
 * declares the meta-types reflectively.
 *
 * See `corpus/manifests/protocol/algebra.md` (Concept-primary
 * substrate) for the load-bearing prose this seed realises in
 * the registry, and `corpus/manifests/protocol/learn-and-coherence.md`
 * for the verb that resolves it.
 */
import { Schema } from 'effect'
import {
  concept,
  isConcept,
  prose,
  type AnyConcept,
  type Concept,
} from '@literate/core'

const ConceptProse = prose(import.meta.url, './concept.mdx')

/**
 * The meta-instance Schema: validates that an unknown value is a
 * runtime Concept value (`_tag: 'Concept'` plus the required
 * fields). Uses the `isConcept` type guard for the discriminant
 * check; field shape is checked structurally by Effect Schema.
 */
export const ConceptInstanceSchema: Schema.Schema<AnyConcept> =
  Schema.declare(
    (u: unknown): u is AnyConcept => {
      if (!isConcept(u)) return false
      const o = u as Record<string, unknown>
      return (
        typeof o['id'] === 'string' &&
        typeof o['version'] === 'string' &&
        typeof o['description'] === 'string' &&
        typeof o['instanceSchema'] === 'object' &&
        typeof o['prose'] === 'object' &&
        Array.isArray(o['dependencies']) &&
        Array.isArray(o['tropes'])
      )
    },
    { identifier: 'Concept' },
  )

export const ConceptOfConcept: Concept<AnyConcept> = concept({
  id: 'concept',
  version: '0.1.0',
  description:
    'The meta-Concept: declares what a Concept is in LF\'s algebra. A Concept is a typed contract paired with prose — `instanceSchema` plus a prose body — that names a primitive in LF\'s vocabulary. Every Concept presupposes one or more Tropes that realise it. This seed is required for `literate learn concept` to resolve.',
  instanceSchema: ConceptInstanceSchema,
  prose: ConceptProse,
})

export default ConceptOfConcept
