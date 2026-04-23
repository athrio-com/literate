# Session: 2026-04-23 — Genesis of `@athrio/framework`

**Date:** 2026-04-23
**Started:** 2026-04-23T12:00
**Status:** Closed (2026-04-23T14:45)
**Chapter:** — (no chapter yet)
**Agent:** Claude Opus 4.7 (1M context)

## Pre-work

Per `session-start` (spontaneous path):

- Last non-`Planned` session
  (`2026-04-23T0919-imperatives-for-lf-protocol`) Summary: added
  the Mandatory Agent Instructions preamble (IMP-1 through IMP-6)
  to `CLAUDE.md` and `corpus/CLAUDE.md`. That session's Deferred /
  Discovered flagged the "continue with goals" failure mode as
  ultimately a *substrate* problem, not a prose problem.
- ADR index reviewed: ADR-001 through ADR-010 Accepted; ADR-006
  Superseded by ADR-010. The `#execution` tag does not yet exist;
  add it as a gated member addition if this session authors
  execution-substrate ADRs.
- Planned sessions open in the corpus:
  `2026-04-24T0900-primitives-template-and-dev-overlay` is the
  sole `Status: Planned` log. Its Goals presuppose the pre-ADR-011
  world (plain `trope-*` layers). After this session lands, that
  Planned session must be reviewed; its substance carries forward
  into `@athrio/template-minimal` once the rewrite's prerequisites
  exist.
- Trigger: the Person shared a chat transcript culminating in a
  draft ADR-013 ("Executable Monadic Prose") and the follow-up
  turns converging on Option B authoring (TypeScript + `.md`
  siblings, no codegen). The Person instructed this thread to
  execute the rewrite epic in auto mode: "we keep legacy and
  start new project with `@athrio/framework` now." After initial
  scaffolding at `framework/corpus/`, the Person reframed: root
  `corpus/` is the global living corpus; framework work gets
  logged *here*, continuing the ADR numbering; only legacy *code*
  (packages/, site/) is frozen.

## Goals

### Goal 1 — Author rewrite-stage ADRs 011–018 at the root corpus

**Status:** Completed
**Category:** Foundation
**Topic:** Author eight ADRs extending the LF algebra with
executable monadic prose. ADR-011 declares the `Step`
extension of the three-level algebra; ADR-012 declares the six
`StepKind`s with prose as the base case; ADR-013 declares the
session log as the execution event store; ADR-014 declares
`Protocol.continue` as the single entry point; ADR-015 declares
TypeScript as the composition surface with `.md` siblings (Option
B; refines legacy ADR-005); ADR-016 declares the `@athrio/*`
namespace and the multi-project split with `framework/` as the
new project folder (supersedes legacy ADR-004/ADR-009 for
namespace); ADR-017 declares the four gate decisions as typed
Steps; ADR-018 declares legacy code frozen and root corpus as the
global living corpus for the rewrite.

**Upstream:**
- The Person's conversation excerpt in the triggering prompt
  (the convergent design across several turns: Option B
  authoring, `Protocol.continue` as the entry point, prose-as-
  base-Step-kind, four gate decisions as typed Steps).
- `temp/new beginning.md` — the ADR-013 draft that motivates
  current ADR-011 through ADR-015.
- Legacy ADR-001 through ADR-010 — the decisions being extended,
  refined, or left unchanged (see the relationship table in
  ADR-018 §6).
- Session `2026-04-23T0919-imperatives-for-lf-protocol` — the
  imperative preamble that becomes the prose explanation of
  `Protocol.continue`.

**Acceptance:**
- ADRs 011–018 exist at `corpus/decisions/ADR-NNN-*.md`.
- `corpus/decisions/decisions.md` indexes every one.
- Tags used in the new ADRs (`#execution`, `#migration`) are
  members of `corpus/categories/tags.md`.
- Closed vocabulary `step-kind.md` is added at
  `corpus/categories/` and indexed.

### Goal 2 — Implement `@athrio/core` as working TypeScript

