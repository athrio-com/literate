/**
 * @adr ADR-001
 *
 * Canonical Trope realising the `decisions` Concept. Ships the ADR
 * subkind; future subkinds (SDR, PDR) plug in via the same pattern.
 */

import { proseFrom, type Trope } from '@literate/core'
import { DecisionsConcept } from '@literate/concept-decisions'
import corpusTrope from '@literate/trope-corpus'
import categoryTrope from '@literate/trope-category'
import ADRSubkind from './subkinds/ADR.ts'

export const decisionsTrope: Trope<typeof DecisionsConcept> = {
  _tag: 'Trope',
  id: 'decisions',
  version: '0.1.0',
  realises: DecisionsConcept,
  prose: proseFrom(import.meta.url, './prose.mdx'),
  dependencies: [corpusTrope, categoryTrope],
  subkinds: [ADRSubkind],
  members: [],
}

export { ADRSubkind, ADRInstanceSchema, type ADRInstance } from './subkinds/ADR.ts'
export default decisionsTrope
