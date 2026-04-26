/**
 * Kinds test: construct a trivial Concept, Variant, and Trope bound
 * to a `workflowStep`. Demonstrates the metalanguage surface from
 * `kinds.ts` composing with the Step substrate, and exercises the
 * Disposition + Mode field shapes on Trope.
 */
import { describe, expect, test } from 'bun:test'
import { Effect, Schema } from 'effect'

import {
  concept,
  DispositionSchema,
  isConcept,
  isTrope,
  isVariant,
  Mode,
  ModeSchema,
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
  disposition: { base: 'Protocol', scope: 'note-lifecycle' },
  mode: Mode.Weaving,
  prose: prose(import.meta.url, './kinds.md'),
  proseSchema: requireMdxStructure({ h1: 'Note', h2Slugs: [] }),
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
    expect(NoteConcept.tropes).toEqual([])
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
    expect(NoteLifecycleTrope.disposition).toEqual({
      base: 'Protocol',
      scope: 'note-lifecycle',
    })
    expect(NoteLifecycleTrope.mode).toBe('Weaving')
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

describe('@literate/core Mode', () => {
  test('Mode exposes three constructor values', () => {
    expect(Mode.Exploring).toBe('Exploring')
    expect(Mode.Weaving).toBe('Weaving')
    expect(Mode.Tangling).toBe('Tangling')
  })

  test('ModeSchema decodes each value and rejects unknowns', () => {
    const decode = Schema.decodeUnknownSync(ModeSchema)
    expect(decode('Exploring')).toBe('Exploring')
    expect(decode('Weaving')).toBe('Weaving')
    expect(decode('Tangling')).toBe('Tangling')
    expect(() => decode('Bogus')).toThrow()
  })

  test('Mode is pattern-matchable via switch', () => {
    const explain = (m: Mode): string => {
      switch (m) {
        case 'Exploring':
          return 'deliberation'
        case 'Weaving':
          return 'gated prose authoring'
        case 'Tangling':
          return 'code derivation from accepted prose'
      }
    }
    expect(explain(Mode.Exploring)).toBe('deliberation')
    expect(explain(Mode.Weaving)).toBe('gated prose authoring')
    expect(explain(Mode.Tangling)).toBe('code derivation from accepted prose')
  })
})

describe('@literate/core Disposition', () => {
  test('DispositionSchema accepts the three bases with optional scope', () => {
    const decode = Schema.decodeUnknownSync(DispositionSchema)
    expect(decode({ base: 'Product' })).toEqual({ base: 'Product' })
    expect(decode({ base: 'Protocol', scope: 'algebra' })).toEqual({
      base: 'Protocol',
      scope: 'algebra',
    })
    expect(decode({ base: 'Infrastructure' })).toEqual({
      base: 'Infrastructure',
    })
    expect(() => decode({ base: 'Bogus' })).toThrow()
  })

  test('Trope on a Concept with no Tropes initially still typechecks', () => {
    // Composite Tropes may omit `mode`; the field is optional on the
    // single Trope type at v0.1.
    const noModeTrope: Trope<typeof NoteConcept> = trope({
      id: 'note-no-mode',
      realises: NoteConcept,
      disposition: { base: 'Product' },
      prose: prose(import.meta.url, './kinds.md'),
      proseSchema: requireMdxStructure({ h1: 'Note', h2Slugs: [] }),
      realise: NoteLifecycleStep,
    })
    expect(noModeTrope.mode).toBeUndefined()
    expect(noModeTrope.disposition).toEqual({ base: 'Product' })
  })
})
