/**
 * Tests for the live stdin/stdout `GateService` and the scripted
 * `TerminalIO` that drives its tests.
 *
 * Covers each of the four `GateDecision` variants (Accept / Correct /
 * Clarify / Reject) parsed off a scripted line queue, plus the
 * suspend-semantics path where no valid decision is recorded and the
 * service fails with `GateUnresolved` — the signal `gateStep`
 * translates to a `GatePending` suspend per ADR-017.
 */
import { describe, expect, test } from 'bun:test'
import { Effect, Schema } from 'effect'

import {
  GateService,
  GateUnresolved,
  makeScriptedTerminalIO,
  terminalGateServiceLayer,
} from '../index.ts'

const DraftSchema = Schema.Struct({
  title: Schema.String,
}) as unknown as Schema.Schema<{ readonly title: string }, any, never>

const runGate = (
  inputs: ReadonlyArray<string>,
  draft: { readonly title: string },
) => {
  const { io, writes } = makeScriptedTerminalIO(inputs)
  const program = Effect.gen(function* () {
    const gate = yield* GateService
    return yield* gate.present(draft, DraftSchema)
  }).pipe(Effect.provide(terminalGateServiceLayer(io)))
  return { program, writes }
}

describe('@literate/core terminal GateService', () => {
  test('Accept response yields {_tag: "Accept", value: draft}', async () => {
    const draft = { title: 'a draft' }
    const { program, writes } = runGate(['a'], draft)
    const decision = await Effect.runPromise(program)
    expect(decision).toEqual({ _tag: 'Accept', value: draft })
    // The prompt rendered the draft and the option menu
    const rendered = writes.join('')
    expect(rendered).toContain('"title": "a draft"')
    expect(rendered).toContain('[a]ccept')
  })

  test('Correct response consumes a follow-up note line', async () => {
    const draft = { title: 'original' }
    const { program } = runGate(['c', 'tighten the wording'], draft)
    const decision = await Effect.runPromise(program)
    expect(decision).toEqual({
      _tag: 'Correct',
      value: draft,
      note: 'tighten the wording',
    })
  })

  test('Clarify response consumes a follow-up question line', async () => {
    const draft = { title: 'topic' }
    const { program } = runGate(['cl', 'what is the scope?'], draft)
    const decision = await Effect.runPromise(program)
    expect(decision).toEqual({
      _tag: 'Clarify',
      question: 'what is the scope?',
    })
  })

  test('Reject response consumes a follow-up reason line', async () => {
    const draft = { title: 'too narrow' }
    const { program } = runGate(['r', 'scope mismatch'], draft)
    const decision = await Effect.runPromise(program)
    expect(decision).toEqual({
      _tag: 'Reject',
      reason: 'scope mismatch',
    })
  })

  test('full-word synonyms (accept / correct / clarify / reject) parse', async () => {
    const draft = { title: 'synonym test' }
    const accept = await Effect.runPromise(
      runGate(['accept'], draft).program,
    )
    expect(accept).toEqual({ _tag: 'Accept', value: draft })
    const correct = await Effect.runPromise(
      runGate(['correct', 'fix me'], draft).program,
    )
    expect(correct._tag).toBe('Correct')
    const clarify = await Effect.runPromise(
      runGate(['clarify', 'why?'], draft).program,
    )
    expect(clarify._tag).toBe('Clarify')
    const reject = await Effect.runPromise(
      runGate(['reject', 'no'], draft).program,
    )
    expect(reject._tag).toBe('Reject')
  })

  test('unparseable response fails with GateUnresolved (suspend signal)', async () => {
    const { program } = runGate(['maybe'], { title: 'x' })
    const exit = await Effect.runPromiseExit(program)
    expect(exit._tag).toBe('Failure')
    if (exit._tag === 'Failure') {
      const err = Effect.runSync(
        Effect.catchAllCause(Effect.failCause(exit.cause), (cause) =>
          Effect.succeed(cause.toJSON()),
        ) as Effect.Effect<unknown>,
      )
      // Sanity: the cause JSON mentions GateUnresolved by tag
      expect(JSON.stringify(err)).toContain('GateUnresolved')
    }
  })

  test('empty stdin queue fails with GateUnresolved (EOF = suspend signal)', async () => {
    const { program } = runGate([], { title: 'x' })
    const exit = await Effect.runPromiseExit(program)
    expect(exit._tag).toBe('Failure')
    if (exit._tag === 'Failure') {
      const failure = exit.cause
      const stringified = JSON.stringify(failure.toJSON())
      expect(stringified).toContain('GateUnresolved')
      expect(stringified).toContain('scripted stdin exhausted')
    }
    // Confirm the error really is a GateUnresolved instance path
    const err = new GateUnresolved({ reason: 'x' })
    expect(err._tag).toBe('GateUnresolved')
  })
})
