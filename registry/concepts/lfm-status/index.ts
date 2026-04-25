/**
 * `concepts/lfm-status` — operational status enum for an LFM.
 *
 * Closed four-value vocabulary written by `reconcile`. Not authored
 * by hand: an LFM's `status` field reports the manifest's current
 * reconciliation state, derived mechanically by walking the
 * declaration against implementation and inspecting git state.
 *
 * Distribution shape: registry seed at
 * `registry/concepts/lfm-status/index.ts`. Tangled into a consumer
 * repo via `literate tangle concepts lfm-status`.
 */
import { Schema } from 'effect'
import { concept, prose, type Concept } from '@literate/core'

const ConceptProse = prose(import.meta.url, './concept.mdx')

export const LFMStatusSchema = Schema.Union(
  Schema.Literal('Reconciled'),
  Schema.Literal('Drifted'),
  Schema.Literal('Pending'),
  Schema.Literal('Unverified'),
)
export type LFMStatus = Schema.Schema.Type<typeof LFMStatusSchema>

export const LFMStatus = {
  Reconciled: 'Reconciled' as const,
  Drifted: 'Drifted' as const,
  Pending: 'Pending' as const,
  Unverified: 'Unverified' as const,
} satisfies Record<string, LFMStatus>

export const LFMStatusConcept: Concept<LFMStatus> = concept({
  id: 'lfm-status',
  version: '0.1.0',
  description:
    'Operational status of an LFM: Reconciled | Drifted | Pending | Unverified. Written by the reconcile Trope; not authored by hand.',
  instanceSchema: LFMStatusSchema,
  prose: ConceptProse,
})

export default LFMStatusConcept
