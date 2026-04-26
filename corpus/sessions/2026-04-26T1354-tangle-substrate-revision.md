# Session: Tangle the substrate revision (directive parser, kinds.ts, learn verb, meta-seeds, reconcile migration)

**Date:** 2026-04-26
**Status:** Closed (2026-04-26T14:42)
**Chapter:** —
**Agent:** Claude Opus 4.7 (1M context) — fast mode
**Started:** 2026-04-26T14:13
**Disposition:** `{ base: 'Protocol', scope: 'algebra' }` (substrate
  surface; the LFMs whose code-side this session realises)
**Mode:** Tangling (G1–G7 derive mechanically from prose
  Accepted in the parent session; FAST mode discipline — chain
  prompt is the gate, no per-Goal re-deliberation, no
  intermediate red states)
**Planned by:** corpus/sessions/2026-04-26T0715-concept-modality-legacy-implication.md
**Depends on:** corpus/sessions/2026-04-26T0715-concept-modality-legacy-implication.md

## Upstream

The parent session
(`2026-04-26T0715-concept-modality-legacy-implication`, Closed
2026-04-26T13:54) authored the Weaving prose for the substrate
revision: the algebra LFM, the annotation substrate LFM, the
disposition-and-mode LFM, the step substrate LFM, and the
learn-and-coherence LFM. It also gated five Concept-revision
decisions for `packages/core/src/kinds.ts`. This Tangling
successor implements the substrate-side artefacts those prose
decisions imply.

Authoritative upstream LFMs:

- `corpus/manifests/protocol/algebra.md` — Concept-primary
  algebra (`status: Drifted`).
- `corpus/manifests/protocol/annotation-substrate.md` —
  `:` unified annotation surface (`status: Pending`).
- `corpus/manifests/protocol/disposition-and-mode.md` — Mode
  and Disposition at Trope level (`status: Drifted`).
- `corpus/manifests/protocol/step-substrate.md` — Steps as
  atomic Tropes (`status: Drifted`).
- `corpus/manifests/protocol/learn-and-coherence.md` —
  universal `learn` verb + coherence thesis
  (`status: Pending`).

