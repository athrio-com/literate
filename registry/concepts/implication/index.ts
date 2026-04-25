/**
 * `concepts/implication` — the Implication Concept seed.
 *
 * Implication is a *soft Goal* — surfaced authorial weight that hasn't
 * been adjudicated into a Goal yet. Parallel machinery to Goal,
 * different status set, different gating profile. Schema enforces the
 * `rationale-required-on-Dismissed` invariant; the session-end
 * validator refuses to close a session with a non-terminal
 * Implication. See `concept.mdx` for the prose body.
 *
 * Distribution shape (ADR-025/026 + ADR-033): registry seed at
 * `registry/concepts/implication/index.ts`. Tangled into a consumer
 * repo via `literate tangle concepts implication`.
 *
 * Upstream LFMs: see corpus/manifests/protocol/algebra.md and
 *   sibling LFMs for the current-state declarations this seed
 *   realises.
 */
import { Schema } from 'effect'
import { concept, prose, type Concept } from '@literate/core'

const ConceptProse = prose(import.meta.url, './concept.mdx')

export const ImplicationStatusSchema = Schema.Union(
  Schema.Literal('Surfaced'),
  Schema.Literal('Promoted'),
  Schema.Literal('Filed'),
  Schema.Literal('Dismissed'),
)
export type ImplicationStatus = Schema.Schema.Type<typeof ImplicationStatusSchema>

export const ImplicationStatus = {
  Surfaced: 'Surfaced' as const,
  Promoted: 'Promoted' as const,
  Filed: 'Filed' as const,
  Dismissed: 'Dismissed' as const,
} satisfies Record<string, ImplicationStatus>

const ImplicationStruct = Schema.Struct({
  _tag: Schema.Literal('Implication'),
  id: Schema.String,
  status: ImplicationStatusSchema,
  rationale: Schema.optional(Schema.String),
})

/**
 * Schema-level enforcement of the rationale-required-on-Dismissed
 * invariant. A Dismissed Implication without a non-empty rationale
 * fails Schema validation; downstream consumers do not need to
 * re-check.
 */
export const ImplicationSchema = ImplicationStruct.pipe(
  Schema.filter(
    (value) =>
      value.status !== 'Dismissed' ||
      (value.rationale ?? '').trim() !== '',
    {
      message: () =>
        'Implication: rationale required when status is Dismissed',
    },
  ),
)
export type Implication = Schema.Schema.Type<typeof ImplicationSchema>

const TERMINAL_STATUSES: ReadonlySet<ImplicationStatus> = new Set([
  'Promoted',
  'Filed',
  'Dismissed',
])

export const isTerminalImplication = (i: Implication): boolean =>
  TERMINAL_STATUSES.has(i.status)

export const ImplicationConcept: Concept<Implication> = concept({
  id: 'implication',
  version: '0.1.0',
  description:
    'A soft Goal — surfaced authorial weight that has not been adjudicated into a Goal. Status: Surfaced | Promoted | Filed | Dismissed; rationale required on Dismissed (Schema-enforced). Session-end refuses to close with a non-terminal Implication.',
  instanceSchema: ImplicationSchema,
  prose: ConceptProse,
})

export default ImplicationConcept
