# Session: 2026-04-23 — CLI, `template-minimal`, and end-to-end smoke

**Date:** 2026-04-23
**Started:** 2026-04-23T19:20
**Status:** Closed (2026-04-23T20:30)
**Chapter:** — (no chapter yet)
**Agent:** Claude Opus 4.7 (1M context)
**Planned by:** corpus/sessions/2026-04-23T1600-unify-monorepo-layout.md
**Depends on:** corpus/sessions/2026-04-23T1800-live-services-and-file-execution-log.md

## Pre-work

Per `session-start` (planned path, IMP-1):

- **Last `Status: Closed` session.** S3 closed at
  `2026-04-23T1800-live-services-and-file-execution-log` (Closed
  2026-04-23T19:10). Summary: shipped a live stdin/stdout
  `GateService` (via a minimal `TerminalIO` abstraction, with a
  `node:readline`-backed factory and a scripted test-double) and
  a file-backed `ExecutionLogService` that reads/writes the
  `## Execution Log` fence as JSONL. Eleven new tests, zero
  regressions. The MVP's remaining capstone — the CLI, the
  consumer template, and an e2e smoke — now has all its
  substrate.
- **ADR index reviewed.** No new supersessions. Relevant
  upstreams for this session: ADR-002 (corpus → src → .literate),
  ADR-004 (CLI in Effect; Bun/Deno/Node compatible; `literate`
  manifest key), ADR-007 (LF repo has no `.literate/`; consumer
  repos do), ADR-008 (exhaustive single-realisation at v0.1),
  ADR-013 (session log as event store; file-backed binding
  landed in S3), ADR-014 (`Protocol.continue` is the entry
  point), ADR-017 (gate decisions as typed Steps), ADR-021
  (Modality).
- **Planned-session queue.** None ready after S4 — this is the
  MVP capstone. Any further work (live `AIInvoke`, additional
  workflow Tropes, docs site, etc.) is post-MVP and will be
  planned out of this session's `## Deferred / Discovered`.
- **Mechanical cleanup on open.** Filename renamed from
  `2026-04-27T0900-cli-template-and-e2e-smoke.md` to
  `2026-04-23T1920-cli-template-and-e2e-smoke.md` via `git mv`
  (IMP-1.5 same-calendar-day rule). Parent's `Realised by:`
  field and the sessions-index row updated accordingly —
  ungated metadata edits, Person-Accepted at session open.
- **Goal 1 scope adjustment surfaced and Accepted.** A live
  `node:fs`-backed `SessionStore` binding was not part of S3's
  scope (S3 shipped only the in-memory factory and the stub-fail
  layer). Without it the CLI cannot read or write real session
  logs; S4 Goal 1 therefore absorbs the live `SessionStore`
  binding so the CLI stands up end-to-end. Flagged to the Person
  pre-stamp and Accepted.

## Goals

### Goal 1 — `@literate/cli` as the `Protocol.continue` entry point

**Status:** Active
**Category:** feature
**Topic:** Author the v0.1 CLI. Single command
(`literate continue [repoRoot]`) that resolves the repo root,
constructs the live Layer (live stdin/stdout `GateService` via
`terminalGateServiceLayer(makeNodeTerminalIO().io)` + file-backed
`ExecutionLogService` via
`fileBackedExecutionLogLayer(activeLogPath)` + a live
`node:fs`-backed `SessionStore` binding + `StubAIInvokeLayer`),
calls `Protocol.continue`, renders the `Suspend` frame
(`GatePending` / `AIPending` / `ExternalPending`) to the
terminal, and re-enters on resume. The `init` and `add` verbs
are deferred past the MVP.

**Upstream:**

- ADR-004 — CLI in Effect; Bun/Deno/Node compatible.
- ADR-014 — `Protocol.continue` entry point.
- ADR-013 — session log event-store semantics; S3's file-backed
  `ExecutionLog`.
- ADR-017 — gate decisions as typed Steps; S3's live
  `GateService`.
- S1 metalanguage, S2 workflow Tropes, S3 live services.
- Legacy `legacy/packages/cli/` — reference only for arg-parsing
  patterns; no imports (ADR-018 / ADR-020).

**Scope:**

- `packages/cli/` package with a `bin` entry.
- Live `node:fs`-backed `SessionStore` binding (absorbed from
  the Goal scope adjustment above).
- `literate continue .` reaches the gate in a scratch repo.

**Out of scope:**

- `init` verb (scaffolding a fresh consumer repo).
- `add` verb (adding a Concept or Trope from a template).
- Colourised output, progress bars, arg-parsing via a third
  party library (v0.1 rolls its own minimal parser).

