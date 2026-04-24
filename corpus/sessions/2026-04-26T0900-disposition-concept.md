# Session: 2026-04-26 — Disposition Concept

**Date:** 2026-04-26 (provisional; rename on open per IMP-1.5 if drift)
**Status:** Abandoned (2026-04-24T17:07 — superseded by `corpus/sessions/2026-04-24T1712-typed-concepts-disposition-mode-implication.md` which collapses P5/P6/P7 into one fast-mode session sharing structure across the three Concept authoring goals)
**Chapter:** — (no chapter yet)
**Agent:** —
**Started:** —
**Planned by:** corpus/sessions/2026-04-23T2100-ship-surface.md
**Depends on:** corpus/sessions/2026-04-25T0900-registry-and-cli-surface.md

## Goals

*Provisional — re-gate per IMP-1.6 at session open.*

### Goal 1 — Author `@literate/concept-disposition` as a parametrised struct

**Topic:** Disposition names the **referential domain** a Trope or
authored instance belongs to. Ships as a parametrised struct (not a
closed ADT) with Effect Schema:

```
base: 'Product' | 'Protocol' | 'Infrastructure'  (closed set, v0.1)
scope?: string                                    (open, freeform)
prompt?: string                                   (open, first-class — agent reads first)
prose?: string                                    (open, authored declaration)
```

`base` is exhaustive; everything below it is open. No registry of
scopes; scopes accrete from use. Renames /consolidations happen
after the fact via an ADR when a scope's weight warrants it.

*Disposition* replaces the term **Modality** from ADR-021. Reasons
(per exploration §8.2): linguistic weight of "modality"
(epistemic / deontic / alethic stances) mismatches the intended
referential-frame meaning; "disposition" carries the right shape
in everyday usage.

**Upstream:** Exploration §8 + §13.5; ADR-021 (retired into
Disposition).

**Acceptance:**
- `registry/concepts/disposition/concept.mdx` + `index.ts`
  authored with typed Schema.
- `concept-session` and `concept-adr` (and any other relevant
  Concepts) revised to carry a `disposition: Disposition` field.
- `trope-session-start` revised: new Step reads/sets Disposition
  at session open; if ambiguous from the Person's prompt, asks.
- ADR-021's `Status:` updated to record retirement in favour of
  Disposition (append-only amendment per IMP-6).

### Goal 2 — Update the Protocol prose surface

**Topic:** `.literate/LITERATE.md` template gains a Disposition
section (what it is, the three v0.1 `base` values, how to name
scope and prompt). Brief, reader-oriented; deep treatment stays in
the Concept's own prose.

**Upstream:** ADR-025 (`.literate/LITERATE.md` is the Protocol
surface); this session's Goal 1.

**Acceptance:** `registry/` carries an updated LITERATE.md
template that names Disposition; smoke test: `literate weave` in
a scratch consumer repo produces a `.literate/LITERATE.md` that
includes the Disposition section.

### Goal 3 — Rename cleanup in Concept-level prose

**Topic:** Any residual uses of "modality" in corpus prose or
`@literate/*` source (outside frozen ADR bodies) are renamed to
"disposition." ADR-021's body stays frozen (IMP-6); its Status
line records the retirement.

**Upstream:** Exploration §15 (terminology register).

**Acceptance:** Grep for "modality" finds it only in frozen
archival locations (ADR-021's body, session logs predating the
rename, exploration-protocol reference copies).
