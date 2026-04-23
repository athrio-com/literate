/**
 * Smoke test for @literate/core.
 *
 * Covers:
 *   1. `prose()` helper resolves a sibling `.md`.
 *   2. `proseStep` renders with {vars} interpolation and returns
 *      structured `ProseOutput`.
 *   3. `memo` memoises: invoking the same Step twice writes exactly
 *      one record to the in-memory `ExecutionLog`.
 *   4. `Protocol.continue` returns a typed `NoAction` outcome.
 */
import { describe, expect, test } from 'bun:test'
import { Effect, Layer } from 'effect'

import {
  ExecutionLog,
  InMemoryExecutionLogLayer,
  DefaultStubLayers,
  memo,
  Protocol,
  prose,
  proseStep,
  StepId,
} from '../index.ts'

const greeting = proseStep({
  id: StepId('smoke.greeting'),
  source: prose(import.meta.url, './smoke.md'),
})

describe('@literate/core smoke', () => {
  test('proseStep renders and memo caches', async () => {
    const program = Effect.gen(function* () {
      const runGreeting = memo(greeting)

      const first = yield* runGreeting({
        vars: { actor: 'Person', count: '1' },
      })
      const second = yield* runGreeting({
        vars: { actor: 'Person', count: '1' },
      })

      const log = yield* ExecutionLog
      const records = yield* log.all()

      return { first, second, records }
    })

    const runnable = program.pipe(
      Effect.provide(Layer.mergeAll(InMemoryExecutionLogLayer, DefaultStubLayers)),
    )

    const { first, second, records } = await Effect.runPromise(runnable)

    expect(first.text).toContain('Hello from `@literate/core`')
    expect(first.text).toContain('Actor: Person')
    expect(first.text).toContain('Count:  1')

    // Second call returns the cached output; content matches
    expect(second.text).toBe(first.text)

    // Exactly one record — memoisation held (ADR-013 §2)
    expect(records.length).toBe(1)
    expect(records[0]!.stepId).toBe('smoke.greeting')
    expect(records[0]!.status).toBe('completed')
    expect(records[0]!.kind).toBe('prose')
  })

  test('Protocol.continue returns typed NoAction', async () => {
    const outcome = await Effect.runPromise(Protocol.continue('/tmp/repo'))
    expect(outcome._tag).toBe('NoAction')
    if (outcome._tag === 'NoAction') {
      expect(outcome.reason).toContain('scaffolded')
    }
  })
})
