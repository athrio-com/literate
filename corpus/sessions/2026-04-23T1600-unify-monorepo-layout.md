# Session: 2026-04-23 — Unify monorepo layout; scope MVP arc

**Date:** 2026-04-23
**Started:** 2026-04-23T16:00
**Status:** Closed (2026-04-23T16:40)
**Chapter:** — (no chapter yet)
**Agent:** Claude Opus 4.7 (1M context)

## Pre-work

Per `session-start` (spontaneous path):

- Last non-`Planned` session
  (`2026-04-23T1500-literate-namespace-reinstated`) Summary:
  Superseded ADR-016's `@athrio/*` namespace clause via ADR-019;
  reinstated `@literate/*` across the rewrite surface
  (`framework/package.json`, `framework/packages/core`, mutable
  prose). Smoke tests pass (2/2). Deferred items: workflow Tropes
  (`trope-session-start`, `trope-session-end`, `trope-gate-flow`,
  `trope-goal-flow`, `trope-adr-flow`), file-backed
  `ExecutionLogService`, live `AIInvoke` / `GateService`, `cli`,
  `template-minimal`.
- ADR index reviewed: ADR-011 through ADR-019 Accepted.
  ADR-016 carries `Superseded by ADR-019 (namespace clause)`;
  its folder-layout clause (separate `framework/` project) is
  still in force at session open but will be superseded this
  session.
- Planned-session queue at session open: five `Status: Planned`
  logs dated 2026-04-24 through 2026-04-28, charting an arc that
  bootstraps docs templates on top of the legacy algebra
  (primitives-template-and-dev-overlay, templating-mechanism,
  dev-overlay-trope-and-docs-template, cli-multi-template,
  bootstrap-literate-docs). The first is already flagged
  `Planned (superseded by rewrite)` in `sessions.md`; the other
  four assume the legacy Concept/Trope types and the
  `framework/`-vs-`packages/` split that this session dissolves.
- Trigger: the Person asked for a comparative status of the
  `@literate/framework` rewrite vs. the legacy `packages/*` tree
  and then made two material decisions: (1) the monorepo is
  fully dedicated to LF, so root `./packages/` is the canonical
  home and the legacy should be moved to a sibling `legacy/`
  dir; (2) the existing Planned sessions should be abandoned
  unless fully relevant. The Person explicitly waived the Goal
  gate: "No need of gating. I provided decision." This log
  records the decision and proceeds to execute.

## Goals

### Goal 1 — Unify monorepo layout; scope MVP arc

**Status:** Completed
**Category:** migration
**Topic:** The current repo has two workspaces
(root `@literate/monorepo` hosting the frozen legacy, and
`framework/@literate/framework` hosting the rewrite). This split
made sense at genesis (ADR-016 §1) when the rewrite needed
isolation from a still-mutable legacy. With the legacy now frozen
and the rewrite scope firmly owning the repo, the split costs
more than it buys: two dependency trees, two tooling configs, a
`framework/` prefix on every rewrite path, and an implicit
bundling of Tropes under `framework/packages/*` that misreads the
"Tropes are independently shippable" framing of ADR-011 / ADR-017.
This Goal collapses the split: move legacy code + tooling into a
sibling `legacy/` dir (all at once, preserving content), promote
`framework/packages/core` to root `packages/core`, and rewrite the
workspace manifest + mutable prose for the unified layout. In the
same session, re-scope the multi-session arc: abandon Planned
sessions that target the legacy algebra or the legacy docs-template
flow; author a fresh four-session arc that delivers an end-to-end
MVP (core metalanguage → workflow Tropes → live services →
CLI + template + smoke). ADR-020 captures the layout change and
the freeze-scope shift (the freeze now targets `legacy/`, not
`packages/`).

**Upstream:**

- The Person's two decisions in this thread (2026-04-23): root
  `packages/` is the canonical home; legacy moves to a sibling
  new dir; obsolete Planned sessions are abandoned.
- Memory `athrio_reference.md` — LF monorepo is fully dedicated
  to LF, not shared with any sister-repo product; supports the
  "monorepo IS LF" framing.
- ADR-016 — the folder-layout clause being superseded (the
  namespace clause is already superseded by ADR-019; the
  multi-project split is what moves now).
