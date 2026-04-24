# Session: 2026-04-25 — Workflow Tropes: `trope-session-start` and `trope-session-end`

**Date:** 2026-04-23
**Started:** 2026-04-23T16:49
**Status:** Closed (2026-04-23T17:43)
**Chapter:** — (no chapter yet)
**Agent:** Claude Opus 4.7 (1M context)
**Planned by:** corpus/sessions/2026-04-23T1600-unify-monorepo-layout.md
**Depends on:** corpus/sessions/2026-04-23T1311-core-metalanguage.md

> **Provisional.** The Goals below are drafts copied from the
> parent session's Plan entry. They land authoritatively only
> when this session opens and each Goal is re-presented to the
> Person for Accept / Correct / Clarify / Reject (IMP-1.6).

## Pre-work

Per `session-start` (planned path, IMP-1):

- **Last `Status: Closed` session.** S1 closed at
  `2026-04-23T1311-core-metalanguage` (Closed 2026-04-23T13:38).
  Its Summary: Added `Concept<D>`, `Trope<C>`, and
  `Variant<C, D>` types to `@literate/core` on top of the Step
  substrate — the minimum metalanguage S2 needs to author
  workflow Tropes as `workflowStep` compositions. S1's Deferred
  items are the three remaining MVP-arc sessions (S2 = this, S3
  live services, S4 CLI+template+e2e). The preceding session
  (`2026-04-23T1600-unify-monorepo-layout`, Closed 16:40)
  established the post-ADR-020 layout: active `packages/*`
  at repo root, legacy frozen under `legacy/*`, `@literate/`
  namespace per ADR-019.
- **ADR index reviewed.** ADR-011 through ADR-015, ADR-017,
  ADR-019, ADR-020 Accepted. ADR-016 Superseded by ADR-019
  (namespace) and ADR-020 (layout) — body untouched. ADR-018
  Accepted with scope relocated to `legacy/` by ADR-020. No
  supersessions affect this session's scope. Relevant upstreams
  for this work: ADR-011 (Step substrate), ADR-012 (six Step
  kinds), ADR-013 (session log as event store), ADR-014
  (`Protocol.continue`), ADR-015 (TypeScript + `.md` siblings),
  ADR-017 (gate decisions as typed Steps).
- **Planned-session queue.** S3
  (`2026-04-26T0900-live-services-and-file-execution-log`) and
  S4 (`2026-04-27T0900-cli-template-and-e2e-smoke`) remain
  `Planned`, gated on this session and then S3 respectively.
  Parent's Plan entry for S2 was pre-stamped `Realised by:
  corpus/sessions/2026-04-25T0900-workflow-tropes-session-lifecycle.md`;
  updated at this transition to the realised path
  `corpus/sessions/2026-04-23T1649-workflow-tropes-session-lifecycle.md`
  (the filename rename proposed and Person-Accepted on open).
- **Mechanical cleanup on open.** Fixed the stale `Depends on:`
  path on this log's header from `2026-04-24T0900-…` (the slot
  originally drafted for S1) to the realised path
  `2026-04-23T1311-core-metalanguage.md` (Person-confirmed,
  ungated metadata edit). Filename renamed from
  `2026-04-25T0900-workflow-tropes-session-lifecycle.md` to
  `2026-04-23T1649-workflow-tropes-session-lifecycle.md` via
  `git mv` to match the actual start time (IMP-1.5
  same-calendar-day rule); parent's `Realised by:` path and the
  sessions-index row updated accordingly. The Depends-on slug on
  S3's header (`…-live-services-and-file-execution-log.md`)
  still points at the old filename; updated to the new path as
  an ungated metadata edit since S3 remains `Planned`.
- **Surfaced anomaly.** IMP-1.5 prescribes UTC for `Started:`
  and `Closed:` stamps; every existing session log in the corpus
  actually records local time (EEST, UTC+3). This session
  continues the existing local-time convention to stay
  consistent with the corpus; amending IMP-1.5's "UTC"
  stipulation to "local (or any consistent zone)" or normalising
  all prior stamps to UTC is a deferred decision — surfacing
  here rather than introducing a convention break mid-corpus.

## Goals

### Goal 1 — Author `@literate/trope-session-start` as an executable workflow Trope

**Status:** Completed
**Category:** feature
**Topic:** Re-author the session-start procedure (IMP-1) as a
`workflowStep`-composed Trope on the Step substrate. The legacy
prose at `legacy/packages/trope-session-start/src/prose.mdx` is
the authoritative procedural description; this session translates
its steps (start-path detection, orphan handling, pre-work
surfacing, goal gating) into a composition of `prose`, `effect`,
`gate`, and `workflow` Steps, with typed inputs (repo root,
agent id) and a typed output (opened session reference).

**Upstream:**

- Legacy `legacy/packages/trope-session-start/src/prose.mdx` —
  procedural authority for IMP-1.
- `corpus/CLAUDE.md#IMP-1` — the inline imperative version that
  the framework implementation must satisfy.
