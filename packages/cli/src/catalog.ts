/**
 * @adr ADR-001
 * @adr ADR-008
 * @adr ADR-010
 *
 * The bundled Trope catalog. v0.1 ships every @literate/trope-* package
 * as a workspace dependency so the CLI can resolve any of them by id
 * without dynamic npm lookup. Future versions can extend this with a
 * registry-fetched catalog.
 *
 * Source of truth: the imported objects themselves. No string lookup,
 * no duplicated dependency map.
 */

import type { AnyTrope } from '@literate/core'
import corpusTrope from '@literate/trope-corpus'
import sessionTrope from '@literate/trope-session'
import sessionStartTrope from '@literate/trope-session-start'
import sessionEndTrope from '@literate/trope-session-end'
import decisionsTrope from '@literate/trope-decisions'
import categoryTrope from '@literate/trope-category'
import chaptersTrope from '@literate/trope-chapters'
import adrFlowTrope from '@literate/trope-adr-flow'
import goalFlowTrope from '@literate/trope-goal-flow'

export const BUNDLED_TROPES: ReadonlyArray<AnyTrope> = [
  corpusTrope,
  sessionTrope,
  sessionStartTrope,
  sessionEndTrope,
  decisionsTrope,
  categoryTrope,
  chaptersTrope,
  adrFlowTrope,
  goalFlowTrope,
]

const byId = new Map<string, AnyTrope>(
  BUNDLED_TROPES.map((t) => [t.id, t] as const),
)

const byPackage = new Map<string, AnyTrope>([
  ['@literate/trope-corpus', corpusTrope],
  ['@literate/trope-session', sessionTrope],
  ['@literate/trope-session-start', sessionStartTrope],
  ['@literate/trope-session-end', sessionEndTrope],
  ['@literate/trope-decisions', decisionsTrope],
  ['@literate/trope-category', categoryTrope],
  ['@literate/trope-chapters', chaptersTrope],
  ['@literate/trope-adr-flow', adrFlowTrope],
  ['@literate/trope-goal-flow', goalFlowTrope],
])

/** Resolve a manifest entry (package name or bare id) to a Trope value. */
export const resolveTrope = (key: string): AnyTrope | undefined =>
  byPackage.get(key) ?? byId.get(key)

export const tropePackageNames = (): ReadonlyArray<string> => [...byPackage.keys()]
