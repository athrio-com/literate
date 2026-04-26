/**
 * @literate/trope-session-end tests — three branches under stub services.
 *
 *   1. Happy path: a fully-populated Open log. Validation passes, header
 *      is stamped Closed, and the sessions-index row Status cell is
 *      rewritten.
 *   2. Missing `## Summary`: Validation fails; the Trope raises
 *      `SessionEndIncomplete` listing the missing item; on-disk state
 *      remains Open.
 *   3. Active Goal at close: one Goal still carries `Status: Active`.
 *      Validation fails with a `Goals[…].Status=terminal` entry; the
 *      session stays Open.
 */
import { describe, expect, test } from 'bun:test'
import { Effect, Exit, Layer } from 'effect'
import {
  InMemoryExecutionLogLayer,
  inMemorySessionStoreLayer,
  SessionStore,
  type Timestamp,
} from '@literate/core'

import {
  sessionEndStep,
  sessionEndTrope,
  SessionEndConcept,
  SessionEndIncomplete,
  type SessionClosure,
} from '../index.ts'

// ---------------------------------------------------------------------------
// Fixtures

const NOW: Timestamp = {
  iso: '2026-04-23T17:00:00.000Z',
  logStamp: '2026-04-23T17:00',
  filenameStamp: '2026-04-23T1700',
}

const sessionsIndex = `# Sessions — index

| File | Topic | Status |
|---|---|---|
| [2026-04-23T1600-target.md](./2026-04-23T1600-target.md) | Target | Open |
`

const TARGET_PATH = 'corpus/sessions/2026-04-23T1600-target.md'

const fullyPopulatedLog = `# Session: 2026-04-23 — Target

**Date:** 2026-04-23
**Started:** 2026-04-23T16:00
**Status:** Open
**Chapter:** —
**Agent:** TestAgent

## Goals

### Goal 1 — Do the thing

**Status:** Completed
**Category:** feature
**Topic:** Placeholder.

## Decisions Made

- Decision bullet.

## Work Done

- File X created.

## Summary

Summary text.

## Deferred / Discovered

- Nothing.
`

const missingSummaryLog = `# Session: 2026-04-23 — Target

**Date:** 2026-04-23
**Started:** 2026-04-23T16:00
**Status:** Open
**Chapter:** —
**Agent:** TestAgent

## Goals

### Goal 1 — Do the thing

**Status:** Completed
**Category:** feature
**Topic:** Placeholder.

## Decisions Made

- Decision bullet.

## Work Done

- File X created.

## Deferred / Discovered

- Nothing.
`

const activeGoalLog = `# Session: 2026-04-23 — Target

**Date:** 2026-04-23
**Started:** 2026-04-23T16:00
**Status:** Open
**Chapter:** —
**Agent:** TestAgent

## Goals

### Goal 1 — Do the thing

**Status:** Active
**Category:** feature
**Topic:** Placeholder.

## Decisions Made

- Decision bullet.

## Work Done

- File X created.

## Summary

Summary text.

## Deferred / Discovered

- Nothing.
`

// ---------------------------------------------------------------------------
// Tests

describe('@literate/trope-session-end — static surface', () => {
  test('Concept and Trope expose the expected disposition + identifiers', () => {
    expect(SessionEndConcept._tag).toBe('Concept')
    expect(SessionEndConcept.id).toBe('session-end-procedure')
    expect(sessionEndTrope._tag).toBe('Trope')
    expect(sessionEndTrope.id).toBe('session-end')
    expect(sessionEndTrope.disposition).toEqual({
      base: 'Protocol',
      scope: 'session-lifecycle',
    })
    expect(sessionEndTrope.realises).toBe(SessionEndConcept)
    expect(sessionEndTrope.realise.kind).toBe('workflow')
    expect(sessionEndTrope.realise.dependencies.length).toBe(5)
  })
})

