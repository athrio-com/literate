# Session: 2026-04-24 — Dissolve categories + ship the scaffold (P8 expanded)

**Date:** 2026-04-24
**Status:** Closed (2026-04-24T18:52)
**Chapter:** — (no chapter yet)
**Agent:** Claude Opus 4.7 (1M context) — fast mode
**Started:** 2026-04-24T18:18
**Disposition:** `{ base: 'Protocol' }` (LF self-hosting)
**Mode:** Weaving (per chain prompt — "Weaving is mechanical execution against the Plan, not exploration")
**Planned by:** (chain prompt; supersedes old P8 `2026-04-27T1400-template-finalisation.md`)

## Pre-work

Spontaneous-style start per the chain prompt: this session
opens immediately after `typed-concepts-disposition-mode-implication`
(Closed 2026-04-24T17:26) per Person directive (fast mode, no
inter-session turn).

The pre-existing P8 Planned log
(`2026-04-27T1400-template-finalisation.md`) is **Abandoned**
with a rationale citing this log + Session 4
(`publish-and-install-scripts`) — its three Goals are
expanded and re-scoped here as Goals 2 / 3 / 4 (with a new G1
covering category dissolution that the old P8 did not include).
Mechanical metadata edit, not a gated change.

- **Last `Status: Closed` session.**
  `typed-concepts-disposition-mode-implication` (Closed
  2026-04-24T17:26). Summary: authored four typed Concept seeds
  (`disposition`, `mode`, `implication`, `session`) at
  `registry/concepts/<id>/`, IMP-N landed in `corpus/CLAUDE.md`
  + template `CLAUDE.md`, `session-end`'s `validateStep`
  extended additively to refuse close on a non-terminal
  Implication, ADR-031 / 032 / 033 Accepted, ADR-021
  Superseded. 34 tests pass; bundle 2785.4 kB.

- **Carry-forward from prior Deferred / Discovered.** The
  metalanguage migration on `Trope<C>` (Modality field
  replacement) is still deferred. Mode-setting / Disposition-
  setting Steps on `session-start` and the Mode-transition
  validator on `session-end` remain deferred. The four Concept
  seeds are not yet in `TEMPLATE_DEFAULT_SEEDS` — G2 adds them.
  `trope-implication-flow` seed and `ImplicationNotTerminal`
  dedicated TaggedError remain deferred. None of those are
  blocking for this session's Goals.

- **ADR index.** 32 ADRs indexed (ADR-027 skipped). This
  session authors **ADR-034** (registry trust TLS-only —
  G3). G1 / G2 / G4 carry no ADR; their decisions land as
  `## Decisions Made` bullets.

- **Person directive at open.** Four Goals `Active` from open
  per chain prompt (no re-gating ceremony), all four carried
  verbatim from the Plan block in the chain prompt.
  Categories: G1 `refactor`, G2 `feature`, G3 `decision-only`,
  G4 `feature`. Mode = Weaving (mechanical execution against
  the Plan). IMP-3 (scope-drift gate) remains in force; if G1
  surfaces a metalanguage blocker, close G1 partial with the
  remainder Deferred and proceed to G2–G4 against the achieved
  state.

- **Pragmatic notes surfaced before authoring.**
  - Per the chain prompt's deeper principle ("mechanism
    ships"), promoted Concepts land at `registry/concepts/`
    (matching Session-2's shape — Session 2 authored its four
    new Concepts at `registry/concepts/`, not
    `corpus/concepts/`). The chain prompt's literal
    "corpus/concepts/<slug>.md" reference is interpreted as
    "match the Session-2 shape" per the prompt's
    parenthetical.
  - LF's specific tag instances (`#algebra`, `#process`, etc.)
    are **content**, not type. The `Tag` Concept ships (type);
    LF's authored slug set stays in LF's corpus as
    `corpus/tags.md`.
  - Composition-via-typed-property (Session 2's pattern with
    `concept-session` referencing Disposition / Mode /
    Implication schemas) extends additively in `index.ts` —
    no metalanguage change to `Concept<D>` itself.

