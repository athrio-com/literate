/**
 * Tests for `fileBackedExecutionLogLayer` (ADR-013 §1).
 *
 * The wire format is JSONL inside a ```exec fence under the level-2
 * heading `## Execution Log`. These tests verify:
 *
 * 1. Round-trip: a record with each of the six `ExecutionStatus`
 *    variants serialises and deserialises losslessly.
 * 2. Replay: appending records in one "session" and reading them back
 *    through a fresh `ExecutionLogService` instance (same store)
 *    yields the same sequence.
 * 3. `find` resolves to the matching record or `Option.none`.
 * 4. Section injection into a log that lacks a `## Execution Log`
 *    heading creates the section at the end.
 * 5. Section rewriting preserves surrounding content (pre- and
 *    post-section markdown).
 */
import { describe, expect, test } from 'bun:test'
import { Effect, Layer, Option, Schema } from 'effect'

import {
  deriveInvocationKey,
  ExecutionLog,
  ExecutionRecord,
  fileBackedExecutionLogLayer,
  inMemorySessionStoreLayer,
  makeInMemorySessionStore,
  SessionStore,
  StepId,
  type ExecutionLogService,
  type ExecutionStatus,
} from '../index.ts'

const now = {
  iso: '2026-04-23T18:00:00.000Z',
  logStamp: '2026-04-23T18:00',
  filenameStamp: '2026-04-23T1800',
}

const logPath = 'corpus/sessions/2026-04-23T1800-live-services.md'

const header = `# Session: 2026-04-23 — Live services\n\n**Status:** Open\n\n## Goals\n\n- Goal A\n- Goal B\n`

