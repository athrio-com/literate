/**
 * @adr ADR-002
 *
 * The `corpus` Concept — declares the directory structure that holds a
 * product's authored prose. Instances of this Concept are filesystem
 * trees (described here by their root path and installed folders).
 */

import { Schema } from 'effect'
import { proseFrom, type Concept } from '@literate/core'

export const CorpusFolder = Schema.Literal(
  'decisions',
  'specs',
  'chapters',
  'sessions',
  'categories',
  'concepts',
  'memos',
  'stories',
)
export type CorpusFolder = Schema.Schema.Type<typeof CorpusFolder>

export const CorpusInstanceSchema = Schema.Struct({
  root: Schema.String,
  folders: Schema.Array(CorpusFolder),
})
export type CorpusInstance = Schema.Schema.Type<typeof CorpusInstanceSchema>

export const CorpusConcept: Concept<CorpusInstance> = {
  _tag: 'Concept',
  id: 'corpus',
  version: '0.1.0',
  description:
    'The prose half of every LF-using repo. Holds decisions, sessions, categories, concepts, and other Trope instances.',
  instanceSchema: CorpusInstanceSchema,
  prose: proseFrom(import.meta.url, './concept.mdx'),
  dependencies: [],
}

export default CorpusConcept
