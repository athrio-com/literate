/**
 * `concepts/layer` — typed container in `corpus/manifests/`.
 *
 * A Layer is a typed grouping that holds either Domains directly
 * (flat layer: `workspace/`) or further sub-layers (nested layer:
 * `apps/app1/`, `apps/app2/` as siblings under `apps/`). The four
 * top-level kinds are closed; sub-layers under `apps/` and
 * `infrastructure/` are open (consumer-named).
 *
 * Distribution shape: registry seed at
 * `registry/concepts/layer/index.ts`. Tangled via
 * `literate tangle concepts layer`.
 */
import { Schema } from 'effect'
import { concept, prose, type Concept } from '@literate/core'

const ConceptProse = prose(import.meta.url, './concept.mdx')

/**
 * The four top-level Layer kinds. Closed at v0.1.
 *
 *  - `apps`           — contains one sub-layer per application
 *  - `workspace`      — singleton, flat, repo-wide concerns
 *  - `infrastructure` — flat or nested by deployment target
 *  - `protocol`       — LF dev-repo only; absent in consumer scaffolds
 */
export const LayerKindSchema = Schema.Union(
  Schema.Literal('apps'),
  Schema.Literal('workspace'),
  Schema.Literal('infrastructure'),
  Schema.Literal('protocol'),
)
export type LayerKind = Schema.Schema.Type<typeof LayerKindSchema>

export const LayerKind = {
  apps: 'apps' as const,
  workspace: 'workspace' as const,
  infrastructure: 'infrastructure' as const,
  protocol: 'protocol' as const,
} satisfies Record<string, LayerKind>

/**
 * A Layer instance describes a node in the `corpus/manifests/`
 * directory tree.
 *
 *  - `kind` is the top-level Layer kind (the first path component).
 *  - `path` is the slash-joined path under `corpus/manifests/`,
 *    starting with `kind`. Examples: `protocol`, `workspace`,
 *    `apps/app1`, `infrastructure/aws`.
 *  - `holds` declares whether this Layer holds Domains directly
 *    (a leaf in the Layer tree, with `<domain>.md` LFM files as
 *    children) or further sub-layers.
 */
export const LayerSchema = Schema.Struct({
  kind: LayerKindSchema,
  path: Schema.String,
  holds: Schema.Union(
    Schema.Literal('domains'),
    Schema.Literal('sub-layers'),
  ),
})
export type Layer = Schema.Schema.Type<typeof LayerSchema>

export const LayerConcept: Concept<Layer> = concept({
  id: 'layer',
  version: '0.1.0',
  description:
    'A typed container in corpus/manifests/. Four top-level kinds (apps, workspace, infrastructure, protocol). Holds either Domains directly or further sub-layers; recursive nesting permitted under apps/ and infrastructure/.',
  instanceSchema: LayerSchema,
  prose: ConceptProse,
})

export default LayerConcept
