/**
 * `concepts/metadata` — typed head-of-file metadata.
 *
 * Substrate-level Concept: declares the typed shape of the
 * metadata block at the head of an authored prose file. The
 * canonical wire form is the leaf directive `::metadata{key=val,
 * key=val, ...}` per the annotation substrate; the legacy YAML
 * frontmatter (`---`-fenced) is the previous wire form, retired
 * mechanically by `tropes/reconcile`'s migration step.
 *
 * The Concept's instance is a typed key→string record. The
 * substrate keeps values opaque; downstream consumers (LFMs,
 * future typed prose surfaces) interpret the values against
 * their own schemas. Field names a typical LFM frontmatter
 * carries — `id`, `disposition`, `layer`, `domain`, `status`,
 * `dependencies` — are documented in `concept.mdx`; the Schema
 * itself stays open to keep the substrate honest about the
 * directive's actual data model (key=val pairs).
 *
 * See `corpus/manifests/protocol/annotation-substrate.md` for
 * the canonical leaf-directive declaration this seed realises.
 */
import { Schema } from 'effect'
import { concept, prose, type Concept } from '@literate/core'

const ConceptProse = prose(import.meta.url, './concept.mdx')

/**
 * The substrate-level metadata shape: a record of string keys to
 * string values. Each entry corresponds to one `key=val` pair in
 * the `::metadata{...}` leaf directive (or one `key: val` line in
 * the legacy YAML form). Values are kept opaque at this level;
 * consumers parse them against their own typed schemas.
 */
export const MetadataSchema = Schema.Record({
  key: Schema.String,
  value: Schema.String,
})
export type Metadata = Schema.Schema.Type<typeof MetadataSchema>

export const MetadataConcept: Concept<Metadata> = concept({
  id: 'metadata',
  version: '0.1.0',
  description:
    'Typed head-of-file metadata. The canonical wire form is the leaf directive ::metadata{key=val, ...}; the legacy YAML --- frontmatter is the previous form, retired mechanically by reconcile. Substrate-level: values are opaque strings, interpreted by downstream consumers (LFMs, future typed prose surfaces) against their own schemas.',
  instanceSchema: MetadataSchema,
  prose: ConceptProse,
})

export default MetadataConcept
