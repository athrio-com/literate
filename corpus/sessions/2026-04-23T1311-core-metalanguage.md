# Session: 2026-04-23 — Core metalanguage: Concept and Trope types in `@literate/core`

**Date:** 2026-04-23
**Started:** 2026-04-23T13:11
**Status:** Closed (2026-04-23T13:38)
**Chapter:** — (no chapter yet)
**Agent:** Claude Opus 4.7 (1M context)
**Planned by:** corpus/sessions/2026-04-23T1600-unify-monorepo-layout.md

> **Provisional.** The Goals below are drafts copied from the
> parent session's Plan entry. They land authoritatively only
> when this session opens and each Goal is re-presented to the
> Person for Accept / Correct / Clarify / Reject (IMP-1.6).

## Pre-work

Per `session-start` (planned path, IMP-1):

- **Last `Status: Closed` session**
  (`2026-04-23T1600-unify-monorepo-layout`) Summary: unified the
  monorepo via ADR-020 (single workspace at repo root; legacy
  moved to sibling `legacy/`); relocated the ADR-018 freeze scope
  to `legacy/`; promoted `framework/packages/core/` →
  `packages/core/`; rewrote the workspace manifest as
  `@literate/monorepo`; re-scoped the multi-session arc into a
  four-session MVP arc (S1 core metalanguage → S2 workflow Tropes
  → S3 live services → S4 CLI + template + e2e smoke); abandoned
  five pre-rewrite docs-template Planned sessions. Smoke tests
  pass 2/2; typecheck clean. Deferred items carried into this
  arc: Concept/Trope metalanguage (this session), workflow
  Tropes (S2), live services + file-backed ExecutionLog (S3),
  CLI + template + e2e smoke (S4).
- **ADR index reviewed.** ADR-011 through ADR-015, ADR-017,
  ADR-019, ADR-020 Accepted. ADR-016 Superseded by ADR-019
  (namespace clause) and ADR-020 (layout clause) — body
  untouched. ADR-018 Accepted with scope relocated to `legacy/`
  by ADR-020. No supersessions affect this Goal's scope.
- **Planned-session queue.** S2
  (`2026-04-25T0900-workflow-tropes-session-lifecycle`),
  S3 (`2026-04-26T0900-live-services-and-file-execution-log`),
  S4 (`2026-04-27T0900-cli-template-and-e2e-smoke`) remain
  `Planned`, each depending transitively on this session's
  output.
- **Index-sync fixup (mechanical, ungated).** The parent session
  (`2026-04-23T1600`) was carrying `Status: Closed
  (2026-04-23T16:40)` in its header but `Open` in
  `corpus/sessions/sessions.md`. The index row was corrected to
  `Closed (2026-04-23T16:40)` before opening this session
  (index files are fully mutable mechanical reflections of the
  folder per `corpus/CLAUDE.md` mutability table).
- **Filename rename (consented).** The Planned log was slugged
  `2026-04-24T0900-core-metalanguage.md`. Current UTC at open is
  `2026-04-23T13:11`, a different calendar day; per IMP-1.5 the
  Person consented to rename to
  `2026-04-23T1311-core-metalanguage.md`. Parent session's Plan
  entry 1 `Realised by:` updated to the new path.

## Goals

### Goal 1 — Add `Concept<D>` and `Trope<C>` types to `@literate/core`

