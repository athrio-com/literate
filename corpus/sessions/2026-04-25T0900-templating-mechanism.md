# Session: 2026-04-25 — templating mechanism choice

**Date:** 2026-04-25
**Started:** —
**Status:** Abandoned (2026-04-23T1630; superseded by the MVP arc authored in session 2026-04-23T1600-unify-monorepo-layout.md — the docs-templating-mechanism choice is out of scope for the MVP; v0.1 ships only `@literate/template-minimal`)
**Chapter:** — (no chapter yet)
**Agent:** —
**Planned by:** corpus/sessions/2026-04-23T0818-planned-sessions-and-arc.md

## Goals

*(provisional; re-gated on Open.)*

### Goal 1 — Survey templating tools

**Topic:** Compare eta, handlebars, plop, hygen, degit,
cookiecutter, shadcn-style copy, and at least one AI-augmented
option (e.g., a prompted-fill scaffold). Score on pure-Effect
compatibility, parameterisation expressiveness, conditional file
inclusion, JSON-aware substitution, runtime size, and DX for the
docs-site case.
**Upstream:** `concept-template` (Session 2026-04-24's Goal 1)
defines the contract a mechanism must satisfy.
**Acceptance:** A short comparison memo authored under
`corpus/memos/` (folder created if absent) summarising findings;
at most three finalists.

### Goal 2 — ADR-012: templating mechanism for `@literate/cli`

**Topic:** Pick one mechanism and document why; specify the
variable syntax, conditional-file convention, and how the
manifest of selected Tropes is propagated.
**Upstream:** Goal 1's memo.
**Acceptance:** `corpus/decisions/ADR-012-templating-mechanism.md`
exists, Accepted; ADR index updated.

## Decisions Made

*(populated when this session opens.)*

## Work Done

*(populated when this session opens.)*

## Summary

*(written at session end.)*

## Deferred / Discovered

*(populated at session end.)*
