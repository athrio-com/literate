# Session: 2026-04-23 — Reinstate `@literate/*` namespace for rewrite packages

**Date:** 2026-04-23
**Started:** 2026-04-23T15:00
**Status:** Closed (2026-04-23T15:30)
**Chapter:** — (no chapter yet)
**Agent:** Claude Opus 4.7 (1M context)

## Pre-work

Per `session-start` (spontaneous path):

- Last non-`Planned` session
  (`2026-04-23T1200-athrio-framework-genesis`) Summary: authored
  rewrite-stage ADRs 011–018 and scaffolded
  `framework/packages/core/` as the first `@athrio/*` package with
  `Step`, `ExecutionLog`, `Suspend`, `Protocol.continue` skeleton,
  and two passing smoke tests. Deferred / Discovered flagged next
  goals: `@athrio/trope-gate-flow` (critical path),
  `@athrio/trope-session-start`, file-backed
  `ExecutionLogService`, live `AIInvoke` / `GateService`
  bindings. Everything in that catalogue assumes the `@athrio/*`
  scope.
- ADR index reviewed: ADR-011 through ADR-018 Accepted. ADR-016
  decided the `@athrio/*` namespace; ADR-018 §3 cites that
  decision and §7 deprecates `@literate/*`. Those two clauses are
  the ones that need to move when the scope is reinstated.
- Trigger: the Person has flagged a material mistake in the
  prior session's Work Done summary — "`@athrio/core` is wrong
  package name for LF. Athrio is reserved for the platform — it
  is sister repo. Correct is `@literate/` packages prefix for any
  LF package." The prior session treated `@athrio/*` as the
  rewrite's publishing scope across every one of
  ADR-016/ADR-018, the new `framework/` project, the `core`
  package, and several pieces of living corpus prose.

## Goals

### Goal 1 — Supersede `@athrio/*` namespace; reinstate `@literate/*` across rewrite surface

**Status:** Completed
**Category:** migration
**Topic:** Author ADR-019 that supersedes ADR-016's *namespace*
clause and amends ADR-018 §3 and §7. LF ships every rewrite
package under `@literate/*`; `@athrio/` is reserved for the
sister-repo platform (`/Users/yegor/Projects/Coding/athrio-com/athrio/`)
and not used by LF. Propagate the rename across the living
surfaces: rename `framework/package.json`
(`@athrio/framework` → `@literate/framework`) and
`framework/packages/core/package.json`
(`@athrio/core` → `@literate/core`); update mutable prose that
refers to `@athrio/*` (root `CLAUDE.md`, `corpus/CLAUDE.md`'s
"Working with `packages/` and `framework/packages/`" section,
`framework/CLAUDE.md`, `framework/README.md`); re-run
`bun install` and the smoke tests to confirm the rename is
clean. Leave frozen ADR-011…ADR-018 bodies alone (append-only);
ADR-016's `Status:` line becomes `Superseded by ADR-019` — that
line is the sole mutable part.

**Upstream:**

- The Person's correction prompt (2026-04-23, this thread).
- Memory `athrio_reference.md` — establishes Athrio as the
  sister-repo platform LF is being abstracted from; confirms
  `@athrio/*` is platform-scoped, not framework-scoped.
- ADR-016 — the decision being superseded on namespace; its
  multi-project / `framework/` split survives.
- ADR-018 §3, §7 — the clauses being amended.
- Last session's Work Done — enumerates every file that mentions
  `@athrio/*` and needs a rename or reference update.

**Scope:**

- `corpus/decisions/ADR-019-*.md` — new ADR.
- `corpus/decisions/decisions.md` — new row; mark ADR-016
  `Superseded by ADR-019`.
- `corpus/decisions/ADR-016-athrio-namespace-framework-folder.md`
  — `Status:` line only (append-only body; mutable Status).
- `CLAUDE.md` (root) — update `@athrio/*` references; ADR-018 §8
  already authorises scoped freeze-lifts for this file.
- `corpus/CLAUDE.md` — update `@athrio/*` references in the
  "Working with `packages/` and `framework/packages/`" section
  and NEVER list; editorial revision, not a category/member
  change.
- `framework/package.json` — name `@athrio/framework` →
  `@literate/framework`.
- `framework/packages/core/package.json` — name `@athrio/core` →
  `@literate/core`; description if it mentions the scope.
- `framework/CLAUDE.md` — rewrite `@athrio/*` references.
- `framework/README.md` — rewrite `@athrio/*` references.
- `bun install` at `framework/` to refresh the lockfile.
- `bun test` at `framework/packages/core/` to confirm 2/2 pass.

**Out of scope:**

- Legacy `packages/*` — frozen per ADR-018; no name changes,
  no edits. Their `@literate/*` names stay.