- `@literate/core` metalanguage (S1) — Concept/Trope types.
- ADR-014 — the `Protocol.continue` entry point this Trope is
  dispatched from.
- ADR-017 — gate decisions as typed Steps.

**Acceptance:**

- `packages/trope-session-start/` package exists, is part of
  the workspace, and exposes `sessionStartTrope` as a `Trope<…>`.
- Prose for the Trope lives in sibling `.md` files per ADR-015.
- Unit tests exercise the orphan-detection, spontaneous-start,
  and planned-start branches under stub services.
- No imports from `legacy/`.

### Goal 2 — Author `@literate/trope-session-end` as an executable workflow Trope

**Status:** Completed
**Category:** feature
**Topic:** Re-author the session-end procedure (IMP-5) on the
Step substrate. The Trope validates that every Goal carries a
terminal Status, every Plan entry is `Realised by` / `Planned` /
`Abandoned`, and the session has a populated Summary. Stamps
`Status: Closed (YYYY-MM-DDTHH:MM)` atomically and updates the
sessions index.

**Upstream:**

- Legacy `legacy/packages/trope-session-end/src/prose.mdx` —
  procedural authority for IMP-5.
- `corpus/CLAUDE.md#IMP-5` — inline imperatives.
- S1 core metalanguage; ADR-013 event-store semantics.

**Acceptance:**

- `packages/trope-session-end/` exists; exposes
  `sessionEndTrope`; prose in sibling `.md`.
- Unit tests cover happy-path close plus validation failures
  (missing Summary, Active Goal at close).
- No imports from `legacy/`.

**Notes:**

- The two Tropes together are the minimum dispatch surface
  `Protocol.continue` needs in S4 for an end-to-end session
  run. Other workflow Tropes (`trope-gate-flow`,
  `trope-goal-flow`, `trope-adr-flow`) are deferred past the MVP.

### Goal 3 — Introduce `Modality` as a general six-case ADT

**Status:** Completed
**Category:** feature
**Topic:** Extend the metalanguage in `@literate/core` with
`Modality` — a general ADT (not Trope-specific) whose six
variants (`Protocol`, `Weave`, `Tangle`, `Unweave`, `Untangle`,
`Attest`) mark the mode of any algebra artefact. Each variant
is a tagged struct (pattern-matchable, composable). `Trope<C>`
gains a required `modality: Modality` field; `Concept<D>`
gains an optional `modality?: Modality` field (Concepts may
elect a default modality inherited by realising Tropes, or stay
unmoded). Codified in ADR-021. Both Tropes authored in Goals
1 and 2 stamp `modality: { _tag: 'Protocol' }` on creation.

**Upstream:**

- ADR-001 (three-level algebra) — the primitives this field is
  added to.
- ADR-011 (Step substrate) — establishes that executable
  primitives need classification.
- Goals 1 & 2 above — first concrete callers.
- Knuth literate programming (weave/tangle) — lineage for the
  authorial variants; `unweave`/`untangle`/`attest` are LF
  extensions.

**Acceptance:**

- `Modality` schema + type exported from `@literate/core` as a
  Schema.Union of six tagged structs with stable `_tag` values.
- Ergonomic constructors exported (`Modality.Protocol`,
  `Modality.Weave`, …) for call-site concision.
- `Trope<C>` has required `modality: Modality`;
  `Concept<D>` has optional `modality?: Modality`.
