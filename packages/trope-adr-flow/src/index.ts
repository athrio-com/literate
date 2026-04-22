/**
 * @adr ADR-001
 *
 * The adr-flow workflow Trope. Defines the steps for drafting,
 * gating, and landing an ADR. Provides an Effect service for
 * mechanical operations (next number, tag validation, supersession
 * stamp).
 */

import { Context, Data, Effect, Layer } from 'effect'
import { proseFrom, type Trope } from '@literate/core'
import { TropeConcept } from '@literate/concept-trope'
import decisionsTrope from '@literate/trope-decisions'
import categoryTrope, { BaseTag } from '@literate/trope-category'

export class UnknownTag extends Data.TaggedError('UnknownTag')<{
  readonly tag: string
  readonly knownTags: ReadonlyArray<string>
}> {}

export class AdrFlow extends Context.Tag('@literate/AdrFlow')<
  AdrFlow,
  {
    readonly nextNumber: (
      decisionsDir: string,
    ) => Effect.Effect<number, Error>
    readonly validateTags: (
      tags: ReadonlyArray<string>,
    ) => Effect.Effect<void, UnknownTag>
  }
>() {}

const defaultLayer = Layer.succeed(AdrFlow, {
  nextNumber: (_decisionsDir: string) =>
    Effect.gen(function* () {
      yield* Effect.logInfo('adr-flow: would scan decisions/ for the next number')
      return 1
    }),
  validateTags: (tags) =>
    Effect.gen(function* () {
      const known = BaseTag.literals
      for (const tag of tags) {
        if (!(known as readonly string[]).includes(tag)) {
          yield* new UnknownTag({ tag, knownTags: known as readonly string[] })
        }
      }
    }),
})

export const adrFlowTrope: Trope<typeof TropeConcept> = {
  _tag: 'Trope',
  id: 'adr-flow',
  version: '0.1.0',
  realises: TropeConcept,
  prose: proseFrom(import.meta.url, './prose.mdx'),
  dependencies: [decisionsTrope, categoryTrope],
  subkinds: [],
  members: [],
  layer: defaultLayer,
}

export default adrFlowTrope
