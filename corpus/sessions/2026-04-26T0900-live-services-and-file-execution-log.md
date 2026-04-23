# Session: 2026-04-26 — Live services and file-backed ExecutionLog

**Date:** 2026-04-26
**Started:** —
**Status:** Planned
**Chapter:** — (no chapter yet)
**Agent:** —
**Planned by:** corpus/sessions/2026-04-23T1600-unify-monorepo-layout.md
**Depends on:** corpus/sessions/2026-04-25T0900-workflow-tropes-session-lifecycle.md

> **Provisional.** The Goals below are drafts copied from the
> parent session's Plan entry. They land authoritatively only
> when this session opens and each Goal is re-presented to the
> Person for Accept / Correct / Clarify / Reject (IMP-1.6).

## Goals

### Goal 1 — Interactive `GateService` implementation

**Status:** (provisional)
**Category:** (provisional)
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

**Status:** (provisional)
**Category:** (provisional)
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
