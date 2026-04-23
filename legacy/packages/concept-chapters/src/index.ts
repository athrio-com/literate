/**
 * @adr ADR-001
 *
 * The `chapters` Concept — multi-session development plans. Chapters
 * are living plans: mutable bodies, gated material revisions, status
 * transitions ungated when they flow atomically from completed work.
 */

import { Schema } from 'effect'
import { proseFrom, type Concept } from '@literate/core'
import { CorpusConcept } from '@literate/concept-corpus'

export const ChapterStatus = Schema.Literal('In progress', 'Completed')
export type ChapterStatus = Schema.Schema.Type<typeof ChapterStatus>

export const ChapterInstanceSchema = Schema.Struct({
  handle: Schema.String,
  title: Schema.String,
  status: ChapterStatus,
  dependsOn: Schema.optional(Schema.Array(Schema.String)),
  unlocks: Schema.optional(Schema.Array(Schema.String)),
  prose: Schema.String,
})
export type ChapterInstance = Schema.Schema.Type<typeof ChapterInstanceSchema>

export const ChaptersConcept: Concept<ChapterInstance> = {
  _tag: 'Concept',
  id: 'chapters',
  version: '0.1.0',
  description:
    'Multi-session development plans. Mutable bodies; new files and material revisions gated; status transitions ungated.',
  instanceSchema: ChapterInstanceSchema,
  prose: proseFrom(import.meta.url, './concept.mdx'),
  dependencies: [CorpusConcept],
}

export default ChaptersConcept