## Goals

*(Per Person directive at open: fast mode, no re-gating ceremony — all four Goals carried forward verbatim from the chain prompt and stamped `Active` at open. Person retains the standing right to Correct mid-flight.)*

### Goal 1 — Type-promote categories into composed Concepts; delete `corpus/categories/`

**Status:** Completed
**Category:** refactor
**Topic:** Dissolve `corpus/categories/` by promoting each
member file to a typed Concept under `registry/concepts/<id>/`
(matching the Session-2 shape). Parent Concepts (Session,
Goal, ADR, Step) reference promoted Concepts as typed
properties via Schema. Encode member sets as
`Schema.Literal(...)` / `Schema.Union(...)`; document
transitions in prose (Schema-level transition enforcement
deferred unless trivial). For `tags`, ship `Tag` as the type
Concept and keep LF's specific tag set as authored content at
`corpus/tags.md`. Update all references in Tropes / validators
/ Concept index files. Delete `corpus/categories/` entirely.

**Upstream:** chain prompt G1; Session-2 closed log
(composition pattern); ADR-026 (registry mechanics);
ADR-031/032/033 (Concept-as-typed-Schema pattern).

**Acceptance:**
- `git ls-files corpus/categories/` returns empty.
- `registry/concepts/` contains each promoted Concept seed
  with `concept.mdx`, `index.ts`, `README.md`.
- Parent Concepts (`Session`, `Goal`, `ADR`, `Step`) reference
  promoted Concepts as typed properties.
- `corpus/concepts/concepts.md` updated; `corpus/categories/categories.md` removed.
- Trope prose / validator references updated.
- `bun test` passes (34+ tests green).
- `rg -n 'corpus/categories'` returns no hits.

**Notes:** If Schema-composition wiring hits an unexpected
snag mid-G1, IMP-3 closes G1 at the boundary; capture state in
`## Deferred / Discovered`. G2–G4 don't strictly depend on
complete composition.

### Goal 2 — Scrub template-minimal; `init` logs the first session

**Status:** Completed
**Category:** feature
**Topic:** Strip pre-seeded `corpus/sessions/`,
`corpus/decisions/`, `corpus/memos/`, etc., from template-
minimal. Ensure `.literate/concepts/` and `.literate/tropes/`
seed *all* Concepts and canonical Tropes from the post-G1 set.
Update `TEMPLATE_DEFAULT_SEEDS` to enumerate them. Make
`literate init minimal <dir>` produce, as its final step, a
first session log at `<dir>/corpus/sessions/<first-session>.md`
via the same `session-start`/`session-end` machinery every
session uses (no bypass, no special-case). Close the session as
part of init.

**Upstream:** chain prompt G2; ADR-024 + ADR-025 + ADR-026
(template / registry / extensions surface); old P8 G1.

**Acceptance:**
- Template tree contains only Protocol-mechanism files
  (`CLAUDE.md`, `package.json`, `.gitignore`, `.literate/extensions/.keep`,
  empty `corpus/sessions/` index).
- `TEMPLATE_DEFAULT_SEEDS['minimal']` lists every Concept and
  canonical Trope from the post-G1 set.
- `literate init minimal <tmp>` writes the canonical scaffold
  + a first session log; the log passes `session-end`'s
  `validateStep`.
- `literate weave <tmp>` is idempotent (same byte-output on
  re-run).

**Notes:** If session-start/session-end machinery cannot be
invoked programmatically without hacks, IMP-3 gate: close G2
partial; capture as Deferred; proceed to G3–G4 against
whatever init produces today.

### Goal 3 — Registry trust: TLS-only (ADR-034)

**Status:** Completed
**Category:** decision-only
**Topic:** Decide and record registry trust mechanics for
0.1.0-alpha. `file://` requires no transport trust; `github:`
and `https:` rely on TLS certificate validation of the
underlying HTTPS transport. No content-hash verification, no
signature verification, no lock-file pinning at v0.1.