- Deferred / Discovered items from the prior session
  (`trope-gate-flow`, `trope-session-start`, file-backed
  ExecutionLog, live AIInvoke/GateService bindings) — still
  deferred, now carried forward under the reinstated scope.
- Rewriting ADR-011…ADR-018 bodies — append-only; they remain
  historically accurate as the journal of what was decided, even
  where a later ADR supersedes a clause.
- Consumer-manifest-key renaming (ADR-016 mentioned a future
  `literate` → `athrio` key migration; that migration is itself
  retracted by ADR-019).

**Acceptance:**

- `corpus/decisions/ADR-019-*.md` exists, Accepted, and is
  indexed in `decisions.md`.
- ADR-016's `Status:` reads `Superseded by ADR-019 (namespace
  clause)` or equivalent; its body is untouched.
- `grep '@athrio/' framework/ -r --include='*.json' --include='*.md'`
  returns zero hits (excluding `node_modules` and lockfiles that
  regenerate).
- Mutable corpus prose (`CLAUDE.md`, `corpus/CLAUDE.md`) carries
  the `@literate/*` scope.
- `bun install` and smoke tests pass under the new scope.
- This session stamps `Status: Closed`, updates
  `corpus/sessions/sessions.md`, and populates Summary / Work
  Done / Deferred / Discovered.

**Notes:**

- The "version-number fiction" concern that drove ADR-016's
  namespace choice was theoretical. ADR-018 §7 itself notes
  "Consumers of `@literate/*` (zero at time of writing — the
  legacy scaffold is pre-1.0 and unpublished)". With zero
  consumers and zero published versions, reusing `@literate/*`
  for the rewrite is the first real publication of that name,
  not a silent replacement. ADR-019 records this reasoning.
- Legacy `packages/*` keep their `@literate/*` names but remain
  frozen and unpublished per ADR-018; they will never ship. The
  collision is only at authoring-time inside this repo, and even
  there the two workspaces (root, `framework/`) are separate
  dependency trees per ADR-016's multi-project split. Bun
  workspace resolution stays scoped per project; no cross-wiring.
- The `framework/` project folder survives ADR-019 unchanged;
  only the *publishing scope* of packages inside it moves.

## Decisions Made

- Accepted ADR-019 — Reinstate `@literate/*` namespace for
  rewrite packages. Supersedes the namespace clause of ADR-016;
  amends ADR-018 §3 and §7 in substance. Retracts the
  anticipated consumer-manifest-key migration `literate` →
  `athrio` (manifest key stays `literate`).
- Marked ADR-016 `Superseded by ADR-019 (namespace clause)` on
  its Status line only. Its body is untouched (append-only).
  Annotated ADR-018 in the index as `Accepted (§3, §7 amended by
  ADR-019)`; its body is untouched.
- Editorial revision of `corpus/categories/tags.md` `#migration`
  definition to remove the obsolete "`@literate/*` → `@athrio/*`"
  example and add the ADR-019 scope-correction case. Ungated
  editorial; no member addition or removal.

## Work Done

Created at root corpus:

- `corpus/decisions/ADR-019-reinstate-literate-namespace.md` —
  the new ADR.
- `corpus/sessions/2026-04-23T1500-literate-namespace-reinstated.md`
  — this session log.

Modified at root corpus:

- `corpus/decisions/decisions.md` — appended row for ADR-019;
  updated ADR-016 row `Status` to `Superseded by ADR-019`;
  annotated ADR-018 row `Status` to `Accepted (§3, §7 amended by
  ADR-019)`.
- `corpus/decisions/ADR-016-athrio-namespace-framework-folder.md`
  — `Status:` line updated (sole mutable part of an accepted
  ADR body).
- `corpus/sessions/sessions.md` — appended row for this
  session; closed status populated in end-of-session step.
- `corpus/categories/tags.md` — editorial revision of
  `#migration` definition.
- `corpus/categories/step-kind.md` — editorial revision (one
  `@athrio/*` → `@literate/*` reference in prose).
- `corpus/categories/categories.md` — editorial revision of
  `step-kind.md` row purpose text.
- `CLAUDE.md` (root) — `@athrio/*` references replaced with
  `@literate/*`; added ADR-019 pointer; added note on
  `@athrio/` scope being reserved for the sister-repo product.
- `corpus/CLAUDE.md` — "Working with `packages/` and
  `framework/packages/`" section rewritten for the reinstated
  scope; NEVER-list bullet on legacy imports re-anchored to
  workspace isolation rather than differing namespaces.

Modified under `framework/`:

- `framework/package.json` — `name: @athrio/framework` →
  `@literate/framework`.
- `framework/packages/core/package.json` — `name: @athrio/core`
  → `@literate/core`.
- `framework/packages/core/src/index.ts` — JSDoc header
  rescoped to `@literate/core` with ADR-019 pointer.
- `framework/packages/core/src/services.ts` — three
  `Context.Tag('@athrio/…')` identifiers renamed to
  `@literate/…` (ProseInvoke, AIInvoke, GateService).
- `framework/packages/core/src/execution.ts` — ExecutionLog
  `Context.Tag` identifier renamed.
- `framework/packages/core/src/protocol.ts` — JSDoc
  `@athrio/trope-session-start` → `@literate/trope-session-start`.
- `framework/packages/core/src/__tests__/smoke.md` — greeting
  prose rescoped.
- `framework/packages/core/src/__tests__/smoke.test.ts` — JSDoc
  header, `describe(...)` label, and one `expect(...).toContain`
  string rescoped.
- `framework/CLAUDE.md` and `framework/README.md` rewritten for
  the `@literate/*` scope; ADR-019 pointer added; historical
  ADR-016 references retained in prose.
- `framework/bun.lock` — regenerated (self-name refreshed).

Deferred bodies (intentionally untouched):

- ADR-011 through ADR-018 bodies — append-only; their prose
  remains the historical journal of what was decided even where
  ADR-019 supersedes a clause.
- Session log
  `2026-04-23T1200-athrio-framework-genesis.md` — append-once
  body; its `@athrio/*` content is preserved as journal.
- Legacy `packages/*` — frozen per ADR-018.

Verification:

- `bun install` at `framework/` succeeds; lockfile regenerated
  with `@literate/framework` as the root workspace name.
- `bun test` at `framework/packages/core/` — 2 pass, 0 fail, 10
  expect() calls.
- `grep '@athrio/' framework/` — four remaining hits, all
  intentional prose references: three pointers to the
  superseded ADR-016 clause
  (`framework/CLAUDE.md`, `framework/README.md`,
  `framework/packages/core/src/index.ts`) and one reservation
  note in `framework/CLAUDE.md` naming the sister-repo scope.
  `bun.lock` no longer carries any `@athrio/*` name after
  regeneration.

## Summary

Superseded ADR-016's `@athrio/*` namespace clause and amended
ADR-018 §3 and §7 via ADR-019, reinstating `@literate/*` as the
publication scope for every rewrite-shipped package. The `@athrio/`
scope is reserved for the sister-repo Athrio product that LF is
abstracted from, not for LF itself. Renamed `@athrio/framework` →
`@literate/framework` and `@athrio/core` → `@literate/core` across
`framework/package.json`, `framework/packages/core/package.json`,
the Effect `Context.Tag` identifiers in `execution.ts` and
`services.ts`, and all mutable prose referencing the old scope;
regenerated the `framework/` lockfile; re-ran the smoke tests
(2 pass, 0 fail). Frozen ADR-011…ADR-018 bodies and the prior
session log are untouched — they remain the append-only historical
record of the decision that ADR-019 now corrects.

## Deferred / Discovered

Carried forward from prior session (now re-scoped to
`@literate/*`):

- `@literate/trope-gate-flow` — the ADR-017 critical-path
  Trope; next implementation target.
- `@literate/trope-session-start` — encodes IMP-1's start-path
  detection as a composable workflow Step.
- `@literate/trope-session-end` — encodes IMP-5.
- File-backed `ExecutionLogService` — parses the session-log
  `## Execution Log` fenced block (ADR-013).
- Live `AIInvoke` and `GateService` bindings — currently stubs.
- `@literate/cli` and `@literate/template-minimal` — follow-ups
  once the workflow Tropes exist.

Discovered in this session:

- The `@athrio/` npm scope belongs to the sister-repo product
  (`/Users/yegor/Projects/Coding/athrio-com/athrio/`). LF must
  not publish under it. Captured as durable reasoning in
  ADR-019; also already captured in agent memory
  (`athrio_reference.md`).
- Bun's lockfile retains the top-level workspace `name` across a
  simple `bun install` — changing the root package name requires
  deleting and regenerating `bun.lock`. Not itself ADR-worthy,
  but worth noting if a future rename surfaces.
- ADR amendments across multiple ADR bodies work cleanly as a
  new ADR that names the amended sections, relying on the
  `Status:`-line-as-sole-mutable convention to carry the
  supersession forward without breaking the append-only body
  rule. Pattern may be worth a small spec or a note in
  `corpus/CLAUDE.md`'s mutability section if it recurs.

Frozen ADR-011..ADR-018 bodies still reference `@athrio/*`; that
is by design. If a future consumer of the corpus needs a
machine-readable view of "current namespace", ADR-019 is the
authoritative row.

