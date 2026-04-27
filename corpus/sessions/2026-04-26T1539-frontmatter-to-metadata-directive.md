# Session: Migrate YAML frontmatter to `::metadata{...}` leaf directives + author Metadata Trope

**Date:** 2026-04-26
**Status:** Closed (2026-04-26T16:08)
**Chapter:** —
**Agent:** Claude Opus 4.7 (1M context) — fast mode
**Started:** 2026-04-26T15:46
**Disposition:** `{ base: 'Protocol', scope: 'annotation-substrate' }`
  (substrate surface; frontmatter parser + Metadata Trope seed)
**Mode:** Tangling (mechanical migration + new Trope authoring;
  the prose decisions live in upstream LFMs)
**Planned by:** corpus/sessions/2026-04-26T1442-migrate-at-lfm-and-extend-reconcile.md
**Depends on:** corpus/sessions/2026-04-26T1442-migrate-at-lfm-and-extend-reconcile.md

## Upstream

This session realises the frontmatter-retirement decision
declared in `corpus/manifests/protocol/annotation-substrate.md`
(`:lfm[annotation-substrate]{hash=9a6b8081}`) — the LFM body says
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

- `:lfm[annotation-substrate]{hash=9a6b8081}` — declares the `:`
  unified surface; says frontmatter migrates to
  `::metadata{...}`.
- `:lfm[learn-and-coherence]{hash=c3606f28}` — names the Metadata
  Trope as a candidate for `learn metadata` resolution.
- Parent session's *Decisions Made* / *Deferred / Discovered* —
  scopes this work explicitly.

## Pre-work

Per IMP-1 (Planned start path):

- **Last `Status: Closed` session.** `2026-04-26T1442-migrate-at-lfm-and-extend-reconcile`
  (Closed 2026-04-26T15:02). Migrated `@lfm(<hash>)` to
  `:lfm[<name>]{hash=<hash>}` corpus-wide; added the
  `migrateAtLfmReferencesStep` to reconcile; fixed
  `computeLfmId` to strip cached hash attrs (convergence in
  cyclic-reference graphs); 10 manifests migrated. Post-close
  amendment added `findNearbyLfmName` proximity-fallback so
  stale-hash references in old session logs migrate by name
  with the original hash preserved.
- **Carry-forward.** This session inherits the parent's
  `## Deferred / Discovered`: Metadata Trope seed, YAML
  frontmatter retirement (`---` → `::metadata{...}`), and the
  out-of-scope items (`learn`-based annotation resolution
  check, `Concept.tropes` field population, Step runtime
  extension). Only the first two are in scope here.
- **LFM tree state.** `literate reconcile` reports
  `20 reconciled / 0 drifted / 0 pending / 0 unverified`. No
  new LFMs have been authored since the parent closed.
- **Parent's Plan entry.** The parent session has no
  `## Plan` block — the Metadata Trope and frontmatter
  retirement were carried in `## Deferred / Discovered`, not
  formally planned. No Plan entry to freeze.
- **Person directive at open.** FAST mode; chain prompt is the
  gate; all five Goals stamped Active at open per the prompt.

## Goals (provisional — re-gated at successor open)

### Goal 1 — Author the Metadata Trope seed

**Status:** Completed
**Category:** feature
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

**Status:** Completed
**Category:** feature
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

**Status:** Completed
**Category:** feature
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

**Status:** Completed
**Category:** feature
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

**Status:** Completed
**Category:** feature
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

## Summary

The frontmatter retirement landed end-to-end. A new
`metadata` substrate primitive — Concept seed at
`registry/concepts/metadata/` and Trope seed at
`registry/tropes/metadata/` — owns the parse / serialise
round-trip between the canonical leaf-directive form
`::metadata{key=val, ...}` and the typed `Metadata` record
(`Record<string, string>`); the seed also retains a reader for
the legacy YAML `---` form for the duration of the transition.
`reconcile`'s `parseLFM` / `serialiseHeader` and the `lfm`
Trope's `serialiseHeader` were rewritten to delegate to the
metadata Trope's helpers; the `index` Trope's metadata reader
was switched to the same parser so the corpus index stays
correct after migration. All 20 LFMs auto-migrated to the
directive form on the first reconcile run after the wiring
landed; body hashes were preserved (the migration affected the
metadata block only). 67 tests pass (17 new in
`registry/tropes/metadata/__tests__`); tsc clean across both
packages; smoke-e2e green at 22 seeds (6 tropes + 16 concepts).

## Decisions Made

### Metadata as substrate-level Record<string, string>

The Metadata Concept models the leaf directive's actual data
model: a typed key→string record. Values are kept opaque at the
substrate level; downstream consumers (today the `lfm` Concept's
`LFMSchema`, tomorrow other typed prose surfaces) interpret the
values against their own schemas. This keeps the substrate
honest about the directive's data shape while staying open to
future consumers without a Concept revision.

### Both wire forms parse, only the directive form writes

Goal 2 requires transitional support: the parser tries the
canonical directive form first and falls back to the legacy
YAML form. The serialiser always emits the directive form. Once
a corpus is fully migrated, YAML parsing is dead code that can
be retired in a follow-on; the parse-both-forms rule stays in
the Trope until then so consumers mid-migration are not broken.

### Migration runs through reconcile's existing read-write loop

Reconcile's `reconcileEachStep` already reads each LFM, computes
status, and writes the file back when `newContent !== content`.
Switching `serialiseHeader` to the directive form makes the
write detect the wire-form difference and rewrite. No new
migration step was needed — the existing loop covers
mechanically. All 20 manifests migrated on the first run after
the wiring landed; reconcile is idempotent thereafter.