- ADR-021 Accepted; `decisions/decisions.md` row added;
  appropriate tag set.
- Existing `kinds.test.ts` and `smoke.test.ts` updated so the
  `NoteLifecycleTrope` fixture carries a `modality`; no
  regressions.

**Notes:**

- Single value per Trope (no composite modes). Tropes that
  straddle (e.g., scaffold-then-document) should be
  decomposed.
- Applying the field to Concepts is lighter-touch (optional):
  some Concepts are genuinely mode-polymorphic; forcing a
  declaration everywhere creates noise. Tropes, being
  realisations, always pick a mode.
- Order matters: ADR-021 lands before code, and the core
  extension lands before Goals 1 & 2's Tropes are authored.
  The new Tropes are born with `modality: Modality.Protocol`.

## Decisions Made

- **ADR-021 — `Modality` as a general six-case ADT.** Accepted.
  Adds a general ADT (`Protocol` | `Weave` | `Tangle` |
  `Unweave` | `Untangle` | `Attest`) applicable to Tropes
  (required) and Concepts (optional). Schema-backed; unit
  variants at v0.1 with payloads deferred as non-breaking
  future extensions. Indexed at
  `corpus/decisions/decisions.md`. Files touched:
  `corpus/decisions/ADR-021-modality-adt.md` (created),
  `corpus/decisions/decisions.md` (index row),
  `packages/core/src/kinds.ts` (extended),
  `packages/core/src/index.ts` (exports),
  `packages/core/src/__tests__/kinds.test.ts` (fixture +
  three new test groups for Modality).

## Work Done

- Created `corpus/decisions/ADR-021-modality-adt.md` — new
  ADR specifying the `Modality` ADT, its six variants,
  placement on `Trope<C>` (required) and `Concept<D>`
  (optional), downstream effects (`Protocol.continue`
  dispatch filter, `literate add` default filter, docs
  grouping, publishing/versioning split), and the
  single-value-per-Trope constraint.
- Added the ADR-021 row to `corpus/decisions/decisions.md`
  with `#algebra` `#protocol` tags and `Accepted` status.
- Extended `packages/core/src/kinds.ts`:
  - Added `ModalitySchema` (Schema.Union of six tagged
    structs) and the `Modality` type alias.
  - Added the `Modality` constructor namespace (ergonomic
    `Modality.Protocol`, `Modality.Weave`, … forms).
  - Added `modality?: Modality` to `Concept<D>` and
    `ConceptDefinition<D>`; conditional spread in `concept()`
    preserves `exactOptionalPropertyTypes` compatibility.
  - Added required `modality: Modality` to `Trope<C>`,
    `TropeDefinition<C>`, and the `trope()` constructor.
- Extended `packages/core/src/index.ts` to export
  `Modality`, `ModalitySchema`, and the updated
  `ConceptDefinition` / `TropeDefinition` interfaces.
- Updated `packages/core/src/__tests__/kinds.test.ts`:
  - `NoteLifecycleTrope` fixture now carries
    `modality: Modality.Weave`.
  - New assertion on the fixture's `modality`.
  - New `@literate/core Modality` describe block with four
    tests: constructor values, Schema round-trip,
    pattern-matching via `switch(m._tag)`, and the
    `Concept` optional vs `Trope` required surface.
- `smoke.test.ts` required no change (no Trope fixture; no
  Modality dependency).
- `bun run typecheck` passes in `packages/core/`.
- `bun test` passes: 10/10 across 2 files (up from 7 before;
  3 new Modality tests).

### Goal 1 — `@literate/trope-session-start`

- Gated `concept.md` and `prose.md` prose (prose-before-code
  per IMP-6); Person-Accepted the four prose files plus the
  `SessionStore` service shape proposed for addition to
  `@literate/core`.
- Added the `SessionStore` service Tag to
  `packages/core/src/services.ts`: `listDir` / `read` /
  `write` / `rename` / `now`, a `Timestamp` schema, a
  `SessionStoreError` tagged error, an always-fail
  `StubSessionStoreLayer` (merged into `DefaultStubLayers`),
  and a working `makeInMemorySessionStore` factory +
  `inMemorySessionStoreLayer` for tests. Also added
  `makeScriptedGateService` + `scriptedGateServiceLayer` so
  Protocol-mode tests can drive gate decisions without
  reaching for real stdin. All new surface re-exported from
  `@literate/core`'s `index.ts`.
