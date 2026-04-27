# Session: Purify LFM bodies to declarative-only voice

**Date:** 2026-04-26
**Status:** Closed (2026-04-26T16:29)
**Chapter:** —
**Agent:** Claude Opus 4.7 (1M context) — fast mode
**Started:** 2026-04-26T16:24
**Disposition:** `{ base: 'Protocol', scope: 'lfm-authoring' }`
  (corpus surface; declarative-voice cleanup of six LFMs)
**Mode:** Tangling (mechanical prose edits against the
  self-sufficiency rule declared in
  `:lfm[lfm]` `registry/concepts/lfm/concept.mdx`)

## Upstream

The `lfm` Concept's `concept.mdx` declares the cardinal rule:
*"each LFM stands alone… the body declares what is, in plain
present-tense prose. No supersession chains. No 'this was
decided in LFM(abc123) and then refined in LFM(def456).'"*

A targeted audit of the 20 LFMs (run in this thread before the
session opened) found one **FAIL** and five **MINOR**
violations. Every violation lives in a `Why …?` / `Why not …?`
section that narrates a past decision rather than declaring
present-tense rationale.

The violating bodies and their failure modes:

- **`workspace/legacy-freeze.md`** (FAIL) — multi-paragraph
  history of the rewrite as load-bearing context for the
  freeze rule.
- **`workspace/monorepo-layout.md`** (MINOR) — narrates an
  earlier `framework/`-folder design attempt.
- **`workspace/namespace.md`** (MINOR) — explains the
  `@literate/*` choice through the past `@athrio/*` candidate
  and a "transitional period" of legacy authorship.
- **`infrastructure/install-path.md`** (MINOR) — narrates the
  prior `mise`-wrapper direction and "two findings" that
  retired it.
- **`infrastructure/distribution-model.md`** (MINOR) — frames
  the no-individual-Trope-packages rule through a retired
  rewrite-stage attempt.
- **`protocol/annotation-substrate.md`** (MINOR) — the
  *Migration from `@lfm(<hash>)`* section narrates the legacy
  form as transitional context (and is now itself historical:
  the migration ran end-to-end in two prior sessions).

## Pre-work

Per IMP-1 (spontaneous start path):

- **Last `Status: Closed` session.**
  `2026-04-26T1539-frontmatter-to-metadata-directive` (Closed
  2026-04-26T16:08). New `metadata` Concept + Trope seeds;
  reconcile + lfm + index Tropes' frontmatter handling
  delegates to the metadata Trope; all 20 LFMs auto-migrated
  to `::metadata{…}` form on first reconcile run; 67 tests
  pass; smoke-e2e green at 22 seeds.
- **Carry-forward.** No deferred items from that session bear
  on this scope. The audit that scoped this session was a
  read-only analysis run before the session opened.
- **LFM tree state.** `literate reconcile` reports
  `20 reconciled / 0 drifted / 0 pending / 0 unverified`.
- **Person directive at open.** FAST mode; no gating; one
  Goal stamped Active at open.

## Goals

### Goal 1 — Rewrite the six violating LFM bodies to declarative voice

**Status:** Completed
**Category:** quality
**Mode:** Tangling

**Topic:** Replace each violating section with present-tense
declarations of *what is* rather than narratives of *how we got
here*. The fix pattern, applied uniformly: "we tried X and
learned Y, so now Z" → "Z because [present-tense reason]". The
rewrite must preserve every load-bearing fact (current
constraints, present-day rationale, design boundaries) while
removing the historical framing.

**Acceptance:**
- Every `Why …?` / `Why not …?` section in the six LFMs
  declares current rationale without narrating past attempts,
  retired directions, or transitional periods as load-bearing.
- No supersession chains. No "previously / used to / earlier
  attempt / was retired / prior direction" phrasing as
  load-bearing narrative.
- Every body is readable cold without needing prior LFMs,
  ADRs, or session logs to parse.
- `literate reconcile` settles to
  `20 reconciled / 0 drifted / 0 pending / 0 unverified`
  after the rewrites land. Body hashes recompute (the bodies
  changed); cross-LFM `:lfm[<name>]{hash=…}` references
  cascade automatically. All 67 tests pass; tsc clean.

**Out of scope:**
- Editorial polishing of the 14 PASS bodies.
- The `Why preserve at all` rationale itself — preserve the
  freeze rule's *reason* (authoritative legacy content; freeze
  protects the active surface), strip the rewrite-history
  framing.
- `:::declaration{...}` container directive usage in LFM
  bodies (deferred per the prior session).

## Summary

The six violating LFM bodies — one FAIL plus five MINOR per
the audit run before the session opened — were rewritten to
declarative-only voice. Every `Why …?` / `Why not …?` section
that narrated past attempts as load-bearing now declares
present-tense rationale: current constraints, design
boundaries, structural facts. A second sweep caught residual
"the rewrite" / "pre-rewrite" / "historically" phrasings in
two additional LFMs (`repo-shape`, `session-lifecycle`) and in
the lists of legacy contents inside `legacy-freeze.md` and
`monorepo-layout.md`. Reconcile converged in two iterations
after each batch (eight LFM hashes recomputed; six
cross-LFM `:lfm[…]{hash=…}` references cascaded automatically).
67 tests pass; tsc clean.

## Decisions Made

### Single-pattern fix: replace narrative motivation with present-tense rationale

The audit found one stable pattern across every violation: a
`Why …?` section that narrated a past attempt or retired
direction as load-bearing context for understanding the
current state. The fix pattern, applied uniformly: "we tried X
and learned Y, so now Z" → "Z because [present-tense reason]".