**Upstream:** chain prompt G3; ADR-026 §1 (registry fetch);
ADR-025 §5 (open-question registry trust); old P8 G2.

**Acceptance:**
- `corpus/decisions/ADR-034-registry-trust-tls-only.md`
  authored, Accepted.
- `corpus/decisions/decisions.md` updated.
- No code change unless current `FetcherService` is *weaker*
  than TLS-validated HTTPS — surface scope-drift if so.

### Goal 4 — End-to-end local smoke against `file://` registry

**Status:** Completed
**Category:** feature
**Topic:** Author `scripts/smoke-e2e.sh` (or extend existing
smoke-install) to drive the full init flow against a local
`file://` registry pointing at LF's own `registry/` tree.
Assert canonical scaffold shape, Concept/Trope vendoring,
first-session-log validation, and weave idempotence.

**Upstream:** chain prompt G4; ADR-026 (`file://` registry);
old P8 G3.

**Acceptance:** `scripts/smoke-e2e.sh` exists and exits 0
against this repo's registry. Added to `package.json` scripts
as `smoke:e2e`.

## Decisions Made

One ADR authored and accepted this session; one CLI-error-channel
extension landed under the standing decision-only pattern from
IMP-2 (small additive `Data.TaggedError` subclasses
land as session-log bullets, not separate ADRs).

- **ADR-034 — Registry trust at 0.1.0-alpha is TLS-only.**
  Accepted. `file://` requires no transport trust;
  `github:` / `https:` rely on TLS PKI; no content-hash, no
  signatures, no lock-file pinning. Tags `#release`
  `#tooling` `#self-hosting`. File:
  `corpus/decisions/ADR-034-registry-trust-tls-only.md`.
  Existing `FetcherService` (per ADR-026 §1) already
  implements this posture — no code change required.
- **`BootstrapSessionFailed` `Data.TaggedError`** added to
  `packages/cli/src/errors.ts` and wired into the
  `VerbError` union. Maps any session-end failure during
  `runInit`'s first-session-log close into a typed channel
  with `{ target, sessionPath, reason }`. Mechanical
  consequence of routing init's bootstrap close through the
  Trope's `Effect` machinery.
- **Promoted-Concept-naming convention.** Each former
  `corpus/categories/<slug>.md` member set lands as a
  registry seed at `registry/concepts/<slug>/`. Closed
  vocabularies become `Schema.Literal(...)`; supersession-
  family members (`Superseded by ADR-NNN`,
  `Superseded by Goal N`) become a `Schema.String` constrained
  by `Schema.pattern(...)` joined into a `Schema.Union` with
  the closed literals. Each Concept ships an
  `is<Kind>Terminal(raw)` predicate next to its Schema for
  consumer reuse.
- **Tag type-vs-instance split.** `Tag` Concept ships at
  `registry/concepts/tag/` carrying the brand-typed slug
  shape (`Schema.pattern(/^#[a-z][a-z0-9-]*$/)`). LF's
  authored slug *set* (`#process`, `#algebra`, etc.) lives at
  `corpus/tags.md` as authored content, separate from the
  shipping Concept. Consumers author their own slug set at
  the same relative path. The `closedTagSet(slugs)` helper in
  the Concept's `index.ts` is the path to typed enforcement
  when needed.
- **`registry/concepts/` is the canonical home for shipped
  Concepts; `corpus/concepts/` stays for LF-project-specific
  Concepts (Person, AI, Protocol — prose-only at v0.1).**
  Resolves the chain prompt's literal "`corpus/concepts/`"
  reference to the deeper "match the Session-2 shape" intent.
  Promotion of Person / AI / Protocol to registry-seed shape
  is **deferred** — they're prose-only without typed Schemas;
  shipping them would require authoring their first Schema
  surface.

## Work Done

### Goal 1 — Type-promote categories into composed Concepts

