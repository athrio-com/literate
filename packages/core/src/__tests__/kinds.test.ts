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
  prose,
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
  realise: NoteLifecycleStep,
  variants: [StickyNoteVariant],
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