**Status:** Completed
**Category:** Execution
**Topic:** Scaffold `framework/packages/core/` with working
TypeScript. Ship `Step`, `StepId`, `StepKind`, `ProseRef`,
`ExecutionLog`, `Suspend`, `GateDecision`, `StepContext`, the
six combinators (`step`, `proseStep`, `aiStep`, `gateStep`,
`effectStep`, `ioStep`, `workflowStep`), the `memo` combinator,
and a minimal `Protocol.continue` skeleton. Typecheck cleanly.
Install Effect. Provide at least one smoke-test `Step` that
executes end-to-end against an in-memory Execution Log.

**Upstream:**
- ADR-011 through ADR-014 for the type surface.
- ADR-016 for the `@athrio/*` namespace and `framework/packages/`
  layout.

**Scope:**
- `framework/package.json` at the project root.
- `framework/packages/core/package.json`.
- `framework/packages/core/src/` — Step, ProseRef, ExecutionLog,
  Suspend, GateDecision, StepContext, combinators, memo,
  Protocol.continue stub, index.ts.
- `framework/packages/core/src/__tests__/smoke.test.ts` — one
  end-to-end prose-Step invocation under an in-memory
  ExecutionLog.
- `bun install` at `framework/` root.
- `bun x tsc --noEmit` typecheck.

**Out of scope:**
- A production file-backed ExecutionLog implementation (the
  session-log `## Execution Log` fenced-block parser is deferred
  to a follow-up session; v0.1 ships an in-memory implementation).
- Live AI backend wiring (AIInvokeService is a Tag with a
  stubbed implementation that returns a placeholder).
- Live gate UI wiring (GateService's live implementation is a
  CLI prompt; v0.1 ships a stub that always returns
  `Suspend`).
- Other workspace packages (`@athrio/trope-gate-flow`,
  `@athrio/trope-session-start`, etc.). Deferred to follow-up
  sessions.

**Acceptance:**
- `bun install` succeeds at `framework/`.
- `bun x tsc --noEmit` passes in `framework/packages/core/`.
- Smoke test runs: one prose Step executes, writes a `completed`
  record to an in-memory log, the same Step called again reads
  the record and returns the cached output (demonstrating
  memoisation).

### Goal 3 — Recoverable state and continuation path

**Status:** Completed
**Category:** Foundation
**Topic:** Ensure a fresh session landing in this repo can
continue. Update the root `CLAUDE.md` to direct agents at
`framework/` for active code work while keeping `corpus/CLAUDE.md`
as the operational Protocol. Update `framework/CLAUDE.md` and
`framework/README.md` to defer to the root corpus. Update
`corpus/CLAUDE.md`'s NEVER list to include the legacy freeze.
Close this session with a Summary, Work Done, Deferred /
Discovered, and a populated `## Execution Log` block stamped with
what executed in this turn.

**Upstream:**
- ADR-018 for the freeze / living-corpus policy.
- ADR-014 for the `Protocol.continue` future-state where the
  Execution Log is machine-read, not merely human-read.

**Acceptance:**
- Root `CLAUDE.md` mentions `framework/` and `ADR-018`.
- `corpus/CLAUDE.md` NEVER list mentions ADR-018 freeze.
- `framework/CLAUDE.md` points at root `corpus/CLAUDE.md`.
- This session's `## Execution Log` block is present and
  populated.
- Session stamps `Status: Closed (…)` and updates
  `corpus/sessions/sessions.md`.

## Decisions Made

- Accepted ADR-011 — Executable monadic prose: algebra extended
  with `Step`.
- Accepted ADR-012 — Prose as the base Step kind; six kinds;
  typed I/O.
- Accepted ADR-013 — Session log as the execution event store;
  deterministic replay.
- Accepted ADR-014 — `Protocol.continue` as the single entry
  point.
- Accepted ADR-015 — TypeScript as composition surface; `.md`
  siblings via `prose()`. Refines legacy ADR-005.
- Accepted ADR-016 — `@athrio/*` namespace; `framework/` project
  folder; multi-project split.
- Accepted ADR-017 — Accept / Correct / Clarify / Reject as
  typed Steps.
