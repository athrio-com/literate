/**
 * `concepts/adr-status` — the ADR Status Concept seed.
 *
 * Closed vocabulary of `Status:` values an ADR can carry: `Open`,
 * `Accepted`, `Deferred`, or the open string family `Superseded by
 * ADR-NNN[ — note]`. Promoted from the legacy
 * `corpus/categories/adr-status.md` category file; transitions
 * documented in prose, not enforced at the Schema level (deferred
 * to a future material revision).
 *
 * Distribution shape (ADR-025/026): registry seed at
 * `registry/concepts/adr-status/index.ts`. Tangled into a consumer
 * repo via `literate tangle concepts adr-status`.
 *
 * Upstream ADRs: ADR-001 (algebra), ADR-010 (Concepts unify Terms),
 * ADR-015 (TS + .md siblings), ADR-025/026 (registry seed shape).
 */
import { Schema } from 'effect'
import { concept, prose, type Concept } from '@literate/core'

const ConceptProse = prose(import.meta.url, './concept.mdx')

export const ADRStatusBaseSchema = Schema.Literal(
  'Open',
  'Accepted',
  'Deferred',
)
export type ADRStatusBase = Schema.Schema.Type<typeof ADRStatusBaseSchema>

export const SUPERSEDED_BY_PATTERN = /^Superseded by ADR-\d+/

const SupersededByLine = Schema.String.pipe(
  Schema.pattern(SUPERSEDED_BY_PATTERN, {
    message: () => 'expected `Superseded by ADR-NNN[ — note]`',
  }),
)

export const ADRStatusSchema = Schema.Union(
  ADRStatusBaseSchema,
  SupersededByLine,
)
export type ADRStatus = Schema.Schema.Type<typeof ADRStatusSchema>

export const ADRStatus = {
  Open: 'Open' as const,
  Accepted: 'Accepted' as const,
  Deferred: 'Deferred' as const,
  supersededBy: (adrNumber: number, note?: string): string => {
    const padded = String(adrNumber).padStart(3, '0')
    return note
      ? `Superseded by ADR-${padded} (${note})`
      : `Superseded by ADR-${padded}`
  },
}

export const isTerminalADRStatus = (raw: string): boolean => {
  const v = raw.trim()
  if (v === 'Accepted' || v === 'Deferred') return true
  return SUPERSEDED_BY_PATTERN.test(v)
}

export const ADRStatusConcept: Concept<ADRStatus> = concept({
  id: 'adr-status',
  version: '0.1.0',
  description:
    'Closed vocabulary of `Status:` values an ADR can carry: `Open`, `Accepted`, `Deferred`, or `Superseded by ADR-NNN[ — note]`. Promoted from the legacy `corpus/categories/adr-status.md` category file. Transitions documented in prose; Schema-level enforcement deferred.',
  instanceSchema: ADRStatusSchema,
  prose: ConceptProse,
})

export default ADRStatusConcept
