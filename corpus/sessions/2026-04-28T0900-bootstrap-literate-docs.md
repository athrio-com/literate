# Session: 2026-04-28 — bootstrap `@literate/docs`

**Date:** 2026-04-28
**Started:** —
**Status:** Abandoned (2026-04-23T1630; superseded by the MVP arc authored in session 2026-04-23T1600-unify-monorepo-layout.md — bootstrapping `@literate/docs` is downstream of the MVP and belongs to a later docs-specific arc)
**Chapter:** — (no chapter yet)
**Agent:** —
**Planned by:** corpus/sessions/2026-04-23T0818-planned-sessions-and-arc.md

## Goals

*(provisional; re-gated on Open.)*

### Goal 1 — Scaffold the project

**Topic:** Run `literate init template-docs --target docs --name @literate/docs`
from the monorepo root; verify `docs/.literate/` is materialised,
`docs/corpus/` carries skeletal indexes, and `docs/package.json`
declares the dev-overlay Trope.
**Upstream:** Session 2026-04-27's CLI work; ADR-011 (nested
consumer carve-out, from Session 2026-04-24).
**Acceptance:** `docs/` exists at the monorepo root; root
`package.json` workspace globs include it; `bun install` +
`bun run --filter '@literate/docs' typecheck` clean;
`docs/.literate/manifest.json` lists the expected Tropes.

### Goal 2 — First session in `docs/corpus/`

**Topic:** Open the inaugural session log under
`docs/corpus/sessions/`, draft and gate Goal 1 ("establish the
docs landing page under LF discipline"), surface the first
authoring task. The session itself becomes the proof that LF
works recursively.
**Upstream:** Goal 1.
**Acceptance:** `docs/corpus/sessions/<inaugural>.md` exists with
`Status: Open` and at least one Accepted Goal; the session log
validates the cross-corpus boundary (LF-project decisions stay in
`corpus/`, docs decisions stay in `docs/corpus/`).

## Decisions Made

*(populated when this session opens.)*

## Work Done

*(populated when this session opens.)*

## Summary

*(written at session end.)*

## Deferred / Discovered

*(populated at session end.)*
