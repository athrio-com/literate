# Session: 2026-04-23 — Imperatives for LF Protocol

**Date:** 2026-04-23
**Started:** 2026-04-23T09:19
**Status:** Closed (2026-04-23T09:25)
**Chapter:** — (no chapter yet)
**Agent:** Claude Opus 4.7 (1M context)

## Pre-work

Per `session-start` (spontaneous path; pivoted from a paused planned
start of session B):

- Last non-`Planned` session
  (`2026-04-23T0818-planned-sessions-and-arc`) Summary: extended the
  session lifecycle with `Planned` status and `## Plan` section.
- Deferred / Discovered carried forward (still open): Effect Layer
  I/O wiring, `literate check` schema validation, orphan force-push
  held. None directly upstream to this Goal.
- ADR index reviewed: ADR-005 (prose-first MDX + Schema), ADR-009
  (Tropes as packages), ADR-010 (Concepts unify Terms) frame the
  Concept-vs-CLAUDE.md choice for where Imperatives live.
- Open sessions: session B
  (`2026-04-24T0900-primitives-template-and-dev-overlay`) was
  provisionally opened by another agent thread and reverted to
  `Planned` (see that log's pause note). Session B remains Planned;
  this spontaneous session takes priority.
- Other Planned sessions: B (depends on this fix; should not be
  started until Imperatives land), C / D / E / F downstream of B.
- Trigger: the Person opened a fresh Claude thread and said "Let's
  continue with goals." The Opus instance there did not detect
  there were Planned sessions awaiting a planned-start, did not
  read `packages/trope-session-start/src/prose.mdx`, and instead
  spent ~10 tool calls investigating the repo before stamping
  session B `Open` without re-gating its Goals. Root cause: LF's
  agent-facing entry points (`CLAUDE.md` at the root and
  `corpus/CLAUDE.md`) describe the lifecycle but do not *command*
  the agent at the top of the file. A fresh agent has no
  unmissable instruction set to execute on session start. The
  athrio repo at `/Users/yegor/Projects/Coding/athrio-com/athrio/CLAUDE.md`
  uses an explicit "Mandatory Agent Instructions" preamble with
  numbered imperatives ("ALWAYS START SESSION", "DURING the
  session — on every X", "AT SESSION END", "NEVER"); the Person
  cited this as the reference and asked LF to be fixed
  accordingly.

## Goals

### Goal 1 — Author Imperatives in LF agent-entry files

**Status:** Completed
**Category:** process
**Topic:** Add an explicit, top-of-file Imperatives preamble to
LF's agent-entry surface so that any fresh agent reading the
repo knows, before doing anything else, which files to read and
which procedure to execute. Two surfaces: the maintainer
entry-point at `CLAUDE.md` (root) and the operational rules at
`corpus/CLAUDE.md`. Modeled on athrio's "Mandatory Agent
Instructions" pattern (numbered imperative blocks for SESSION
START / DURING / END / NEVER), adapted to LF's structure
(planned-vs-spontaneous start path; Concept-as-architectural-
canon; Tropes-as-typed-glue; the trope-session-start prose as
the canonical lifecycle source of truth).

**Upstream:**
- The athrio reference at
  `/Users/yegor/Projects/Coding/athrio-com/athrio/CLAUDE.md`
  (lines 10–203, "Mandatory Agent Instructions" through
  "NEVER").
- LF's own `packages/trope-session-start/src/prose.mdx` —
  contains the start-procedure but is unreachable from a fresh
  agent's first-read order.
- `packages/trope-session-end/src/prose.mdx` — likewise the
  end-procedure.
- The session 2026-04-23T0818 lifecycle update (Planned status,
  ## Plan section, planned-start path) — the new procedure is
  what the Imperatives need to make mechanical.
- The Person's framing: "LF Protocol defines Imperatives which
  guide Agent."

**Scope:**
- Rewrite the top of `corpus/CLAUDE.md` with a
  "## Mandatory Agent Instructions" section containing four
  imperative blocks:
  - **AT SESSION START** — numbered procedure with branches for
    spontaneous start, planned start, and the "continue with
    goals" / fresh-thread case (detect `Status: Open` orphans;
    detect ready-to-start `Planned` sessions; ask the Person
    when ambiguous).
  - **DURING the session — on every architectural decision** —
    Concept-update path vs ADR path (per the Person's "Concept
    is its ADR" rule); gating procedure; `Status:` updates on
    other ADRs only after Accept of the current one.
  - **DURING the session — on every material scope change** —
    new Goal entry, gate, supersede prior Goal atomically.
  - **AT SESSION END** — `session-end` Trope steps including
    Plan-entry validation; Summary; index update.
- Add a "## NEVER" section at the bottom of the imperatives
  consolidating the existing NEVER bullets from `corpus/CLAUDE.md`
  with new ones surfaced by the discovered gap (e.g. "Never
  open a `Planned` session without re-gating its provisional
  Goals", "Never stamp `Status: Open` on a planned-path session
  before reading and following the trope-session-start
  procedure").
- Update the root `CLAUDE.md` to (a) keep its short orientation
  role, (b) prepend a brief "Before any action" imperative
  block that points at `corpus/CLAUDE.md`'s Mandatory Agent
  Instructions and tells the agent which session-start path
  applies given the repo state. Avoid duplicating the full
  imperatives — point to them.
- The imperatives reference the trope prose as the canonical
  source for any deep procedure (so corpus/CLAUDE.md remains
  light) but contain enough mechanical steps that a fresh agent
  can execute without first reading the trope packages.

**Out of scope:**
- A `concept-imperatives` or new Concept package. The Person's
  athrio reference inlines imperatives in CLAUDE.md; no
  evidence we need a higher-order primitive yet. (If a future
  consumer project demands an imperatives-as-Concept treatment,
  open a new session.)
- A `scripts/session-init.sh` or `session-end.sh` shell wrapper.
  Useful, but a separate concern; defer to a follow-up session
  (carry to Deferred / Discovered).
- Re-authoring `LITERATE.md` (the framework Protocol consumers
  read) to include imperatives. The product surface is governed
  by Concept/Trope prose, which already carries the mechanics;
  the imperatives gap is on the *maintainer* / *agent* side.
  May be revisited if consumer projects discover the same gap.

**Acceptance:**
- `corpus/CLAUDE.md` opens with an unmissable
  "## Mandatory Agent Instructions" section before any other
  content (apart from the title and one-line caption).
- A fresh agent reading only `CLAUDE.md` and `corpus/CLAUDE.md`
  has a complete, numbered procedure for: opening any session
  (spontaneous or planned); responding to "continue with
  goals" without investigating the repo; gating Concepts /
  ADRs / specs; ending a session with valid Plan-entry state.
- The "NEVER" block lists at least the additions surfaced by
  this session's discovered gap.
- Root `CLAUDE.md` has a "Before any action" imperative
  pointer that directs the agent to `corpus/CLAUDE.md`'s
  Mandatory Agent Instructions; orientation prose is preserved
  but no longer the first thing the agent reads.
- The imperatives are consistent with
  `packages/trope-session-start/src/prose.mdx` and
  `packages/trope-session-end/src/prose.mdx` (cross-checked).
- A dry-run of "given the current repo state, what should an
  agent do?" produces the unique correct answer:
  *the next planned-start is session B; do not open spontaneously;
  re-gate B's three provisional Goals before any work*.

**Notes:**
- This Goal addresses a *meta* gap (agent guidance), not a
  Concept revision. Per CLAUDE.md mutability, `corpus/CLAUDE.md`
  is "mutable; new authorial rules encoded in CLAUDE.md
  originate in a gated ADR upstream" (athrio's framing). The
  Goal's Acceptance *is* the gate.
- The "continue with goals" case is specifically called out
  because it was the discovered failure mode. Future "ambiguous
  startup" prompts should also be enumerated as the
  imperatives encounter them in practice.

## Decisions Made

- **Operational rules: imperative agent preamble adopted in
  `corpus/CLAUDE.md`.** Added a new top-of-file section
  `## Mandatory Agent Instructions` with five numbered imperative
  blocks (IMP-1 SESSION START with path detection, IMP-2 DURING
  on architectural decisions with Concept-vs-ADR paths, IMP-3
  DURING on material scope changes, IMP-4 DURING optional Plan
  authoring, IMP-5 SESSION END with Plan-entry validation) plus
  IMP-6 NEVER and a `Goal shape` template. Modeled on athrio's
  pattern. The lower `## NEVER` section is consolidated into IMP-6
  with a pointer.
- **Operational rules: imperative pointer added to root
  `CLAUDE.md`.** New `## Before any action — Mandatory Agent
  Instructions` section directs the agent to `corpus/CLAUDE.md`
  IMP-1 before any tool calls, with a specific note that vague
  continuation prompts are planned-start triggers.
- **Trope prose: planned-vs-spontaneous path detection added.**
  `packages/trope-session-start/src/prose.mdx` gains a `## Path
  detection` section above the two start paths and an explicit
  reference to IMP-1 as the imperative wrapper. Spontaneous
  step-list reordered so step 6 (gating) is the last and the
  "do not proceed past a Goal until Accepted" rule is explicit.
  Planned step 5 collapsed accordingly to avoid duplication.

## Work Done

- Reverted `corpus/sessions/2026-04-24T0900-primitives-template-and-dev-overlay.md`
  from `Status: Open` (set provisionally by a separate thread on
  a misread of "continue with goals") to `Status: Planned`;
  added a pause note explaining the reason and pointing at this
  fix session. Header `Date`, `Started`, `Agent` reset to the
  Planned shape. Pre-work block preserved verbatim.
- Created
  `corpus/sessions/2026-04-23T0919-imperatives-for-lf-protocol.md`
  (this log) and authored Goal 1.
- Edited `corpus/CLAUDE.md`: prepended the
  `## Mandatory Agent Instructions` section with IMP-1 through
  IMP-6 and the `Goal shape` template; consolidated the lower
  `## NEVER` into a pointer.
- Edited `CLAUDE.md` (repo root): prepended the
  `## Before any action — Mandatory Agent Instructions` section
  pointing at IMP-1 in `corpus/CLAUDE.md`.
- Edited `packages/trope-session-start/src/prose.mdx`: added the
  `## Path detection` section, the IMP-1 cross-reference,
  reordered the spontaneous step list, tightened the planned
  step 5 to avoid duplication.
- Updated `corpus/sessions/sessions.md`: added the row for this
  session; reverted the row for session B's status to `Planned`.
- Ran `bun run --filter "@literate/trope-session-start"
  typecheck` — clean (no schema change; prose-only edit).

## Summary

Closed a discovered LF workflow gap: agents starting a fresh
thread had no unmissable, top-of-file imperative procedure for
detecting the right session-start path, and so a separate Opus
thread spent ten exploratory tool calls before stamping a planned
session `Open` without re-gating its Goals. Adopted athrio's
"Mandatory Agent Instructions" preamble pattern, adapted to LF's
planned-vs-spontaneous lifecycle and the "Concept is its ADR"
convention. The preamble now sits at the top of `corpus/CLAUDE.md`
(IMP-1 to IMP-6 plus Goal shape) and is pointed at from the root
`CLAUDE.md`. The `trope-session-start` prose was tightened to
match: path detection moved up, gating made explicit. Session B
was reverted to `Planned` so it can be properly opened under the
fixed protocol.

## Deferred / Discovered

- [ ] **Session-init / session-end shell scripts** like athrio's
  `scripts/session-init.sh` and `scripts/session-end.sh` would
  make the imperative procedure even harder to bypass. Defer to
  a follow-up session (and possibly to ADR-013 if the script
  surface warrants a tooling commitment).
- [ ] **Imperatives as a `concept-imperatives` package** — not
  needed today, but if a consumer project rediscovers the same
  agent-guidance gap, formalise it as a Concept LF can ship to
  consumers via `.literate/`. For now the rules live in
  `corpus/CLAUDE.md` only.
- [ ] **`LITERATE.md` (consumer-facing Protocol)** does not
  currently carry agent-imperatives for consumer agents. If
  consumer experience surfaces the same gap, mirror IMP-1
  through IMP-6 there.
- [ ] Carried forward from prior sessions (still open): Effect
  Layer I/O wiring; `literate check` schema-level validation;
  orphan force-push held.
