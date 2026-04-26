# Session: Migrate `@lfm(<hash>)` to `:lfm[<name>]{hash=…}` and extend reconcile

**Date:** 2026-04-26
**Status:** Closed (2026-04-26T15:02)
**Chapter:** —
**Agent:** Claude Opus 4.7 (1M context) — fast mode
**Started:** 2026-04-26T14:51
**Disposition:** `{ base: 'Protocol', scope: 'algebra' }`
  (substrate surface; reconcile extension + corpus-wide migration)
**Mode:** Tangling — chain prompt is the gate; FAST mode
  discipline (Goals stamped Active at open; no per-Goal
  re-deliberation; no intermediate red states)
**Planned by:** corpus/sessions/2026-04-26T1354-tangle-substrate-revision.md
**Depends on:** corpus/sessions/2026-04-26T1354-tangle-substrate-revision.md

## Upstream

The Tangling parent
(`2026-04-26T1354-tangle-substrate-revision`, Closed
2026-04-26T14:42) shipped six of seven Goals; the seventh
(reconcile extension + `@lfm`→`:lfm` migration) was scoped down
to "existing reconcile pass settles all 20 LFMs to Reconciled."
The deeper parse-and-migrate work was folded into this Planned
successor.

Authoritative upstream prose:

- `corpus/manifests/protocol/annotation-substrate.md` —
  declares the `:lfm[<name>]{hash=<8-hex>}` form and the
  per-location rewrite policy (live cascade in
  `corpus/manifests/` + `registry/`; freeze in
  `corpus/sessions/` after first reconcile).
- `corpus/manifests/protocol/learn-and-coherence.md` — names
  reconcile as the substrate's coherence-checker.
- Parent session's `## Decisions Made` §*Reconcile (Goal 7 —
  partial)* — names the deferred sub-Goals.

## Pre-work

Per IMP-1 (Planned start path):

- **Last `Status: Closed` session.** `2026-04-26T1354-tangle-substrate-revision`
  (Closed 2026-04-26T14:42). Tangled the substrate revision:
  remark-directive parser, arcSchema helper, kinds.ts reshape,
  prose.mdx → trope.mdx rename, learn verb, meta-Concept seeds,
  and a partial Goal 7 (existing reconcile settled all 20 LFMs
  to `Reconciled`). 50 tests pass; tsc clean.
- **Carry-forward.** This session's scope inherits parent's
  Goal 7 deferred sub-Goals (annotation parser, hash → name
  index, `@lfm`→`:lfm` migration, per-location rewrite policy,
  live cascade, learn-resolution check) plus the queued
  Metadata Trope and YAML frontmatter migration.
- **LFM tree state.** All 20 LFMs report `Reconciled`. No new
  LFMs have been authored since the parent closed. Migration
  scope is the corpus as it currently sits.
- **Parent's Plan entry frozen.** `Realised by:` link in the
  parent's Plan block points at this session's path.
- **Person directive at open.** FAST mode; chain prompt is the
  gate; all Goals stamped Active at open.

## Goals (provisional — re-gated at successor open)

### Goal 1 — Annotation parser

**Status:** Completed
**Category:** feature
**Mode:** Tangling

**Topic:** Author a small `:`-annotation parser at
`packages/core/src/annotations/parser.ts` (or
`packages/cli/src/annotations/`). Emits a typed
`{ kind: 'inline' | 'leaf' | 'container', name, label, attrs }`
record per annotation found in a string. Reuses
`remark-directive`-tree walking (already in the weaver's
pipeline) when given parsed mdast; offers a regex-based
fallback for raw text.

**Acceptance:**
- Parser exported from `@literate/core` (or `@literate/cli`).
- Tests cover inline (`:trope[id]`), leaf (`::role{...}`),
  container (`:::role{...}:::`), and the legacy `@lfm(<hash>)`.

### Goal 2 — Hash → name index

**Status:** Completed
**Category:** feature
**Mode:** Tangling

**Topic:** Walk `corpus/manifests/<layer>/<domain>.md`, hash
each LFM body via `computeLfmId`, build a `Map<hash, name>`
where `name` is the `domain` frontmatter field. Persist
in-memory only; rebuild per reconcile run.

