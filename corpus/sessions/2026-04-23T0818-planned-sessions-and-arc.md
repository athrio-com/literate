# Session: 2026-04-23 — planned sessions and the docs-site arc

**Date:** 2026-04-23
**Started:** 2026-04-23T08:18
**Status:** Closed (2026-04-23T09:06)
**Chapter:** — (no chapter yet)
**Agent:** Claude Opus 4.7 (1M context)

## Pre-work

Per `session-start`:

- Last session (`2026-04-22T1801-deferred-cleanup`) Summary: template
  tree free of legacy `terms/`; Concept count corrected; `add trope`
  and `compile` smoke-tested deterministic.
- Deferred / Discovered carried forward: Effect Layer I/O wiring,
  `literate check` schema validation, orphan force-push held. None
  are upstream to the Goals below.
- ADR index reviewed: ADR-001 (algebra), ADR-005 (prose-first MDX +
  Schema), ADR-009 (Tropes as packages) are upstream constraints on
  Goal 1's reshape of the session lifecycle. ADR-002 (`corpus/ →
  src/ ← .literate/` invariant) and ADR-007 (no `.literate/` in LF
  repo) are upstream for the multi-session arc planned in Goal 2.
- Mid-session prototype at `site/components/dev/*` and the dev-mode
  CSS in `site/app/globals.css` were authored before this session
  opened, on a misread that "trope" was loose language. The Person
  corrected this. The prototype is left in place untouched as a
  reference implementation; it is non-authoritative and will be
  superseded by the Trope realisation produced in Session D.

## Goals

### Goal 1 — Author "Planned Sessions" into the session lifecycle

**Status:** Completed
**Category:** process
**Topic:** Extend the session lifecycle so a session may exist in a
`Planned` state before it is started, carrying a multi-session arc of
provisional Goals that future sessions instantiate. Today a session
is `Open` (work in progress) or `Closed` (finished). There is no
mechanism for pre-scoping a multi-session arc, no place for an
upstream session to draft the Goals of a successor session, and no
gate on plan-level work distinct from in-session Goal gating.
This Goal authors the prose for the new lifecycle.

**Upstream:**
- `packages/concept-session/src/concept.mdx` — current Status
  vocabulary and section list. Material revision; gated.
- `packages/trope-session/src/prose.mdx` — header / sections /
  mutability description; updated to match.
- `packages/trope-session-start/src/prose.mdx` and
  `packages/trope-session-end/src/prose.mdx` — workflow updates so
  starting a Planned session adopts its Plan, and closing a session
  may carry forward an unstarted Plan to a successor.
- `corpus/categories/` — possibly add `session-status.md`
  formalising the closed Status set; today only `goal-status.md` and
  `adr-status.md` exist.
- `corpus/CLAUDE.md` — operational rules referencing the session
  lifecycle; updated where necessary.
- The Person's framing: planned sessions must be adjustable mid-
  flight, with adjustments themselves gated.

**Scope:**
- Add `Planned` to the session Status set, with the transitions
  `Planned → Open → Closed` and (rare) `Planned → Abandoned`.
- Add a `## Plan` section to the session log shape, gated as a unit
  on first-author and on material revision. The Plan declares an
  ordered sequence of provisional successor sessions, each with a
  short slug, a one-line topic, dependencies, and a provisional
  Goals list (each Goal with `Topic`, `Upstream`, `Acceptance`).
- Specify Plan adjustability: a Planned session may revise its own
  Plan up to the moment it transitions to `Open`; adjustments are
  gated. Once a successor session is `Started`, the parent's Plan
  entry for it is frozen (the successor's own log carries its
  authoritative Goals).
- Specify the provenance link: every session log carries an
  optional `Planned by:` field (path to the parent session log) and
  every Plan entry carries the eventual `Realised by:` field (path
  to the successor log) once the successor exists.
- Update `trope-session-start` so a session that finds itself
  named in a parent's Plan adopts that Plan entry's Goals as its
  draft Goals (still subject to its own gate).
- Update `trope-session-end` to (a) carry forward unstarted Plan
  entries by referencing them in `## Deferred / Discovered`, and
  (b) refuse to close if Plan entries remain `Active` without
  explicit Person-authored disposition.
- Add `corpus/categories/session-status.md` if it does not exist;
  add it to the `categories/categories.md` index.

**Out of scope:**
- Authoring an actual ADR for this; per the Person's clarification
  ("Concept is its ADR"), the Concept update IS the architectural
  decision artefact. ADRs remain reserved for one-shot tooling
  commitments and append-only amendments to prior ADRs.
- Tooling: the CLI does not yet parse Plans. `literate check`
  schema validation of Plan blocks is deferred to v0.2+.
- Backporting Plans into the two existing closed session logs.

**Acceptance:**
- `packages/concept-session/src/concept.mdx` carries the new
  Status set, the `## Plan` section description, and the
  Planned/Realised provenance fields.
- `packages/trope-session/src/prose.mdx`,
  `packages/trope-session-start/src/prose.mdx`,
  `packages/trope-session-end/src/prose.mdx` are consistent with
  the Concept update.
- `corpus/categories/session-status.md` exists with members
  {`Planned`, `Open`, `Closed`, `Abandoned`} and the transitions
  documented.
- `corpus/categories/categories.md` indexes the new file.
- `corpus/CLAUDE.md` operational rules accommodate the new
  Planned status (the session-lifecycle paragraph is updated).
- `bun run typecheck` clean across affected packages.

**Notes:**
- The Concept update is gated; this session's Acceptance of the
  Goal *is* the gate for the Concept-level material revision.
- Plan-as-Goal-staging-area mirrors what gating already does at
  Goal level; it lifts the same discipline up one level.

### Goal 2 — Plan the multi-session arc for `@literate/docs`

**Status:** Completed
**Category:** process
**Topic:** Use the Planned-Sessions mechanism authored in Goal 1
to draft the arc of upcoming sessions that produce the new
`@literate/docs` consumer project: the `template`/`dev-overlay`
Concepts, the templating-mechanism choice, the Trope and Template
packages, the CLI generalisation, the bootstrap of `@literate/docs`,
and the start of LF-disciplined development inside it. The arc lives
as the `## Plan` of this session log; Goal 1 must be Accepted before
this Plan can be authored under the new shape.

**Upstream:**
- Goal 1's Concept update.
- The Person's strategic direction:
  - Existing `site/` is left untouched as a reference. Not migrated.
  - `@literate/docs` is a new peer project under the monorepo,
    scaffolded by CLI from a new `@literate/template-docs` template.
  - LF the framework is `@literate/framework`; `corpus/` is its
    own project's corpus. `@literate/docs` will gain its own
    `corpus/` and `.literate/`.
  - "Concept is its ADR" — Concepts are the higher-order
    architectural canon. ADRs are reserved for tooling commitments
    and append-only amendments.
  - Templating mechanism is open ("explore"); current generators
    (eta, handlebars, plop, hygen, degit, cookiecutter, shadcn-style
    component-copy, AI-augmented templates) all candidates.
  - Templates stay separate from Tropes (DX clarity).

**Scope:**
- Author the `## Plan` block of this session log, listing
  provisional successor sessions B–F+ with slug, topic,
  dependencies, and provisional Goals. Each Plan entry's Goals
  carry `Topic`, `Upstream`, `Acceptance`; full `Scope` / `Out of
  scope` / `Notes` are deferred to the successor session's own
  draft (which re-gates).

**Out of scope:**
- Executing any of Sessions B–F+ within this session.
- Touching package code outside what Goal 1 requires.

**Acceptance:**
- The `## Plan` block exists with provisional Sessions B–F+.
- Each Plan entry has at least one provisional Goal with `Topic`,
  `Upstream`, `Acceptance`.
- Dependencies between Plan entries are explicit (e.g. Session D
  depends on the Concepts authored in Session B and the
  templating-mechanism ADR from Session C).

**Notes:**
- The Plan is provisional. Successor sessions revise per discovery.
- Session-D Trope realisation will reference the existing
  `site/components/dev/*` prototype as a starting implementation
  but the authoring discipline (prose first, Concept-gated) is
  not bypassed.

## Plan

The arc that produces `@literate/docs`, scaffolded by a new
templating mechanism through a new template package, with the
dev-overlay collaboration pattern formalised as a Concept and
realised as a thin Trope. Five planned sessions; each gets its
own `Planned` log under `corpus/sessions/`.

### Plan entry B — Primitives: `concept-template`, `concept-dev-overlay`, nested-consumer ADR

**Slug:** `primitives-template-and-dev-overlay`
**Topic:** Author the two new Concepts that successor sessions
depend on, and clarify ADR-007's scope so nested consumer
projects (`site/`, `docs/`) gain their own `.literate/`.
**Depends on:** none (this session's Goal 1).
**Realised by:** `corpus/sessions/2026-04-24T0900-primitives-template-and-dev-overlay.md`

Provisional Goals:

- **B-G1 — Author `concept-template`.**
  *Topic:* Formalise Templates as a primitive: a typed bundle
  declaring an id, version, scaffold tree path, default Tropes
  manifest, optional substitution variables, optional
  post-scaffold hooks. Concept ships under
  `packages/concept-template/` with prose + Effect Schema.
  Indexed in `corpus/concepts/concepts.md`.
  *Upstream:* This session's lifecycle update; existing
  `packages/template-minimal/` as the de-facto reference.
  *Acceptance:* `packages/concept-template/` exists with
  `concept.mdx` + `index.ts`; the existing `template-minimal`
  package is shown to satisfy the Concept (no code change
  required, just a prose cross-reference); typecheck clean.
- **B-G2 — Author `concept-dev-overlay`.**
  *Topic:* Formalise the dev-mode collaboration pattern: a
  Region (labelled, identifiable runtime UI surface with a
  stable `idx`), Core vs Optional regions, registry semantics,
  toggle+persistence semantics, dev-mode gating, the HTML
  contract (`data-idx` / `data-trope-region`). The Concept is
  stack-agnostic; React/Vue/etc. realisation is a consumer or
  template concern.
  *Upstream:* The mid-session prototype at
  `site/components/dev/*` as a reference shape; the user's
  framing ("idx for the agent" + "meta-trope toggle, except
  Core").
  *Acceptance:* `packages/concept-dev-overlay/` exists with
  `concept.mdx` + `index.ts` (Schema for `RegionRecord`,
  `RegistryState`); indexed; typecheck clean.
- **B-G3 — ADR-011: nested-consumer carve-out for ADR-007.**
  *Topic:* Append-only ADR clarifying that ADR-007's
  "no `.literate/` in LF repo" applies to the framework root
  only; nested consumer projects in the same monorepo are
  normal LF consumers and gain their own `.literate/` and
  `corpus/`.
  *Upstream:* ADR-007; the Person's "monorepo, two distinct
  projects" framing.
  *Acceptance:* `corpus/decisions/ADR-011-nested-consumer-carve-out.md`
  exists, Accepted; ADR index updated; ADR-007's `Status:` line
  records the amendment reference.

### Plan entry C — Templating mechanism choice (ADR-012)

**Slug:** `templating-mechanism`
**Topic:** Survey current generators and AI-augmented
scaffolders; commit to one templating mechanism via an ADR.
**Depends on:** B-G1 (`concept-template` defines the contract a
mechanism must satisfy).
**Realised by:** `corpus/sessions/2026-04-25T0900-templating-mechanism.md`

Provisional Goals:

- **C-G1 — Survey templating tools.**
  *Topic:* Compare eta, handlebars, plop, hygen, degit,
  cookiecutter, shadcn-style copy, and at least one
  AI-augmented option (e.g., a prompted-fill scaffold). Score on
  pure-Effect compatibility, parameterisation expressiveness,
  conditional file inclusion, JSON-aware substitution, runtime
  size, and DX for the docs-site case.
  *Upstream:* `concept-template` (B-G1) defines the contract.
  *Acceptance:* A short comparison memo authored under
  `corpus/memos/` (folder created if absent) summarising
  findings; at most three finalists.
- **C-G2 — ADR-012: templating mechanism for `@literate/cli`.**
  *Topic:* Pick one mechanism and document why; specify the
  variable syntax, conditional-file convention, and how the
  manifest of selected Tropes is propagated.
  *Upstream:* C-G1 memo.
  *Acceptance:*
  `corpus/decisions/ADR-012-templating-mechanism.md` exists,
  Accepted; ADR index updated.

### Plan entry D — `trope-dev-overlay` + `@literate/template-docs`

**Slug:** `dev-overlay-trope-and-docs-template`
**Topic:** Author the thin `dev-overlay` Trope (typed glue
realising `concept-dev-overlay`); author the `template-docs`
package as the static scaffold tree for a Next.js docs site
that materialises the dev-overlay contract in React.
**Depends on:** B-G1, B-G2, B-G3, C-G2.
**Realised by:** `corpus/sessions/2026-04-26T0900-dev-overlay-trope-and-docs-template.md`

Provisional Goals:

- **D-G1 — Author `trope-dev-overlay`.**
  *Topic:* `packages/trope-dev-overlay/` with `prose.mdx`
  describing realisation discipline (HTML contract,
  localStorage key, dev-mode gating, `shift+D` shortcut,
  Core / Optional discipline), `index.ts` exporting the
  `Trope<typeof DevOverlayConcept>` value, no runtime code.
  *Upstream:* `concept-dev-overlay` (B-G2).
  *Acceptance:* Package exists, typechecks, importable from
  `@literate/cli` catalog.
- **D-G2 — Author `@literate/template-docs`.**
  *Topic:* `packages/template-docs/` with `tree/` containing
  the Next.js scaffold (App Router, `app/`, `components/`,
  `corpus/` skeleton, `package.json` with the `literate`
  manifest naming `dev-overlay` and the standard authoring
  Tropes). The dev-overlay React realisation lives under
  `tree/components/dev/` (lifted from the existing
  `site/components/dev/` prototype, now sanctioned as a Trope
  realisation). `tree/CLAUDE.md` orients the consumer agent.
  Optional substitution slots per ADR-012.
  *Upstream:* C-G2 (mechanism), D-G1 (Trope), the existing
  `site/components/dev/*` prototype.
  *Acceptance:* `packages/template-docs/` exists; the static
  tree under `tree/` is internally consistent; package
  typechecks. (No CLI integration in this session.)

### Plan entry E — CLI generalisation

**Slug:** `cli-multi-template`
**Topic:** Generalise `literate init` to accept any
`@literate/template-*` package; add a bundled-templates catalog
analogous to `BUNDLED_TROPES`; thread the templating mechanism's
parameters through the CLI surface.
**Depends on:** C-G2, D-G2.
**Realised by:** `corpus/sessions/2026-04-27T0900-cli-multi-template.md`

Provisional Goals:

- **E-G1 — Bundled templates catalog.**
  *Topic:* Add `packages/cli/src/template-catalog.ts` modelled
  on `catalog.ts`, importing every `@literate/template-*`
  package and exposing `resolveTemplate(key)`. Wire `init.ts`
  to consult it instead of hardcoding `'minimal'`.
  *Upstream:* C-G2, D-G2.
  *Acceptance:* `literate init template-docs --target /tmp/docs-test`
  scaffolds the docs template; `literate init template-minimal`
  still works; both compile `.literate/` cleanly.
- **E-G2 — Substitution and prompts.**
  *Topic:* If ADR-012 chose a parameterised mechanism, expose
  the parameters via CLI flags (and optionally `@effect/cli`
  prompts). Document the substitution variables in the
  template's `tree/README.md`.
  *Upstream:* E-G1.
  *Acceptance:* `literate init template-docs --target docs --name @literate/docs`
  produces a project whose `package.json` reflects the chosen
  name and whose tree has substitutions applied.

### Plan entry F — Bootstrap `@literate/docs`

**Slug:** `bootstrap-literate-docs`
**Topic:** Use the new CLI to scaffold `@literate/docs/` at the
monorepo root, open its first session log under
`docs/corpus/sessions/`, and validate the round-trip.
**Depends on:** E-G2.
**Realised by:** `corpus/sessions/2026-04-28T0900-bootstrap-literate-docs.md`

Provisional Goals:

- **F-G1 — Scaffold the project.**
  *Topic:* Run `literate init template-docs --target docs --name @literate/docs`
  from the monorepo root; verify `docs/.literate/` is
  materialised, `docs/corpus/` carries skeletal indexes, and
  `docs/package.json` declares the dev-overlay Trope.
  *Upstream:* E-G2; ADR-011 (nested consumer carve-out).
  *Acceptance:* `docs/` exists at the monorepo root; root
  `package.json` workspace globs include it; `bun install`
  + `bun run --filter '@literate/docs' typecheck` clean;
  `docs/.literate/manifest.json` lists the expected Tropes.
- **F-G2 — First session in `docs/corpus/`.**
  *Topic:* Open the inaugural session log under
  `docs/corpus/sessions/`, draft and gate Goal 1
  ("establish the docs landing page under LF discipline"),
  surface the first authoring task. The session itself becomes
  the proof that LF works recursively.
  *Upstream:* F-G1.
  *Acceptance:* `docs/corpus/sessions/<inaugural>.md` exists
  with `Status: Open` and at least one Accepted Goal; the
  session log validates the cross-corpus boundary (LF-project
  decisions stay in `corpus/`, docs decisions stay in
  `docs/corpus/`).

### Plan entry G+ — Develop `docs/` under LF discipline

**Slug:** `docs-development` (umbrella; spawns its own sub-arc)
**Topic:** Iterative authoring of the docs site inside the new
`docs/` project. Discoveries that require LF changes are
surfaced as new sessions in the LF-project `corpus/`.
**Depends on:** F-G2.
**Realised by:** *(populated by the first docs session in F-G2.)*

Provisional Goals:

- **G+-G1 — Author the landing page under LF discipline.**
  *Topic:* Recreate (not copy) the landing page from `site/`
  with prose-first authoring of each section's contract;
  exercise the dev-overlay Trope; surface any LF gaps as
  return-trip sessions in the LF-project `corpus/`.
  *Upstream:* F-G2.
  *Acceptance:* `docs/app/page.tsx` renders a landing page with
  the dev-overlay Trope realised; every section has an
  upstream Concept or spec under `docs/corpus/`; one
  return-trip session in LF-project `corpus/` (or a clean
  bill of health stating none was needed).

## Decisions Made

- **Concept-level material revision: `session` Concept extended.**
  Added `Planned` and `Abandoned` to the Status set, the optional
  `## Plan` section, the `Planned by` / `Realised by` provenance
  fields, and the planned-vs-spontaneous lifecycle paths. Files:
  `packages/concept-session/src/concept.mdx`,
  `packages/concept-session/src/index.ts`,
  `packages/trope-session/src/prose.mdx`,
  `packages/trope-session-start/src/prose.mdx`,
  `packages/trope-session-end/src/prose.mdx`. Per the Person's
  framing ("Concept is its ADR"), no separate ADR was authored.
- **Closed-vocabulary addition: `session-status.md`.** New
  category file at `corpus/categories/session-status.md` with
  members {`Planned`, `Open`, `Closed (timestamp)`, `Abandoned`}
  and the transition diagram. Indexed in
  `corpus/categories/categories.md`.
- **Operational rules updated.** `corpus/CLAUDE.md` session
  lifecycle paragraph rewritten to cover spontaneous + planned
  paths and the new `(Optional) Planning` step; mutability
  table row for session log extended to cover `## Plan`.
- **Plan accepted: docs-site arc.** Five Plan entries (B–F)
  authored under Goal 2 and materialised as `Planned` successor
  logs. The G+ umbrella entry remains a Plan reference only
  (its first concrete session will be spawned by the F session).

## Work Done

- Renamed session log from `2026-04-23T0818-dev-overlay-trope.md`
  to `2026-04-23T0818-planned-sessions-and-arc.md` after the
  Person's strategic reframe; rewrote the body with the revised
  Goals 1 and 2.
- Edited `packages/concept-session/src/concept.mdx`: added
  Status set, `## Plan` section description, `Planned by` /
  `Realised by` provenance, planned-vs-spontaneous lifecycle,
  mutability rules for Plan entries.
- Edited `packages/concept-session/src/index.ts`: extended
  `SessionStatus` union with `'Planned'` and `'Abandoned'`;
  added `PlanGoal`, `PlanEntry` Schemas; added `started` as
  optional, `plannedBy` as optional, `plan` as optional in
  `SessionInstanceSchema`.
- Edited `packages/trope-session/src/prose.mdx`: header and
  sections updated to match Concept; mutability section
  rewritten; planned-filename caveat noted.
- Edited `packages/trope-session-start/src/prose.mdx`: split
  into spontaneous + planned start paths; added the
  Planned-sessions list step.
- Edited `packages/trope-session-end/src/prose.mdx`: added
  Plan-entry validation; added the carry-forward step under
  Deferred / Discovered.
- Created `corpus/categories/session-status.md`; added row in
  `corpus/categories/categories.md`.
- Edited `corpus/CLAUDE.md`: session lifecycle paragraph
  rewritten; mutability table row for session log updated.
- Authored `## Plan` block in this session log with five Plan
  entries (B–F) plus an umbrella G+ entry.
- Created the five `Planned` successor logs:
  `2026-04-24T0900-primitives-template-and-dev-overlay.md`,
  `2026-04-25T0900-templating-mechanism.md`,
  `2026-04-26T0900-dev-overlay-trope-and-docs-template.md`,
  `2026-04-27T0900-cli-multi-template.md`,
  `2026-04-28T0900-bootstrap-literate-docs.md`. Each carries
  provisional Goals copied from the parent Plan entry; each
  will be re-gated when the session transitions to `Open`.
- Updated `corpus/sessions/sessions.md` with all six new rows
  (this session and the five Planned successors).
- Ran `bun run --filter "@literate/concept-session" --filter
  "@literate/trope-session" --filter "@literate/trope-session-start"
  --filter "@literate/trope-session-end" --filter "@literate/cli"
  typecheck` — clean across all five.

## Summary

Extended LF's session lifecycle to admit a `Planned` status,
introducing a `## Plan` section that lets one session pre-scope a
multi-session arc with provisional Goals; updated the `session`
Concept, the `session` / `session-start` / `session-end` Tropes,
the `corpus/CLAUDE.md` operational rules, and added the new
`session-status` closed vocabulary. Used the new mechanism in the
same session: authored a five-entry Plan for the docs-site arc
(Concepts → templating-mechanism ADR → Trope + Template package
→ CLI generalisation → bootstrap of `@literate/docs`) and
materialised the five `Planned` successor logs. Goal 1 land
established that "Concept is its ADR" — material Concept revisions
are the architectural decision artefact and no separate ADR was
required. Typecheck clean across all affected packages. The
mid-session prototype at `site/components/dev/*` remains in place
untouched, sanctioned for use as the reference implementation
that Session D's Trope realisation will draw from.

## Deferred / Discovered

- [ ] **Plan entry G+ (`docs-development`) is an umbrella**: no
  `Planned` log was created for it, since its first concrete
  session will be spawned by the F session (`bootstrap-literate-docs`).
  Carry forward to F's responsibility.
- [ ] **The five `Planned` successor logs** carry provisional
  Goals copied verbatim from this session's Plan entries. Each
  will be re-gated when its session transitions to `Open`; the
  Person may Accept verbatim, Correct, Clarify, or Reject any
  Goal.
- [ ] **`literate check` schema validation of `## Plan` blocks**
  is not yet implemented; deferred to v0.2+. Until then, the
  Plan section is enforced by review discipline alone.
- [ ] **Existing closed session logs are not back-filled** with
  the new shape (no Plan blocks, no `Planned by` field). Per
  the Goal 1 Out-of-scope, this is intentional.
- [ ] Carried forward from prior session (still open):
  - Effect Layer I/O wiring for `session-start`, `session-end`,
    `adr-flow`.
  - `literate check` schema-level validation against authored
    instances.
  - Orphan force-push to `main` remains pre-authorised but held
    for explicit Person confirmation.
