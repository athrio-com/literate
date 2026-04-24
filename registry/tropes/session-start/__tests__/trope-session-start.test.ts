/**
 * @literate/trope-session-start tests — three branches under stub services.
 *
 *   1. Spontaneous start: no Planned ready, no orphan. The Trope creates
 *      a new log and returns a `SessionRef` pointing at it.
 *   2. Planned start: one ready Planned log with a satisfied Depends-on.
 *      The Trope rewrites the log's header to Status: Open, re-gates a
 *      single provisional Goal, stamps it Accepted.
 *   3. Orphan detection: a non-Planned log shows Status: Open. The Trope
 *      gates an Orphan decision; on `Accept({action: 'resume'})` it
 *      returns a `SessionRef` pointing at the orphan without opening a
 *      new log.
 */
import { describe, expect, test } from 'bun:test'
import { Effect, Layer } from 'effect'
import {
  InMemoryExecutionLogLayer,
  inMemorySessionStoreLayer,
  scriptedGateServiceLayer,
  type Timestamp,
} from '@literate/core'

import {
  sessionStartTrope,
  sessionStartStep,
  SessionStartConcept,
  type SessionRef,
} from '../index.ts'

// ---------------------------------------------------------------------------
// Fixtures

const NOW: Timestamp = {
  iso: '2026-04-23T16:00:00.000Z',
  logStamp: '2026-04-23T16:00',
  filenameStamp: '2026-04-23T1600',
}

const priorClosedLog = `# Session: 2026-04-23 — Prior work

**Date:** 2026-04-23
**Started:** 2026-04-23T10:00
**Status:** Closed (2026-04-23T10:30)
**Chapter:** —
**Agent:** TestAgent

## Summary

Prior session summary used for surfacing in the next session's Pre-work.

## Deferred / Discovered

- Item one carried forward.
`

const decisionsIndex = `# Decisions — index

| # | Title | Status | Tags |
|---|---|---|---|
| [001](./ADR-001.md) | Example | Accepted | \`#algebra\` |
`

const sessionsIndex = `# Sessions — index

| File | Topic | Status |
|---|---|---|
| [2026-04-23T1000-prior.md](./2026-04-23T1000-prior.md) | Prior work | Closed (2026-04-23T10:30) |
`

// ---------------------------------------------------------------------------
// Tests

describe('@literate/trope-session-start — static surface', () => {
  test('Concept and Trope expose the expected modality + identifiers', () => {
    expect(SessionStartConcept._tag).toBe('Concept')
    expect(SessionStartConcept.id).toBe('session-start-procedure')
    expect(SessionStartConcept.modality).toEqual({ _tag: 'Protocol' })
    expect(sessionStartTrope._tag).toBe('Trope')
    expect(sessionStartTrope.id).toBe('session-start')
    expect(sessionStartTrope.modality).toEqual({ _tag: 'Protocol' })
    expect(sessionStartTrope.realises).toBe(SessionStartConcept)
    expect(sessionStartTrope.realise.kind).toBe('workflow')
    expect(sessionStartTrope.realise.dependencies.length).toBe(10)
  })
})

describe('@literate/trope-session-start — spontaneous branch', () => {
  test('creates a new log, surfaces prior context, returns SessionRef', async () => {
    const files: Record<string, string> = {
      'corpus/sessions/sessions.md': sessionsIndex,
      'corpus/sessions/2026-04-23T1000-prior.md': priorClosedLog,
      'corpus/decisions/decisions.md': decisionsIndex,
    }

    const layer = Layer.mergeAll(
      InMemoryExecutionLogLayer,
      inMemorySessionStoreLayer({ files, now: NOW }),
      // Spontaneous path never gates — provide an empty queue.
      scriptedGateServiceLayer([]),
    )

    const program = Effect.gen(function* () {
      return yield* sessionStartStep.realise({
        repoRoot: '/tmp/repo',
        agent: 'TestAgent',
        slug: 'test-session',
      })
    })

    const ref = await Effect.runPromise(
      program.pipe(Effect.provide(layer)) as Effect.Effect<SessionRef>,
    )

    expect(ref._tag).toBe('SessionRef')
    expect(ref.slug).toBe('test-session')
    expect(ref.path).toBe('corpus/sessions/2026-04-23T1600-test-session.md')
  })
})