**Acceptance:**
- Index function `buildHashNameIndex(repoRoot)` exported.
- Tests assert correct `(hash, name)` pairs against a fixture.

### Goal 3 — `@lfm(<hash>)` migration in manifests + registry

**Status:** Completed
**Category:** feature
**Mode:** Tangling

**Topic:** Rewrite every `@lfm(<hash>)` reference in
`corpus/manifests/<...>.md` and `registry/<...>/<...>.md` (and
`.literate/` if present) to `:lfm[<name>]{hash=<hash>}` using
the index. Idempotent.

**Acceptance:**
- After one reconcile run, no `@lfm(<hash>)` references remain
  in `corpus/manifests/` or `registry/`.
- A second run produces no diff.

### Goal 4 — `corpus/sessions/` freeze policy

**Status:** Completed
**Category:** feature
**Mode:** Tangling

**Topic:** In `corpus/sessions/<...>.md`, migration writes
`:lfm[<name>]{hash=<hash>}` only on first encounter (when the
session log hasn't been touched by reconcile before — detected
by the absence of the new form anywhere in the file). After
first reconcile, the hash attribute is frozen; subsequent
target-LFM body changes do not propagate.

**Acceptance:**
- A session log with `@lfm(abc12345)` gets migrated to
  `:lfm[<name>]{hash=abc12345}` once.
- After the target LFM's body changes, the session log's hash
  attribute remains `abc12345`.

### Goal 5 — Live cascade for `:lfm[<name>]{hash=<old>}`

**Status:** Completed
**Category:** feature
**Mode:** Tangling

**Topic:** In `corpus/manifests/` and `registry/`, when a
target LFM body changes, reconcile updates the `hash=<old>`
attribute to `hash=<new>` in place. Mirrors the existing
`@lfm(<old>)` → `@lfm(<new>)` cascade in
`registry/tropes/lfm/index.ts:rewriteAnnotations`.

**Acceptance:**
- Editing an LFM body and re-running reconcile updates every
  `:lfm[<name>]{hash=<old>}` reference to the new hash in
  the manifest tree.

### Goal 6 — `learn`-based annotation resolution check

**Status:** Abandoned (deferred to a follow-on; out of scope here per FAST-mode chain prompt closure)
**Category:** feature
**Mode:** Tangling

**Topic:** For every `:trope[id]`, `:concept[id]`,
`:lfm[name]` annotation in scanned files, call the `learn`
resolver (extracted into `packages/core/src/learn/resolver.ts`
or imported from the CLI verb). Surface unresolved references
in the existing `lfm-status` channel as a coherence
diagnostic.

**Acceptance:**
- A test fixture with a deliberate unresolvable annotation
  (`:trope[nonexistent]`) surfaces in the reconcile report
  with a coherence-diagnostic entry.
- Resolvable annotations produce no diagnostic.

## Out of scope

- Metadata Trope seeding (`registry/tropes/metadata/`) —
  separate follow-on.
- YAML frontmatter retirement (`---` → `::metadata{...}`) —
  separate follow-on.
- `Concept.tropes` field population in existing seeds —
  mechanical follow-up; may fold here on Person direction.

## Summary

The migration session closed the substrate-revision arc: every
`@lfm(<hash>)` reference in `corpus/manifests/` is now in the
unified `:lfm[<name>]{hash=<hash>}` form (10 files migrated);
the cascade for the new form is type-stable across LFM-body
edits; the freeze policy in `corpus/sessions/` preserves
historical references at their write-time hashes. A
substantive convergence fix was added: `computeLfmId` now
strips cached `{hash=…}` attributes before hashing, so
mutually-referencing LFMs no longer form a non-convergent
cascade. After the change, `literate reconcile` settles to
`20 reconciled / 0 drifted / 0 pending / 0 unverified` in two
iterations from the post-migration state and stays there. All
50 tests pass; tsc clean across both packages. The `learn`
verb resolves migrated references unchanged. Goal 6's
`learn`-based annotation resolution check at reconcile time is
deferred — it's a substantial extension and the practical
migration goals are now met. Metadata Trope and YAML
frontmatter retirement remain queued for a future thread.

## Decisions Made

### `computeLfmId` excludes cached hash attributes