describe('@literate/core fileBackedExecutionLogLayer', () => {
  test('round-trips a record of every ExecutionStatus variant losslessly', async () => {
    const statuses: ReadonlyArray<ExecutionStatus> = [
      'completed',
      'gate-pending',
      'ai-pending',
      'external-pending',
      'failed',
      'suspended',
    ]
    const records: ExecutionRecord[] = statuses.map((status, i) => ({
      stepId: `step.${status}`,
      invocationKey: `k${i}`,
      kind: 'effect',
      startedAt: `2026-04-23T18:00:0${i}.000Z`,
      completedAt: `2026-04-23T18:00:0${i + 1}.000Z`,
      status,
      input: { i },
      output: { doubled: i * 2 },
    }))

    const storeService = await Effect.runPromise(
      makeInMemorySessionStore({ files: { [logPath]: header }, now }),
    )
    const storeLayer = Layer.succeed(SessionStore, storeService)
    const logLayer = Layer.provide(
      fileBackedExecutionLogLayer(logPath),
      storeLayer,
    )

    // Append every record through a single log-service instance.
    await Effect.runPromise(
      Effect.gen(function* () {
        const log = yield* ExecutionLog
        for (const r of records) {
          yield* log.append(r)
        }
      }).pipe(Effect.provide(logLayer)),
    )

    // Read back through a fresh service instance over the same store.
    const readBack = await Effect.runPromise(
      Effect.gen(function* () {
        const log = yield* ExecutionLog
        return yield* log.all()
      }).pipe(Effect.provide(logLayer)),
    )

    // Decode via Schema to confirm each record satisfies the schema.
    const decoded = readBack.map((r) =>
      Schema.decodeUnknownSync(ExecutionRecord)(r),
    )
    expect(decoded.length).toBe(records.length)
    for (let i = 0; i < records.length; i++) {
      expect(decoded[i]).toEqual(records[i]!)
    }
  })

  test('replay: append A, re-open fresh service over same store, read A', async () => {
    const record: ExecutionRecord = {
      stepId: 'step.a',
      invocationKey: deriveInvocationKey(StepId('step.a'), { x: 1 }),
      kind: 'effect',
      startedAt: '2026-04-23T18:00:00.000Z',
      completedAt: '2026-04-23T18:00:00.500Z',
      status: 'completed',
      input: { x: 1 },
      output: { y: 2 },
    }
    const storeService = await Effect.runPromise(
      makeInMemorySessionStore({ files: { [logPath]: header }, now }),
    )
    const storeLayer = Layer.succeed(SessionStore, storeService)
    // "First turn": append through one log layer, discard it.
    await Effect.runPromise(
      Effect.flatMap(ExecutionLog, (log) => log.append(record)).pipe(
        Effect.provide(
          Layer.provide(fileBackedExecutionLogLayer(logPath), storeLayer),
        ),
      ),
    )
    // "Second turn": brand-new log layer over the same store.
    const { replayAll, replayHit, replayMiss } = await Effect.runPromise(
      Effect.gen(function* () {
        const log = yield* ExecutionLog
        const all = yield* log.all()
        const hit = yield* log.find(
          StepId('step.a'),
          deriveInvocationKey(StepId('step.a'), { x: 1 }),
        )
        const miss = yield* log.find(
          StepId('step.b'),
          deriveInvocationKey(StepId('step.b'), {}),
        )
        return { replayAll: all, replayHit: hit, replayMiss: miss }
      }).pipe(
        Effect.provide(
          Layer.provide(fileBackedExecutionLogLayer(logPath), storeLayer),
        ),
      ),
    )
    expect(replayAll.length).toBe(1)
    expect(replayAll[0]).toEqual(record)
    expect(Option.isSome(replayHit)).toBe(true)
    if (Option.isSome(replayHit)) {
      expect(replayHit.value).toEqual(record)
    }
    expect(Option.isNone(replayMiss)).toBe(true)
  })

  test('log without ## Execution Log section: append creates section at end', async () => {
    const storeLayer = inMemorySessionStoreLayer({
      files: { [logPath]: header },
      now,
    })
    const record: ExecutionRecord = {
      stepId: 'step.x',
      invocationKey: 'kx',
      kind: 'prose',
      startedAt: '2026-04-23T18:00:00.000Z',
      status: 'completed',
      input: {},
      output: { ok: true },
    }
    // Build a single shared composite layer used for both the append
    // and the subsequent read — inMemorySessionStoreLayer memoises
    // inside a single Layer value.
    const composite = Layer.provide(
      fileBackedExecutionLogLayer(logPath),
      storeLayer,
    )
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const log = yield* ExecutionLog
        yield* log.append(record)
        const raw = yield* Effect.flatMap(SessionStore, (s) =>
          s.read(logPath),
        )
        const all = yield* log.all()
        return { raw, all }
      }).pipe(Effect.provide(Layer.merge(composite, storeLayer))),
    )
    expect(result.raw).toContain('## Execution Log')
    expect(result.raw).toContain('```exec')
    expect(result.raw).toContain('"stepId":"step.x"')
    // Original content preserved above the new section
    expect(result.raw.indexOf('## Goals')).toBeLessThan(
      result.raw.indexOf('## Execution Log'),
    )
    expect(result.all.length).toBe(1)
    expect(result.all[0]).toEqual(record)
  })

  test('rewriting section preserves pre- and post-section markdown', async () => {
    const surroundingLog =
      `# S\n\n## Goals\n\n- G1\n\n## Execution Log\n\n\`\`\`exec\n\`\`\`\n\n## Summary\n\nTBD.\n`
    const storeLayer = inMemorySessionStoreLayer({
      files: { [logPath]: surroundingLog },
      now,
    })
    const r1: ExecutionRecord = {
      stepId: 'step.1',
      invocationKey: 'k1',
      kind: 'effect',
      startedAt: '2026-04-23T18:00:00.000Z',
      status: 'completed',
      input: {},
      output: { v: 1 },
    }
    const r2: ExecutionRecord = {
      stepId: 'step.2',
      invocationKey: 'k2',
      kind: 'effect',
      startedAt: '2026-04-23T18:00:01.000Z',
      status: 'completed',
      input: {},
      output: { v: 2 },
    }
    const composite = Layer.provide(
      fileBackedExecutionLogLayer(logPath),
      storeLayer,
    )
    const { raw, all } = await Effect.runPromise(
      Effect.gen(function* () {
        const log = yield* ExecutionLog
        yield* log.append(r1)
        yield* log.append(r2)
        const content = yield* Effect.flatMap(SessionStore, (s) =>
          s.read(logPath),
        )
        const records = yield* log.all()
        return { raw: content, all: records }
      }).pipe(Effect.provide(Layer.merge(composite, storeLayer))),
    )
    // Both surrounding sections preserved
    expect(raw).toContain('## Goals')
    expect(raw).toContain('## Summary')
    expect(raw).toContain('TBD.')
    // Goals precedes Execution Log precedes Summary (section ordering
    // preserved despite rewrite)
    const i1 = raw.indexOf('## Goals')
    const i2 = raw.indexOf('## Execution Log')
    const i3 = raw.indexOf('## Summary')
    expect(i1 < i2).toBe(true)
    expect(i2 < i3).toBe(true)
    // Both records present
    expect(all).toEqual([r1, r2])
  })
})
