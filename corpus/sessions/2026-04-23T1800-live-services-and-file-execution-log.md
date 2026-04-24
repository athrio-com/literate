# Session: 2026-04-23 — Live services and file-backed ExecutionLog

**Date:** 2026-04-23
**Started:** 2026-04-23T18:00
**Status:** Closed (2026-04-23T19:10)
**Chapter:** — (no chapter yet)
**Agent:** Claude Opus 4.7 (1M context)
**Planned by:** corpus/sessions/2026-04-23T1600-unify-monorepo-layout.md
**Depends on:** corpus/sessions/2026-04-23T1649-workflow-tropes-session-lifecycle.md

## Pre-work

Per `session-start` (planned path, IMP-1):

- **Last `Status: Closed` session.** S2 closed at
  `2026-04-23T1649-workflow-tropes-session-lifecycle` (Closed
  2026-04-23T17:43). Summary: shipped the minimum executable
  workflow Tropes the MVP arc needs — `@literate/trope-session-start`
  (ten atomic Steps composed via `workflowStep`) and
  `@literate/trope-session-end` (five atomic Steps + validator +
  stamp). Along the way, ADR-021 introduced `Modality` as a general
  six-case ADT (`Protocol` / `Weave` / `Tangle` / `Unweave` /
  `Untangle` / `Attest`), required on `Trope<C>` and optional on
  `Concept<D>`. `@literate/core` also gained the
  `SessionStore` service (list/read/write/rename/now + in-memory
  factory + stub-fail layer) and a `scriptedGateServiceLayer` test
  helper. S2 left two items on the Deferred slate that are direct
  upstreams for S3: live `SessionStore` binding (filesystem) and
  live `GateService` (stdin/stdout).
- **ADR index reviewed.** ADR-011 through ADR-015, ADR-017,
  ADR-019, ADR-020, ADR-021 Accepted. No new supersessions affect
  this session. Relevant upstreams: ADR-013 (session log as event
  store; fenced-block semantics), ADR-014 (`Protocol.continue`
  entry point), ADR-015 (TypeScript + `.md` sibling composition),
  ADR-017 (gate decisions as typed Steps), ADR-021 (Modality).
- **Planned-session queue.** S4
  (`2026-04-27T0900-cli-template-and-e2e-smoke`) remains `Planned`,
  `Depends on:` this session; will open after S3 closes. Parent's
  Plan entry `Realised by:` updated atomically to the renamed
  path `corpus/sessions/2026-04-23T1800-live-services-and-file-execution-log.md`.