The rewrites preserve every load-bearing fact (current
constraints, design boundaries, present-day rationale) while
removing the historical framing. The bodies stay
self-sufficient — a reader picking up any LFM cold reads what
*is* without needing prior LFMs, ADRs, or session history to
parse.

### Residual sweep on "the rewrite" / "pre-rewrite" descriptors

A second sweep beyond the audit's six targets caught five
more lapses — the descriptors "the rewrite", "pre-rewrite
`@literate/*` packages", "frozen pre-rewrite code", "LF's
rewrite packages", and "(deleted in the LFM rewrite)" — used
as load-bearing identifiers for current state. These reframe
on the active/frozen split structurally: legacy contents
become "a parallel `@literate/*` package set" / "a Next.js
scaffold not used by the active surface" / "the framework
Protocol prose authored on the three-level algebra"; active
packages become "active workspace packages"; the deleted
`decisions/` directory simply isn't mentioned. The active
surface is the present; the frozen subtree is what it's
disjoint from.

### Annotation substrate: legacy `@lfm(<hash>)` reframed as a compatibility alias

The "Migration from `@lfm(<hash>)`" section narrated the
transition from the legacy form. Since the migration ran
end-to-end in two prior sessions, the section was itself
historical. Replaced with a compatibility note: the substrate
accepts either form; reconcile rewrites bare `@lfm(<hash>)` to
`:lfm[<name>]{hash=<hash>}` mechanically; the unified form is
the canonical write target. No transition narrative; one
declaration of what the substrate accepts.

### Legacy contents declared by structural relation, not by history

`legacy-freeze.md`'s list of contents became four typed
descriptors of *what is in the subtree* and *how it relates to
the active surface* — "a parallel `@literate/*` package set",
"a Next.js scaffold not used by the active surface" — rather
than "the pre-rewrite X" / "the legacy Y". The supersession
language survives only as a structural statement
("supersession by the active Protocol is structural, not
narrative") to make explicit that the relation is by present
disjointness, not by historical chain.

## Work Done

- `corpus/manifests/workspace/legacy-freeze.md` — *Why preserve
  at all* rewritten to declare the active/frozen split's
  present-tense purpose; *What lives in `legacy/`* list
  rewritten with structural descriptors (parallel package set,
  unused scaffold, prose authored on the three-level algebra).
  Hash: `5842b2de` → `bf4e66f8`.
- `corpus/manifests/workspace/monorepo-layout.md` — *Why no
  `framework/` folder* / *One workspace, one root* sections
  collapsed into a single declaration; *What `legacy/` is*
  rewritten with structural descriptors; layout-tree comment
  updated from "frozen pre-rewrite code" to "frozen reference
  subtree". Hash: `8536c525` → `6c6aee81`.
- `corpus/manifests/workspace/namespace.md` — *Why `@literate/*`
  and not `@athrio/*`* rewritten as a present-tense rationale
  (framework name = framework scope; LF and Athrio carry
  distinct scopes); *Scope discipline* third rule reframed
  from "any future Athrio integration work" to "the
  sister-repo Athrio product"; lead sentence "rewrite packages"
  → "active workspace packages". Hash: `d8e2db9f` →
  `06997960`.
- `corpus/manifests/infrastructure/install-path.md` — *Why
  direct, not via a tool manager* rewritten as two structural
  properties (no tool-manager wrappers; no shell-rc edits
  beyond Bun's installer) without the prior-direction
  narrative. Hash: `d666893b` → `6ee10bd5`.
- `corpus/manifests/infrastructure/distribution-model.md` —
  *What does not ship* first bullet rewritten: "the per-Trope
  `@literate/trope-<id>` shape is intentionally absent" rather
  than "the rewrite-stage attempt to ship each Trope … was
  retired". Hash: `ea66ac0e` → `32aa53dc`.
- `corpus/manifests/protocol/annotation-substrate.md` —
  *Per-location rewrite policy* tightened (one short
  paragraph per scope); *Migration from `@lfm(<hash>)`*
  section replaced with a *Compatibility with `@lfm(<hash>)`*
  declaration of what the substrate accepts. Hash: `9a6b8081`
  → `d3b990b2`.
- `corpus/manifests/protocol/repo-shape.md` — `corpus/`
  paragraph stripped of the "(deleted in the LFM rewrite)"
  parenthetical. Hash: `7ba91734` → `ed4d88d9`.
- `corpus/manifests/protocol/session-lifecycle.md` —
  *Decisions Made* bullet rewritten without the "Pre-LFM-
  rewrite vocabulary" parenthetical. Hash: `255d1d85` →
  `82b984cc`.
- `corpus/sessions/sessions.md` — index row added then
  stamped Closed.

## Deferred / Discovered

- **A linting rule for declarative-only voice.** The patterns
  this session caught — "the rewrite", "pre-rewrite",
  "previously", "earlier attempt", "was retired", "prior
  direction", "(deleted in …)" — are mechanically detectable.
  A reconcile-time linter could surface them as coherence
  diagnostics on every walked LFM. Out of scope here; the
  manual sweep was sufficient for v0.1's 20-LFM corpus.
- **Forward-looking sections.** `install-path.md` carries a
  *Forward: compiled binary* section declaring v0.1 ships
  bun-direct and post-1.0 may add compiled binaries. This
  reads as a current-scope declaration, not a future
  narrative — left in place. If a pattern of these sections
  emerges across LFMs, the substrate could mint a typed
  `## Forward` shape.
- **`session-lifecycle.md` cleanup further.** The session
  status vocabulary section still mentions the four values'
  semantics; this reads as declarative. No further edits
  needed in this scope.
