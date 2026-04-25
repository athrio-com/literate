/**
 * `concepts/mode` — the Mode Concept seed.
 *
 * Mode names the *operational stance* of a session, Trope, or Step:
 * `Exploring | Weaving | Tangling`. Orthogonal to Disposition. The
 * enactor axis (agent-in-session vs mechanical CLI) is named in the
 * prose; same Mode Concept covers both. See `concept.mdx` for the
 * prose body and IMP-N (in `corpus/CLAUDE.md`) for the agent-binding
 * imperative.
 *
 * Distribution shape (ADR-025/026 + ADR-032): registry seed at
 * `registry/concepts/mode/index.ts`. Tangled into a consumer repo via
 * `literate tangle concepts mode`.
 *
 * Upstream LFMs: see corpus/manifests/protocol/algebra.md and
 *   sibling LFMs for the current-state declarations this seed
 *   realises.
 */
import { Schema } from 'effect'
import { concept, prose, type Concept } from '@literate/core'

const ConceptProse = prose(import.meta.url, './concept.mdx')

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

/**
 * Enactor names *who* enacts a Mode. The same Mode Concept covers
 * both enactors; the discipline expectations differ. v0.1 surfaces
 * Enactor only at the prose level (IMP-N binds the agent-side
 * discipline); typed enactor fields on Steps are a forward question.
 */
export const EnactorSchema = Schema.Union(
  Schema.Literal('Agent'),
  Schema.Literal('CLI'),
)
export type Enactor = Schema.Schema.Type<typeof EnactorSchema>

export const Enactor = {
  Agent: 'Agent' as const,
  CLI: 'CLI' as const,
} satisfies Record<string, Enactor>

export const ModeConcept: Concept<Mode> = concept({
  id: 'mode',
  version: '0.1.0',
  description:
    'The operational stance of a session, Trope, or Step: Exploring | Weaving | Tangling. Orthogonal to Disposition; same Concept covers both Agent and CLI enactors with different per-enactor discipline. Bound to IMP-N (Mode-discipline imperative) for the agent enactor.',
  instanceSchema: ModeSchema,
  prose: ConceptProse,
})

export default ModeConcept