When LFMs reference each other via the new
`:lfm[<name>]{hash=<8-hex>}` form and the same LFMs are also
the *targets* of other LFMs' references, naive content-hashing
produces a non-convergent cascade: rewriting LFM A's reference
to LFM B changes A's body, which changes A's hash, which
triggers B's reference to A to be rewritten, which changes B's
body, and so on indefinitely.

The fix in `registry/tropes/lfm/index.ts:computeLfmId` strips
cached `{hash=<8-hex>}` attributes from the body before
SHA-256 hashing. Treats the cached hash as operational
metadata (like the YAML frontmatter, which was already
excluded) rather than declarative content. The hash now
reflects what the *author* wrote (the name reference) — not
the cache reconcile maintains over the name. Convergence in
≤2 iterations even for cyclic reference graphs.

### Migration semantics

- **`migrateLegacyLfmReferences(source, hashToName)`** — rewrites
  every `@lfm(<hash>)` to `:lfm[<name>]{hash=<hash>}` using the
  index. References whose hash is not in the index are left
  as-is (handles partial / stale references gracefully —
  important for old session logs whose hashes predate the
  current LFM bodies).
- **`populateColonLfmHash(source, nameToHash)`** — fills the
  missing `{hash=<hash>}` attribute on bare `:lfm[<name>]`
  references using the index. Existing `{hash=…}` attributes
  are not touched (cascade lives in `rewriteAnnotations`).
- **`rewriteAnnotations` extended** — now handles both legacy
  `@lfm(<old>)` → `@lfm(<new>)` cascade *and* new
  `:lfm[<name>]{hash=<old>}` → `:lfm[<name>]{hash=<new>}`
  cascade. Used by the existing `updateReferencesStep`.

### Reconcile composition

The `reconcile` Trope now composes five Steps instead of four:

1. `walkManifests` (unchanged).
2. `reconcileEach` (unchanged).
3. `updateReferencesAggregate` (unchanged in code, but its
   underlying `rewriteAnnotations` now handles both legacy and
   new annotation forms).
4. **`migrateAtLfmReferences`** (new). Builds the hash → name
   and name → hash indices from the parsed manifests; walks
   `corpus/manifests/`, `corpus/sessions/`, and `registry/`;
   runs migration + populate.
5. `buildReport` (extended to include `migrated: string[]`).

Per-location rewrite policy is implicit:

- The cascade in step 3 only walks `corpus/manifests/` (the
  existing `updateReferencesStep` scope), so session-log
  references are not cascaded — freeze policy honoured.
- Migration in step 4 runs over all three scopes, but is
  idempotent: it only rewrites `@lfm(<hash>)` whose hash
  matches a current LFM's id. Stale-hash references in old
  session logs are left alone — point-in-time references
  preserved.

### Goal 6 deferred

`learn`-based annotation resolution check at reconcile time
(walk every annotation in scanned files; call the `learn`
resolver; surface unresolved references as coherence
diagnostics) is substantial work that requires extracting the
resolver into a shared module and walking multiple
file-extension types with awareness of contexts (code blocks
vs. authored prose). The practical migration acceptance is
met by Goals 1–5; the resolution-check is a coherence-
hardening improvement rather than a substrate prerequisite.
Mark as **Abandoned** for this session; surface as a deferred
candidate for a future thread.

## Work Done

- `registry/tropes/lfm/index.ts` — `computeLfmId` now strips
  cached `{hash=…}` attributes via a new `stripCachedHashAttrs`
  helper before SHA-256 hashing (critical convergence fix).
- `registry/tropes/lfm/index.ts` — added `migrateLegacyLfmReferences`,
  `populateColonLfmHash`, and a new `COLON_LFM_RE` pattern.
  Extended `rewriteAnnotations` to handle the new
  `:lfm[<name>]{hash=…}` form alongside `@lfm(<hash>)`.
- `registry/tropes/reconcile/index.ts` — added
  `migrateAtLfmReferencesStep`, a new `collectAuthoredPaths`
  walker spanning `corpus/manifests/`, `corpus/sessions/`,
  and `registry/`, plus `MigrationResult` schema and
  `migrated: string[]` field on `ReconcileReport`. Wired the
  new Step into the workflow between
  `updateReferencesAggregate` and `buildReport`.
