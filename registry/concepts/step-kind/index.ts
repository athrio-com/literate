/**
 * `concepts/step-kind` — the Step Kind Concept seed.
 *
 * Closed vocabulary of the `StepKind` discriminator declared by
 * ADR-012. Every Step authored under `@literate/*` carries
 * exactly one kind from the six-element set: `prose`, `workflow`,
 * `effect`, `ai`, `gate`, `io`. Adding a new kind requires a
 * gated ADR amendment.
 *
 * Promoted from `corpus/categories/step-kind.md`. The actual
 * runtime `StepKind` enumeration shipped by `@literate/core`
 * (in `kinds.ts`) is the load-bearing surface; this Concept seed
 * declares the *typed* surface that consumers receive when they
 * tangle `concepts/step-kind` into their repo.
 *
 * Distribution shape (ADR-025/026): registry seed at
 * `registry/concepts/step-kind/index.ts`. Tangled via
 * `literate tangle concepts step-kind`.
 *
 * Upstream ADRs: ADR-001 (algebra), ADR-010 (Concepts unify Terms),
 * ADR-011 (Step substrate), ADR-012 (prose as base step kind),
 * ADR-013 (event store), ADR-015 (TS + .md siblings),
 * ADR-017 (gate as typed step), ADR-025/026 (registry seed shape).
 */
import { Schema } from 'effect'
import { concept, prose, type Concept } from '@literate/core'

const ConceptProse = prose(import.meta.url, './concept.mdx')

export const StepKindSchema = Schema.Literal(
  'prose',
  'workflow',
  'effect',
  'ai',
  'gate',
  'io',
)
export type StepKind = Schema.Schema.Type<typeof StepKindSchema>

export const StepKind = {
  prose: 'prose' as const,
  workflow: 'workflow' as const,
  effect: 'effect' as const,
  ai: 'ai' as const,
  gate: 'gate' as const,
  io: 'io' as const,
} satisfies Record<string, StepKind>

export const StepKindConcept: Concept<StepKind> = concept({
  id: 'step-kind',
  version: '0.1.0',
  description:
    "Closed vocabulary of the `StepKind` discriminator declared by ADR-012: `prose`, `workflow`, `effect`, `ai`, `gate`, `io`. `prose` is the base kind; the other five specialise it by binding to a service. Promoted from `corpus/categories/step-kind.md`.",
  instanceSchema: StepKindSchema,
  prose: ConceptProse,
})

export default StepKindConcept
