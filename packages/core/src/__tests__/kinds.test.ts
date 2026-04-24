/**
 * Kinds test: construct a trivial Concept, Variant, and Trope bound
 * to a `workflowStep`. Demonstrates the metalanguage surface from
 * `kinds.ts` composing with the Step substrate.
 */
import { describe, expect, test } from 'bun:test'
import { Effect, Schema } from 'effect'

import {
  concept,
  isConcept,
  isTrope,
  isVariant,
  Modality,
  ModalitySchema,
  prose,
  requireMdxStructure,
  StepId,
  trope,
  variant,
  workflowStep,
  type Concept,
  type Trope,
} from '../index.ts'

interface Note {
  readonly body: string
}

const NoteSchema = Schema.Struct({
  body: Schema.String,
}) as unknown as Schema.Schema<Note, any, never>

const NoteConcept: Concept<Note> = concept({
  id: 'note',
  description: 'A short freeform text artefact.',
  instanceSchema: NoteSchema,
  prose: prose(import.meta.url, './kinds.md'),
})

const NoteLifecycleStep = workflowStep({
  id: StepId('note.lifecycle'),
  inputSchema: NoteSchema,
  outputSchema: NoteSchema,
  prose: prose(import.meta.url, './kinds.md'),
  run: (input: Note) => Effect.succeed(input),
})

const StickyNoteVariant = variant({
  id: 'sticky-note',
  realises: NoteConcept,
  instanceSchema: NoteSchema,
  prose: prose(import.meta.url, './kinds.md'),
})

const NoteLifecycleTrope: Trope<typeof NoteConcept> = trope({
  id: 'note-lifecycle',
  realises: NoteConcept,
  prose: prose(import.meta.url, './kinds.md'),
  proseSchema: requireMdxStructure({ h1: 'Note', h2Slugs: [] }),
  realise: NoteLifecycleStep,
  variants: [StickyNoteVariant],
  modality: Modality.Weave,
})

describe('@literate/core kinds', () => {
  test('concept() builds a Concept with defaults', () => {
    expect(NoteConcept._tag).toBe('Concept')
    expect(NoteConcept.id).toBe('note')
    expect(NoteConcept.version).toBe('0.0.1')
    expect(NoteConcept.description).toBe('A short freeform text artefact.')
    expect(NoteConcept.dependencies).toEqual([])
    expect(isConcept(NoteConcept)).toBe(true)
    expect(isTrope(NoteConcept)).toBe(false)
  })

  test('variant() builds an ADT-case of a Concept', () => {
    expect(StickyNoteVariant._tag).toBe('Variant')
    expect(StickyNoteVariant.id).toBe('sticky-note')
    expect(StickyNoteVariant.realises).toBe(NoteConcept)
    expect(isVariant(StickyNoteVariant)).toBe(true)
    expect(isConcept(StickyNoteVariant)).toBe(false)
  })

  test('trope() builds a Trope bound to a Concept, a Step, and variants', () => {
    expect(NoteLifecycleTrope._tag).toBe('Trope')
    expect(NoteLifecycleTrope.id).toBe('note-lifecycle')
    expect(NoteLifecycleTrope.version).toBe('0.0.1')
    expect(NoteLifecycleTrope.realises).toBe(NoteConcept)
    expect(NoteLifecycleTrope.realise.kind).toBe('workflow')
    expect(NoteLifecycleTrope.realise.id).toBe(StepId('note.lifecycle'))
    expect(NoteLifecycleTrope.dependencies).toEqual([])
    expect(NoteLifecycleTrope.variants).toEqual([StickyNoteVariant])
    expect(NoteLifecycleTrope.modality).toEqual({ _tag: 'Weave' })
    expect(isTrope(NoteLifecycleTrope)).toBe(true)
    expect(isConcept(NoteLifecycleTrope)).toBe(false)
  })

  test('trope realise executes under Effect', async () => {
    const input: Note = { body: 'hello' }
    const output = await Effect.runPromise(
      NoteLifecycleTrope.realise.realise(input) as Effect.Effect<Note>,
    )
    expect(output).toEqual(input)
  })
})

describe('@literate/core Modality', () => {
  test('Modality exposes six constructor values with stable _tag', () => {
    expect(Modality.Protocol).toEqual({ _tag: 'Protocol' })
    expect(Modality.Weave).toEqual({ _tag: 'Weave' })
    expect(Modality.Tangle).toEqual({ _tag: 'Tangle' })
    expect(Modality.Unweave).toEqual({ _tag: 'Unweave' })
    expect(Modality.Untangle).toEqual({ _tag: 'Untangle' })
    expect(Modality.Attest).toEqual({ _tag: 'Attest' })
  })

  test('ModalitySchema decodes each variant and rejects unknowns', () => {
    const decode = Schema.decodeUnknownSync(ModalitySchema)
    expect(decode({ _tag: 'Protocol' })).toEqual({ _tag: 'Protocol' })
    expect(decode({ _tag: 'Weave' })).toEqual({ _tag: 'Weave' })
    expect(decode({ _tag: 'Tangle' })).toEqual({ _tag: 'Tangle' })
    expect(decode({ _tag: 'Unweave' })).toEqual({ _tag: 'Unweave' })
    expect(decode({ _tag: 'Untangle' })).toEqual({ _tag: 'Untangle' })
    expect(decode({ _tag: 'Attest' })).toEqual({ _tag: 'Attest' })
    expect(() => decode({ _tag: 'Bogus' })).toThrow()
  })

  test('Modality is pattern-matchable via switch on _tag', () => {
    const explain = (m: typeof Modality.Protocol | typeof Modality.Weave): string => {
      switch (m._tag) {
        case 'Protocol':
          return 'lifecycle'
        case 'Weave':
          return 'corpus authoring'
      }
    }
    expect(explain(Modality.Protocol)).toBe('lifecycle')
    expect(explain(Modality.Weave)).toBe('corpus authoring')
  })

  test('Concept accepts an optional modality; Trope requires one', () => {
    const unmoded: Concept<Note> = concept({
      id: 'note.unmoded',
      description: 'A Concept that does not carry a modality (data shape only).',
      instanceSchema: NoteSchema,
      prose: prose(import.meta.url, './kinds.md'),
    })
    expect(unmoded.modality).toBeUndefined()

    const moded: Concept<Note> = concept({
      id: 'note.moded',
      description: 'A Concept electing a default modality.',
      instanceSchema: NoteSchema,
      prose: prose(import.meta.url, './kinds.md'),
      modality: Modality.Weave,
    })
    expect(moded.modality).toEqual({ _tag: 'Weave' })
  })
})
