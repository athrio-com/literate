# Session: 2026-04-22 — deferred cleanup

**Date:** 2026-04-22
**Started:** 2026-04-22T18:01
**Status:** Closed (2026-04-22T18:04)
**Chapter:** — (founding; no chapter yet)
**Agent:** Claude Opus 4.7 (1M context)

## Goals

### Goal 1

**Status:** Completed
**Category:** process
**Topic:** Discharge the actionable deferred items left by the
v0.1 migration session — verify the consumer-facing template
prose is free of legacy `terms/` language, fix the stale "eight
Concepts" count in the template's root `CLAUDE.md` (now seven
after ADR-010), and exercise `literate add trope` and `literate
compile` end-to-end against a freshly scaffolded consumer.
**Upstream:** The Deferred / Discovered section of
`corpus/sessions/2026-04-22T1315-v0.1-migration.md`. No new ADRs
are needed; this is a cleanup + verification pass after the
prior session's reshape.
**Scope:**
- Re-grep the consumer template tree for legacy `terms/`
  references; confirm none.
- Update `packages/template-minimal/tree/CLAUDE.md` to reflect
  the post-ADR-010 Concept count.
- Run `literate init --target /tmp/lf-test minimal`.
- Run `literate add trope @literate/trope-chapters --target
  /tmp/lf-test` and verify the manifest gains the entry and the
  `.literate/` recompiles with `chapters` Tropes/Concepts.
- Run `literate compile --target /tmp/lf-test` again to confirm
  the verb is independently invocable and the output is
  deterministic.
**Out of scope:**
- Adding new Tropes, new Concepts, or new ADRs.
- Wiring real I/O into the workflow Tropes' Effect Layers
  (still placeholders; flagged again for a future session).
- The orphan force-push (still pre-authorised but held for
  Person confirmation).
**Acceptance:**
- The template tree contains no occurrence of `terms/` outside
  the historical session log and ADR-006 / ADR-010.
- `packages/template-minimal/tree/CLAUDE.md` says "seven" (or
  describes the set without an inaccurate count).
- `literate add trope` adds the entry and recompiles without
  error.
- `literate compile` re-emits the same manifest content
  (deterministic up to `compiledAt`).
**Notes:**
- Treat this as a small follow-up session; the prior session's
  Goal 1 / 2 / 3 acceptance is already met.

## Decisions Made

*(none expected; flag and add if any surface during work.)*

## Work Done

- Re-grepped the consumer template tree
  (`packages/template-minimal/tree/`) for `terms/`,
  `\bTerm\b`, and `\bterm\b` — confirmed no remaining
  references. The deferred concern was a false alarm; ADR-010's
  rename was already complete at session-end of the prior
  session.
- Edited `packages/template-minimal/tree/CLAUDE.md`: corrected
  "the eight Concepts" → "the seven Concepts" to reflect the
  post-ADR-010 set (concept, trope, corpus, session, decisions,
  category, chapters).
- Re-ran `bun run packages/cli/src/bin.ts init --target
  /tmp/lf-test minimal` from a clean target. Output: scaffolded
  to `/tmp/lf-test`; compiled `.literate/` with 6 concepts and
  8 tropes from the bundled minimal manifest.
- Ran `bun run packages/cli/src/bin.ts add trope --target
  /tmp/lf-test '@literate/trope-chapters'`. Output: appended the
  package to `package.json`'s `"literate".tropes`, sorted the
  array, recompiled `.literate/` to 7 concepts and 9 tropes
  (chapters Trope and Concept now present in
  `.literate/tropes/chapters/` and `.literate/concepts/chapters.mdx`).
- Ran `bun run packages/cli/src/bin.ts compile --target
  /tmp/lf-test` standalone (without going through `add trope`).
  Stripped `compiledAt` from the manifest before and after,
  diffed: identical content. Compilation is deterministic
  apart from the timestamp.

## Summary

Discharged the actionable items from the prior session's
Deferred / Discovered list. Confirmed the consumer template
tree carries no legacy `terms/` references; corrected the stale
Concept count in the template's root `CLAUDE.md`. Verified
`literate add trope` and `literate compile` end-to-end against
a fresh `/tmp/lf-test` consumer scaffold: `add trope` updates
the manifest and recompiles, `compile` is deterministic. No
ADRs needed and no design changes; the v0.1 scaffold remains
internally consistent.

## Deferred / Discovered

- [ ] Wiring real I/O into the workflow Tropes' Effect Layers
  (`session-start`, `session-end`, `adr-flow`) is still
  follow-up work; current Layers log intent rather than mutate
  the filesystem.
- [ ] `literate check` schema-level validation (decode authored
  ADRs/sessions/categories against the Concept Schemas) is
  still v0.2+ scope.
- [ ] The orphan force-push to `main` remains pre-authorised
  but is held for an explicit Person confirmation. `temp/`
  remains in the working tree (gitignored) and will not survive
  the orphan commit.
