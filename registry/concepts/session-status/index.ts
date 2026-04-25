/**
 * `concepts/session-status` — the Session Status Concept seed.
 *
 * Closed vocabulary of `Status:` values a session log can carry:
 * `Planned`, `Open`, `Closed`, `Abandoned`. The on-disk header
 * line for `Closed` carries a timestamp suffix
 * (`Closed (YYYY-MM-DDTHH:MM)`); the timestamp lives separately
 * on the `Session` Concept's `closedAt` field. The same convention
 * applies to `Abandoned (timestamp — rationale)`.
 *
 * Promoted from `corpus/categories/session-status.md` as part of
 * the category-dissolution refactor. Replaces the inline
 * `SessionStatusSchema` previously declared in
 * `registry/concepts/session/index.ts` (Session 2026-04-24T1712);
 * the Session Concept now imports from here.
 *
 * Distribution shape (ADR-025/026): registry seed at
 * `registry/concepts/session-status/index.ts`. Tangled via
 * `literate tangle concepts session-status`.
 *
 * Upstream LFMs: see corpus/manifests/protocol/algebra.md and
 *   sibling LFMs for the current-state declarations this seed
 *   realises.
 */
import { Schema } from 'effect'
import { concept, prose, type Concept } from '@literate/core'

const ConceptProse = prose(import.meta.url, './concept.mdx')

export const SessionStatusSchema = Schema.Literal(
  'Planned',
  'Open',
  'Closed',
  'Abandoned',
)
export type SessionStatus = Schema.Schema.Type<typeof SessionStatusSchema>

export const SessionStatus = {
  Planned: 'Planned' as const,
  Open: 'Open' as const,
  Closed: 'Closed' as const,
  Abandoned: 'Abandoned' as const,
} satisfies Record<string, SessionStatus>

const TERMINAL_SESSION_STATUSES: ReadonlySet<string> = new Set([
  'Closed',
  'Abandoned',
])

/**
 * Header `Status:` lines in session logs may carry a parenthetical
 * suffix (`Closed (2026-04-24T18:00)`, `Abandoned (... — rationale)`).
 * `parseSessionStatusBase` strips the suffix and returns the base
 * literal. Returns `null` if the value is not in the closed set.
 */
export const parseSessionStatusBase = (raw: string): SessionStatus | null => {
  const trimmed = raw.trim()
  const base = trimmed.split(/\s+\(/)[0]?.trim() ?? ''
  if (
    base === 'Planned' ||
    base === 'Open' ||
    base === 'Closed' ||
    base === 'Abandoned'
  ) {
    return base
  }
  return null
}

export const isTerminalSessionStatus = (raw: string): boolean => {
  const base = parseSessionStatusBase(raw)
  return base !== null && TERMINAL_SESSION_STATUSES.has(base)
}

export const SessionStatusConcept: Concept<SessionStatus> = concept({
  id: 'session-status',
  version: '0.1.0',
  description:
    'Closed vocabulary of `Status:` values a session log can carry: `Planned`, `Open`, `Closed`, `Abandoned`. The Schema types the base literal; on-disk header lines may carry a parenthetical suffix (timestamp / rationale) parsed separately.',
  instanceSchema: SessionStatusSchema,
  prose: ConceptProse,
})

export default SessionStatusConcept
