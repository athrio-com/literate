# Session: 2026-04-27 — CLI multi-template support

**Date:** 2026-04-27
**Started:** —
**Status:** Planned
**Chapter:** — (no chapter yet)
**Agent:** —
**Planned by:** corpus/sessions/2026-04-23T0818-planned-sessions-and-arc.md

## Goals

*(provisional; re-gated on Open.)*

### Goal 1 — Bundled templates catalog

**Topic:** Add `packages/cli/src/template-catalog.ts` modelled on
`catalog.ts`, importing every `@literate/template-*` package and
exposing `resolveTemplate(key)`. Wire `init.ts` to consult it
instead of hardcoding `'minimal'`.
**Upstream:** Session 2026-04-25's ADR-012; Session 2026-04-26's
`@literate/template-docs`.
**Acceptance:** `literate init template-docs --target /tmp/docs-test`
scaffolds the docs template; `literate init template-minimal`
still works; both compile `.literate/` cleanly.

### Goal 2 — Substitution and prompts

**Topic:** If ADR-012 chose a parameterised mechanism, expose the
parameters via CLI flags (and optionally `@effect/cli` prompts).
Document the substitution variables in the template's
`tree/README.md`.
**Upstream:** Goal 1.
**Acceptance:** `literate init template-docs --target docs --name @literate/docs`
produces a project whose `package.json` reflects the chosen name
and whose tree has substitutions applied.

## Decisions Made

*(populated when this session opens.)*

## Work Done

*(populated when this session opens.)*

## Summary

*(written at session end.)*

## Deferred / Discovered

*(populated at session end.)*