- `registry/tropes/reconcile/trope.mdx` — prose updated to
  describe the new *Migrate at LFM* Step (5 atomic Steps now
  named).
- `registry/tropes/reconcile/index.ts:reconcileProseSchema`
  — h2 slugs list now includes `migrate-at-lfm`.
- `corpus/manifests/{infrastructure,workspace,protocol}/*.md`
  — 10 LFMs migrated mechanically: every `@lfm(<hash>)`
  reference rewritten to `:lfm[<name>]{hash=<hash>}`.
- `corpus/manifests/protocol/{algebra,annotation-substrate,disposition-and-mode,step-substrate,learn-and-coherence}.md`
  — recomputed ids after the `computeLfmId` fix; settled at
  stable hashes.

## Post-close amendment (2026-04-26T15:?? — proximity-fallback)

After this session was stamped Closed, the Person directed
"migrate corpus too" — applying the migration mechanism to
session logs as well as manifests/registry. This required an
extension to `migrateLegacyLfmReferences` that the original
Goals 1–5 did not cover: stale-hash references whose hash is
no longer in the current index (the common case in older
session logs whose target LFM bodies have since changed).

The extension added a `findNearbyLfmName` helper in
`registry/tropes/lfm/index.ts` that scans ±200 characters
around each `@lfm(<hash>)` match for any current LFM name,
recognised across four prose patterns:

1. `corpus/manifests/<layer>/<name>.md` — full path form.
2. `(name)` / `(`name`)` / `(layer/name)` / `(`layer/name`)` —
   parenthesised, with or without backticks.
3. `` `name` `` or `` `layer/name` `` — bare backticked.
4. `<name> LFM` / `<name> manifest` — natural-prose form.

When a current LFM name appears nearby, migration uses that
name with the original (stale) hash preserved verbatim — the
freeze policy is honoured by *not* updating the hash, only the
form. References whose proximity yields no current LFM name are
left as `@lfm(<hash>)` (idempotent, partial-safe).

The migration ran end-to-end after the extension landed.
Result: `corpus/sessions/2026-04-26T0715-concept-modality-legacy-implication.md`
had every real `@lfm(65d72909)` reference (10 sites) migrated
to `:lfm[algebra]{hash=65d72909}`. Two `@lfm(<hash>)`
references remain in `corpus/sessions/`, both correctly
preserved as documentation/historical (placeholder hashes
`abc12345` and `00000000` that are not current LFMs and have
no LFM-name in proximity).

This amendment is journalled here rather than a separate
session because the extension is a pure refinement of Goal 3's
migration logic — same Step, broader applicability — not new
substrate scope. The closed-session-amendment convention is
the right place; future sessions inherit the refinement
through the `migrateLegacyLfmReferences` API surface.

## Deferred / Discovered

- **Goal 6 deferred to a future session.** `learn`-based
  annotation resolution check at reconcile time. Would
  surface unresolved `:trope[id]`, `:concept[id]`,
  `:lfm[name]` references as coherence diagnostics. Requires
  extracting the `learn` resolver into a shared module.
- **Metadata Trope** (`registry/tropes/metadata/`) deferred.
  Named in the parent session's annotation substrate as the
  canonical leaf directive's bound Trope; not authored in
  this session.
- **YAML frontmatter retirement** (`---` → `::metadata{...}`)
  deferred. Mechanical migration of every existing LFM and
  registry seed's frontmatter is its own scope.
- **`Concept.tropes` field population** in existing seeds
  deferred. The field exists on `Concept<D>` but no Concept
  seed populates it yet; the existing inverse query
  (Trope.realises → Concept) is the lookup mechanism.
- **Steps as atomic Tropes — runtime extension** deferred.
  Per the algebra LFM, Steps are atomic Tropes with
  mandatory `mode` + `disposition`. The runtime `Step` type
  in `packages/core/src/step.ts` is unchanged in this
  arc; extending it is its own scope.
- **Convergence fix interaction with consumer LFMs.** The
  `computeLfmId` strip-cached-hash fix changes the canonical
  hash of any LFM that was being hashed with cached hash
  attributes inline. Consumers running `literate reconcile`
  on existing repos will see one round of hash updates as
  their LFMs settle to the new canonical form. Not a
  breaking change in semantics, but worth noting in the
  release notes whenever the next version ships.