- Authored the Trope package at
  `packages/trope-session-start/`:
  - `package.json` (name `@literate/trope-session-start`,
    workspace dep on `@literate/core`).
  - `tsconfig.json` mirroring core.
  - `src/concept.md` — typed contract (input, output,
    errors, preconditions, postconditions, invariants,
    services, modality `Protocol`).
  - `src/prose.md` — ten-section procedural decomposition,
    one `##` heading per atomic Step; closes with a
    `## Composition` sketch of the `Effect.gen` body.
  - `src/index.ts` — full realisation: the
    `SessionStartConcept`, ten exported atomic Steps
    (`detectStartPath`, `handleOrphan`, `openLog`,
    `surfacePriorContext`, `readAdrIndex`,
    `writePreWorkBlock`, `freezeParentPlanEntry`,
    `reGateGoals`, `stampAcceptedGoals`,
    `returnSessionRef`), the composing `sessionStartStep`
    (`workflowStep` with all ten Steps listed in
    `dependencies`), and the `sessionStartTrope` with
    `modality: Modality.Protocol`.
- Authored
  `src/__tests__/trope-session-start.test.ts` covering four
  tests: static-surface assertions (Concept + Trope shape
  plus `dependencies.length === 10`), the spontaneous
  branch (empty sessions dir except one Closed prior → new
  log created, path correct), the planned branch (one
  ready `Planned` log with satisfied `Depends on` →
  header rewritten and Goal 1 gated through), and the
  orphan branch (one non-`Planned` log shows `Open` →
  orphan gate `Accept({action: 'resume'})` returns
  SessionRef pointing at the orphan). Tests pass 4/4 under
  `bun test`; typecheck clean.

### Goal 2 — `@literate/trope-session-end`

- Authored the Trope package at
  `packages/trope-session-end/`:
  - `package.json`, `tsconfig.json` (same shape as the
    start package).
  - `src/concept.md` — typed contract listing the seven
    validators, error channels (`SessionEndIncomplete`,
    `SessionMalformed`), preconditions (log exists with
    `Status: Open`), postconditions (header + index both
    show `Closed (…)`).
  - `src/prose.md` — five-section procedural decomposition
    (read / validate / stamp / update-index / return) plus
    `## Composition`.
  - `src/index.ts` — full realisation: the
    `SessionEndConcept`, five atomic Steps, the composing
    `sessionEndStep` (`workflowStep` with all five listed
    in `dependencies`), and the `sessionEndTrope` with
    `modality: Modality.Protocol`. Also exports the
    `SessionEndIncomplete` tagged error that callers
    pattern-match on.
- Authored
  `src/__tests__/trope-session-end.test.ts` covering four
  tests: static-surface assertions
  (`dependencies.length === 5`), the happy path
  (fully-populated Open log → `closedAt` stamped, header
  rewritten to `Closed (2026-04-23T17:00)`, sessions-index
  row updated), the missing-Summary branch (raises
  `SessionEndIncomplete` with `'## Summary'` in `missing`;
  on-disk state remains `Open`), and the Active-Goal
  branch (raises `SessionEndIncomplete` with a
  `Goals[…].Status=terminal` entry in `missing`). Tests
  pass 4/4; typecheck clean.

### Cross-cutting

- Workspace wiring: `bun install` at repo root picks up
  both new packages and writes them to the lockfile. No
  changes needed to root `package.json` — the existing
  `workspaces: ['packages/*']` entry covers them.
- No imports from `legacy/` anywhere in the new packages
  (`grep from ['\"].*legacy packages/` returned no
  matches).
- Workspace-wide test status after this session: 18/18
  pass, 89 expect() calls, across 4 files in 3 packages
  (up from 10/10 in 1 package at the start of the
  session).

## Deferred / Discovered

Deferred to later sessions:

- **Live `SessionStore` binding (filesystem)** → S3. The
  in-memory factory shipped this session backs tests;
  wiring node:fs + git-mv binds live remains S3's work
  alongside the file-backed `ExecutionLog`.