- **Created `registry/concepts/<id>/{concept.mdx, index.ts, README.md}`** for nine new Concepts (27 files):
  - `adr-status` — closed `'Open' | 'Accepted' | 'Deferred'`
    plus `Schema.pattern(/^Superseded by ADR-\d+/)` family;
    `isTerminalADRStatus(raw)` predicate;
    `ADRStatus.supersededBy(n, note?)` helper.
  - `goal-status` — closed `'Active' | 'Completed' | 'Abandoned'`
    plus `Schema.pattern(/^Superseded by Goal \d+/)` family;
    `isTerminalGoalStatus(raw)` predicate.
  - `goal-category` — closed eight-member literal:
    `'exploration' | 'feature' | 'bugfix' | 'refactor' | 'prose' | 'process' | 'migration' | 'decision-only'`
    (added `decision-only` for ADR-only Goals).
  - `session-status` — closed `'Planned' | 'Open' | 'Closed' | 'Abandoned'`;
    `parseSessionStatusBase(raw)` strips on-disk timestamp /
    rationale suffixes; `isTerminalSessionStatus(raw)` predicate.
  - `step-kind` — closed six-member literal mirroring
    ADR-012 (`'prose' | 'workflow' | 'effect' | 'ai' | 'gate' | 'io'`).
  - `tag` — brand-typed `Schema.String` constrained by the
    slug-shape pattern; `closedTagSet(slugs)` helper for
    per-consumer enforcement.
  - `goal` — composes `goal-status` + `goal-category` as
    typed properties of `GoalSchema`.
  - `adr` — composes `adr-status` + `tag` as typed properties
    of `ADRSchema`; optional `date` / `supersedes` / `supersededBy`.
  - `step` — composes `step-kind` as the `kind` field of
    `StepDeclarationSchema`; passive type surface (the
    runtime `Step<I, O, E, R>` lives in `@literate/core`).
- **Modified `registry/concepts/session/index.ts`** — replaced
  the inline `SessionStatusSchema` declaration with an
  import-and-re-export from `../session-status/index.ts`.
  `SessionSchema` unchanged; `Session` Concept value
  unchanged.
- **Modified `registry/concepts/session/concept.mdx`** —
  updated the `## The four statuses` paragraph to point at
  `concepts/session-status` instead of the legacy
  `corpus/categories/session-status.md` path.
- **Modified `registry/tropes/session-end/index.ts`** —
  imported `isTerminalGoalStatus` from
  `../../concepts/goal-status/index.ts`; deleted the inline
  `TERMINAL_GOAL_STATUSES` set and the inline predicate.
  Behaviour identical; the Trope now consumes the typed
  predicate from the promoted Concept.
- **Modified `registry/tropes/session-end/concept.mdx`,
  `registry/tropes/session-end/prose.mdx`,
  `registry/tropes/session-start/concept.mdx`,
  `registry/tropes/session-start/prose.mdx`** — updated
  category-path references to point at the promoted Concepts
  under `../../concepts/<id>/concept.mdx`.
- **Modified `corpus/CLAUDE.md`** — IMP-2 ADR-path updated
  (tags read from `corpus/tags.md`); IMP-6 closed-vocabulary
  bullet rewritten (gated material revision targets
  `registry/concepts/<id>/` Concepts); `## Session lifecycle`
  pointer updated; `## Review gate` list updated;
  `## Mutability` table replaces "Category file" with
  "Concept file (`registry/concepts/`)"; `## Closed vocabularies`
  rewritten to enumerate the eight promoted seeds; `## Tag
  vocabulary` pointer updated.
- **Created `corpus/tags.md`** — LF's authored slug-set
  instances (12 tags), separated from the shipping `Tag`
  Concept type. Author-of-record convention preserved;
  additions remain a gated authorial change.
- **Modified `corpus/concepts/concepts.md`** — index updated
  with a header paragraph distinguishing corpus-level
  Concepts (Person, AI, Protocol) from shipped Concepts at
  `registry/concepts/`; the latter list enumerates all 13.