- **Mechanical cleanup on open.** Filename renamed from
  `2026-04-26T0900-live-services-and-file-execution-log.md` to
  `2026-04-23T1800-live-services-and-file-execution-log.md` via
  `git mv` to match the actual start time (IMP-1.5
  same-calendar-day rule; the encoded `2026-04-26` preceded
  today's real date of 2026-04-23 by three calendar days).
  Parent's `Realised by:` updated, S4's `Depends on:` updated,
  and the sessions-index row updated accordingly — all ungated
  metadata edits, Person-Accepted at session open.
- **Header-stamp timestamp convention.** S2 surfaced that IMP-1.5
  prescribes UTC but every existing log uses local time (EEST,
  UTC+3). Continuing local for consistency; amendment or
  normalisation pass remains deferred.

## Goals

### Goal 1 — Interactive `GateService` implementation

**Status:** Active
**Category:** feature
**Topic:** Replace the stub `GateService` in
`packages/core/src/services.ts` (which always suspends) with a
live implementation that renders the gate prompt to stdout,
reads the Person's Accept / Correct / Clarify / Reject response
from stdin, and returns a typed `GateDecision`. The layer is
bound in the CLI entry point (S4); the core package exports the
factory.

**Upstream:**

- ADR-017 — gate decisions as typed Steps.
- `packages/core/src/gate.ts` — `GateDecision` schema.
- `packages/core/src/services.ts` — current stub surface.

**Acceptance:**

- `GateService` live implementation exists, is exported from
  `@literate/core`, and is selectable via a Layer.
- Unit tests exercise each decision type with scripted stdin.
- Suspend semantics preserved: Reject still raises a
  `GatePending` suspend if no decision is recorded.

### Goal 2 — File-backed `ExecutionLog` writing to the session log's `## Execution Log` fence

**Status:** Active
**Category:** feature
**Topic:** Replace `InMemoryExecutionLogLayer` with a file-backed
implementation per ADR-013: reads and writes the
`## Execution Log` fenced block inside the active session log
markdown file. Deterministic replay is restored: a second run of
`Protocol.continue` over the same log must produce the same
sequence of records.

**Upstream:**

- ADR-013 — session log as event store; fenced block semantics.
- `packages/core/src/execution.ts` — current in-memory impl.

**Acceptance:**

- `FileBackedExecutionLogLayer` exists, reads/writes the fence.
- Replay test: append record A, close, re-open, replay produces
  A exactly.
- Round-trip test: a record with every `ExecutionStatus` variant
  serialises and deserialises losslessly.

**Notes:**

- These two services are what make `Protocol.continue` a usable
  dispatch function rather than a demo skeleton. S4's CLI wires
  them as the default live Layer.

## Decisions Made

- **ExecutionLog wire format — JSONL inside a `` ```exec `` fence.**
  ADR-013 §1 sketched a free-form key-value format and flagged it
  indicative, promising a future spec ADR once the first real Step
  ran against a real log. This session runs the first Steps against
  a file-backed log and commits to JSONL (one `ExecutionRecord` per
  line) for lossless round-trip and trivial parsing. A formal spec
  ADR is deferred to S4, when the CLI writes real files on disk; at
  that point the format is either promoted to ADR-022 verbatim or
  refined against e2e feedback.
- **`TerminalIO` as the live gate substrate.** Introduced a minimal
  line-oriented `TerminalIO` interface (`readLine`, `write`) in
  `@literate/core`, a `makeTerminalGateService(io)` factory bound
  via `terminalGateServiceLayer`, a `makeScriptedTerminalIO`
  test-double, and a `node:readline`-backed `makeNodeTerminalIO`
  quarantined in `terminal.ts`. The CLI (S4) wires `process.stdin` /
  `process.stdout`; tests wire the scripted IO. No new ADR — this
  is a bind to existing `GateService` (ADR-017) without
  architectural change.

## Work Done

### Goal 1 — live `GateService` (stdin/stdout)

- Extended `packages/core/src/services.ts`:
  - Added the `TerminalIO` interface
    (`readLine: () => Effect.Effect<string, GateUnresolved>`,
    `write: (s) => Effect.Effect<void>`).
  - Added `renderGateDraft` (JSON pretty-print of the draft; a
    schema-aware renderer remains deferred).
  - Added `makeTerminalGateService(io)` — factory returning a
    `GateServiceImpl` that writes a prompt, reads a line, parses
    `a`/`accept`, `c`/`correct`, `cl`/`clarify`, `r`/`reject`,
    consumes a follow-up line for Correct/Clarify/Reject, and
    fails with `GateUnresolved` on any unrecognised response or
    queue exhaustion.
  - Added `terminalGateServiceLayer(io)`: `Layer.effect` binding.
  - Added `makeScriptedTerminalIO(inputs)`: returns
    `{ io, writes }` — a pair the tests use to drive the service
    and assert on the rendered prompt.
- Created `packages/core/src/terminal.ts`:
  - `NodeTerminal` type + `makeNodeTerminalIO({ input?, output? })`
    backed by `node:readline`. Works on Bun and Node. Supports
    optional stream injection for test harnesses that synthesise
    a readable stream. Exposes `close()` for the CLI to release
    the readline interface at turn end; outstanding reads resolve
    with `GateUnresolved` on close.
- Updated `packages/core/src/index.ts` to re-export
  `TerminalIO`, `makeTerminalGateService`, `terminalGateServiceLayer`,
  `makeScriptedTerminalIO`, `makeNodeTerminalIO`, `NodeTerminal`.
- Authored `packages/core/src/__tests__/terminal-gate.test.ts`
  with seven tests: `Accept`, `Correct`, `Clarify`, `Reject`,
  full-word synonyms, unparseable response → `GateUnresolved`,
  empty queue (EOF) → `GateUnresolved` with the expected reason.
  All pass; 16 `expect()` calls.

### Goal 2 — file-backed `ExecutionLog` (ADR-013 fence)

- Extended `packages/core/src/execution.ts`:
  - Added constants `EXECUTION_LOG_HEADING`,
    `EXECUTION_LOG_FENCE_OPEN`, `EXECUTION_LOG_FENCE_CLOSE`.
  - Added `extractFenceBody(markdown)` — locates the fence under
    `## Execution Log` and returns its body or `null`.
  - Added `parseExecutionLogFence(markdown)` — JSONL parse;
    malformed lines are skipped (a stricter validator is deferred
    until the first malformed-log incident).
  - Added `renderExecutionLogSection(records)` — canonical
    serialisation: heading, blank line, fence open, JSONL body,
    fence close, trailing newline.
  - Added `rewriteExecutionLogSection(markdown, records)` —
    either appends the section to the file (no existing heading)
    or replaces the existing section from its heading to the next
    level-2 heading or EOF, preserving surrounding content.
  - Added `makeFileBackedExecutionLog(logPath)` returning an
    `ExecutionLogService` wired over `SessionStore`. `find` and
    `all` read → parse; `append` is read-modify-write and maps
    any `SessionStoreError` into `LogWriteError` with an
    operation-qualified reason.
  - Added `fileBackedExecutionLogLayer(logPath)`:
    `Layer.effect(ExecutionLog, makeFileBackedExecutionLog(logPath))`
    carrying a `SessionStore` requirement.
- Updated `packages/core/src/index.ts` to re-export
  `fileBackedExecutionLogLayer` and `makeFileBackedExecutionLog`.
- Authored
  `packages/core/src/__tests__/file-backed-execution-log.test.ts`
  with four tests:
  1. Round-trips a record of every `ExecutionStatus` variant
     (`completed`, `gate-pending`, `ai-pending`, `external-pending`,
     `failed`, `suspended`) through the Schema.
  2. Replay across fresh `ExecutionLogService` instances against
     the same `SessionStore` — `all()` returns the appended record;
     `find()` resolves by `(stepId, invocationKey)` or misses
     with `Option.none`.
  3. Appending to a log that lacks the `## Execution Log` section
     creates the section at the end while preserving the
     `## Goals` prefix.
  4. Rewriting the section in a log with a pre-existing
     `## Goals` and trailing `## Summary` preserves both
     surrounding sections and their ordering.
  All pass; 24 `expect()` calls.

### Cross-cutting

- Workspace-wide test status after this session: 29/29 pass, 129
  `expect()` calls, across 6 files in 3 packages (up from 21/10
  in 1 package at S2 close; delta: +11 tests, +40 expects across
  two new test files in `@literate/core`).
- `bun run typecheck` passes in `packages/core`.
- No imports from `legacy/` anywhere in the new code (the
  `legacy/` freeze from ADR-018 / ADR-020 is honoured).
- `corpus/CLAUDE.md` unchanged — no imperative updates needed.

## Deferred / Discovered

Deferred to later sessions:

- **Formal ADR-022 for the execution-log wire format.** S3 commits
  to JSONL inside `` ```exec `` and ships the parser/writer. S4's
  e2e smoke is the natural moment to either promote the commit to
  ADR-022 verbatim or refine once the CLI writes real files.
- **Schema-aware gate draft rendering.** v0.1
  `renderGateDraft(draft)` is `JSON.stringify(draft, null, 2)`.
  A schema-directed renderer (field order, nullable elision,
  enum-hint rendering) is a separate concern.
- **Strict execution-log validation.** `parseExecutionLogFence`
  currently skips malformed lines silently. A strict mode that
  halts with a tagged error is deferred; the `ReplayDivergence`
  error already exists for semantic divergence but there is no
  analogue for wire-format corruption.
- **readline close-ordering edge cases.** `makeNodeTerminalIO`
  pairs each pending read with a pending close-handler so EOF
  drains every outstanding reader. A future rework with
  `Effect.scoped` + `Effect.addFinalizer` (rather than a manual
  `close()` escape hatch) would fit the Effect idiom better; v0.1
  keeps the escape hatch for CLI simplicity.

Discovered in this session:

- **Layer sharing for multi-turn simulations.** Tests that
  simulate "close the process, re-open against the same state"
  need a single `SessionStoreService` instance shared across two
  `Effect.runPromise` calls. `inMemorySessionStoreLayer` via
  `Layer.effect` re-evaluates its builder per `Layer.build`, so
  for replay tests we construct the service eagerly via
  `Effect.runPromise(makeInMemorySessionStore(...))` and wrap it
  with `Layer.succeed(SessionStore, instance)`. Worth folding
  this pattern into a small test helper (`makeSharedSessionStore`)
  as soon as a second replay test needs it.
- **JSONL + markdown cohabitation is clean.** A `` ```exec ``
  fence inside a markdown file reads fine to humans
  (each record is one compact line, grep-friendly) and is
  trivially machine-parseable. The ADR-013 §1 free-form sketch
  was optimised for human readability at the cost of parser
  brittleness; JSONL keeps both. S4 will confirm this holds once
  session logs see real traffic.

## Summary

Shipped the two live services that promote `Protocol.continue` from
a demo skeleton to a usable dispatch function. `@literate/core` now
exposes a live stdin/stdout `GateService` via a minimal `TerminalIO`
abstraction (scripted in tests, `node:readline`-backed in the CLI)
plus a file-backed `ExecutionLogService` that reads and writes the
`## Execution Log` fenced block using JSONL — the concrete wire
format for what ADR-013 §1 left indicative. Eleven new tests across
two new files bring workspace-wide status to 29/29 pass. S4 (CLI +
`template-minimal` + e2e smoke) is now structurally unblocked: its
CLI can wire `terminalGateServiceLayer(makeNodeTerminalIO().io)` and
`fileBackedExecutionLogLayer(activeLogPath)` into the default live
Layer without further core work.