- **Live `GateService` (stdin/stdout)** → S3. Scripted
  factory shipped for tests; CLI binding is S3.
- **Goal re-gate Correct semantics.** At v0.1 the Trope
  treats `Correct` as `Accept` without applying the
  Person's edit to the provisional draft. A proper
  implementation needs a Goal-draft schema rich enough to
  accept edits (topic, upstream, acceptance, etc.) and
  re-present; scope for a dedicated `trope-goal-flow`.
- **Orphan `close` / `revert` actions.** The Trope gates on
  `resume` / `close` / `revert` but v0.1 only implements
  `resume`; the other two are recorded in the gate
  decision but not dispatched. A caller that wants
  `close` must explicitly invoke `sessionEndStep` after
  this Trope returns (document once the CLI exists).
- **Slug suggestion for spontaneous starts.** v0.1 takes
  `slug` as an optional input; when omitted defaults to
  `'session'`. A gated Concept-driven suggestion is
  deferred.
- **Filename-rename gate on planned start.** Specified in
  `prose.md` but not yet implemented; the current Trope
  keeps the planned log's original filename even if it is
  far from the start time. Implementation is a gated
  rename with Accept/Reject only; a small extension.
- **`## Pre-work` block content richness.** The current
  writer emits a compact summary (prior path + first 200
  chars of Summary; ADR row count). A future pass can
  surface the fuller pre-work block the imperatives
  describe (explicit ADR supersession flagging, etc.).
- **Header-stamp timestamp convention.** IMP-1.5 says UTC;
  prior sessions use local (EEST). S2 continues local for
  consistency. An amendment of IMP-1.5 (or a full
  normalisation pass) is deferred.

Discovered in this session:

- **Modality is deeper than Tropes.** The six-case ADT
  (ADR-021) applies naturally to Concepts too (optional
  field added). It probably extends to Steps, Variants,
  and even ADRs themselves as a classification axis; each
  extension is additive and should be motivated by
  concrete call-sites rather than speculative application.
- **Schema-union workaround.** Effect's
  `Schema.Union(Schema.Struct({_tag: Schema.Literal(…)}))`
  is verbose compared to a tagged-enum constructor, but
  keeps type-level exhaustiveness clean. Worth
  re-evaluating `Data.TaggedEnum` when adding the next
  ADT to see if it composes better with
  `Schema.Schema.Type`.
- **Prose-section-to-Step correspondence is a convention.**
  ProseRef currently has no type-level binding to a
  section slug; consumers must pass `{section: '…'}` at
  `ProseInvoke.render` time. A future `proseSection()`
  helper returning a section-scoped `ProseRef` would make
  the binding explicit and catch typos at
  compile time. Deferred.
- **Open-session detection matches on Status exactly.**
  My `detectStartPath` checks `header.status === 'Open'`.
  A log mid-transition with `Status: Open` *and* a stale
  `Closed (…)` appended could be ambiguous; for v0.1 this
  is not a concern (transitions are atomic rewrites) but
  the parser will need a sharper story if partial
  writes become possible.

## Summary

Shipped the minimum executable workflow Tropes the MVP arc
needs and, along the way, promoted a broader algebraic
commitment out of a mid-session clarification. ADR-021
introduces `Modality` as a general six-case ADT
(`Protocol` / `Weave` / `Tangle` / `Unweave` / `Untangle`
/ `Attest`) — lineage from Knuth's weave/tangle, with
`unweave`/`untangle`/`attest` as LF-specific extensions —
made required on `Trope<C>` and optional on `Concept<D>`.
`@literate/core` gained the ADT, a minimal `SessionStore`
service (list/read/write/rename/now + in-memory factory +
stub-fail layer), and a `scriptedGateServiceLayer` test
helper. Two new workspace packages,
`@literate/trope-session-start` (ten atomic Steps + one
composing `workflowStep`) and `@literate/trope-session-end`
(five atomic Steps + validator + stamp), each with prose
siblings per ADR-015, together constitute the Protocol-mode
dispatch surface `Protocol.continue` will need in S4. S3
(live services) and S4 (CLI + template + e2e) remain
`Planned` and are structurally unblocked.