- ADR-018 — the freeze ADR; its scope (`packages/`, `site/`,
  `LITERATE.md`, root tooling) moves to `legacy/` wholesale. The
  freeze stays in force; only the path it targets changes.
- ADR-019 — survives untouched; `@literate/*` namespace remains
  the publication scope for rewrite packages and is reinforced
  by the layout unification.
- Previous session's Deferred / Discovered — the workflow Tropes,
  file-backed ExecutionLog, live services, CLI, and template
  that the new MVP arc will deliver.

**Scope:**

- `corpus/decisions/ADR-020-*.md` — new ADR unifying the
  monorepo layout and re-scoping the ADR-018 freeze onto
  `legacy/`.
- `corpus/decisions/decisions.md` — new row; mark ADR-016
  `Superseded by ADR-020 (layout clause)`; annotate ADR-018
  `Accepted (scope moved to legacy/ by ADR-020)`.
- `corpus/decisions/ADR-016-athrio-namespace-framework-folder.md`
  — `Status:` line only (append-only body).
- `corpus/decisions/ADR-018-legacy-code-frozen-corpus-global.md`
  — `Status:` line only (append-only body).
- Physical archive: move `packages/`, `site/`, `LITERATE.md`,
  legacy root `package.json`, `bun.lock`, `bun.lockb`,
  `mise.toml`, `moon.yml`, `.moon/`, `tsconfig.base.json`,
  `tsconfig.package.json` under `legacy/`. Preserve content.
- Promote `framework/packages/core/` to `packages/core/`;
  promote `framework/package.json` (renaming workspace), `bun.lock`,
  `tsconfig.json`, `README.md` to repo root.
- Root `CLAUDE.md` — rewrite for the unified layout. Remove
  the `framework/` section; the IMP-1 detection narrative stays
  but the "Where you are" map changes.
- `corpus/CLAUDE.md` — update the "Working with `packages/`
  and `framework/packages/`" section; collapse to "Working with
  `packages/` and `legacy/`". Update the NEVER-list legacy-paths
  bullet.
- Remove `framework/CLAUDE.md` and `framework/README.md` (their
  relevant content merges into root files).
- Regenerate `bun.lock` at the new root; run typecheck and smoke
  tests (2/2 expected to pass under the new path).
- `corpus/sessions/sessions.md` — abandon obsolete Planned
  rows; add new Planned rows for the MVP arc.
- Four new Planned session logs under `corpus/sessions/`:
  - `2026-04-24T0900-core-metalanguage.md` (Concept + Trope
    types in `@literate/core`).
  - `2026-04-25T0900-workflow-tropes-session-lifecycle.md`
    (`@literate/trope-session-start` + `@literate/trope-session-end`).
  - `2026-04-26T0900-live-services-and-file-execution-log.md`
    (interactive `GateService`, file-backed `ExecutionLog`).
  - `2026-04-27T0900-cli-template-and-e2e-smoke.md`
    (`@literate/cli` + `@literate/template-minimal` + end-to-end
    session run).

**Out of scope:**

- Editing frozen ADR bodies (011–019). Their prose remains
  historically accurate; only `Status:` lines mutate.
- Editing frozen session log bodies (including the
  `2026-04-23T1500-literate-namespace-reinstated` log whose
  "Working with legacy packages" text now contains path details
  that ADR-020 supersedes).
- Authoring Concept/Trope types themselves — that's Planned
  session S1's scope.
- Touching `node_modules/`, published artefacts, or the git
  index entries for renamed paths beyond what `git mv` / move
  + `bun install` naturally produce.

**Acceptance:**

- ADR-020 exists, Accepted, indexed; ADR-016 and ADR-018
  carry updated Status lines; bodies untouched.
- `legacy/` exists at repo root containing every legacy asset
  listed in Scope; zero legacy-tree files remain at repo root.
- `packages/core/` exists at repo root; `framework/` directory
  is removed.
- Root `package.json` is the single workspace manifest; root
  `bun.lock` regenerates cleanly; `bun test` in `packages/core`
  passes 2/2.
- Root `CLAUDE.md` and `corpus/CLAUDE.md` describe the new
  layout (no stale `framework/` references).