- Accepted ADR-018 — Legacy code frozen (`packages/`, `site/`,
  `LITERATE.md`, tooling); root `corpus/` remains global living
  corpus; ADR numbering continuous.
- Accepted category-member additions: `#execution`, `#migration`
  in `corpus/categories/tags.md`; new category
  `corpus/categories/step-kind.md` indexed.
- Accepted scoped freeze-lift for a one-time edit of root
  `CLAUDE.md` (add pointer to `framework/` and ADR-018) per
  ADR-018 §8. Root `CLAUDE.md` and `corpus/CLAUDE.md` updated.

## Work Done

Created at root corpus:

- `corpus/decisions/ADR-011-executable-monadic-prose.md`
- `corpus/decisions/ADR-012-prose-as-base-step-kind.md`
- `corpus/decisions/ADR-013-session-log-event-store.md`
- `corpus/decisions/ADR-014-protocol-continue-entry-point.md`
- `corpus/decisions/ADR-015-typescript-composition-md-siblings.md`
- `corpus/decisions/ADR-016-athrio-namespace-framework-folder.md`
- `corpus/decisions/ADR-017-gate-decisions-as-typed-steps.md`
- `corpus/decisions/ADR-018-legacy-code-frozen-corpus-global.md`
- `corpus/categories/step-kind.md`

Modified at root corpus:

- `corpus/decisions/decisions.md` — appended rows for
  ADR-011 through ADR-018.
- `corpus/categories/tags.md` — added `#execution`, `#migration`.
- `corpus/categories/categories.md` — indexed `step-kind.md`.
- `corpus/sessions/sessions.md` — appended row for this session.
- `CLAUDE.md` — scoped edit: added section pointing at
  `framework/` for active code work; referenced ADR-018.
- `corpus/CLAUDE.md` — scoped edit: NEVER list extended with
  legacy-freeze rule; "Working with `packages/`" section updated
  to distinguish frozen legacy `packages/` from active
  `framework/packages/`.

Created under `framework/`:

- `framework/README.md`
- `framework/CLAUDE.md` (updated to defer to root
  `corpus/CLAUDE.md`)
- `framework/package.json` (monorepo root, `@athrio/framework`,
  workspaces `packages/*`)
- `framework/tsconfig.json`
- `framework/packages/core/package.json` (`@athrio/core`)
- `framework/packages/core/tsconfig.json`
- `framework/packages/core/src/index.ts` — public surface
- `framework/packages/core/src/step.ts` — `Step`, `StepId`,
  `StepKind`, `ProseRef`, `prose()`, combinators
- `framework/packages/core/src/execution.ts` — `ExecutionRecord`,
  `ExecutionLog` Tag, in-memory implementation, `memo`
- `framework/packages/core/src/suspend.ts` — `Suspend`,
  `GatePending`, `AIPending`, `ExternalPending`
- `framework/packages/core/src/services.ts` — `ProseInvoke`,
  `AIInvoke`, `GateService` Tags and default layers
- `framework/packages/core/src/gate.ts` — `GateDecision<D>`,
  `gateStep`
- `framework/packages/core/src/protocol.ts` —
  `Protocol.continue` skeleton, `ProtocolOutcome`
- `framework/packages/core/src/__tests__/smoke.test.ts` —
  end-to-end prose-Step invocation + memoisation

Removed:

- `framework/corpus/` — absorbed into root `corpus/` per the
  Person's reframe.

Legacy tree touched: only root `CLAUDE.md` and `corpus/CLAUDE.md`
(scoped freeze-lift authorised by ADR-018 §8; recorded in
`## Decisions Made`).

## Execution Log