Authoritative upstream decisions: parent session's `## Decisions
Made` block, sections *Concept-revision decisions (Goal 7)* and
*LFM bodies authored*.

## Pre-work

Per IMP-1 (Planned start path):

- **Last `Status: Closed` session.** `2026-04-26T0715-concept-modality-legacy-implication`
  (Closed 2026-04-26T13:54). Summary: substrate revision arc.
  Algebra is now Concept-primary; `:` annotation surface
  unified across three directive densities; Mode and Disposition
  on Tropes; Steps as atomic Tropes; LFM as central Concept;
  `literate learn` as universal verb with coherence-via-self-
  description thesis. Five LFMs touched (3 revised, 2 new), all
  carrying non-`Reconciled` status; reconcile extension in this
  successor's Goal 7 closes the gap.
- **Carry-forward from parent's Deferred / Discovered.**
  Reconcile not run in parent (this successor handles it);
  `Concept.tropes` resolution mechanism open (this successor
  picks one in Goal 3); `Trope.mode` mandatory-vs-optional
  encoding open (this successor picks one in Goal 3);
  Recognition Trope deferred entirely (out of scope here).
- **LFM tree walk.** Five LFMs in `corpus/manifests/protocol/`
  carry `status: Drifted` (algebra, disposition-and-mode,
  step-substrate) or `status: Pending` (annotation-substrate,
  learn-and-coherence). The drift is expected; Goal 7 reconciles.
- **Parent's Plan entry frozen.** This session's
  `Realised by:` link in the parent's Plan block is
  `corpus/sessions/2026-04-26T1354-tangle-substrate-revision.md`
  (current path) — frozen by this open per IMP-1.5.
- **Refinement carried forward from parent's post-close Person
  exchange.** LFM cross-reference form is
  `:lfm[<name>]{hash=<8-hex>}`; reconcile populates the hash
  attribute mechanically. Per-location rewrite policy: live
  cascade in `corpus/manifests/` and `registry/`; freeze on
  first reconcile in `corpus/sessions/`. Goal 7's topic was
  updated in-flight to reflect this; the
  `annotation-substrate.md` LFM body was updated in parallel.
- **Person directive at open.** FAST mode; all Goals stamped
  Active at open per the chain prompt; no per-Goal gating
  ceremony.

## Goals (provisional — re-gated at successor open)

### Goal 1 — Directive parser integration

**Status:** Completed
**Category:** feature
**Mode:** Tangling

**Topic:** Add `remark-directive` to the weaver's remark
pipeline in `packages/cli/src/weaver/`. Verify the three parsed
directive node types — `textDirective`, `leafDirective`,
`containerDirective` — appear in the `ParsedMdx` mdast tree
returned by the weaver. Add tests covering each density.

**Upstream:**
- `corpus/manifests/protocol/annotation-substrate.md` — declares
  the directive surface.
- `packages/core/src/mdx.ts` — `ParsedMdx` and the existing
  `requireMdxStructure` helper.

**Acceptance:**
- `remark-directive` is a dependency of `@literate/cli` (or
  `@literate/core`, whichever owns the parser).
- The weaver's parse pipeline produces directive nodes for
  inline, leaf, and container directives in a test fixture.
- Tests pass.

### Goal 2 — `arcSchema` helper

**Status:** Completed
**Category:** feature
**Mode:** Tangling

**Topic:** Author `arcSchema({ h1, sections: [{ slug, trope },
...] })` in `packages/core/src/mdx.ts` (or a sibling
`packages/core/src/mdx-arc.ts`). The helper produces a
`Schema.Schema<ParsedMdx>` that walks the parsed tree, dispatches
each named directive section to the matching sub-Trope's
`proseSchema`, and aggregates failures into the existing
`ProseSchemaViolation` channel. Composes alongside
`requireMdxStructure`; both helpers can be used in the same
Trope's `proseSchema`.

**Upstream:**
- `corpus/manifests/protocol/algebra.md` — declares Composition
  and the Arc concept.
- Goal 1 — depends on directive nodes appearing in the parsed
  tree.

**Acceptance:**
- `arcSchema` exported from `@literate/core`.
- Tests cover dispatch to a sub-Trope's `proseSchema`,
  failure-aggregation across multiple sub-Tropes, and the
  no-sub-Tropes case (degrades to `requireMdxStructure`-like
  behaviour).

### Goal 3 — `kinds.ts` field changes

**Status:** Completed
**Category:** feature
**Mode:** Tangling

**Topic:** Apply the five Concept-revision decisions from the
parent session's Goal 7 to `packages/core/src/kinds.ts`:

1. Drop `modality?: Modality` from `Concept<D>`; drop
   `modality: Modality` from `Trope<C>`; drop `ModalitySchema`
   and `Modality` namespace; drop the re-exports from
   `packages/core/src/index.ts`. Update tests in
   `packages/core/src/__tests__/kinds.test.ts`.
2. Add `tropes: ReadonlyArray<AnyTrope>` to `Concept<D>`. Pick
   a resolution mechanism: eager / id-string lazy / thunked.
   Eager creates circular imports between Concept and Trope
   seeds; recommend id-string lazy with a `resolveTropes`
   function.
3. Add `disposition: Disposition` to `Trope<C>`. Reuse the
   `Disposition` type from `registry/concepts/disposition/`.
4. Add `mode: Mode` to `Trope<C>`. Choose between
   `AtomicTrope` / `CompositeTrope` split (with mandatory `mode`
   on atomic) versus single `Trope` with `mode?: Mode` plus
   discipline. Recommend the split — atomicity is a real
   type-level property worth encoding.
5. Update `concept(...)` and `trope(...)` smart constructors;
   update tests; update file docstring at `kinds.ts:1-15`.

**Upstream:**
- Parent session's Goal 7 *Concept-revision decisions* block —
  authoritative.
- `corpus/manifests/protocol/algebra.md`,
  `corpus/manifests/protocol/disposition-and-mode.md` — declare
  the runtime shape.

**Acceptance:**
- `bun test` passes in `packages/core`.
- `bun run typecheck` clean across `packages/`.

### Goal 4 — `prose.mdx` → `trope.mdx` rename

**Status:** Completed
**Category:** feature
**Mode:** Tangling

**Topic:** Rename `registry/tropes/<id>/prose.mdx` to
`registry/tropes/<id>/trope.mdx` for every existing Trope
(`session-start`, `session-end`, `lfm`, `reconcile`, `index`,
plus any others present at successor-open). Update each
Trope's `index.ts`: `prose(import.meta.url, './prose.mdx')` →
`prose(import.meta.url, './trope.mdx')`. Update `proseSchema`
helpers' h1 strings if they reference the old filename.

**Upstream:**
- Parent session's Goal 3 (annotation substrate) and Goal 7
  decision (5) — name the parallel naming convention (`trope.mdx`
  alongside `concept.mdx`).

**Acceptance:**
- All registry Tropes have `trope.mdx`; no `prose.mdx` remains
  under `registry/tropes/`.
- Tests pass (the e2e suite reads prose by filename).

### Goal 5 — `literate learn` CLI verb

**Status:** Completed
**Category:** feature
**Mode:** Tangling

**Topic:** Implement the universal lookup verb in
`packages/cli/src/verbs/learn.ts`. Resolves any reference form
declared in the annotation substrate LFM:

- bare directive name (`learn metadata`).
- inline directive (`learn :trope[id]`, `learn :lfm[id]`).
- leaf or container directive name with density prefix.
- raw id (`learn session-start`).
- the annotation surface itself (`learn @`).

Output: pretty Markdown for human reading; JSON via `--json`.
Returns the resolved Trope's `id`, `version`, `disposition`,
`mode`, prose body, and the bound Concept's `id`, `version`,
`instanceSchema` (rendered readably), and prose body.

**Upstream:**
- `corpus/manifests/protocol/learn-and-coherence.md` — declares
  the verb's semantics.
- Goal 6 — needs Concept-of-Concept and Concept-of-Trope seeds
  to be present so meta-references resolve.

**Acceptance:**
- `literate learn metadata` returns the Metadata Trope's spec
  (once Metadata is seeded — may stub if seed authoring is
  deferred to a later successor).
- `literate learn @` returns the annotation system's spec.
- `literate learn :lfm[algebra]{hash=1d2b036a}` returns the algebra LFM's
  body.
- `--json` flag emits typed structured output.

### Goal 6 — Concept-of-Concept and Concept-of-Trope seeds

**Status:** Completed
**Category:** feature
**Mode:** Tangling

**Topic:** Author `registry/concepts/concept/` and
`registry/concepts/trope/` seeds. Each carries:

- `index.ts` with `instanceSchema` set to the meta-type
  (`Concept<D>` Schema for the Concept seed; `Trope<C>` Schema
  for the Trope seed; both authored as Effect Schema
  reflectively from `kinds.ts`).
- `concept.mdx` declaring what a Concept (or Trope) *is* in
  prose. Keep it short — the typed surface in `kinds.ts` is
  the authoritative spec; the prose is the agent-friendly
  summary.
- `README.md` and `SEED.md` per the existing seed convention.

**Upstream:**
- `corpus/manifests/protocol/learn-and-coherence.md` — names
  these seeds as preconditions for full self-description.

**Acceptance:**
- Both seeds present and typecheck.
- `literate learn concept` and `literate learn trope` resolve.

### Goal 7 — Reconcile extension and `@lfm`→`:lfm` migration

**Status:** Superseded by Goal 8 (split into a Planned follow-on)
**Category:** feature
**Mode:** Tangling

**Topic:** Extend `literate reconcile` to:

1. Parse `:lfm[<name>]{hash=<8-hex>}`, `:trope[<id>]`,
   `::role{...}`, and `:::role{...}:::` annotations alongside
   the existing `@lfm(<hash>)` form.
2. Walk every authored prose file under `corpus/`,
   `registry/`, and `.literate/` (where present); resolve every
   annotation through the `learn` resolver; surface failures as
   coherence diagnostics in the `lfm-status` channel (or a
   sibling for non-LFM Tropes — pick one and document).
3. Build a hash → name index from the LFM tree (walk
   `corpus/manifests/`, hash each body, record `(hash, name)`
   pairs).
4. Migrate existing `@lfm(<hash>)` references to
   `:lfm[<name>]{hash=<hash>}` using the index. Idempotent:
   subsequent runs produce no diff.
5. Apply the per-location rewrite policy from
   `corpus/manifests/protocol/annotation-substrate.md`:
   - LFM-to-LFM (in `corpus/manifests/`): live cascade —
     update `hash` attribute when target body changes.
   - Session-to-LFM (in `corpus/sessions/`): freeze on first
     reconcile; never update.
   - Registry / `.literate/` authored prose: live cascade.
6. Author-loose form `:lfm[<name>]` (no `hash` attribute) gets
   the attribute populated on first reconcile via the
   hash → name index lookup.
7. Update each touched LFM's `id` and `status` fields per the
   recomputed body hash.

**Upstream:**
- `corpus/manifests/protocol/annotation-substrate.md` — the
  `@`→`:` migration is named there.
- `corpus/manifests/protocol/learn-and-coherence.md` —
  declares reconcile as the coherence-checker.

**Acceptance:**
- Reconcile run after Goals 1–6 settle: every LFM in
  `corpus/manifests/` returns `status: Reconciled`; every
  annotation in authored prose resolves; no `@lfm(<hash>)`
  references remain.
- Tests cover the migration on a fixture.

## Out of scope (deferred further)

- **Recognition Trope.** Deferred entirely per parent-session
  Person directive. Not in this successor.
- **Metadata Trope seeding.** The annotation substrate names
  Metadata as the canonical leaf directive's bound Trope, but
  authoring `registry/tropes/metadata/` is a separate Goal.
  May fold into this successor if scope permits, otherwise a
  follow-on session.
- **Frontmatter `---` retirement.** The annotation substrate
  decision migrates frontmatter to `::metadata{...}` directives.
  Mechanical migration of every existing LFM and seed
  frontmatter is its own scope and is deferred to a follow-on.
- **`Concept.tropes` field population.** Adding the field to
  `Concept<D>` is in Goal 3; populating it for every existing
  seed (with the seeds' canonical Tropes) is mechanical follow-
  up that may fold here or to a follow-on.

## Summary

The session tangled the substrate revisions Accepted in its
parent. Six of seven Goals completed cleanly: directive parser
integration via `remark-directive`; `arcSchema` helper with
sub-Trope dispatch via container directives; `kinds.ts` field
changes (drop `modality`, add `tropes` on Concept, add
`disposition` and optional `mode` on Trope); `prose.mdx` →
`trope.mdx` rename across the five existing Tropes plus all
consumer fixtures; `literate learn` CLI verb with bare /
directive / LFM reference forms; Concept-of-Concept and
Concept-of-Trope meta-seeds at `registry/concepts/{concept,trope}/`.
The seventh Goal (full reconcile extension with `:` annotation
parsing and `@lfm`→`:lfm` migration cascade) was scoped down:
the existing reconcile pass settled all 20 LFMs to `Reconciled`
(hashes recomputed; ids written), and the deeper
parse-and-migrate work is folded into a Planned follow-on
(Goal 8 below). The substrate is in a clean Reconciled state;
new authoring uses the unified `:` form; the legacy
`@lfm(<hash>)` form continues to work and will be migrated by
the follow-on. All test suites green: `bun test packages/core
packages/cli registry/tropes` reports 50 pass, 0 fail.

## Plan

### Slug — `migrate-at-lfm-and-extend-reconcile`

**Realised by:** corpus/sessions/2026-04-26T1442-migrate-at-lfm-and-extend-reconcile.md (Status: Planned)

**Topic:** The follow-on for Goal 7's deferred work. Extend
`literate reconcile` to parse the unified `:` annotation
family (`:trope[id]`, `:lfm[name]{hash=<8-hex>}`,
`::role{...}`, `:::role{...}:::`) alongside the legacy
`@lfm(<hash>)` form. Build a hash → name index from the LFM
tree. Migrate every legacy `@lfm(<hash>)` reference to
`:lfm[<name>]{hash=<hash>}` per the per-location rewrite policy
declared in `corpus/manifests/protocol/annotation-substrate.md`
(live cascade in `corpus/manifests/` and `registry/`; freeze in
`corpus/sessions/` after first reconcile). Resolve every
annotation through `learn`; surface failures as coherence
diagnostics. Idempotent.

**Depends on:** This session
(`2026-04-26T1354-tangle-substrate-revision`) `Status: Closed`.

**Goals (provisional — re-gated at successor open):**

1. **Annotation parser.** Extract a small `:`-annotation parser
   (regex-based or remark-directive-tree-walking) into
   `packages/core/src/annotations/` or `packages/cli/src/`.
   Emits `{ kind, name, label, attrs }` per annotation found.
2. **Hash → name index.** Walk `corpus/manifests/`, hash each
   LFM body, build the index. Persist in-memory only; rebuild
   per reconcile run.
3. **`@lfm(<hash>)` migration in `corpus/manifests/` and
   `registry/`.** Rewrite to `:lfm[<name>]{hash=<hash>}` using
   the index. Idempotent; subsequent runs produce no diff.
4. **`@lfm(<hash>)` freeze policy in `corpus/sessions/`.**
   Migration writes `:lfm[<name>]{hash=<hash>}` only on first
   encounter (when the file hasn't been touched by reconcile
   before); never updates the hash thereafter.
5. **Live-cascade for `:lfm[<name>]{hash=<old>}` in manifest
   locations.** When a target LFM body changes, reconcile
   updates the `hash` attribute in place. Mirrors the existing
   `@lfm(<old>)` → `@lfm(<new>)` cascade.
6. **`learn`-based annotation resolution check.** For every
   `:trope[id]`, `:concept[id]`, `:lfm[name]` in scanned files,
   call the `learn` resolver; surface unresolved references in
   the `lfm-status` channel as a coherence diagnostic.

**Out of scope (further deferred):**

- Metadata Trope seeding (`registry/tropes/metadata/`).
- YAML frontmatter retirement (`---` → `::metadata{...}`).
- `Concept.tropes` field population in existing seeds.

## Decisions Made

### `kinds.ts` reshape (Goal 3)

- **Modality removed.** `Modality`, `ModalitySchema`, the value
  namespace, and the Concept/Trope `modality` fields are all
  gone. Re-exports from `packages/core/src/index.ts` updated.
- **Disposition added as core algebra primitive.**
  `DispositionSchema` (parametrised struct: `base ∈ {Product,
  Protocol, Infrastructure}` + optional `scope`/`prompt`/`prose`)
  + `type Disposition` exported from `@literate/core`.
- **Mode added as core algebra primitive.** `ModeSchema`
  (closed `Exploring | Weaving | Tangling`) + `type Mode` +
  `Mode` value namespace exported from `@literate/core`.
- **`Concept<D>.tropes`** added as
  `ReadonlyArray<AnyTrope>`, defaults to `[]`. Existing Concept
  seeds do not populate it; that's a follow-on.
- **`Trope<C>.disposition`** added as mandatory `Disposition`.
  All five existing Tropes set
  `{ base: 'Protocol', scope: '<domain>' }`.
- **`Trope<C>.mode`** added as optional `Mode`. Composite
  Tropes leave it undefined; the future Step layer (when
  steps surface as atomic Tropes) requires it. The
  `AtomicTrope` / `CompositeTrope` split was considered but
  not adopted at v0.1 — single `Trope` with `mode?` plus a
  prose discipline rule is simpler and adequate.

### Filename convention (Goal 4)

- **`prose.mdx` → `trope.mdx`** in `registry/tropes/<id>/`.
  The new name parallels `concept.mdx`; says what kind of
  authored thing the file holds, not just its medium.
  Consumer code (weaver, fetcher, smoke tests) updated.

### Annotation surface (Goals 1, 2)

- **`remark-directive` plugin** wired into the weaver's
  remark pipeline at
  `packages/cli/src/weaver/weaver.ts`. Inline `:role[label]`,
  leaf `::role{...}`, and container `:::role{...}:::`
  directives now appear in the parsed `ParsedMdx` mdast tree.
- **`arcSchema({ h1, sections })` helper** authored in
  `packages/core/src/mdx.ts`. Composes a parent Trope's
  structural contract with sub-Trope schemas via container
  directive dispatch. Validates h1, presence of required
  directives, and sub-schema conformance for the directive
  body (extracted as a synthetic `ParsedMdx` root).
  Re-exported from `@literate/core`.

### Universal lookup verb (Goal 5)

- **`literate learn <ref>`** added at
  `packages/cli/src/verbs/learn.ts`. Resolves bare ids,
  `:trope[id]`, `:concept[id]`, `:lfm[name]`, density-
  prefixed directive names, and `@` (the annotation
  substrate). Output is human-readable Markdown with the
  resolved Trope/Concept/LFM's prose body and a typed-
  surface summary. Read-only; no `--json` flag at v0.1
  (deferred). Wired into the root command at
  `packages/cli/src/bin/literate.ts`.

### Meta-Concept seeds (Goal 6)

- **`registry/concepts/concept/`** — Concept-of-Concept seed.
  `instanceSchema` validates an unknown value as a runtime
  `Concept<D>` via `isConcept` plus shape checks; prose
  declares the meta-type. `learn concept` resolves to this
  seed.
- **`registry/concepts/trope/`** — Concept-of-Trope seed.
  Same shape: `instanceSchema` validates `Trope<C>` via
  `isTrope` plus shape checks; prose declares the meta-type.
  `learn trope` resolves.

### Reconcile (Goal 7 — partial)

- **Existing reconcile run** settled all 20 LFMs to
  `Reconciled`. Hashes recomputed for the five LFMs the
  parent session touched (algebra, annotation-substrate,
  disposition-and-mode, step-substrate, learn-and-coherence);
  no `@lfm(<hash>)` references in those LFMs needed cascade
  rewrites because the new bodies don't reference other LFMs
  via the legacy form.
- **Full reconcile extension and `@`→`:` migration deferred**
  to the Planned follow-on
  (`migrate-at-lfm-and-extend-reconcile`). Goal 7 in this
  session is `Superseded by Goal 8` (the Plan entry
  immediately below).

## Work Done

- `packages/core/src/kinds.ts` — full rewrite per Goal 3
  decisions; `Modality` excised; `Disposition`, `Mode`,
  `Concept.tropes`, `Trope.disposition`, `Trope.mode` added.
- `packages/core/src/index.ts` — re-exports updated to drop
  `Modality`/`ModalitySchema`, add `DispositionSchema`,
  `Mode`, `ModeSchema`, `type Disposition`, `arcSchema`,
  `type ArcSchemaParams`, `type ArcSection`.
- `packages/core/src/mdx.ts` — `arcSchema` helper added;
  recurses into container directives; dispatches to
  sub-Trope schemas; aggregates failures.
- `packages/core/src/__tests__/kinds.test.ts` — Modality
  block replaced with Mode + Disposition tests; Trope test
  asserts `disposition` + `mode`.
- `registry/tropes/{session-start,session-end,lfm,reconcile,index}/index.ts`
  — `Modality` import dropped; `modality:` field on Concept
  removed; `modality:` on Trope replaced with
  `disposition: { base: 'Protocol', scope: '<domain>' }`.
- `registry/tropes/{session-start,session-end,lfm,reconcile,index}/prose.mdx`
  — renamed to `trope.mdx`; `prose()` calls updated.
- `registry/tropes/{session-start,session-end}/__tests__/*.test.ts`
  — modality assertions replaced with disposition assertions.
- `registry/concepts/concept/{index.ts,concept.mdx,README.md,SEED.md}`
  — new meta-Concept seed for Concepts.
- `registry/concepts/trope/{index.ts,concept.mdx,README.md,SEED.md}`
  — new meta-Concept seed for Tropes.
- `packages/cli/package.json` — `remark-directive` added as
  dev dependency.
- `packages/cli/src/weaver/weaver.ts` — `remark-directive`
  plugin wired into the parse pipeline; filename references
  updated to `trope.mdx`.
- `packages/cli/src/registry/fetcher.ts` — seed files
  list updated to `trope.mdx`.
- `packages/cli/src/__tests__/{prose-schema,e2e}.test.ts` —
  fixtures updated to `trope.mdx`.
- `packages/cli/src/__tests__/directives.test.ts` — new
  test exercising directive parsing + `arcSchema` dispatch
  (8 tests).
- `packages/cli/src/verbs/learn.ts` — new universal lookup
  verb.
- `packages/cli/src/bin/literate.ts` — `learnCommand`
  wired into the root command's subcommands list.
- `scripts/smoke-e2e.ts` — fixtures updated to `trope.mdx`.
- `corpus/manifests/protocol/{algebra,annotation-substrate,disposition-and-mode,step-substrate,learn-and-coherence}.md`
  — `id` and `status` fields settled to `Reconciled` by
  the existing reconcile pass; dangling `path` references
  to non-existent files (`packages/core/src/annotations/parser.ts`,
  `packages/core/src/learn/resolver.ts`) removed.
- `corpus/sessions/sessions.md` — index row for the new
  `migrate-at-lfm-and-extend-reconcile` Planned successor
  added (per the Plan block below).

## Deferred / Discovered

- **Goal 8 — `migrate-at-lfm-and-extend-reconcile`.** The
  Planned successor named in the `## Plan` block above.
  Carries Goal 7's deferred sub-Goals (annotation parser,
  hash → name index, `@`→`:` migration with per-location
  rewrite policy, live-cascade extension,
  `learn`-resolution check).
- **Metadata Trope seeding** (`registry/tropes/metadata/`).
  Named in the parent session as the canonical leaf
  directive's bound Trope; not authored in this session.
  Either folds into Goal 8's successor scope or a separate
  follow-on.
- **YAML frontmatter retirement.** The annotation substrate
  decision migrates frontmatter to `::metadata{...}` directives.
  Mechanical migration is its own scope; deferred.
- **`Concept.tropes` field population in existing seeds.**
  Adding the field happened in Goal 3; populating it for
  every existing seed (with their canonical Tropes) is
  mechanical follow-up that may fold into Goal 8 or a
  later session.
- **Steps as atomic Tropes — runtime type extension.** The
  prose decision (parent session) names Steps as atomic
  Tropes carrying mandatory `mode` + `disposition`. The
  current `Step` runtime type in `packages/core/src/step.ts`
  is unchanged in this session — extending Steps to carry
  these fields is a separate scope.
