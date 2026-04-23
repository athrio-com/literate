# Session: 2026-04-25 — Workflow Tropes: `trope-session-start` and `trope-session-end`

**Date:** 2026-04-25
**Started:** —
**Status:** Planned
**Chapter:** — (no chapter yet)
**Agent:** —
**Planned by:** corpus/sessions/2026-04-23T1600-unify-monorepo-layout.md
**Depends on:** corpus/sessions/2026-04-24T0900-core-metalanguage.md

> **Provisional.** The Goals below are drafts copied from the
> parent session's Plan entry. They land authoritatively only
> when this session opens and each Goal is re-presented to the
> Person for Accept / Correct / Clarify / Reject (IMP-1.6).

## Goals

### Goal 1 — Author `@literate/trope-session-start` as an executable workflow Trope

**Status:** (provisional)
**Category:** (provisional)
**Topic:** Re-author the session-start procedure (IMP-1) as a
`workflowStep`-composed Trope on the Step substrate. The legacy
prose at `legacy/packages/trope-session-start/src/prose.mdx` is
the authoritative procedural description; this session translates
its steps (start-path detection, orphan handling, pre-work
surfacing, goal gating) into a composition of `prose`, `effect`,
`gate`, and `workflow` Steps, with typed inputs (repo root,
agent id) and a typed output (opened session reference).

**Upstream:**

- Legacy `legacy/packages/trope-session-start/src/prose.mdx` —
  procedural authority for IMP-1.
- `corpus/CLAUDE.md#IMP-1` — the inline imperative version that
  the framework implementation must satisfy.
- `@literate/core` metalanguage (S1) — Concept/Trope types.
- ADR-014 — the `Protocol.continue` entry point this Trope is
  dispatched from.
- ADR-017 — gate decisions as typed Steps.

**Acceptance:**

- `packages/trope-session-start/` package exists, is part of
  the workspace, and exposes `sessionStartTrope` as a `Trope<…>`.
- Prose for the Trope lives in sibling `.md` files per ADR-015.
- Unit tests exercise the orphan-detection, spontaneous-start,
  and planned-start branches under stub services.
- No imports from `legacy/`.

### Goal 2 — Author `@literate/trope-session-end` as an executable workflow Trope

**Status:** (provisional)
**Category:** (provisional)
**Topic:** Re-author the session-end procedure (IMP-5) on the
Step substrate. The Trope validates that every Goal carries a
terminal Status, every Plan entry is `Realised by` / `Planned` /
`Abandoned`, and the session has a populated Summary. Stamps
`Status: Closed (YYYY-MM-DDTHH:MM)` atomically and updates the
sessions index.

**Upstream:**

- Legacy `legacy/packages/trope-session-end/src/prose.mdx` —
  procedural authority for IMP-5.
- `corpus/CLAUDE.md#IMP-5` — inline imperatives.
- S1 core metalanguage; ADR-013 event-store semantics.

**Acceptance:**

- `packages/trope-session-end/` exists; exposes
  `sessionEndTrope`; prose in sibling `.md`.
- Unit tests cover happy-path close plus validation failures
  (missing Summary, Active Goal at close).
- No imports from `legacy/`.

**Notes:**

- The two Tropes together are the minimum dispatch surface
  `Protocol.continue` needs in S4 for an end-to-end session
  run. Other workflow Tropes (`trope-gate-flow`,
  `trope-goal-flow`, `trope-adr-flow`) are deferred past the MVP.
