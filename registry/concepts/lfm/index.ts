/**
 * `concepts/lfm` — the Literate Framework Manifest Concept seed.
 *
 * An LFM is a typed mutable manifest declaring current-state for
 * one Dispositional Domain within one Layer. Self-sufficient:
 * each LFM stands alone; cross-references to other LFMs exist
 * only as soft `@lfm(<short-hash>)` annotations, never as
 * load-bearing narrative.
 *
 * Identified by a short content hash recomputed on edit. Status
 * is operational (derived by the `reconcile` Trope), not
 * historical (git holds the history).
 *
 * Distribution shape: registry seed at
 * `registry/concepts/lfm/index.ts`. Tangled via
 * `literate tangle concepts lfm`.
 */
import { Schema } from 'effect'
import { concept, prose, type Concept } from '@literate/core'

import { DispositionSchema } from '../disposition/index.ts'
import { LayerSchema } from '../layer/index.ts'
import { LFMStatusSchema } from '../lfm-status/index.ts'

const ConceptProse = prose(import.meta.url, './concept.mdx')

/**
 * The metadata header an LFM file carries above its declarative
 * body. The `id` is a short content hash (first 8 chars of SHA-256
 * of the body without the metadata header, computed mechanically
 * by the `lfm` Trope). The `dependencies` field is optional —
 * absent or empty when the LFM has no soft links to other LFMs.
 *
 * `domain` is encoded as a string at this level (the Domain name
 * within the LFM's Layer). The Layer is encoded directly via
 * `LayerSchema`; the (Layer, name) pair recovers a full
 * `DispositionalDomain` instance when needed.
 */
export const LFMSchema = Schema.Struct({
  id: Schema.String,
  disposition: DispositionSchema,
  layer: LayerSchema,
  domain: Schema.String,
  status: LFMStatusSchema,
  dependencies: Schema.optional(Schema.Array(Schema.String)),
})
export type LFM = Schema.Schema.Type<typeof LFMSchema>

export const LFMConcept: Concept<LFM> = concept({
  id: 'lfm',
  version: '0.1.0',
  description:
    'A typed mutable manifest declaring current-state for one Dispositional Domain within one Layer. Self-sufficient: cross-references exist only as soft @lfm(<short-hash>) annotations. Identified by short content hash. Status is operational (derived by reconcile), not historical (git holds the history).',
  instanceSchema: LFMSchema,
  prose: ConceptProse,
})

export default LFMConcept
