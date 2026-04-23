/**
 * @adr ADR-001
 *
 * Canonical Trope realising the `session` Concept. Declares on-disk
 * shape, lifecycle, and gating rules for session logs.
 */

import { proseFrom, type Trope } from '@literate/core'
import { SessionConcept } from '@literate/concept-session'
import corpusTrope from '@literate/trope-corpus'

export const sessionTrope: Trope<typeof SessionConcept> = {
  _tag: 'Trope',
  id: 'session',
  version: '0.1.0',
  realises: SessionConcept,
  prose: proseFrom(import.meta.url, './prose.mdx'),
  dependencies: [corpusTrope],
  subkinds: [],
  members: [],
}

export default sessionTrope
