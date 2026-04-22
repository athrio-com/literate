# Project Protocol — Operational Rules

Operational rules for authoring inside `corpus/`. Extend with
project-specific tag vocabulary and gating notes as your repo
grows.

See `../CLAUDE.md` (root) and `.literate/concepts/` for the
framework-level rules this file sits under.

## Session lifecycle

1. Create a log at `corpus/sessions/YYYY-MM-DDTHHMM-<slug>.md`
   per the `session` Trope.
2. Draft Goal(s) in `## Goals`; gate each; on Accept stamp
   `Status: Active` and a `Category`.
3. Work; draft ADRs as needed via the `adr-flow` Trope.
4. End the session: write `## Summary`, populate `## Work Done`,
   run `session-end` validation, stamp `Status: Closed`.

## Closed vocabularies

Tag vocabulary, ADR/Goal statuses and categories ship from the
`category` Trope into `corpus/categories/`. Extend by gated
authorial change.