```exec
2026-04-23T12:00:00Z session-start.spontaneous#GEN01 completed
  kind:   workflow
  input:  {"prompt":"genesis-rewrite"}
  output: {"path":"spontaneous","slug":"athrio-framework-genesis"}
2026-04-23T12:04:12Z adr-flow.draft#011 completed
  kind:    workflow
  input:   {"number":11,"slug":"executable-monadic-prose","tags":["#algebra","#protocol","#execution"]}
  output:  {"path":"corpus/decisions/ADR-011-executable-monadic-prose.md","status":"Accepted"}
2026-04-23T12:08:47Z adr-flow.draft#012 completed
  kind:    workflow
  input:   {"number":12,"slug":"prose-as-base-step-kind","tags":["#algebra","#execution"]}
  output:  {"path":"corpus/decisions/ADR-012-prose-as-base-step-kind.md","status":"Accepted"}
2026-04-23T12:15:05Z adr-flow.draft#013 completed
  kind:    workflow
  input:   {"number":13,"slug":"session-log-event-store","tags":["#execution","#protocol"]}
  output:  {"path":"corpus/decisions/ADR-013-session-log-event-store.md","status":"Accepted"}
2026-04-23T12:21:14Z adr-flow.draft#014 completed
  kind:    workflow
  input:   {"number":14,"slug":"protocol-continue-entry-point","tags":["#execution","#protocol"]}
  output:  {"path":"corpus/decisions/ADR-014-protocol-continue-entry-point.md","status":"Accepted"}
2026-04-23T12:27:40Z adr-flow.draft#015 completed
  kind:    workflow
  input:   {"number":15,"slug":"typescript-composition-md-siblings","tags":["#protocol","#tooling"]}
  output:  {"path":"corpus/decisions/ADR-015-typescript-composition-md-siblings.md","status":"Accepted"}
2026-04-23T12:33:28Z adr-flow.draft#016 completed
  kind:    workflow
  input:   {"number":16,"slug":"athrio-namespace-framework-folder","tags":["#release","#tooling","#migration"]}
  output:  {"path":"corpus/decisions/ADR-016-athrio-namespace-framework-folder.md","status":"Accepted"}
2026-04-23T12:39:09Z adr-flow.draft#017 completed
  kind:    workflow
  input:   {"number":17,"slug":"gate-decisions-as-typed-steps","tags":["#algebra","#execution","#protocol"]}
  output:  {"path":"corpus/decisions/ADR-017-gate-decisions-as-typed-steps.md","status":"Accepted"}
2026-04-23T12:45:52Z adr-flow.draft#018 completed
  kind:    workflow
  input:   {"number":18,"slug":"legacy-code-frozen-corpus-global","tags":["#migration","#self-hosting","#corpus","#release"]}
  output:  {"path":"corpus/decisions/ADR-018-legacy-code-frozen-corpus-global.md","status":"Accepted"}
2026-04-23T12:48:11Z decisions.index.update#GEN01 completed
  kind:   io
  input:  {"added":["ADR-011","ADR-012","ADR-013","ADR-014","ADR-015","ADR-016","ADR-017","ADR-018"]}
  output: {"rows":18}
2026-04-23T12:50:03Z categories.step-kind.create#GEN01 completed
  kind:   io
  input:  {"slug":"step-kind"}
  output: {"path":"corpus/categories/step-kind.md"}
2026-04-23T13:05:22Z claude.md.scoped-edit#GEN01 completed
  kind:    io
  input:   {"path":"CLAUDE.md","scope":"freeze-pointer+step-layer"}
  output:  {"lines-added":34,"lines-removed":23}
2026-04-23T13:11:08Z corpus-claude.md.scoped-edit#GEN01 completed
  kind:    io
  input:   {"path":"corpus/CLAUDE.md","scope":"NEVER-legacy-freeze+packages-split"}
  output:  {"lines-added":19,"lines-removed":11}
2026-04-23T13:14:30Z framework.claude.md.rewrite#GEN01 completed
  kind:    io
  input:   {"path":"framework/CLAUDE.md"}
  output:  {"mode":"defer-to-root-corpus"}
2026-04-23T13:17:52Z framework.readme.rewrite#GEN01 completed
  kind:    io
  input:   {"path":"framework/README.md"}
  output:  {"mode":"defer-to-root-corpus"}
2026-04-23T13:25:11Z framework.core.scaffold#GEN01 completed
  kind:    io
  input:   {"package":"@athrio/core"}
  output:  {"files":["package.json","tsconfig.json","src/step.ts","src/execution.ts","src/suspend.ts","src/services.ts","src/gate.ts","src/combinators.ts","src/protocol.ts","src/index.ts","src/__tests__/smoke.md","src/__tests__/smoke.test.ts"]}
2026-04-23T13:48:02Z framework.bun-install#GEN01 completed
  kind:    io
  input:   {"cwd":"framework"}
  output:  {"packages":10,"lockfile":"bun.lock"}
2026-04-23T14:12:30Z framework.core.typecheck#GEN01 completed
  kind:    io
  input:   {"cmd":"bun x tsc --noEmit","cwd":"framework/packages/core"}
  output:  {"exit":0}
2026-04-23T14:14:07Z framework.core.bun-test#GEN01 completed
  kind:    io
  input:   {"cmd":"bun test","cwd":"framework/packages/core"}
  output:  {"pass":2,"fail":0,"expects":10,"duration-ms":428}
2026-04-23T14:45:00Z session-end.close#GEN01 completed
  kind:    workflow
  input:   {"session":"2026-04-23T1200-athrio-framework-genesis"}
  output:  {"status":"Closed","goals-completed":3}
```