- `sessions.md` shows 4 new Planned rows and 5 Abandoned rows
  (or equivalent journalled transitions).
- This session stamps `Status: Closed`, writes Summary / Work
  Done / Decisions Made / Deferred, updates `sessions.md`.

**Notes:**

- The `@athrio/` scope is still reserved for the sister-repo
  product and still never used by LF. ADR-019 stands.
- The legacy workspace in `legacy/` will not build or test. That
  is fine; it is pure historical reference. The freeze NEVER
  rule remains: no edits to files inside `legacy/` without an
  explicit freeze-lift recorded in a session's Decisions Made.
- This reorg makes legacy → rewrite cross-imports physically
  awkward (different directory subtrees, no shared workspace
  resolution), reinforcing the ADR-018 §4 no-import rule by
  construction.
- The four new Planned sessions are deliberately sequenced so
  each unlocks the next: S1 produces the Concept/Trope types
  S2 depends on; S2 produces the workflow Tropes S3's live
  services are wired for; S4 composes S1–S3 outputs behind a
  CLI and runs an end-to-end session as the MVP acceptance gate.

## Plan

### Planned Session 1 — Core metalanguage (Concept + Trope types)

**Slug:** core-metalanguage
**Realised by:** corpus/sessions/2026-04-23T1311-core-metalanguage.md
**Goals (provisional; re-gated on open):**

- Add `Concept<D>` and `Trope<C>` types to `@literate/core` on
  top of the Step substrate. Minimum surface needed by S2.

### Planned Session 2 — Workflow Tropes: session lifecycle

**Slug:** workflow-tropes-session-lifecycle
**Depends on:** Planned Session 1
**Realised by:** corpus/sessions/2026-04-25T0900-workflow-tropes-session-lifecycle.md
**Goals (provisional; re-gated on open):**

- `@literate/trope-session-start` implementing IMP-1 as a
  composition of Steps.
- `@literate/trope-session-end` implementing IMP-5 as a
  composition of Steps.

### Planned Session 3 — Live services and file-backed ExecutionLog

**Slug:** live-services-and-file-execution-log
**Depends on:** Planned Session 2
**Realised by:** corpus/sessions/2026-04-26T0900-live-services-and-file-execution-log.md
**Goals (provisional; re-gated on open):**

- Interactive `GateService` (CLI stdin/stdout) replacing the
  stub that always suspends.
- `FileBackedExecutionLogLayer` reading/writing the session log
  `## Execution Log` fence per ADR-013; replay-deterministic.

### Planned Session 4 — CLI, template-minimal, end-to-end smoke (MVP capstone)

**Slug:** cli-template-and-e2e-smoke
**Depends on:** Planned Session 3
**Realised by:** corpus/sessions/2026-04-27T0900-cli-template-and-e2e-smoke.md
**Goals (provisional; re-gated on open):**

- `@literate/cli` with `literate continue` as the
  `Protocol.continue` entry point.
- `@literate/template-minimal` rebuilt on the rewrite algebra.
- End-to-end smoke: scaffold template, run `literate continue`
  under scripted stdin, Accept a Goal, close the session. This
  test is the MVP done marker.

## Decisions Made

- Accepted ADR-020 — Unify monorepo layout: single workspace at
  repo root; legacy moves to `legacy/`. Supersedes ADR-016's
  layout clause; relocates the ADR-018 freeze scope to `legacy/`.
  The Person waived the gate step: "No need of gating. I provided
  decision."
- Annotated ADR-016 `Superseded by ADR-019 (namespace clause) and
  ADR-020 (layout clause)`; body untouched.
- Annotated ADR-018 `Accepted (§3, §7 amended by ADR-019; scope
  relocated to legacy/ by ADR-020)`; body untouched.
- Freeze lift authorised (one-time, scoped to this session per
  ADR-020 §3): physically move `packages/`, `site/`,
  `LITERATE.md`, and pre-rewrite root tooling into `legacy/`.
  Content preserved verbatim; paths changed via `git mv` where
  tracked.
- Abandoned five obsolete Planned sessions — the
  docs-template-arc successors of the closed
  `2026-04-23T0818-planned-sessions-and-arc` session — whose
  Goals targeted the legacy algebra or docs-site scaffolding
  rather than the MVP execution path. Each session's Status
  line carries the rationale.
