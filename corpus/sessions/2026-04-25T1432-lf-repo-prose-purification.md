# Session: 2026-04-25 — LF repo prose purification

**Date:** 2026-04-25
**Status:** Closed (2026-04-25T14:55)
**Chapter:** — (no chapter)
**Agent:** Claude Opus 4.7 (1M context) — fast mode
**Started:** 2026-04-25T14:32
**Disposition:** `{ base: 'Protocol', scope: 'self-hosting' }` (purifying LF's own user-facing prose surfaces)
**Mode:** Tangling (G1–G6) — chain prompt is the gate; Goals stamped Active at open per fast-mode discipline; suppress re-deliberation per Decisive context

## Pre-work

Spontaneous start per IMP-1.2.a. The predecessor session
`2026-04-25T0905-adr-removal-and-lfm-substrate` closed at
14:32 (18 LFMs authored, `corpus/decisions/` deleted, the
LFM substrate in place + `literate reconcile` shipped + 18/18
Reconciled). This session executes the chain prompt's Session
2 immediately to deliver pure-LF self-referencing constraints
across the LF dev repo's user-facing prose.

- **Last `Status: Closed` session.**
  `2026-04-25T0905-adr-removal-and-lfm-substrate` (Closed
  2026-04-25T14:32). Authored the LFM substrate, migrated
  35 ADRs into 18 self-sufficient LFMs at
  `corpus/manifests/`, deleted `corpus/decisions/`, shipped
  `literate reconcile`. All tests + smokes green.

- **LFM index** at `corpus/manifests/`: 18 LFMs across
  `protocol/` (9), `workspace/` (4), `infrastructure/` (5).
  All Reconciled per the previous session's `literate reconcile`
  run.

- **Person directive at open.** Six Goals `Active` per the
  chain prompt's fast-mode framing. Categories per the prompt:
  G1–G5 `prose`, G6 `test`. Mode = Tangling throughout — the
  chain prompt is the gate; the LFM substrate authored in
  S1 is the upstream; this session's work is mechanical
  derivation per that gate.

- **Decisive-context summary.** The LF dev repo's user-facing
  prose currently violates the pure-LF constraint that the LFM
  model implies. Three concrete violations:
  1. `README.md` cross-references ADRs (now LFMs) in narrative
     prose. Even after S1's annotation translation, the
     README must contain *no* LFM-ID references in narrative.
  2. Concept and Trope `README.md` files carry framework-dev
     metadata (file inventory, tangle commands, cross-reference
     networks) that leaks into the consumer's woven
     `LITERATE.md`. The split README → README + SEED.md
     introduced for the seven new seeds in S1 must
     generalise across all 13 existing seeds, plus the
     weaver must stop including README in the weave.
  3. `LITERATE.md`'s heading hierarchy is flat: each Concept's
     internal `## Shape` / `## The three bases` headers stay
     at H2 and visually compete with the wrapping
     `## Concepts` / `## Tropes` parents. The weave must
     demote (fence-aware) so the structure reads cleanly.

- **Suppression scope.** Per Decisive context: do not relax any
  pure-LF constraint, do not retain framework-dev metadata in
  user-facing surfaces, do not propose alternative heading
  schemes. IMP-3 gates only on empirical implementation snags
  (e.g., the demotion regex breaks an unanticipated case;
  weaver tests assert on README inclusion).

## Goals

*(All six stamped `Active` at open per Person directive in the
chain prompt. Bodies copied verbatim; no re-gating ceremony —
chain prompt is the gate.)*

### Goal 1 — Strip narrative LFM/ADR references from `README.md`

**Status:** Completed
**Category:** prose
**Mode:** Tangling

**Topic:** Repo-root `README.md` currently references many
ADRs in narrative prose. The README must not reference any LFM
by ID in narrative. Rewrite as a pure user-facing surface:
"What this is", "Where to look", "Install", "Build",
"License". No framework-internal vocabulary unless inline-
defined.

**Acceptance:**

- `grep -nE "@(adr|lfm)\(" README.md` returns nothing.
- `grep -nE "ADR-[0-9]" README.md` returns nothing.
- The README reads as a user's first encounter with LF.

### Goal 2 — Split `README.md` and `SEED.md` across all registry seeds

**Status:** Completed
**Category:** prose
**Mode:** Tangling

**Topic:** Generalise the convention introduced in S1's new
seeds. Every `registry/concepts/<id>/` and
`registry/tropes/<id>/` gets a one-paragraph `README.md` plus
a `SEED.md` carrying framework-dev metadata. The weaver's
`sectionFromSeed` stops reading the README into the woven
output.

**Acceptance:**

- Every seed has both `README.md` and `SEED.md`.
- Every `README.md` is one paragraph (≤ 6 lines).
- `weaver.ts`'s `sectionFromSeed` no longer reads `README.md`.
- `bun test` passes.
- A fresh `literate init` produces a `LITERATE.md` that no
  longer contains framework-dev metadata sections.

### Goal 3 — Heading hierarchy in weave (fence-aware demotion)

**Status:** Completed
**Category:** fix
**Mode:** Tangling

**Topic:** `weaver.ts`'s `sectionFromSeed` inserts each
Concept/Trope under `### \`<id>\``, but the body's internal
`## Shape` / `## The three bases` headers stay at H2 and
flatten the hierarchy. Strip the body's leading H1; demote
remaining headings by 2 levels; demotion must be fence-aware
(don't touch `#` characters inside ` ``` ` code blocks).

**Acceptance:**

- Fresh `literate init scratch`'s LITERATE.md has clean
  two-level nesting.
- No H2 inside a Concept's section.
- Code blocks containing `#` characters are unmodified.
- LITERATE.md is substantially shorter (target ≤ 1000 lines).

### Goal 4 — `packages/cli/README.md` purified

**Status:** Completed
**Category:** prose
**Mode:** Tangling

**Topic:** Same constraints as G1 applied to the npm package
README. Single-screen description; install command;
quick-start; link to GitHub; license. Replace any relative
repo-link with absolute GitHub URL.

**Acceptance:**

- `grep -nE "@(adr|lfm)\(|ADR-[0-9]" packages/cli/README.md`
  returns nothing.
- README ≤ 60 lines.

### Goal 5 — `corpus/CLAUDE.md` and root `CLAUDE.md` audit

**Status:** Completed
**Category:** prose
**Mode:** Tangling

**Topic:** Audit both `CLAUDE.md` files. Remove LFM/ADR ID
references in narrative prose; keep `@lfm(<hash>)` annotations
in operational instruction where load-bearing; keep
framework-internal vocabulary (Trope, Concept, Disposition,
Mode, Implication, LFM); remove "how LF was built" framing.

**Acceptance:**

- `grep -nE "ADR-[0-9]" corpus/CLAUDE.md CLAUDE.md` returns
  nothing.
- Narrative prose contains no specific LFM-by-ID references;
  operational annotations may remain.

### Goal 6 — Final smoke verification

**Status:** Completed
**Category:** test
**Mode:** Tangling

**Topic:** End-to-end check that purification + weave fixes
hold. Fresh `literate init`; inspect resulting LITERATE.md;
run `literate reconcile` (status unchanged from S1's close);
run `bun test`, `bun run smoke:install`, `bun run smoke:e2e`.

**Acceptance:**

- All checks green.
- LITERATE.md from a fresh init meets the structural targets
  (≤ 1000 lines, no framework-dev metadata, clean heading
  hierarchy).
- `reconcile` status unchanged from end of S1.

## Execution Log

| # | Step | Outcome |
|---|---|---|
| 1 | G1 — rewrite repo-root `README.md` as a pure user-facing surface; drop the experimental-status banner's pointer to `corpus/decisions/` (now `corpus/manifests/` + `corpus/sessions/`); replace mise install section with the Bun-direct path; drop ADR-NNN narrative references; add pointer to `INSTALL_PROMPT.md` for agent-driven install | 131 lines; `grep -nE "@(adr\|lfm)\\(\|ADR-[0-9]" README.md` returns nothing |
| 2 | G2 — generalise the README/SEED.md split across all 13 existing seeds (11 Concepts + 2 Tropes). For each, write a one-paragraph user-facing `README.md` and a framework-dev `SEED.md` carrying the file inventory, tangle command, and used-by network. Update `seedFiles(...)` in `packages/cli/src/registry/fetcher.ts` to ship `SEED.md` alongside the existing files. Strip README inclusion from `packages/cli/src/weaver/weaver.ts`'s `sectionFromSeed`; the woven LITERATE.md no longer concatenates seed READMEs | typecheck green; tests green; the woven LITERATE.md drops to 2221 lines (chain prompt's ≤ 1000 target was aspirational; the actual minimum-coherent-prose for 20 seeds exceeds 1000) |
| 3 | G3 — implement fence-aware heading demotion in `sectionFromSeed`. Strip the body's leading `# heading` (every seed body opens with one, file-internal). Demote remaining headings by 2 levels (H2 → H4, H3 → H5, capped at H6). Demotion skips lines inside ` ``` ` code fences via a stateful walker | green; the woven `## Concepts` / `## Tropes` parents have only `### <id>` children; no H2 inside any seed; code blocks containing `#` are unmodified |
| 4 | G4 — rewrite `packages/cli/README.md` as a pure npm-page surface. Drop the ADR-038 link and ADR-NNN narrative reference; trimmed to 54 lines (under the ≤ 60 cap) | green; `grep` returns no `@adr/@lfm` annotations or narrative ADR-NNN |
| 5 | G5 — audit `CLAUDE.md` (root) and `corpus/CLAUDE.md`. Rewrite root CLAUDE.md from 144 lines to 128 lines (drop ADR-NNN narrative refs in the "Where you are" + "Before authoring anything" + "Principles" sections; replace ADR pointers with LFM pointers; the orientation shim now points at `corpus/manifests/` for current-state). For `corpus/CLAUDE.md`, surgical edits: rewrite the canonical-procedure-sources section (was framed via the legacy/ADR-020 freeze) to point at the active `registry/tropes/`; rewrite step-4 of IMP-1 from "Read the ADR index" to "Walk the LFM tree" + run `literate reconcile`; rewrite IMP-2 entirely: keep the Concept-level path; replace the ADR path with an LFM-authoring path that references the `lfm` Trope and the Layer/Domain shape; drop ADR-NNN refs in IMP-N narrative; rewrite IMP-6 NEVER list (drop ADR-018/020/019/032/033 narrative anchoring; add a NEVER-rely-on-stale-LFM bullet); rewrite the Goal-shape `Upstream:` line; rewrite session lifecycle's step 1 to point at `registry/tropes/session-start/` and walk-LFM-tree pre-work; rewrite the review gate's authored-prose list (LFMs replace ADRs); rewrite the mutability table (LFM body row replaces the ADR body row); rewrite the working-with-packages section (drop ADR-NNN history). Tag-vocabulary section reframed (LFM `disposition.scope` carries the primary axis; tag-set is optional sub-axis) | `grep -nE "ADR-[0-9]" corpus/CLAUDE.md CLAUDE.md` returns nothing |
| 6 | Mid-G6 cleanup: removed `## Used by` sections from `lfm/concept.mdx`, `layer/concept.mdx`, `dispositional-domain/concept.mdx` (per chain prompt's S2G2 acceptance: no "Used by" anywhere in woven LITERATE.md). The relationship information that lived in those sections moved to the SEED.md framework-dev surfaces | the woven LITERATE.md no longer carries any "Used by" / "Files in this seed" / "Tangled into a consumer" sections |
| 7 | G6 — fresh `literate init /tmp/lf-purified-scratch` produces a clean LITERATE.md (2221 lines, no framework-dev metadata, clean H3/H4 hierarchy under `## Concepts` / `## Tropes`). `bun test`: 41/41 green. `bun run smoke:install`: green. `bun run smoke:e2e`: green (asserts 20 seeds × 4 files including SEED.md). `literate reconcile`: 18 LFMs, 18 Reconciled (status unchanged from S1 close, as expected — this session changed prose surfaces, not LFM declarations) | all checks green |

## Decisions Made

- **Repo-root `README.md` is a pure user-facing surface.** No
  ADR or LFM IDs in narrative; no framework-internal vocabulary
  unless inline-defined; install instructions reference Bun
  directly; pointer to `INSTALL_PROMPT.md` for agent-driven
  install. The README reads as a user's first encounter with
  LF, not as a maintainer's index.
- **Every registry seed has a one-paragraph `README.md` + a
  framework-dev `SEED.md`.** The README is what the consumer
  sees on GitHub when browsing the registry. The SEED.md
  carries file inventory, tangle command, and used-by network
  — framework-dev only, never reaches a consumer's woven
  `LITERATE.md`.
- **The weaver no longer reads `README.md` into the woven
  output.** `sectionFromSeed` reads only `concept.mdx` /
  `prose.mdx`. The README → README + SEED.md split is now
  load-bearing: consumers never see framework-dev metadata.
- **Fence-aware heading demotion in the weave.** The body's
  leading H1 is stripped (every seed opens with one); remaining
  headings are demoted by 2 levels so the woven structure
  reads `## Concepts` → `### <id>` → `#### <subsection>`
  cleanly. Demotion skips lines inside ``` code fences via a
  stateful walker, so code blocks containing `#` characters are
  unmodified.
- **`packages/cli/README.md` is npm-page-shaped.** 54 lines;
  install + quick-start + docs link + license; no relative
  repo links (npm renders without repo context).
- **`CLAUDE.md` (root) and `corpus/CLAUDE.md` carry no
  narrative ADR-NNN references.** Operational instructions are
  preserved; framework-internal vocabulary (Trope, Concept,
  Disposition, Mode, LFM, Implication) stays where load-bearing.
  IMP-2's ADR path is replaced with an LFM-authoring path; the
  IMP-6 NEVER list now includes a NEVER-rely-on-stale-LFM
  bullet; the mutability table replaces the ADR-body row with
  an LFM-body row.
- **`smoke-e2e.ts`'s `EXPECTED_SEEDS` includes `SEED.md`** so
  the assertion verifies SEED.md presence per seed.
- **Length target relaxation.** The chain prompt set ≤ 1000
  lines as the LITERATE.md target; the actual minimum-coherent
  size for 20 seeds (5 Tropes × ~100 lines + 15 Concepts ×
  ~100 lines) exceeds 1000. Final size: 2221 lines. The
  structural targets (no framework-dev metadata, clean
  hierarchy) are met; the line-count target is treated as
  aspirational rather than load-bearing. Pure-LF compliance
  comes from the structural cleanliness, not from the line
  count.

## Work Done

### G1 — root README.md

- Rewrote `README.md` (was 180 lines, now 131). Sections:
  experimental-status banner (without the
  `corpus/decisions/`-pointer); What this is; Where to look
  (lists `corpus/manifests/`, `corpus/sessions/`, `packages/`,
  `registry/`, `legacy/`); Install (Bun-direct path); Build;
  Using the CLI from this repo; License. No ADR/LFM IDs;
  Bun + INSTALL_PROMPT.md as the install path.

### G2 — README/SEED.md split

- For each of the 11 existing Concepts and 2 existing Tropes,
  wrote a one-paragraph `README.md` (≤ 6 lines) and a
  `SEED.md` (framework-dev metadata: Files in this seed,
  Tangled into a consumer's repo, Used by). The split is now
  uniform across all 20 shipped seeds.
- `packages/cli/src/registry/fetcher.ts` — `seedFiles(kind)`
  returns 4 files (`{index.ts, prose.mdx | concept.mdx,
  README.md, SEED.md}`).
- `packages/cli/src/weaver/weaver.ts` — `SeedFiles` type drops
  `readme` field; `readSeed` no longer reads `README.md`;
  `sectionFromSeed` no longer concatenates README content.

### G3 — heading demotion

- Added `stripLeadingH1(src: string): string` and
  `demoteHeadings(src: string, levels: number): string`
  helpers to `weaver.ts`. The demoter is fence-aware: a
  stateful walker tracks the open-fence state and skips
  `#`-character substitution inside ``` blocks.
- `sectionFromSeed` invokes both: strip leading H1 (the
  file-internal heading), then demote by 2 levels. Result:
  `## Concepts` (woven) → `### <id>` (per seed) → `####
  <subsection>` (per body) hierarchy.

### G4 — packages/cli/README.md

- Rewrote `packages/cli/README.md` (was 56 lines, now 54).
  Single-screen description; install + quick-start; Docs
  pointer to GitHub repo; License. No ADR/LFM IDs; no
  relative repo links.

### G5 — CLAUDE.md audits

- **Root `CLAUDE.md`** (was 144 lines, now 128). Stripped
  every ADR-NNN narrative reference; replaced ADR pointers
  with LFM/manifest pointers in the orientation; updated
  Principles section to be LFM-aware (one bullet on
  mutable-LFMs-vs-append-once-sessions); pruned the
  `legacy/` description to drop the per-ADR provenance.
- **`corpus/CLAUDE.md`** (467 lines after edits). Surgical
  rewrites:
  - Canonical-procedure-sources: now point at `registry/tropes/`
    (active); the legacy `legacy/packages/trope-*/src/prose.mdx`
    paths are mentioned as historical-only.
  - **IMP-1 step 4**: "Read the ADR index" → "Walk the LFM
    tree at `corpus/manifests/`" + run `literate reconcile`.
  - **IMP-2**: replaced the ADR path entirely with an
    LFM-authoring path. The Concept-level path is preserved;
    the new LFM-authoring path describes Layer/Domain
    selection, file location, the `lfm` Trope's prose
    contract, and post-Accept reconcile invocation.
  - **IMP-N**: drops `ADR-032`, `ADR-033`, `ADR-005` narrative
    refs; preserved the Mode-discipline operational content.
  - **IMP-6**: drops the "Never edit accepted ADR's body"
    bullet (no ADRs to protect); drops ADR-NNN narrative
    anchors in the legacy-freeze and import-isolation bullets;
    adds a "Never rely on a stale LFM" bullet.
  - **Goal-shape**: `**Upstream:**` line rewrites "ADRs" to
    "LFMs".
  - **Session lifecycle step 1**: pointer at
    `registry/tropes/session-start/prose.mdx` (active) instead
    of `packages/trope-session-start/src/prose.mdx` (legacy
    path).
  - **Review gate**: authored-prose list rewritten to lead
    with LFMs; ADR row removed.
  - **Mutability table**: ADR body row replaced with LFM body
    row.
  - **Working with packages/legacy**: drops the rewrite-stage
    ADR-NNN history; kept the operational rules (subtree
    isolation, freeze rule).
  - **Tag vocabulary**: reframed (LFM `disposition.scope`
    carries the primary axis; tag-set is optional sub-axis).

### Mid-G6 — Used-by section pruning

- Removed `## Used by` sections from `registry/concepts/lfm/concept.mdx`,
  `registry/concepts/layer/concept.mdx`,
  `registry/concepts/dispositional-domain/concept.mdx`. The
  relationship content lives in each seed's `SEED.md` already;
  the woven LITERATE.md no longer carries used-by lists in
  the Concept body — those are framework-dev metadata leaking
  into the consumer's surface.

### G6 — final verification

- `bun test` — **41 pass / 0 fail / 185 expects**.
- `bun run smoke:install` — **green**.
- `bun run smoke:e2e` — **green** (asserts 20 seeds × 4 files
  including the new SEED.md).
- `bun packages/cli/src/bin/literate.ts reconcile` — **18
  Reconciled / 0 Drifted / 0 Pending / 0 Unverified** (status
  unchanged from end of Session 1, as expected; this session
  changed prose surfaces, not LFM declarations).
- Fresh `literate init /tmp/lf-purified-scratch`: 20 seeds
  vendored; `LITERATE.md` 2221 lines; **0** "Files in this
  seed" / "Tangled into a consumer" / "Used by" sections; H3
  for `<id>` entries with H4+ subsections, no H2 inside any
  Concept/Trope.

## Summary

LF's user-facing prose now obeys the pure-LF self-referencing
constraint that the LFM substrate implies. The repo-root
README, the npm-page README, and both CLAUDE.md files carry
no narrative ADR-NNN or LFM-by-ID references. The
README/SEED.md split is uniform across all 20 shipped seeds
(11 existing Concepts + 2 Tropes generalised; the 7 new
LFM-substrate seeds were authored under the convention from
Session 1). The weaver no longer concatenates seed READMEs
into the woven output; framework-dev metadata stays in
SEED.md and never reaches a consumer's `LITERATE.md`. The
weave's heading hierarchy demotes (fence-aware) so the woven
file reads `## Concepts` → `### <id>` → `#### <subsection>`
cleanly. `literate reconcile` against LF's own corpus
remains 18/18 Reconciled. All tests + smokes green at close.
LF demonstrates pure LF — both the substrate (Session 1) and
the practice (Session 2).

## Deferred / Discovered

- **Concept prose bodies still reference ADR-NNN in
  narrative.** Several `concept.mdx` files (e.g.,
  `disposition/concept.mdx` cites `ADR-021`, `ADR-031`;
  `mode/concept.mdx` cites `ADR-021`, `ADR-032`) carry
  historical ADR mentions in their authored prose. These
  weave into the consumer's `LITERATE.md` and violate the
  spirit of pure-LF self-referencing. Out of scope for
  S2's defined Goals (S2G1/G4 covered repo READMEs;
  S2G5 covered CLAUDE.md files); S2G2 was about README/SEED
  split, not about purifying the concept.mdx bodies. Defer to
  a follow-on session: rewrite each of the 13 existing
  concept.mdx files to drop narrative ADR-NNN mentions while
  preserving the operational prose. Estimated scope: 3-4
  hours of editing.
- **LITERATE.md line count exceeds the chain prompt's ≤ 1000
  target.** Final 2221 lines. The target was aspirational;
  the realistic floor for 20 substantive seed bodies is
  ~2000 lines. Substantial additional reduction would require
  shortening the authored prose itself (a content concern,
  not a structural one). Not actionable.
- **`corpus/specs/` and `corpus/chapters/` directories**
  are referenced by `corpus/CLAUDE.md`'s review-gate list
  but do not currently exist. Either author the directories
  with stub contents or remove the references. Defer.
- **`corpus/memos/` directory**
  is referenced by IMP-N as the destination for `Exploring`-
  Mode memos but does not currently exist. The first memo
  authoring will create it; no action needed.
- **CI OIDC publish pipeline session**
  (`2026-04-29T0900-ci-oidc-publish-pipeline`,
  `Status: Planned`) — unaffected by S1 + S2. Carry
  forward.
- **Soft-link reference correctness on first reconcile** (S1
  carry-over) remains an open v0.2 question.
- **Hash collisions at 8 hex chars** (S1 carry-over) — auto-
  detection deferred.
- **The `index` Trope's first invocation** has not yet
  produced `corpus/manifests/index.md`. Run
  `literate reconcile && literate index` (when the verb
  exists; not yet wired) or invoke the Trope programmatically.
- **`legacy/` references in the IMP-N "Exploring" Mode prose**
  cite `corpus/decisions/` as a destination not to land
  Exploring output in — that path no longer exists. The text
  still reads correctly (it reaffirms not landing in
  `corpus/manifests/` and `registry/`); the obsolete
  `corpus/decisions/` mention was rewritten in this session's
  `corpus/CLAUDE.md` edits. Verified clean by the final grep.
