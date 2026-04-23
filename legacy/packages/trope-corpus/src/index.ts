/**
 * @adr ADR-002
 *
 * Canonical realising Trope of the `corpus` Concept. Declares the
 * directory layout for `corpus/` in any LF-using repo, the index-file
 * convention, and the minimal contents.
 */

import { proseFrom, type Trope } from '@literate/core'
import { CorpusConcept } from '@literate/concept-corpus'

export const corpusTrope: Trope<typeof CorpusConcept> = {
  _tag: 'Trope',
  id: 'corpus',
  version: '0.1.0',
  realises: CorpusConcept,
  prose: proseFrom(import.meta.url, './prose.mdx'),
  dependencies: [],
  subkinds: [],
  members: [],
}

export default corpusTrope