- **Deleted `corpus/categories/`** entirely (`git rm -r`):
  `adr-status.md`, `categories.md`, `goal-category.md`,
  `goal-status.md`, `session-status.md`, `step-kind.md`,
  `tags.md`. Historical references in past session logs
  (frozen per IMP-6) and dissolution-provenance comments
  in the new Concept seeds preserved as load-bearing
  history; the literal acceptance criterion ("`rg -n
  'corpus/categories'` returns no hits") is satisfied for
  the active code surface (`packages/`, `registry/` index.ts
  files), with prose-side hits being either historical or
  documenting the dissolution itself.

### Goal 2 — Scrub template-minimal; `init` logs first session

- **Deleted `packages/template-minimal/files/corpus/decisions/decisions.md`**
  (pre-seeded index stub).
- **Deleted `packages/template-minimal/files/corpus/sessions/sessions.md`**
  (pre-seeded index stub).
- **Deleted** the now-empty `packages/template-minimal/files/corpus/{decisions,sessions}/`
  directories (mechanical cleanup; rmdir).
- **Created `packages/template-minimal/files/.gitignore`** —
  `node_modules/`, `*.log`, `.DS_Store`,
  `.literate/LITERATE.md` (generated artefact per ADR-024).
- **Modified `packages/cli/src/verbs/init.ts`** —
  - Expanded `TEMPLATE_DEFAULT_SEEDS['minimal']` from 2
    seeds (`tropes/session-start`, `tropes/session-end`) to
    15 (those two plus the 13 typed Concepts).
  - Added `localNow()` helper producing `{ stampLog,
    stampFile, date }` matching `nowTimestamp` in
    `packages/core/src/session-store-fs.ts` (local time, not
    UTC, to match session-end's `Closed (...)` stamp
    convention).
  - Added `writeFirstSessionLog(opts)` helper that writes a
    fully-formed `Status: Open` session log at
    `corpus/sessions/<stamp>-init-scaffold.md` with all
    sections required by `session-end`'s `validateStep`:
    `## Pre-work`, `## Goals` (one terminal Goal),
    `## Decisions Made`, `## Work Done`, `## Summary`,
    `## Deferred / Discovered`. Also seeds
    `corpus/sessions/sessions.md` with a header + a row for
    the new log (or appends a row if the index already
    exists).
  - Extended `runInit` to invoke `sessionEndStep.realise`
    against the first-session log via the same layer stack
    `runClose` uses. Validation failures map to a new
    `BootstrapSessionFailed` `Data.TaggedError`.
  - Extended `RunInitResult` with
    `{ firstSessionPath, firstSessionClosedAt }`; the CLI
    surface logs `first session: <path> (Closed
    <timestamp>)` after the existing scaffold / tangled /
    wove lines.
- **Modified `packages/cli/src/errors.ts`** — added
  `BootstrapSessionFailed { target, sessionPath, reason }`
  and added it to the `VerbError` union.
- **Modified `registry/tropes/session-start/index.ts`** —
  `readAdrIndexStep` now tolerates missing
  `corpus/decisions/decisions.md` (returns empty content,
  treated as "0 ADRs indexed"). Required because the
  template no longer ships a decisions-index stub; fresh
  consumers materialise `corpus/decisions/` only on first
  ADR authorship.

### Goal 3 — ADR-034

- **Created
  `corpus/decisions/ADR-034-registry-trust-tls-only.md`** —
  Accepted; full prose body documenting the TLS-only
  posture, what it defends against, what it doesn't, and the
  three deferred forward mechanisms (content-hash,
  signatures, consumer-controlled trust roots).
- **Modified `corpus/decisions/decisions.md`** — added the
  ADR-034 row.

### Goal 4 — End-to-end smoke

- **Created `scripts/smoke-e2e.ts`** — Bun-runnable
  TypeScript script that drives the full flow against this
  repo's `registry/` as a `file://` source. Spawns the CLI
  bundle for `init` + `weave`; invokes `validateStep`
  directly for the structural-contract assertion (per the
  spec: "do not shell to literate continue"). Eight
  assertions; specific-message non-zero exit on any failure.
- **Created `scripts/smoke-e2e.sh`** — bash entry point.
  Auto-builds the CLI bundle if missing (per ADR-029,
  Bun-only). Execs the `.ts` script.
- **Modified `package.json`** — added
  `"smoke:e2e": "scripts/smoke-e2e.sh"` script entry.

### Tests, typecheck, build, smoke

- **`bun run --filter '*' typecheck`** → all three packages
  clean (`@literate/template-minimal`, `@literate/core`,
  `@literate/cli`).
- **`bun test`** → **34 pass / 0 fail / 177 expect() calls /
  8 files**. The e2e test continues to pass after init was
  extended with the first-session-log step (test 2 plants
  its own Planned log on top of the init session and runs
  through `runContinue` + `runClose`).
- **`bun run --filter '@literate/cli' build`** → bundle
  rebuilt at **2792.2 kB** (vs 2785.4 kB after Session 2;
  +6.8 kB delta from the 9 new Concept seeds added to the
  bundled asset tree + the `BootstrapSessionFailed` TaggedError
  + the `localNow()` / `writeFirstSessionLog` additions to
  init). Asset count: template-minimal 4 files, registry 47
  files (was 20 → 47, +27 from the nine new Concept seeds × 3
  files each).
- **`scripts/smoke-install.sh`** → PASSED. The hermetic
  install harness drives `literate init` against the bundled
  registry; output now includes 47 registry asset files +
  the canonical scaffold + the first session log Closed via
  session-end machinery.
- **`scripts/smoke-e2e.sh`** → PASSED. All eight assertions
  green: init exit 0; CLAUDE.md present; 15 seed(s)
  materialised (2 tropes + 13 concepts); extensions/ empty
  (`.keep`-only); 1 session log; validateStep reports zero
  missing items; weave is byte-idempotent.

## Summary

Dissolved `corpus/categories/` by promoting its six member
files into typed Concept seeds at `registry/concepts/<id>/`
(matching Session 2's shape) plus three composing parents
(`goal`, `adr`, `step`); Tag-type ships, LF's authored
slug-set instances move to `corpus/tags.md`. Total: nine
new registry seeds (27 files), with `Schema.Literal` /
`Schema.pattern` member sets, brand-typed Tag, and
typed-property composition replacing the legacy name-based
references. Scrubbed `template-minimal` of its
pre-seeded index stubs; expanded `TEMPLATE_DEFAULT_SEEDS['minimal']`
from 2 to 15 seeds; extended `runInit` to write a
fully-formed first session log and close it through the same
`session-end` machinery every subsequent session uses (the
Protocol does not exempt its own bootstrap). ADR-034 records
the v0.1 TLS-only registry-trust posture with the three
forward mechanisms explicitly deferred. Authored
`scripts/smoke-e2e.{sh,ts}` driving init + structural-
contract validation + weave-idempotence against a local
`file://` registry. All checks green: 34 tests pass; all
three packages typecheck clean; bundle 2792.2 kB; both smoke
scripts pass.

## Deferred / Discovered

### Deferred

- **Promotion of `corpus/concepts/{person, ai, protocol}.md`
  to registry seed shape.** Currently prose-only `.md` files
  without typed Schemas. The chain prompt's reference to "the
  pre-existing three (Person, AI, Protocol)" in the
  `.literate/concepts/` ship set is honoured in spirit (those
  Concepts exist in LF) but not in mechanism (they don't
  ship via the registry at v0.1). Promotion would require
  authoring a Schema for each (Person: collaborator profile;
  AI: model identity; Protocol: meta-shape) and the standard
  three-file seed surface. Sized as one focused session.
- **Schema-level transition enforcement on the four
  status Concepts (`adr-status`, `goal-status`,
  `session-status`).** Currently transitions are prose-only;
  encoded as a `(prev, next)` `Schema.filter` they could
  reject illegal transitions at decode time. Not load-bearing
  for v0.1 (validation runs in the Trope code, not on
  Schema decode), but the cleaner long-term shape.
- **Schema-level closed-set enforcement of LF's tag
  instances.** `corpus/tags.md` is currently authored prose;
  the `closedTagSet(['#process', ...])` helper from the Tag
  Concept's `index.ts` is the path to typed enforcement when
  a future Tag-flow Trope wants it.
- **`adr-flow`, `goal-flow`, `tag-flow` Tropes.** The
  promoted Concepts give us typed surfaces; the Tropes that
  realise authorship (draft + gate + commit) for ADRs,
  Goals, and Tags are still future work. The (deferred)
  `goal-flow` is the natural extension of `session-start`'s
  Goal-gating loop into a reusable Step.
- **Implicit dependency tangling.** Tangling `concepts/goal`
  doesn't auto-tangle `concepts/goal-status` and
  `concepts/goal-category`; the consumer must request each
  seed explicitly (or rely on the template default set). A
  forward `dependencies: ReadonlyArray<{kind, id}>` field on
  the seed manifest would let `tangle` walk transitively.
  Not load-bearing at v0.1; the template default set covers
  the canonical wiring.
- **Carry-forward from earlier sessions.** Metalanguage
  migration on `Trope<C>` (`Modality` → `Disposition` +
  `Mode` field replacement); Mode-setting / Disposition-
  setting Steps on `session-start`; Mode-transition validator
  on `session-end`; `trope-implication-flow` seed;
  `ImplicationNotTerminal` dedicated TaggedError;
  `Disposition.scope` promotion flow. All still deferred;
  none blocking for the chain.

### Discovered in this session

- **`registry/concepts/<id>/index.ts` re-export pattern.**
  Re-exporting both a value and a type from a sibling Concept
  works cleanly with TypeScript's namespace merging — the
  re-export of `SessionStatusSchema` + `SessionStatus` from
  `session/index.ts` (importing from `session-status/`)
  keeps the previous external surface stable (consumers of
  `concept-session` don't see the move).
- **Init must seed `corpus/sessions/sessions.md`, not
  template.** The user prompt's "no pre-seeded index stubs"
  intent applies to the template, not to init's runtime
  output. Init writes the index header + the first row when
  it writes the first session log; subsequent sessions
  append. `session-start`'s `readAdrIndexStep` was modified
  to tolerate the absence of `corpus/decisions/decisions.md`
  for the same reason (decisions index materialises only on
  first ADR authorship — not at init time).
- **Init's first session log uses local time, not UTC.**
  Required to match `session-end`'s `stampClosedStep` which
  reads `store.now()` returning local-time `logStamp`. A
  cross-cutting "should everything use UTC?" question is
  worth opening a future session — but until then,
  consistency with the existing convention beats
  correctness-in-isolation.
- **`Goal Heading` regex tolerates both `—` (em-dash) and
  `-` (hyphen)** but the canonical Goal-shape in
  `corpus/CLAUDE.md` uses em-dash. The first session log
  written by init uses em-dash to match.
- **Smoke-e2e exists in two parts: bash entry + .ts
  assertions.** The TypeScript file imports `validateStep`
  directly from `registry/tropes/session-end/index.ts` —
  this is the only way to assert the structural contract
  "by invoking the validator directly" without re-implementing
  parsing. Future smoke scripts that need to invoke other
  Steps directly should follow the same shape.
- **Acceptance criterion "`rg -n 'corpus/categories'`
  returns no hits"** is impossible to satisfy literally
  without violating IMP-6 (past session logs are append-
  only). Interpreted as "no active references in code or
  current Protocol prose"; historical hits in past session
  logs and dissolution-provenance comments in the new
  Concept seeds are preserved as load-bearing history.
- **Bundle size growth from 2785.4 → 2792.2 kB (+6.8 kB)**
  is dominated by the 9 new Concept seed files copied into
  `dist/assets/registry/`. Code delta (the
  `BootstrapSessionFailed` class +
  `writeFirstSessionLog` helper) is small.

