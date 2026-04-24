# Session: 2026-04-27 — Implication Concept (typed)

**Date:** 2026-04-27 (provisional; rename on open per IMP-1.5 if drift)
**Status:** Abandoned (2026-04-24T17:07 — superseded by `corpus/sessions/2026-04-24T1712-typed-concepts-disposition-mode-implication.md` which collapses P5/P6/P7 into one fast-mode session sharing structure across the three Concept authoring goals)
**Chapter:** — (no chapter yet)
**Agent:** —
**Started:** —
**Planned by:** corpus/sessions/2026-04-23T2100-ship-surface.md
**Depends on:** corpus/sessions/2026-04-25T0900-registry-and-cli-surface.md

## Goals

*Provisional — re-gate per IMP-1.6 at session open.*

### Goal 1 — Author `@literate/concept-implication` with typed Schema

**Topic:** Implication names a **soft Goal** — something an
exploration (or any work) surfaced that has authorial weight but
hasn't been adjudicated into a Goal yet.

Ships as `@literate/concept-implication` with Effect Schema over
the member struct, parallel in shape to Mode and Disposition:

```
Implication = {
  _tag: 'Implication',
  id: string,
  status: 'Surfaced' | 'Promoted' | 'Filed' | 'Dismissed',
  rationale?: string  // required when status = 'Dismissed'
}
```

The `rationale-required-on-Dismissed` invariant is enforced at
the Schema level, not validated imperatively elsewhere.

Status set:
- **Surfaced** — Implication raised, not yet dispositioned.
- **Promoted** — promoted to Goal (this session or a future one).
- **Filed** — filed to memo for later consideration.
- **Dismissed** — explicitly retired without action (rationale
  required).

Relationship to Goal: Implication is to Goal what `Planned` is to
`Open` for sessions — a softer state that tightens later. Parallel
machinery, different status set, different gating profile.
Implications may be surfaced in any Mode but are most common in
Exploring.

**Upstream:** Exploration §10 + §13.7.

**Acceptance:**
- `registry/concepts/implication/concept.mdx` + `index.ts`
  authored with typed Schema enforcing the rationale-on-Dismissed
  invariant.
- Schema unit-tested: constructing a Dismissed Implication without
  rationale fails Schema validation.

### Goal 2 — Wire Implication into `concept-session` and `trope-session-end`

**Topic:** Extend `concept-session` with
`implications: Schema.Array(Implication)` (ungated append-only
journal field; Implications accumulate during the session).
Revise `trope-session-end` to validate that **every Implication
carries a terminal status** (`Promoted | Filed | Dismissed`) at
close.

Validation is a **typed exhaustive match** on the status union,
not a string comparison. Failures carry typed
`ImplicationNotTerminal { id, currentStatus }` errors in the
session-end Effect channel. The existing session-end validations
(every Goal terminal; every Plan entry realised / planned /
abandoned) remain; Implication validation is additive.

**Upstream:** Exploration §10 + §12.5 + §12.7 + §13.7.

**Acceptance:**
- `concept-session` carries the typed `implications` field.
- `trope-session-end` refuses to close a session with a
  non-terminal Implication; typed error surfaces to the CLI.
- Smoke test: session-end succeeds with all terminal
  Implications; session-end fails with one Surfaced Implication
  and reports the id.

### Goal 3 — Author `trope-implication-flow`

**Topic:** Parallel to `trope-goal-flow`: typed Steps,
Effect-composed, that take an Implication through its status
transitions. Surface → (Promote | File | Dismiss). Dismiss
requires rationale (typed; Schema enforces).

**Upstream:** Goal 1; exploration §13.7.

**Acceptance:**
- `registry/tropes/implication-flow/` exists with prose + TS.
- Each transition is a typed Step; the Trope composes them with
  typed I/O and typed failure channels.
- Smoke test: surfacing, promoting, filing, dismissing — each
  covered.
