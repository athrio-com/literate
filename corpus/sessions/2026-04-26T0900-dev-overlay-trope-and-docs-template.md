# Session: 2026-04-26 — dev-overlay Trope and docs Template

**Date:** 2026-04-26
**Started:** —
**Status:** Abandoned (2026-04-23T1630; superseded by the MVP arc authored in session 2026-04-23T1600-unify-monorepo-layout.md — `trope-dev-overlay` and `template-docs` target docs-site scaffolding, not the MVP execution path)
**Chapter:** — (no chapter yet)
**Agent:** —
**Planned by:** corpus/sessions/2026-04-23T0818-planned-sessions-and-arc.md

## Goals

*(provisional; re-gated on Open.)*

### Goal 1 — Author `trope-dev-overlay`

**Topic:** `packages/trope-dev-overlay/` with `prose.mdx`
describing realisation discipline (HTML contract, localStorage
key, dev-mode gating, `shift+D` shortcut, Core / Optional
discipline), `index.ts` exporting the
`Trope<typeof DevOverlayConcept>` value, no runtime code.
**Upstream:** `concept-dev-overlay` (Session 2026-04-24's Goal 2).
**Acceptance:** Package exists, typechecks, importable from
`@literate/cli` catalog.

### Goal 2 — Author `@literate/template-docs`

**Topic:** `packages/template-docs/` with `tree/` containing the
Next.js scaffold (App Router, `app/`, `components/`, `corpus/`
skeleton, `package.json` with the `literate` manifest naming
`dev-overlay` and the standard authoring Tropes). The
dev-overlay React realisation lives under `tree/components/dev/`
(lifted from the existing `site/components/dev/` prototype, now
sanctioned as a Trope realisation). `tree/CLAUDE.md` orients the
consumer agent. Optional substitution slots per ADR-012.
**Upstream:** Session 2026-04-25's ADR-012 (mechanism), Goal 1
(Trope), the existing `site/components/dev/*` prototype.
**Acceptance:** `packages/template-docs/` exists; the static tree
under `tree/` is internally consistent; package typechecks. (No
CLI integration in this session.)

## Decisions Made

*(populated when this session opens.)*

## Work Done

*(populated when this session opens.)*

## Summary

*(written at session end.)*

## Deferred / Discovered

*(populated at session end.)*
