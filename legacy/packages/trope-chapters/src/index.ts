/**
 * @adr ADR-001
 *
 * Canonical Trope realising the `chapters` Concept.
 */

import { proseFrom, type Trope } from '@literate/core'
import { ChaptersConcept } from '@literate/concept-chapters'
import corpusTrope from '@literate/trope-corpus'

export const chaptersTrope: Trope<typeof ChaptersConcept> = {
  _tag: 'Trope',
  id: 'chapters',
  version: '0.1.0',
  realises: ChaptersConcept,
  prose: proseFrom(import.meta.url, './prose.mdx'),
  dependencies: [corpusTrope],
  subkinds: [],
  members: [],
}

export default chaptersTrope