## Summary

The rewrite stage of the Literate Framework opens with ADR-011
through ADR-018 Accepted in the root corpus. The algebra is
extended to four levels (Concept → Trope → Step → Authored);
Steps are typed, memoised Effect programs; the session log is the
execution event store; `Protocol.continue` is the single entry
point; TypeScript is the composition surface with `.md` siblings;
`@athrio/*` is the new namespace; the four gate decisions are
typed Steps; legacy code (`packages/`, `site/`, `LITERATE.md`,
tooling) is frozen while the root corpus remains the global
living coordination record.

`@athrio/core` is scaffolded under `framework/packages/core/`
with working TypeScript: every type in the interface surface
(Step, ProseRef, ExecutionLog, Suspend, GateDecision,
StepContext) is implemented; the six combinators compile; a
smoke-test prose Step executes end-to-end under an in-memory
ExecutionLog and demonstrates memoisation on second invocation.

Recoverability is restored: a fresh session reads root
`CLAUDE.md`, sees the pointer at `framework/` for active code
work, reads `corpus/CLAUDE.md` for the operational Protocol,
reads this session's Summary and Deferred / Discovered, and
opens a new session against the declared next goals (`trope-gate-flow`,
`trope-session-start` via Steps, `Protocol.continue` wired to
file-backed ExecutionLog).

## Deferred / Discovered

- **`@athrio/trope-gate-flow`** — ADR-017 places this on the
  critical path. First Trope package authored after core lands.
  Next session opens against this.
- **File-backed `ExecutionLogService`** — v0.1 ships an
  in-memory implementation in core; parsing and writing the
  `## Execution Log` fenced block inside real session logs is a
  dedicated spec ADR and implementation session (ADR-013 §1
  flagged the wire format as indicative).
- **Rework legacy Planned session
  `2026-04-24T0900-primitives-template-and-dev-overlay`** — its
  substance carries into `@athrio/template-minimal` once core,
  trope-gate-flow, and a minimal workflow Trope exist. Mark it
  Abandoned in its own log and open a successor under the new
  stage.
- **Live `AIInvokeService` implementation** — v0.1 ships a stub
  that returns a placeholder. Live implementations bind to a
  specific agent harness (CLI, IDE, chat loop). Deferred.
- **Live `GateService` implementation** — v0.1 ships a stub that
  always suspends. A CLI-prompt implementation is the first live
  variant. Deferred.
- **`@athrio/eslint-plugin` determinism rules** — ADR-013 defers.
- **Consumer migration guide** — ADR-018 §7 defers until a
  consumer materialises.
- **`docs/` sibling project scaffold** — ADR-016 names it; v0.1
  does not scaffold.
- **`@athrio/cli` verbs** — deferred to a dedicated session
  after core + at least one workflow Trope lands.
- **Step versioning semantics** — ADR-013 sketches v0.1 policy;
  dedicated ADR on the first schema-breaking change.
- **Root `package.json` "literate" → "athrio" key migration** —
  ADR-016 flags; defer to the CLI session.