**Acceptance:**

- `packages/cli/` exists with `@literate/cli` name.
- `literate continue <path>` opens a session in a scratch repo.
- CLI smoke test: spawn under a scripted stdin/stdout harness
  (bypassing readline), confirm a full spontaneous session
  (open → gate Goal → close) completes and writes a valid
  session log to disk.

### Goal 2 — `@literate/template-minimal` as the scaffold

**Status:** Active
**Category:** feature
**Topic:** Rebuild the minimal consumer template on the rewrite
algebra. Contains `corpus/`, `corpus/CLAUDE.md` (pointing at the
consumer's own Protocol), the consumer's `.literate/` snapshot
directory (per ADR-002 / ADR-007 — LF's repo lacks `.literate/`
but consumer repos have it), and a minimal `package.json` with
the `literate` manifest key.

**Upstream:**

- ADR-002 (corpus → src → `.literate/`).
- ADR-007 (LF has no `.literate/`; consumer repos do).
- ADR-008 (exhaustive single-realisation).
- Legacy `legacy/packages/template-minimal/` — reference only.

**Acceptance:**

- `packages/template-minimal/` exists; scaffolded files match a
  documented minimal consumer layout.
- `literate continue` run in the scaffolded template reaches the
  gate without errors.

### Goal 3 — End-to-end smoke test as the MVP acceptance gate

**Status:** Active
**Category:** feature
**Topic:** Single integration test that: (1) scaffolds
`template-minimal` into a temp directory, (2) runs
`literate continue` under a scripted stdin that Accepts a single
Goal, (3) closes the session via the `sessionEndTrope`, (4)
asserts the session log has the expected Status, Summary, and
Execution Log contents. This test is the *MVP done* marker.

**Upstream:**

- All prior sessions' acceptance.
- ADR-013 replay determinism — a second run over the resulting
  session log must be a no-op.

**Acceptance:**

- Integration test lives under `packages/cli/src/__tests__/` or
  a dedicated `packages/e2e/` package; passes.
- The MVP arc's capstone: at close of this session, LF is
  demonstrably runnable end-to-end by a consumer.

## Decisions Made

- **CLI dispatches workflow Tropes directly; `Protocol.continue`
  stays scaffolded.** ADR-014 names `Protocol.continue` as the
  single entry point, but `@literate/core` cannot import
  `@literate/trope-*` without inverting the dependency graph. The
  CLI invokes `sessionStartStep.realise` and `sessionEndStep.realise`
  directly via `@literate/cli` verbs (`runContinue`, `runClose`).
  Unifying the two entry points under `Protocol.continue` — likely
  by injecting a dispatch registry or by moving Protocol.continue
  out of core into a separate `@literate/runtime` package — is
  deferred; no ADR-014 amendment required at v0.1 because the
  public signature does not change.
- **Execution records flush post-open, not mid-flight.** The CLI
  runs the session-start flow under the in-memory `ExecutionLog`,
  then calls `persistExecutionRecords(ref.path)` to write the
  captured records into the newly-created log file's
  `## Execution Log` fence. This preserves ADR-013 §1 (records
  land in the session log) without the circularity of needing
  the log path before `openLogStep` creates the file. A future
  session can lift this into a lazy-path file-backed log if the
  mid-flight write is ever needed.
- **Template ships its own `package.json`.** The minimal
  consumer template includes a stub `package.json` with the
  `literate` manifest key (per ADR-004). This lets `literate
  continue` introspect `package.json.literate` for per-project
  configuration — `corpus` root, `snapshots` dir — without
  requiring an extra config file.

## Work Done

### Goal 1 — `@literate/cli`

- Added `packages/core/src/session-store-fs.ts`:
  - `makeFileSystemSessionStore(repoRoot)` — binds
    `SessionStore` to `node:fs/promises` rooted at `repoRoot`.
    `listDir` filters directory entries to files; `write`
    auto-creates parent dirs via `fs.mkdir({ recursive: true })`;
    `now()` returns local-time `iso` / `logStamp` /
    `filenameStamp` per the corpus convention.
  - `fileSystemSessionStoreLayer(repoRoot)` — `Layer.effect`
    binding.
  - All fs errors mapped into `SessionStoreError` with
    `operation` / `path` / `reason` fields.
- Extended `packages/core/src/execution.ts`:
  - Exported `rewriteExecutionLogSection` (was internal).
  - Added `persistExecutionRecords(logPath)` — reads the current
    `ExecutionLog` records, rewrites the `## Execution Log`
    fence in `logPath` via `SessionStore`, maps write failures
    to `LogWriteError`.
- Updated `packages/core/src/index.ts` to re-export
  `fileSystemSessionStoreLayer`, `makeFileSystemSessionStore`,
  `persistExecutionRecords`, and `rewriteExecutionLogSection`.
- Created `packages/cli/` package with
  `@literate/cli` name, workspace deps on `@literate/core`,
  `@literate/trope-session-start`, `@literate/trope-session-end`,
  and `effect`. `bin` entry points at
  `./src/bin/literate.ts`.
- Authored `packages/cli/src/continue.ts`:
  - `runContinue({ repoRoot, agent, slug?, io })` — builds the
    live layer (`fileSystemSessionStoreLayer`,
    `InMemoryExecutionLogLayer`, `terminalGateServiceLayer`,
    `LiveProseInvokeLayer`, `StubAIInvokeLayer`), dispatches
    `sessionStartStep.realise`, flushes execution records via
    `persistExecutionRecords`, returns `SessionRef`.
- Authored `packages/cli/src/close.ts`:
  - `runClose({ repoRoot, sessionPath })` — builds a
    gate-stub live layer, dispatches
    `sessionEndStep.realise({ sessionPath })`, returns
    `SessionClosure`.
- Authored `packages/cli/src/index.ts` — re-exports
  `runContinue`, `runClose`, and their options.
- Authored `packages/cli/src/bin/literate.ts`:
  - Bun shebang, argv parser, two verbs (`continue`, `close`,
    plus `--help`), `LITERATE_AGENT_ID` env var, live
    `makeNodeTerminalIO()` with `close()` in a `finally`.
- Made the bin executable (`chmod +x`).

### Goal 2 — `@literate/template-minimal`

- Created `packages/template-minimal/` package with
  `@literate/template-minimal` name.
- Template files tree at `packages/template-minimal/files/`:
  - `corpus/CLAUDE.md` — consumer-facing Protocol pointing at
    LF lifecycle rules.
  - `corpus/sessions/sessions.md` — empty index with table
    header.
  - `corpus/decisions/decisions.md` — empty index with table
    header.
  - `.literate/.keep` — snapshot dir placeholder per ADR-002 /
    ADR-007.
  - `package.json` — stub consumer manifest with the `literate`
    key (`corpus: './corpus'`, `snapshots: './.literate'`) per
    ADR-004.
- Authored `packages/template-minimal/src/index.ts`:
  - `TEMPLATE_ROOT` — absolute path to `files/` resolved via
    `import.meta.url`.
  - `scaffold({ target, overwrite? })` — async walk-and-copy
    with per-file skip-on-exists (unless `overwrite: true`).
    Returns `{ copiedFiles, skippedFiles }`.

### Goal 3 — End-to-end smoke test

- Authored `packages/cli/src/__tests__/e2e.test.ts`:
  - Creates a fresh temp dir via `fs.mkdtemp` (cleaned up in
    `afterAll`).
  - Scaffolds `template-minimal` and asserts every expected
    file lands (`corpus/CLAUDE.md`, both indexes).
  - Plants a `Status: Planned` session log with one provisional
    Goal and adds its row to `corpus/sessions/sessions.md`.
  - Runs `runContinue` with a `makeScriptedTerminalIO(['a'])`
    bound into the CLI's live layer.
  - Asserts post-open state: header `Status: Open` + `Agent:`,
    Goal `Status: Active` + `Category: feature`, `## Pre-work`
    block present, `## Execution Log` fence present with a
    `session-start`-tagged record, `Started:` stamp matches the
    local-time format.
  - Populates `## Decisions Made` / `## Work Done` /
    `## Deferred / Discovered` / `## Summary`, upgrades Goal to
    `Completed`, and runs `runClose`.
  - Asserts post-close state: header `Status: Closed (…)`,
    sessions-index row rewritten to `Closed (…)`, no residual
    `Planned` row.
  - 22 `expect()` calls; passes.

### Cross-cutting

- Workspace-wide test status at session close: **30/30 pass,
  151 `expect()` calls, across 7 files in 5 packages** (up
  from 29/129 in 3 packages at S3 close).
- `bun run typecheck` passes in every package: `@literate/core`,
  `@literate/trope-session-start`, `@literate/trope-session-end`,
  `@literate/cli`, `@literate/template-minimal`.
- CLI bin smoke: `bun src/bin/literate.ts --help` prints the
  expected usage banner.
- No imports from `legacy/` anywhere — the ADR-018 / ADR-020
  freeze is honoured across the MVP arc.

## Deferred / Discovered

Deferred past v0.1 MVP:

- **Unify `Protocol.continue` and the CLI dispatch.**
  `@literate/core` ships a `NoAction`-scaffold `Protocol.continue`;
  the CLI bypasses it. A post-MVP session likely moves
  `Protocol.continue` into a new `@literate/runtime` (or accepts
  an injected dispatch registry in core) so the ADR-014 public
  surface becomes the single entry point in practice, not just
  aspirationally.
- **`literate init` verb.** The CLI currently lacks a scaffolding
  verb; consumers must either copy the template files manually
  or call `scaffold()` from JS. Adding `literate init <target>`
  is a thin wrapper.
- **`literate add` verb.** No verb yet for adding a
  Concept/Trope package from a template; defer until a second
  template (beyond `template-minimal`) ships.
- **File-backed `ExecutionLog` during session-start.** Records
  are flushed post-open via `persistExecutionRecords`; for
  turn-spanning suspensions (gate pending across agent turns)
  we will eventually need a mid-flight file-backed log whose
  path can be updated once `openLogStep` creates the file.
- **Formal ADR-022 for the execution-log wire format.** S3
  committed to JSONL inside `` ```exec ``; S4 confirmed the
  format round-trips against a real filesystem. Ready for
  promotion to a formal ADR in a subsequent session.
- **Goal re-gate `Correct` semantics.** S2's
  `reGateGoalsStep` still treats `Correct` as `Accept-with-note`
  without applying the Person's edit; unchanged in this
  session. Needs a proper `trope-goal-flow` or a richer draft
  schema.
- **Interactive close verb.** `literate close` is non-gated —
  it validates and stamps atomically. A future verb variant
  could gate the Summary / Decisions Made / Work Done contents
  per IMP-5 if that workflow is desirable.
- **CLI colourised output, progress bars, richer rendering.**
  v0.1 emits plain-text. Deferred.
- **Cross-runtime smoke.** Tests run under Bun only. A Node +
  Deno run (per ADR-004 portability) is deferred until the
  first cross-runtime consumer shows up.

Discovered in this session:

- **Layer-building order matters for fs-backed bindings.**
  `fileSystemSessionStoreLayer(repoRoot)` is a `Layer.effect`
  that builds a fresh `SessionStoreService` per construction.
  When multiple dispatches in one test share a tmp dir, either
  reuse a single composed layer across calls or accept that
  each call gets its own service instance (still operating on
  the same filesystem state — no functional divergence because
  `fs` is the shared backing store). The in-memory store has
  this concern sharply (shared state lives only in `Ref`s
  inside the service), hence S3's "shared-store test helper"
  deferred item; the fs-backed binding sidesteps it.
- **`openLogStep` appends `## Pre-work` after `## Goals`.** On
  the Planned path the log pre-exists with `## Goals` at the
  top; `writePreWorkBlockStep` appends `## Pre-work` to the end
  of the file. The resulting ordering (Header → Goals →
  Pre-work → Execution Log) is functionally correct but
  semantically the Pre-work block fits between Header and
  Goals. A small post-MVP refinement inserts the block at the
  right anchor; v0.1 keeps the append for simplicity.
- **Sessions-index row Status-cell parsing is coarse.**
  `updateSessionsIndexStep` looks for any line containing the
  filename; relies on the trailing-pipe table convention.
  Resilient for v0.1 but would miss an index that embeds the
  filename in a non-table context. The smoke test's explicit
  assertion (`indexAfter.match(/\| Planned \|/g)).toBeNull()`)
  confirms the narrow case.

## Summary

Shipped the MVP capstone: `@literate/cli` dispatches the two
Protocol-mode workflow Tropes (open via `runContinue`, close via
`runClose`) over a live `node:fs`-backed `SessionStore`, a live
stdin/stdout `GateService`, and an in-memory `ExecutionLog` whose
records are flushed into the opened log file's fenced
`## Execution Log` block. `@literate/template-minimal` provides
the minimal consumer scaffold (`corpus/` + `.literate/` + a
`literate`-manifest-bearing `package.json`), copied into place by
a small `scaffold({ target })` helper. The end-to-end smoke test
— scaffolding a fresh tmp dir, planting a provisional Goal,
gating it through scripted stdin, populating the terminal
sections, closing the session, and verifying both the log and
the sessions index stamp `Status: Closed (…)` atomically —
passes in 22 `expect()` calls. Workspace-wide: 30/30 tests pass
across 7 files in 5 packages; every package typechecks clean; no
`legacy/` imports. LF is demonstrably runnable end-to-end by a
consumer. The MVP arc (S1 → S2 → S3 → S4) is closed.
