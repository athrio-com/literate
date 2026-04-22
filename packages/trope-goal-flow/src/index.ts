/**
 * @adr ADR-001
 *
 * The goal-flow workflow Trope. Drafts, gates, and retires Goals
 * within a session log.
 */

import { proseFrom, type Trope } from '@literate/core'
import { TropeConcept } from '@literate/concept-trope'
import sessionTrope from '@literate/trope-session'

export const goalFlowTrope: Trope<typeof TropeConcept> = {
  _tag: 'Trope',
  id: 'goal-flow',
  version: '0.1.0',
  realises: TropeConcept,
  prose: proseFrom(import.meta.url, './prose.mdx'),
  dependencies: [sessionTrope],
  subkinds: [],
  members: [],
}

export default goalFlowTrope
