# Session: Migrate YAML frontmatter to `::metadata{...}` leaf directives + author Metadata Trope

**Date:** 2026-04-26 (planned slot; actual open time TBD)
**Status:** Planned
**Chapter:** —
**Agent:** (TBD at open)
**Disposition:** `{ base: 'Protocol', scope: 'annotation-substrate' }`
  (substrate surface; frontmatter parser + Metadata Trope seed)
**Mode:** Tangling (mechanical migration + new Trope authoring;
  the prose decisions live in upstream LFMs)
**Planned by:** corpus/sessions/2026-04-26T1442-migrate-at-lfm-and-extend-reconcile.md
**Depends on:** corpus/sessions/2026-04-26T1442-migrate-at-lfm-and-extend-reconcile.md

## Upstream

This session realises the frontmatter-retirement decision
declared in `corpus/manifests/protocol/annotation-substrate.md`
(`:lfm[annotation-substrate]{hash=…}`) — the LFM body says
*"the canonical leaf directive is `::metadata`, which replaces
the legacy YAML frontmatter (`---` blocks) for typed head-of-
file metadata."* The migration is named in the parent session's
`## Deferred / Discovered` as *"YAML frontmatter retirement
(`---` → `::metadata{...}`) deferred."*

It also realises the *Metadata Trope* item in the same
deferred list. The annotation substrate names Metadata as the
canonical leaf directive's bound Trope, but no
`registry/tropes/metadata/` seed exists yet.

Authoritative upstream prose:

- `:lfm[annotation-substrate]{hash=…}` — declares the `:`
  unified surface; says frontmatter migrates to
  `::metadata{...}`.
- `:lfm[learn-and-coherence]{hash=…}` — names the Metadata
  Trope as a candidate for `learn metadata` resolution.
- Parent session's *Decisions Made* / *Deferred / Discovered* —
  scopes this work explicitly.

## Pre-work

(Stamped at session open. Verify the parent migration session
is Closed; verify all 20 LFMs still report `Reconciled`;
confirm no new LFMs have been authored since the parent
closed; read this file's `## Goals` block as the inherited
provisional Goal set, re-gate at open per IMP-1.6.)

## Goals (provisional — re-gated at successor open)

### Goal 1 — Author the Metadata Trope seed

**Status:** (provisional)
**Category:** (provisional)
**Mode:** Tangling

**Topic:** Author `registry/tropes/metadata/` with the standard
seed companions: `index.ts`, `trope.mdx`, `concept.mdx`,
`README.md`, `SEED.md`. The Concept it realises is a *new*
Concept seed at `registry/concepts/metadata/` — author that
too. The Concept declares the typed shape of head-of-file
metadata: `id`, `disposition`, `layer`, `domain`, `status`,
plus optional fields. The Trope's `realise` is a `prose` Step
(or minimal `effect` Step) — Metadata is largely declarative.
The Trope's `proseSchema` is a permissive structural check
(a leaf-directive container).

**Acceptance:**
- `registry/concepts/metadata/{index.ts, concept.mdx, README.md, SEED.md}`
  authored. `learn metadata` resolves to the Concept.
- `registry/tropes/metadata/{index.ts, trope.mdx, README.md, SEED.md}`
  authored. The Trope binds to MetadataConcept and exports
  `metadataTrope`.
- Tests added at `registry/tropes/metadata/__tests__/` covering
  Concept + Trope construction.

### Goal 2 — Extend `parseLFM` and `serialiseHeader` to recognise `::metadata{...}`

**Status:** (provisional)
**Category:** (provisional)
**Mode:** Tangling

**Topic:** Update `registry/tropes/reconcile/index.ts:parseLFM`
and `serialiseHeader` to read/write head-of-file metadata in
`::metadata{key=val, key=val, ...}` leaf-directive form
*alongside* the legacy YAML `---` form (transitional support).
The directive form is the canonical write target; the YAML
form is read-only for backward compatibility during migration.

The reconcile pipeline (compute-id, status-write, hash cascade,
migration step) must continue to work over both forms during
the transition window. Once all LFMs are migrated, YAML
parsing can be retired in a follow-on.

**Acceptance:**
- `parseLFM` accepts both `---\n…\n---\n` and
  `::metadata{…}\n` head-of-file forms; returns the same
  `ParsedLFM` shape regardless.
- `serialiseHeader` always emits the directive form for new
  writes.
- Existing reconcile tests pass; new tests cover the
  directive form parsing and serialisation.

### Goal 3 — Migrate every LFM's frontmatter to `::metadata{...}`

**Status:** (provisional)
**Category:** (provisional)
**Mode:** Tangling

**Topic:** Walk `corpus/manifests/<layer>/<domain>.md` (20 LFMs)
and rewrite each one's `---` YAML frontmatter to
`::metadata{key=val, ...}` directive form. The body content
remains identical. Mechanical rewrite via a small migration
helper (sibling to `migrateLegacyLfmReferences`) added to the
reconcile workflow.

**Acceptance:**
- Every LFM in `corpus/manifests/` opens with `::metadata{…}`
  rather than `---`.
- `literate reconcile` reports `20 reconciled / 0 drifted /
  0 pending / 0 unverified` after the migration.
- Body hashes (post `stripCachedHashAttrs`) are stable across
  the migration — only the metadata form changes, not the
  declarative content.

### Goal 4 — Migrate registry seed frontmatter

**Status:** (provisional)
**Category:** (provisional)
**Mode:** Tangling

**Topic:** Apply the same frontmatter migration to registry
seeds where YAML frontmatter exists. Most registry seeds use
TS-only metadata (no frontmatter on `concept.mdx` or
`trope.mdx`), but if any do carry frontmatter, migrate them
consistently. Audit and rewrite as needed.

**Acceptance:**
- All registry MDX files use directive frontmatter (or no
  frontmatter at all if that is the convention).
- All `bun test` suites pass.

### Goal 5 — Update `weaver.ts` and tests for the directive frontmatter

**Status:** (provisional)
**Category:** (provisional)
**Mode:** Tangling

**Topic:** The CLI weaver (`packages/cli/src/weaver/weaver.ts`)
parses LFM and seed prose through unified+remark. Verify it
handles `::metadata{...}` correctly (the `remark-directive`
plugin already wired in the previous Tangling session should
emit a `leafDirective` node for it). Update any test fixtures
that include frontmatter. Run the smoke tests.

**Acceptance:**
- Weave produces correct output for LFMs with directive
  frontmatter.
- `packages/cli/src/__tests__/{e2e,prose-schema,directives}.test.ts`
  pass.
- `scripts/smoke-e2e.ts` passes.

## Out of scope (deferred further)

- **Retire YAML parsing entirely.** Goal 2 keeps both forms
  readable during the transition. Removing YAML parsing is a
  follow-on once the corpus is fully migrated.
- **Apply container directives (`:::declaration{…}`)** to body
  sections inside LFMs. The annotation substrate spec'd them;
  authoring LFMs that use them is its own scope (and probably
  needs a *Declaration Trope* seed first).
- **`learn`-based annotation resolution check at reconcile time**
  (the Goal 6 deferred from the migration session). Still
  deferred; not in this scope.

## Decisions Made

*(populated at close)*

## Work Done

*(populated at close)*

## Deferred / Discovered

*(populated at close)*
