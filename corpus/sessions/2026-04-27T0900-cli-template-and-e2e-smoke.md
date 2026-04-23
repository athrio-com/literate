# Session: 2026-04-27 — CLI, `template-minimal`, and end-to-end smoke

**Date:** 2026-04-27
**Started:** —
**Status:** Planned
**Chapter:** — (no chapter yet)
**Agent:** —
**Planned by:** corpus/sessions/2026-04-23T1600-unify-monorepo-layout.md
**Depends on:** corpus/sessions/2026-04-26T0900-live-services-and-file-execution-log.md

> **Provisional.** The Goals below are drafts copied from the
> parent session's Plan entry. They land authoritatively only
> when this session opens and each Goal is re-presented to the
> Person for Accept / Correct / Clarify / Reject (IMP-1.6).

## Goals

### Goal 1 — `@literate/cli` as the `Protocol.continue` entry point

**Status:** (provisional)
**Category:** (provisional)
**Topic:** Author the v0.1 CLI. Single command
(`literate continue [repoRoot]`) that resolves the repo root,
constructs the live Layer (GateService + FileBackedExecutionLog
+ stub AIInvoke for v0.1), calls `Protocol.continue`, renders the
Suspend frame (gate prompt, AI-pending message, external-pending
message) to the terminal, and re-enters on resume. The `init`
and `add` verbs are deferred past the MVP.

**Upstream:**

- ADR-014 — `Protocol.continue` entry point.
- S1 metalanguage, S2 workflow Tropes, S3 live services.
- Legacy `legacy/packages/cli/` — reference only for arg-parsing
  patterns; no imports.

**Acceptance:**

- `packages/cli/` exists; `literate continue .` in a scratch repo
  opens a session.
- CLI smoke test: spawn under a scripted stdin/stdout harness,
  confirm a full spontaneous session (open → gate Goal → close)
  completes and writes a valid session log.

### Goal 2 — `@literate/template-minimal` as the scaffold

**Status:** (provisional)
**Category:** (provisional)
**Topic:** Rebuild the minimal consumer template on the rewrite
algebra. Contains `corpus/`, `corpus/CLAUDE.md` (pointing at the
consumer's own Protocol), the consumer's `.literate/` snapshot
directory (per ADR-002 / ADR-007 — LF's repo lacks `.literate/`
but consumer repos have it), and a minimal `package.json` with
the `literate` manifest key.

**Upstream:**

- ADR-002 (corpus → src → `.literate/`), ADR-007 (LF has no
  `.literate/`), ADR-008 (exhaustive single-realisation).
- Legacy `legacy/packages/template-minimal/` — reference only.

**Acceptance:**

- `packages/template-minimal/` exists; scaffolded files match
  a documented minimal consumer layout.
- `literate continue` run in the scaffolded template reaches
  the gate without errors.

### Goal 3 — End-to-end smoke test as the MVP acceptance gate

**Status:** (provisional)
**Category:** (provisional)
**Topic:** Single integration test that: (1) scaffolds
`template-minimal` into a temp directory, (2) runs
`literate continue` under a scripted stdin that Accepts a single
Goal, (3) closes the session via the session-end Trope, (4)
asserts the session log has the expected Status, Summary, and
Execution Log contents. This test is the *MVP done* marker.

**Upstream:**

- All prior sessions' acceptance.
- ADR-013 replay determinism — a second run over the resulting
  session log must be a no-op.

**Acceptance:**

- Integration test lives under `packages/cli/src/__tests__/`
  or a dedicated `packages/e2e/` package; passes.
- The MVP arc's capstone: at close of this session, LF is
  demonstrably runnable end-to-end by a consumer.