- Authored four new Planned sessions forming the MVP arc
  (S1 core metalanguage → S2 workflow Tropes → S3 live services
  → S4 CLI + template + e2e smoke). Each Planned log carries
  provisional Goals; re-gated on Open per IMP-1.6.

## Work Done

Authored:

- `corpus/decisions/ADR-020-unify-monorepo-layout.md` — new ADR.
- `corpus/sessions/2026-04-23T1600-unify-monorepo-layout.md` —
  this log.
- `corpus/sessions/2026-04-24T0900-core-metalanguage.md` — new
  Planned log (MVP arc S1).
- `corpus/sessions/2026-04-25T0900-workflow-tropes-session-lifecycle.md`
  — new Planned log (MVP arc S2).
- `corpus/sessions/2026-04-26T0900-live-services-and-file-execution-log.md`
  — new Planned log (MVP arc S3).
- `corpus/sessions/2026-04-27T0900-cli-template-and-e2e-smoke.md`
  — new Planned log (MVP arc S4, MVP capstone).

Modified (Status lines only, append-only ADR bodies untouched):

- `corpus/decisions/ADR-016-athrio-namespace-framework-folder.md`
  — `Status:` updated.
- `corpus/decisions/ADR-018-legacy-code-frozen-corpus-global.md`
  — `Status:` updated.
- `corpus/decisions/decisions.md` — ADR-020 row added;
  ADR-016 and ADR-018 rows updated.

Modified (Status lines only, Planned-session bodies untouched):

- `corpus/sessions/2026-04-24T0900-primitives-template-and-dev-overlay.md`
  → Abandoned.
- `corpus/sessions/2026-04-25T0900-templating-mechanism.md`
  → Abandoned.
- `corpus/sessions/2026-04-26T0900-dev-overlay-trope-and-docs-template.md`
  → Abandoned.
- `corpus/sessions/2026-04-27T0900-cli-multi-template.md`
  → Abandoned.
- `corpus/sessions/2026-04-28T0900-bootstrap-literate-docs.md`
  → Abandoned.

Modified (mutable prose and index):

- `corpus/sessions/sessions.md` — rewritten for the new arc;
  Abandoned rows and Planned rows for MVP arc.
- `CLAUDE.md` (root) — rewritten for unified layout.
- `corpus/CLAUDE.md` — "Working with `packages/` and
  `framework/packages/`" section rewritten to "Working with
  `packages/` and `legacy/`"; NEVER-list legacy-import bullet
  re-anchored to `legacy/`; canonical-procedure-sources
  pointers re-pathed to `legacy/packages/trope-session-*/`.
- `README.md` (root) — rewritten from the former
  `framework/README.md`; install instructions are now
  repo-root instructions.
- `package.json` (root) — `name` field `@literate/framework`
  → `@literate/monorepo` per ADR-020 §6.
- `packages/core/src/index.ts` — JSDoc path corrected from
  `../../../../corpus/` to `../../../corpus/` for the new
  depth; ADR reference range updated to include ADR-020.

Physical moves (git mv for tracked files; plain mv for
untracked; rm -rf for regenerable `node_modules`):

- `packages/` → `legacy/packages/`
- `site/` → `legacy/site/`
- `LITERATE.md` → `legacy/LITERATE.md`
- `package.json` (legacy) → `legacy/package.json`
- `bun.lock` (legacy) → `legacy/bun.lock`
- `bun.lockb` (untracked) → `legacy/bun.lockb`
- `mise.toml` → `legacy/mise.toml`
- `moon.yml` → `legacy/moon.yml`
- `.moon/` → `legacy/.moon/`
- `tsconfig.base.json` → `legacy/tsconfig.base.json`
- `tsconfig.package.json` → `legacy/tsconfig.package.json`
- `README.md` (legacy) → `legacy/README.md`
- `temp/` (gitignored scratch) → `legacy/temp/`
- `framework/packages/core/` → `packages/core/`
- `framework/package.json` → `package.json` (root)
- `framework/bun.lock` → `bun.lock` (regenerated after rename)
- `framework/tsconfig.json` → `tsconfig.json` (root)
- `framework/README.md` → `README.md` (root; then rewritten)
- `framework/CLAUDE.md` — removed (content merged into root
  `CLAUDE.md`)