### Index Trope updated for forward compatibility

`tropes/index/index.ts:parseEntry` was reading the YAML `---`
form directly. Switched to `parseMetadataBlock` so the corpus
index stays correct against migrated LFMs. The index Trope is
not in `reconcile`'s composition; this update keeps it honest
for any consumer who runs `literate` verbs that invoke it
(today none in scope, but future).

### `metadata` seed added to the `minimal` template

The Metadata substrate is named in the annotation-substrate LFM
as the canonical leaf directive's bound Trope; consumers'
`learn metadata` should resolve. Added the Concept + Trope to
the `minimal` template seed list. Smoke-e2e expectation
expanded to `22 seeds (6 tropes + 16 concepts)`; both pass.

### `lfm` Trope's `serialiseHeader` delegates too

The `lfm` Trope's writeFileStep is the path newly-authored LFMs
take. It used to emit the YAML form directly; rewrote it to
build a metadata record and delegate to
`serialiseMetadataBlock`. Newly-authored LFMs land in the
canonical directive form on first write, no migration loop
needed.

## Work Done

- `registry/concepts/metadata/{index.ts, concept.mdx, README.md, SEED.md}`
  — new Concept seed. `MetadataSchema = Schema.Record({ key, value })`
  declared as the substrate shape; `MetadataConcept` bound to
  `concept.mdx`.
- `registry/tropes/metadata/{index.ts, trope.mdx, README.md, SEED.md}`
  — new Trope seed. Pure helpers: `parseMetadataDirective`
  (depth-aware brace / bracket / quote walk),
  `parseYamlFrontmatter`, `parseMetadataBlock`,
  `serialiseMetadataBlock`, `splitDirectiveAttrs`. Trope binds
  to `MetadataConcept` with `disposition.scope =
  metadata-substrate`.
- `registry/tropes/metadata/__tests__/metadata.test.ts` — 17
  tests covering Concept / Trope construction, the splitter's
  brace / bracket / quote awareness, both wire forms,
  `parseMetadataBlock`'s preference order, the serialiser's key
  ordering and quoting, and a serialise → parse round-trip on
  the canonical LFM-frontmatter shape.
- `registry/tropes/lfm/index.ts` — `serialiseHeader` rewritten
  to build a metadata record and delegate to
  `serialiseMetadataBlock`. New import from `../metadata/`.
- `registry/tropes/reconcile/index.ts` — local `parseLFM` /
  `serialiseHeader` replaced with a thin wrapper around
  `parseMetadataBlock` / `serialiseMetadataBlock`. `ParsedLFM`
  gained a `form: MetadataForm` field so reconcile can observe
  which wire form a file used (informational; the writer
  always emits directive form). Removed unused
  `rewriteAnnotations` import.
- `registry/tropes/index/index.ts` — `parseEntry` rewritten to
  use `parseMetadataBlock` so the corpus index stays correct
  against migrated LFMs.
- `packages/cli/src/verbs/init.ts:TEMPLATE_DEFAULT_SEEDS` —
  added `tropes/metadata` and `concepts/metadata` to the
  `minimal` template; comment updated to `(6 tropes + 16
  concepts) = 22 seeds`.
- `scripts/smoke-e2e.ts:EXPECTED_SEEDS` — mirror updated to
  match.
- `corpus/manifests/{infrastructure,workspace,protocol}/*.md`
  — 20 LFMs migrated mechanically by reconcile from the YAML
  `---` form to the directive `::metadata{...}` form. Body
  hashes preserved (only the wire form of the head changed).
- `corpus/sessions/sessions.md` — index row updated to
  `Open` then `Closed (2026-04-26T16:08)`.

## Deferred / Discovered

- **Retire YAML parsing.** With every authored corpus migrated,
  `parseYamlFrontmatter` is now dead code as far as LF's own
  repo is concerned. Removing it requires a corpus-wide audit
  of any consumer repos using LF (Athrio is the principal
  one); deferred until at least one round of consumer
  migration has run. Until then, keep the YAML reader as a
  safety net.
- **`learn`-based annotation resolution check at reconcile
  time.** Inherited from the parent's deferred list; still out
  of scope. Surfacing unresolved `:trope[id]` / `:concept[id]`
  / `:lfm[name]` references as coherence diagnostics requires
  extracting the resolver into a shared module.
- **`Concept.tropes` field population.** Inherited from the
  parent's deferred list. The new `MetadataConcept` does not
  populate `tropes: [metadataTrope]` (avoiding the cyclic
  import); the existing inverse query
  (Trope.realises → Concept) covers the lookup mechanism.
- **`:::declaration{...}` container directives** for body
  sections inside LFMs. The annotation substrate spec'd them;
  authoring LFMs that use them is its own scope (and probably
  needs a *Declaration Trope* seed first).
- **Metadata serialiser style.** Today the directive form
  emits `disposition={ base: 'Protocol', scope: 'algebra' }`
  verbatim — preserving the legacy YAML's spacing. A future
  pass could canonicalise these JSON-ish values (drop inner
  whitespace, alphabetise keys) for a tighter wire form.
  Cosmetic; not in scope here.
- **CLI verb to invoke the metadata Trope's helpers
  directly.** Today reconcile is the only caller. A
  `literate metadata <subcommand>` verb (parse / serialise / lint)
  would expose the Trope to consumer scripts; not requested,
  not in scope.