**Status:** Completed
**Category:** feature
**Topic:** The rewrite core currently ships the Step substrate
(ADR-011…ADR-014, ADR-017) but not the Concept/Trope metalanguage
(ADR-001 as extended by ADR-010, ADR-009). Legacy
`legacy/packages/core/src/kinds.ts` defines `Concept`, `Trope`,
`Subkind`, `Member` as the primitives consumers use to declare
"what is a session", "what is an ADR", etc. Without these types
in the rewrite, `@literate/trope-session-start` (S2's scope) has
no shape to implement. This Goal authors the minimum set of
metalanguage types directly on top of the Step substrate: a
Concept is a Schema + prose declaration; a Trope is a Concept
realisation that binds a workflow Step. Per ADR-015, TypeScript
is the composition surface — Tropes and Steps are declared in
`.ts`, prose siblings (`.md`, or `.mdx` where a Trope needs it)
are loaded as data via `prose(import.meta.url, …)`. No tangling,
no prose-compiler, no AST-walked codegen.

**Upstream:**

- ADR-001 (three-level algebra), ADR-009 (Tropes as packages),
  ADR-010 (unify Terms into Concepts) — the legacy algebra.
- ADR-011, ADR-012, ADR-017 — the Step substrate the metalanguage
  sits on.
- ADR-015 — `.md` siblings via `prose(import.meta.url, …)`.
- Legacy `legacy/packages/core/src/kinds.ts` — prior-art types
  for reference only (no imports).

**Acceptance:**

- `packages/core/src/kinds.ts` (or similar file) exports
  `Concept<D>`, `Trope<C>`, and any derived types (`Subkind`,
  `Member`) needed by the workflow Tropes of S2.
- Types compose cleanly with the existing `Step<I, O, E, R>`
  so a Trope's `realise` field is a `workflowStep`.
- Typecheck passes; new unit tests demonstrate constructing a
  trivial Concept and a trivial Trope.
- No imports from `legacy/`.

**Notes:**

- This session is the *unlock* for S2 through S4. Keep the
  type surface minimal; over-scoping here delays the rest of
  the arc.

## Decisions Made

- **Concept/Trope metalanguage on top of the Step substrate.**
  Authored `packages/core/src/kinds.ts` with `Concept<D>`
  (schema-backed prose declaration) and `Trope<C>` (Concept
  realisation binding an `AnyStep` via its `realise` field).
  Constructor helpers `concept({...})`, `trope({...})`,
  `variant({...})` provided alongside the interfaces for
  ergonomic authoring with defaults (`version`, `dependencies`,
  `variants`); plain object literals also type-check. Type
  guards (`isConcept`, `isTrope`, `isVariant`) and an extractor
  (`ConceptInstance<C>`) complete the surface. No separate ADR
  authored — this is the minimum surface required for S2's
  workflow Tropes and derives directly from ADR-001 (three-level
  algebra) as extended by ADR-011 (Step substrate). Future ADR
  may be warranted when the metalanguage adds recursion, sum
  elimination, or other non-obvious operations.

- **Renamed `Subkind` → `Variant`.** The Person steered naming
  toward FP-idiomatic ADT vocabulary: a Concept is the sum type
  and its Variants are the ADT cases (matching Effect's
  `TaggedEnum`, Rust's `enum` variants, Scala's case classes).
  Legacy `legacy/packages/core/src/kinds.ts` retains the name
  `Subkind` per ADR-018 (frozen). No cross-tree import bridges
  the names; the rewrite owns its vocabulary.

- **Dropped `Member` from v0.1.** The legacy `Member` primitive
  (named element of a closed-vocabulary Trope — e.g., the members
  of `goal-status` or `tags`) is not needed by S2's workflow
  Tropes, which are procedural not enumerative. Removed for
  YAGNI; additive re-introduction remains non-breaking (consumers
  use the `trope({...})` constructor with defaults, so adding a
  `members` field back requires no migration).

- **Scope clarification on ADR-015 (not an ADR edit).** The
  Person pushed back on my provisional Goal phrasing that read
  "No MDX, no codegen; pure TypeScript per ADR-015". Re-reading
  ADR-015: what it bans is the *tangling-biased* pipeline
  (Option A's MDX-directives + prose-compiler + AST-walked
  codegen). What it adopts (Option B) is TypeScript as the
  *composition* surface, with prose siblings (`.md`, or `.mdx`
  where a Trope needs MDX richness) loaded as data via
  `prose(import.meta.url, …)`. Goal Topic re-gated and
  Accepted with the corrected framing; ADR-015 body untouched.

## Work Done

Authored:

- `packages/core/src/kinds.ts` — new file. Exports `Concept<D>`,
  `Trope<C>`, `Variant<C, D>` (ADT case), their `*Definition`
  interfaces, constructor helpers (`concept`, `trope`,
  `variant`), type aliases (`AnyConcept`, `AnyTrope`,
  `AnyVariant`), extractor (`ConceptInstance<C>`), and type
  guards (`isConcept`, `isTrope`, `isVariant`).
- `packages/core/src/__tests__/kinds.test.ts` — new file. Four
  tests: `concept()` constructor + defaults + type guards,
  `variant()` constructor + Concept binding, `trope()`
  constructor wiring Concept + Step + variants, and a runtime
  exercise of `trope.realise.realise(input)` under Effect.
- `packages/core/src/__tests__/kinds.md` — new file. Small
  placeholder prose sibling used by the test's `ProseRef`
  fields (load path never exercised by these tests).

Modified:

- `packages/core/src/index.ts` — appended "Metalanguage" export
  block re-exporting the `kinds.ts` surface.
- `corpus/sessions/sessions.md` — corrected parent session's
  row from `Open` → `Closed (2026-04-23T16:40)` (mechanical
  index-sync fixup, ungated); updated this session's row from
  `Planned` → `Open` with the renamed filename, and will be
  updated again to `Closed (2026-04-23T13:38)` at close.
- `corpus/sessions/2026-04-23T1600-unify-monorepo-layout.md` —
  `Realised by:` pointer on Plan entry 1 re-pathed to
  `2026-04-23T1311-core-metalanguage.md` (frozen parent Plan
  entry update; mechanical per IMP-1.5).

Renamed:

- `corpus/sessions/2026-04-24T0900-core-metalanguage.md` →
  `corpus/sessions/2026-04-23T1311-core-metalanguage.md`
  (consented by the Person per IMP-1.5; calendar day mismatch
  between planned slug and actual open time).

Verification:

- `bun x tsc --noEmit` at `packages/core/` — clean.
- `bun x tsc --noEmit` at repo root — clean.
- `bun test` at `packages/core/` — 6 pass, 0 fail, 33 expect()
  calls across 2 files (pre-existing 2 smoke tests + 4 new
  kinds tests).
- No imports from `legacy/` in the authored files (verified
  by inspection: `kinds.ts` imports only `effect` and
  `./step.ts`; `kinds.test.ts` imports only `bun:test`,
  `effect`, and `../index.ts`).

## Deferred / Discovered

Carried forward into the MVP arc:

- **S2 (`2026-04-25T0900-workflow-tropes-session-lifecycle`)**
  consumes this session's `Concept<D>` + `Trope<C>` types to
  author `@literate/trope-session-start` and
  `@literate/trope-session-end`. No blockers.
- **S3 (`2026-04-26T0900-live-services-and-file-execution-log`)**
  and **S4 (`2026-04-27T0900-cli-template-and-e2e-smoke`)**
  remain `Planned` and are unblocked transitively.

Discovered in this session:

- **Member dropped; re-introduce on demand.** If/when the first
  closed-vocabulary Trope lands in code (e.g., a `goal-status`
  Trope enumerating `Active` / `Completed` / `Superseded by Goal N`
  / `Abandoned`), re-introduce a `Member`-shaped primitive under a
  better FP-idiomatic name at that point (candidates:
  `Case`, `Entry`, `VocabularyItem`, or keep `Variant` and express
  vocabularies as Concept-with-Variants). Decision defers to the
  authoring site; no ADR needed yet.
- **Concept-level decisions without an ADR.** The metalanguage
  in `kinds.ts` derives from ADR-001 extended by ADR-011; no new
  ADR was authored because the design fits the existing decision
  cone. `corpus/CLAUDE.md` IMP-2 allows this: a Concept-level
  material revision IS the architectural artefact when it fits
  the Concept shape. Here, we have neither a Concept-level
  revision (the types are framework code, not corpus Concepts)
  nor a genuinely new tooling commitment, so no gate artefact
  fired. Flag: if a future session finds this boundary fuzzy,
  an ADR formalising "when framework code authoring needs an
  ADR vs. doesn't" may be worth drafting.
- **Schema casting pattern.** Construction of
  `Schema.Schema<D, any, never>` from `Schema.Struct({...})`
  used `as unknown as Schema.Schema<D, any, never>` in the
  test. This matches the existing `combinators.ts` `gateStep`
  pattern (line 184); not a new concern, but worth noting if
  the MVP ever standardises a builder API.

## Summary

Authored the `Concept<D>` / `Trope<C>` / `Variant<C, D>` metalanguage
in `@literate/core`, realising Goal 1 of the MVP arc and unblocking
S2. Types sit on top of the existing Step substrate: a Trope binds
a Concept (via `realises: C`) and a Step (via `realise: AnyStep`),
so `trope-session-start` can bind a `workflowStep` composing the
IMP-1 pre-work Steps. During gating, corrected a misreading of
ADR-015 in the provisional Goal (the ban is on tangling/codegen,
not on MDX prose); during authoring, the Person steered the naming
of the legacy `Subkind` primitive toward the FP-idiomatic `Variant`
and dropped the legacy `Member` primitive as YAGNI. Tests 6/6 pass;
typecheck clean at both package and repo root; no imports from
`legacy/`.