- `framework/` directory removed (empty after moves).

Deleted:

- Root `node_modules/` (legacy) — regenerable.
- `framework/node_modules/` — regenerable; lockfile moved
  separately.

Verification:

- `bun install` at repo root — succeeds; fresh lockfile
  generated with `@literate/monorepo` as root workspace name.
- `bun test` at `packages/core/` — 2 pass, 0 fail, 10
  expect() calls (identical to the pre-move baseline).
- `bun x tsc --noEmit` at `packages/core/` — clean (no errors).
- `bun x tsc --noEmit` at repo root — clean.
- `grep framework/ packages/ corpus/CLAUDE.md CLAUDE.md README.md`
  returns zero matches outside the frozen session-log bodies
  and frozen ADR bodies.
- `grep @athrio/ packages/` returns zero matches.

## Deferred / Discovered

Carried forward into the MVP arc (each addressed by the named
Planned session):

- Concept/Trope metalanguage in `@literate/core` → S1
  (2026-04-24T0900-core-metalanguage).
- `@literate/trope-session-start` and
  `@literate/trope-session-end` → S2
  (2026-04-25T0900-workflow-tropes-session-lifecycle).
- Interactive `GateService` and file-backed `ExecutionLog`
  → S3 (2026-04-26T0900-live-services-and-file-execution-log).
- `@literate/cli`, `@literate/template-minimal`, and
  end-to-end smoke → S4
  (2026-04-27T0900-cli-template-and-e2e-smoke).

Deferred past the MVP (re-surface when the MVP capstone lands):

- `@literate/trope-gate-flow` (ADR-017 critical path; the
  inline Accept/Correct/Clarify/Reject mechanism S3's live
  GateService wires may already be sufficient for MVP).
- `@literate/trope-goal-flow` and `@literate/trope-adr-flow`
  (workflow Tropes for authoring Goals and ADRs; convenience,
  not MVP-blocking).
- Live `AIInvoke` binding (S4 ships with a stub that fails
  noisily; the MVP acceptance gate is a session run with no
  AI calls).
- Release-cadence / changelog / publishing ADR — when the
  first `@literate/*` package ships.

Discovered in this session:

- The ADR-018 freeze rule can carry forward under a path
  relocation via an ADR-scope clause rather than a per-file
  lift. ADR-020 §3 records this pattern: "The *one-time* move
  of legacy files into `legacy/` performed by the session that
  Accepts this ADR is authorised by this ADR itself and does
  not require a separate freeze lift." Worth codifying in
  `corpus/CLAUDE.md`'s mutability section if similar
  relocations recur.
- `bun.lock`'s top-level `name` binds to the root workspace
  manifest's `name` at generation time. Regenerating is the
  reliable way to rename a workspace; editing the lockfile by
  hand is fragile.
- `git mv` handles directory moves with full subtree reparenting
  while preserving history; `git status` shows them as rename
  operations, which makes the reorg commit readable. Plain `mv`
  for untracked files still works but does not appear in the
  `git mv` rename display.

## Summary

Unified the monorepo layout via ADR-020: collapsed the prior
`framework/` project folder into the repo root, moved the legacy
scaffold wholesale into a sibling `legacy/` directory, and
relocated the ADR-018 freeze scope accordingly. Active
`@literate/*` packages now live at root `packages/*` alongside
`corpus/`; the legacy tree is preserved verbatim under `legacy/`
for historical reference and reading. ADR-016's layout clause is
superseded; its body is untouched. Re-scoped the multi-session
arc: abandoned the five pre-rewrite Planned sessions that
targeted legacy-algebra docs-template scaffolding, and authored
four new Planned sessions forming the MVP arc (core metalanguage
→ workflow Tropes → live services → CLI + template + e2e smoke).
Smoke tests pass 2/2; typecheck clean; `bun install` at repo
root regenerates the lockfile cleanly under the new
`@literate/monorepo` workspace name. The repo is now structurally
aligned with "monorepo IS LF": one active workspace, one frozen
reference tree, one living corpus.