describe('@literate/trope-session-start — planned branch', () => {
  test(
    'opens Planned log, re-gates provisional Goal, stamps Accepted',
    async () => {
      const parentPath = 'corpus/sessions/2026-04-23T1000-parent.md'
      const plannedPath = 'corpus/sessions/2026-04-23T1500-future.md'

      const parent = `# Session: 2026-04-23 — Parent

**Date:** 2026-04-23
**Started:** 2026-04-23T10:00
**Status:** Closed (2026-04-23T10:30)
**Chapter:** —
**Agent:** TestAgent

## Plan

### Planned Session 1 — Future

**Slug:** future
**Realised by:** corpus/sessions/2026-04-23T1500-future.md

## Summary

Parent summary.

## Deferred / Discovered

- None.
`

      const planned = `# Session: 2026-04-25 — Future

**Date:** 2026-04-25
**Started:** —
**Status:** Planned
**Chapter:** —
**Agent:** —
**Planned by:** corpus/sessions/2026-04-23T1000-parent.md
**Depends on:** corpus/sessions/2026-04-23T1000-parent.md

## Goals

### Goal 1 — Draft thing

**Status:** (provisional)
**Category:** (provisional)
**Topic:** Do the thing.
`

      const files: Record<string, string> = {
        'corpus/sessions/sessions.md': sessionsIndex,
        [parentPath]: parent,
        [plannedPath]: planned,
        'corpus/decisions/decisions.md': decisionsIndex,
      }

      // One gate call expected — the re-gate of Goal 1.
      const layer = Layer.mergeAll(
        InMemoryExecutionLogLayer,
        inMemorySessionStoreLayer({ files, now: NOW }),
        scriptedGateServiceLayer([
          { _tag: 'Accept', value: { number: 1, title: 'Draft thing' } },
        ]),
      )

      const program = Effect.gen(function* () {
        return yield* sessionStartStep.realise({
          repoRoot: '/tmp/repo',
          agent: 'PlannedAgent',
          slug: 'future',
        })
      })

      const ref = await Effect.runPromise(
        program.pipe(Effect.provide(layer)) as Effect.Effect<SessionRef>,
      )

      expect(ref.path).toBe(plannedPath)
      expect(ref.slug).toBe('future')
    },
  )
})

describe('@literate/trope-session-start — orphan branch', () => {
  test(
    'detects Open orphan, gates resume, returns orphan SessionRef',
    async () => {
      const orphanPath = 'corpus/sessions/2026-04-23T0800-orphaned.md'
      const orphan = `# Session: 2026-04-23 — Orphan

**Date:** 2026-04-23
**Started:** 2026-04-23T08:00
**Status:** Open
**Chapter:** —
**Agent:** PriorAgent

## Goals
`

      const files: Record<string, string> = {
        'corpus/sessions/sessions.md': sessionsIndex,
        [orphanPath]: orphan,
        'corpus/decisions/decisions.md': decisionsIndex,
      }

      const layer = Layer.mergeAll(
        InMemoryExecutionLogLayer,
        inMemorySessionStoreLayer({ files, now: NOW }),
        scriptedGateServiceLayer([
          {
            _tag: 'Accept',
            value: {
              orphanPath,
              action: 'resume',
            },
          },
        ]),
      )

      const program = Effect.gen(function* () {
        return yield* sessionStartStep.realise({
          repoRoot: '/tmp/repo',
          agent: 'ResumeAgent',
          slug: 'resume',
        })
      })

      const ref = await Effect.runPromise(
        program.pipe(Effect.provide(layer)) as Effect.Effect<SessionRef>,
      )

      expect(ref.path).toBe(orphanPath)
      expect(ref.slug).toBe('orphaned')
    },
  )
})
