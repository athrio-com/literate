# Session: 2026-04-24 — primitives: template, dev-overlay, nested-consumer carve-out

**Date:** 2026-04-24
**Started:** —
**Status:** Planned
**Chapter:** — (no chapter yet)
**Agent:** —
**Planned by:** corpus/sessions/2026-04-23T0818-planned-sessions-and-arc.md

> **Pause note (2026-04-23T09:30):** This session was provisionally
> opened by a separate agent thread on a misread of "continue with
> goals" (the agent jumped past the gate and stamped `Status: Open`
> without re-presenting the Goals to the Person). No Goal was
> Accepted and no work was done. Reverted to `Status: Planned`
> pending a Person-driven planned-start. The pre-work notes below
> remain useful context and are preserved verbatim. The discovered
> root cause — LF protocol does not surface clear, mandatory
> Imperatives at the top of `corpus/CLAUDE.md` — is being addressed
> in a sibling spontaneous session
> `2026-04-23T0919-imperatives-for-lf-protocol.md` before this
> session is properly opened.

## Pre-work (preserved from the aborted open; superseded on next start)

Per `session-start` (planned path):

- Last non-`Planned` session (`2026-04-23T0818-planned-sessions-and-arc`)
  Summary: extended the session lifecycle with `Planned` status and
  `## Plan` section; updated session Concept/Tropes; added
  `session-status.md` category; authored 5 Planned successor logs.
- Deferred / Discovered carried forward: Plan entry G+ remains an
  umbrella (F's responsibility); Plan-block schema validation deferred
  to v0.2+; existing closed logs not back-filled (intentional);
  Effect Layer I/O wiring still open; `literate check` schema-level
  validation still open; orphan force-push still held.
- ADR index reviewed: ADR-007 ("no `.literate/` in LF repo") is the
  direct upstream for Goal 3's append-only carve-out. ADR-005
  (prose-first MDX + Schema) and ADR-009 (Tropes as packages) are
  upstream constraints on Goals 1 and 2's Concept package shape.
  ADR-010 (Concepts unify Terms) governs the corpus/concepts/
  index touch.
- Open sessions: none (the parent closed at 09:06).
- Other Planned sessions (excluding self): C `templating-mechanism`
  (depends on B-G1), D `dev-overlay-trope-and-docs-template`
  (depends on B-G1, B-G2, B-G3, C-G2), E `cli-multi-template`
  (depends on C-G2, D-G2), F `bootstrap-literate-docs`
  (depends on E-G2). None could be started instead — all sit
  downstream of this session's three Goals.
- Filename anchor: planned at `2026-04-24T0900`; actual start
  `2026-04-23T09:11` — proposed rename to
  `2026-04-23T0911-primitives-template-and-dev-overlay.md`
  (awaiting Person consent; does not block work).

## Goals

*(provisional, copied from the parent Plan entry; re-gated when this session transitions to Open.)*

### Goal 1 — Author `concept-template`

**Topic:** Formalise Templates as a primitive: a typed bundle
declaring an id, version, scaffold tree path, default Tropes
manifest, optional substitution variables, optional post-scaffold
hooks. Concept ships under `packages/concept-template/` with prose
+ Effect Schema. Indexed in `corpus/concepts/concepts.md`.
**Upstream:** Session 2026-04-23T0818's lifecycle update; existing
`packages/template-minimal/` as the de-facto reference.
**Acceptance:** `packages/concept-template/` exists with
`concept.mdx` + `index.ts`; the existing `template-minimal`
package is shown to satisfy the Concept (no code change required,
just a prose cross-reference); typecheck clean.

### Goal 2 — Author `concept-dev-overlay`

**Topic:** Formalise the dev-mode collaboration pattern: a
Region (labelled, identifiable runtime UI surface with a stable
`idx`), Core vs Optional regions, registry semantics,
toggle+persistence semantics, dev-mode gating, the HTML contract
(`data-idx` / `data-trope-region`). The Concept is stack-agnostic;
React/Vue/etc. realisation is a consumer or template concern.
**Upstream:** The mid-session prototype at `site/components/dev/*`
as a reference shape; the user's framing ("idx for the agent" +
"meta-trope toggle, except Core").
**Acceptance:** `packages/concept-dev-overlay/` exists with
`concept.mdx` + `index.ts` (Schema for `RegionRecord`,
`RegistryState`); indexed; typecheck clean.

### Goal 3 — ADR-011: nested-consumer carve-out for ADR-007

**Topic:** Append-only ADR clarifying that ADR-007's "no
`.literate/` in LF repo" applies to the framework root only;
nested consumer projects in the same monorepo are normal LF
consumers and gain their own `.literate/` and `corpus/`.
**Upstream:** ADR-007; the Person's "monorepo, two distinct
projects" framing.
**Acceptance:**
`corpus/decisions/ADR-011-nested-consumer-carve-out.md`
exists, Accepted; ADR index updated; ADR-007's `Status:` line
records the amendment reference.

## Decisions Made

*(populated when this session opens.)*

## Work Done

*(populated when this session opens.)*

## Summary

*(written at session end.)*

## Deferred / Discovered

*(populated at session end.)*
