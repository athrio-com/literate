/**
 * `concepts/dispositional-domain` — a meaningful application slice
 * scoped within a Layer. One LFM per Layer-Domain pair.
 *
 * A Domain is named freely — the namespace is open. The same Domain
 * name (e.g. `ux`) can occur in multiple Layers (`apps/app1/ux`,
 * `apps/app2/ux`) without collision because the Layer scopes the
 * namespace.
 *
 * Distribution shape: registry seed at
 * `registry/concepts/dispositional-domain/index.ts`. Tangled via
 * `literate tangle concepts dispositional-domain`.
 */
import { Schema } from 'effect'
import { concept, prose, type Concept } from '@literate/core'

import { LayerSchema } from '../layer/index.ts'

const ConceptProse = prose(import.meta.url, './concept.mdx')

/**
 * A Dispositional Domain is identified by its name within its
 * Layer. The full identity is the pair (layer, name) — the same
 * name in two different layers is a different Domain.
 */
export const DispositionalDomainSchema = Schema.Struct({
  layer: LayerSchema,
  name: Schema.String,
})
export type DispositionalDomain = Schema.Schema.Type<
  typeof DispositionalDomainSchema
>

export const DispositionalDomainConcept: Concept<DispositionalDomain> =
  concept({
    id: 'dispositional-domain',
    version: '0.1.0',
    description:
      'A meaningful application slice scoped within a Layer. The same Domain name can occur in multiple Layers without collision; the Layer scopes the namespace. One LFM per Layer-Domain pair.',
    instanceSchema: DispositionalDomainSchema,
    prose: ConceptProse,
  })

export default DispositionalDomainConcept