describe('@literate/trope-session-end — happy path', () => {
  test(
    'validates, stamps Closed, updates sessions index',
    async () => {
      const files: Record<string, string> = {
        'corpus/sessions/sessions.md': sessionsIndex,
        [TARGET_PATH]: fullyPopulatedLog,
      }

      const layer = Layer.mergeAll(
        InMemoryExecutionLogLayer,
        inMemorySessionStoreLayer({ files, now: NOW }),
      )

      const program = Effect.gen(function* () {
        const closure = yield* sessionEndStep.realise({
          sessionPath: TARGET_PATH,
        })
        const store = yield* SessionStore
        const updatedLog = yield* store.read(TARGET_PATH)
        const updatedIndex = yield* store.read('corpus/sessions/sessions.md')
        return { closure, updatedLog, updatedIndex }
      })

      const { closure, updatedLog, updatedIndex } = await Effect.runPromise(
        program.pipe(Effect.provide(layer)) as Effect.Effect<{
          readonly closure: SessionClosure
          readonly updatedLog: string
          readonly updatedIndex: string
        }>,
      )

      expect(closure.sessionPath).toBe(TARGET_PATH)
      expect(closure.closedAt).toBe('2026-04-23T17:00')
      expect(updatedLog).toContain('**Status:** Closed (2026-04-23T17:00)')
      expect(updatedLog).not.toContain('**Status:** Open')
      expect(updatedIndex).toContain('Closed (2026-04-23T17:00)')
    },
  )
})

describe('@literate/trope-session-end — missing Summary', () => {
  test(
    'raises SessionEndIncomplete with ## Summary in missing list',
    async () => {
      const files: Record<string, string> = {
        'corpus/sessions/sessions.md': sessionsIndex,
        [TARGET_PATH]: missingSummaryLog,
      }

      const layer = Layer.mergeAll(
        InMemoryExecutionLogLayer,
        inMemorySessionStoreLayer({ files, now: NOW }),
      )

      const program = sessionEndStep.realise({ sessionPath: TARGET_PATH })

      const exit = await Effect.runPromiseExit(
        program.pipe(Effect.provide(layer)) as Effect.Effect<
          SessionClosure,
          SessionEndIncomplete | Error,
          never
        >,
      )

      expect(Exit.isFailure(exit)).toBe(true)
      if (Exit.isFailure(exit)) {
        const err = errorFromExit<SessionEndIncomplete>(exit)
        expect(err).toBeInstanceOf(SessionEndIncomplete)
        expect(err.missing).toContain('## Summary')
      }

      // On-disk: Status still Open.
      const readBack = await Effect.runPromise(
        Effect.gen(function* () {
          const store = yield* SessionStore
          return yield* store.read(TARGET_PATH)
        }).pipe(Effect.provide(layer)) as Effect.Effect<string>,
      )
      expect(readBack).toContain('**Status:** Open')
      expect(readBack).not.toContain('Closed (')
    },
  )
})

describe('@literate/trope-session-end — Active Goal at close', () => {
  test(
    'raises SessionEndIncomplete with a Goal terminal entry in missing',
    async () => {
      const files: Record<string, string> = {
        'corpus/sessions/sessions.md': sessionsIndex,
        [TARGET_PATH]: activeGoalLog,
      }

      const layer = Layer.mergeAll(
        InMemoryExecutionLogLayer,
        inMemorySessionStoreLayer({ files, now: NOW }),
      )

      const exit = await Effect.runPromiseExit(
        sessionEndStep
          .realise({ sessionPath: TARGET_PATH })
          .pipe(Effect.provide(layer)) as Effect.Effect<
          SessionClosure,
          SessionEndIncomplete | Error,
          never
        >,
      )

      expect(Exit.isFailure(exit)).toBe(true)
      if (Exit.isFailure(exit)) {
        const err = errorFromExit<SessionEndIncomplete>(exit)
        expect(err).toBeInstanceOf(SessionEndIncomplete)
        const hasTerminalEntry = err.missing.some((m) =>
          m.startsWith('Goals['),
        )
        expect(hasTerminalEntry).toBe(true)
      }
    },
  )
})

// ---------------------------------------------------------------------------
// Helpers

const errorFromExit = <E>(exit: Exit.Exit<unknown, unknown>): E => {
  if (!Exit.isFailure(exit)) throw new Error('Expected a failure exit')
  const cause = exit.cause
  const squashed = (cause as unknown as { _tag?: string; error?: unknown })
  // Unwrap standard Effect Cause shapes (Fail / Die) to the typed error.
  const flatten = (c: any): unknown => {
    if (c._tag === 'Fail') return c.error
    if (c._tag === 'Die') return c.defect
    if (c._tag === 'Sequential' || c._tag === 'Parallel') {
      return flatten(c.left) ?? flatten(c.right)
    }
    return undefined
  }
  const maybe = flatten(squashed)
  if (maybe === undefined) {
    throw new Error('Could not extract error from cause')
  }
  return maybe as E
}
