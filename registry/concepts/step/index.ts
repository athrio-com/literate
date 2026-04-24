/**
 * `concepts/step` — the Step (declaration) Concept seed.
 *
 * The typed shape of a Step *declaration* — id, kind, description,
 * optional version. This is a passive type surface: the runtime
 * `Step` interface lives in `@literate/core`'s `step.ts` (with
 * `Effect.Effect` machinery + `InvocationKey` + `ProseRef`); this
 * Concept declares the *contract* a Step author commits to before
 * tangling code. Composes `step-kind` as a typed property.
 *
 * Distribution shape (ADR-025/026): registry seed at
 * `registry/concepts/step/index.ts`. Tangled via
 * `literate tangle concepts step`.
 *
 * Upstream ADRs: ADR-001 (algebra), ADR-010 (Concepts unify Terms),
 * ADR-011 (Step substrate), ADR-012 (prose as base step kind),
 * ADR-015 (TS + .md siblings), ADR-025/026 (registry seed shape).
 */
import { Schema } from 'effect'
import { concept, prose, type Concept } from '@literate/core'

import { StepKindSchema } from '../step-kind/index.ts'

const ConceptProse = prose(import.meta.url, './concept.mdx')

export const StepDeclarationSchema = Schema.Struct({
  _tag: Schema.Literal('StepDeclaration'),
  id: Schema.String,
  kind: StepKindSchema,
  description: Schema.String,
  version: Schema.optional(Schema.String),
})
export type StepDeclaration = Schema.Schema.Type<typeof StepDeclarationSchema>

export const StepConcept: Concept<StepDeclaration> = concept({
  id: 'step',
  version: '0.1.0',
  description:
    'The typed shape of a Step *declaration*: id, kind (from step-kind), description, optional version. Passive type surface — the runtime `Step` interface lives in @literate/core. Composes step-kind as a typed property.',
  instanceSchema: StepDeclarationSchema,
  prose: ConceptProse,
})

export default StepConcept
