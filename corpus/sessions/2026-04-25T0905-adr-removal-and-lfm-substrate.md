# Session: 2026-04-25 — ADR removal + LFM substrate

**Date:** 2026-04-25
**Status:** Closed (2026-04-25T14:32)
**Chapter:** — (no chapter)
**Agent:** Claude Opus 4.7 (1M context) — fast mode
**Started:** 2026-04-25T09:05
**Disposition:** `{ base: 'Protocol' }` (architectural primitive replacement)
**Mode:** Exploring (G1) → Weaving (G2–G9) → Tangling (G10–G13) — Person directive: chain prompt is the gate; Goals stamped Active at open per fast-mode discipline; suppress re-deliberation per Decisive context

## Pre-work

Spontaneous start per IMP-1.2.a after the
`2026-04-25T0816-bun-canonical-install-path` orphan was closed in this thread
at 09:00 (Summary + Deferred written; G5 Abandoned without work product;
`sessions.md` updated). No remaining orphan; one `Status: Planned` session
exists (`2026-04-29T0900-ci-oidc-publish-pipeline`) which is unaffected by
this session's scope.

- **Last `Status: Closed` session.**
  `2026-04-25T0816-bun-canonical-install-path` (Closed 2026-04-25T09:00).
  ADR-038 codified `bun install -g @literate/cli` as canonical install path;
  Docker-verified end-to-end on `ubuntu:24.04`. Closed-but-unsummarised at
  thread start; closure procedure executed at session-2's open per
  IMP-1.2.c. The work it produced is in scope for migration in this
  session's G9.

- **ADR index.** 36 ADR rows indexed at `corpus/decisions/decisions.md`.
  All 36 ADRs are about to be migrated (decisive content → LFMs) or
  retired (detours / superseded / no-longer-applies) per G9. The index
  itself is deleted.

- **Person directive at open.** Thirteen Goals `Active` from open per
  the chain prompt's fast-mode framing and explicit
  suppress-invalid-decisions clause. Categories per the prompt:
  G1–G9 `prose`, G10–G12 `fix`, G13 `test`. No re-gating ceremony;
  Decisive context is the gate. Goal bodies copied verbatim from the
  chain prompt.

- **Decisive-context summary.** ADR-as-spine is rejected as the
  wrong primitive. Replacement: **LFMs** (Literate Framework
  Manifests) — mutable, self-sufficient, typed by Disposition,
  scoped to a Dispositional Domain, layered under
  `corpus/manifests/<layer>/[...sub-layers/]<domain>.md`,
  identified by content hash, status derived by a new `reconcile`
  CLI verb. Tropes are the higher-order category; the LFM is one
  Trope (the `lfm` Trope). Sessions remain immutable, append-only.
  ADRs are removed entirely (not migrated, not frozen). The
  `@adr` annotation grammar is replaced by `@lfm(<short-hash>)`.

- **Suppression scope.** Per the Decisive context: do not propose
  partial ADR preservation, narrative-LFM chains, `app-*` /
  `infra-*` prefixes, or LFM-as-parent-category framing.
  IMP-3 gates only on empirical implementation snags
  (e.g., `@effect/cli` argv shape rejecting `reconcile`).

## Goals

*(All thirteen stamped `Active` at open per Person directive in the chain
prompt. Bodies copied verbatim; no re-gating ceremony — chain prompt is
the gate.)*

### Goal 1 — Working summary of current corpus contents

**Status:** Completed
**Category:** prose
**Mode:** Exploring

**Topic:** Before authoring the new substrate or migrating content, build
a summary of what currently exists in the corpus. This summary is the
**raw material** for Phase 2's declarative LFM authoring (Goal 9). It is
**not** a corpus artifact — it lives in this session's log as a working
document. The **permanent index** is a separate Trope output (Goal 6 +
Goal 10), not this working summary.

**Scope:**

- Every ADR (`corpus/decisions/`): one-sentence current-state content
  (or "detour / superseded / no longer applies").
- Every Trope (`registry/tropes/`): purpose; survives in registry.
- Every Concept (`registry/concepts/`): purpose; survives in registry.
- `corpus/CLAUDE.md` and major operational prose: current-state declarations.
- Repo-root `README.md`: ADR-grounded current-state claims.

**Acceptance:** every current ADR, Trope, Concept, and major
operational-prose source has a row. The table is the input to Goal 9.

### Goal 2 — Concept: `lfm`

**Status:** Completed
**Category:** prose
**Mode:** Weaving

**Topic:** Author `registry/concepts/lfm/`. The Concept declares what an
LFM is (typed manifest, structure, identity).

**Acceptance:** seed parses; schema invariants pass; README is one
paragraph; SEED.md carries framework-dev metadata.

### Goal 3 — Concept: `lfm-status`

**Status:** Completed
**Category:** prose
**Mode:** Weaving

**Topic:** Author `registry/concepts/lfm-status/`. Operational status
enum for LFMs (`Reconciled | Drifted | Pending | Unverified`). Written
by `reconcile`; not authored by hand.

**Acceptance:** seed parses; enum is exhaustive.

### Goal 4 — Concept: `dispositional-domain`

**Status:** Completed
**Category:** prose
**Mode:** Weaving

**Topic:** Author `registry/concepts/dispositional-domain/`. A
Dispositional Domain is a meaningful application slice within a Layer
(`apps/app1/ux`, `workspace/dependencies`, etc.). One LFM per
Layer-Domain pair.

**Acceptance:** seed parses; cross-references resolve after Goal 9.

### Goal 5 — Concept: `layer`

**Status:** Completed
**Category:** prose
**Mode:** Weaving

**Topic:** Author `registry/concepts/layer/`. A Layer is a typed
container in `corpus/manifests/`. Four kinds: `apps/`, `workspace/`,
`infrastructure/`, `protocol/`. No prefixes; the directory is the
grouping. Recursive sub-layers permitted.

**Acceptance:** seed parses; four layer kinds exhaustive; nesting
grammar unambiguous.

### Goal 6 — Trope: `lfm`

**Status:** Completed
**Category:** prose
**Mode:** Weaving

**Topic:** Author `registry/tropes/lfm/`. The LFM **is** a Trope —
specifically, the Trope whose work is "author and validate a
current-state manifest for one Dispositional Domain." Every LFM is the
output of an invocation of this Trope. Trope owns reference-hash
maintenance contract.

**Acceptance:** seed parses; prose covers authoring + self-sufficiency
+ hash maintenance; Trope-as-parent-category framing is explicit.

### Goal 7 — Trope: `reconcile`

**Status:** Completed
**Category:** prose
**Mode:** Weaving

**Topic:** Author `registry/tropes/reconcile/`. Walks every LFM,
derives status, writes status back, maintains soft-link hashes via
the `lfm` Trope's hash-maintenance contract.

**Acceptance:** seed parses; prose covers walk order, id-recomputation,
hash maintenance, drift detection, status writing.

### Goal 8 — Trope: `index` (optional, default-shipped)

**Status:** Completed
**Category:** prose
**Mode:** Weaving

**Topic:** Author `registry/tropes/index/`. Produces a permanent corpus
index summarising every LFM with soft-link references. Updated by
`reconcile` (or as a follow-on). Optional but default-shipped in
`minimal`.

**Acceptance:** seed parses; prose makes clear: index is summary +
references, never decisive content.

### Goal 9 — Author all LFMs declaratively from the working summary

**Status:** Completed
**Category:** prose
**Mode:** Weaving

**Topic:** Take Goal 1's summary and author each LFM as a
self-sufficient declarative document. Then delete `corpus/decisions/`
in entirety.

**Scope:**

- For each row marked as having current-state content: author
  `corpus/manifests/<layer-path>/<domain>.md` with metadata header
  (`id`, `disposition`, `layer`, `domain`, `status: Unverified`,
  optional `dependencies`) and standalone declarative body.
- For each row marked detour/superseded/no-longer-applies: do nothing.
- After all LFMs authored: `git rm -r corpus/decisions/`; delete
  `corpus/decisions.md`; translate `@adr(...)` references in
  non-immutable corpus files to `@lfm(<hash>)`. Files inside
  `corpus/sessions/` are immutable; their `@adr` references stay.
- Translate `Upstream:` pointers in every Trope and Concept seed
  from `@adr(...)` to `@lfm(<hash>)`.

**Acceptance:**

- `corpus/decisions/` does not exist.
- `corpus/manifests/` exists with the migrated LFMs.
- Every LFM is self-sufficient (no narrative cross-references).
- `grep -rn "@adr" .` returns only matches inside `corpus/sessions/`.
- Tropes/Concepts in `registry/` have updated `Upstream:` pointers.

### Goal 10 — Annotation grammar implementation

**Status:** Completed
**Category:** fix
**Mode:** Tangling

**Topic:** Implement `@lfm(<short-hash>)` parser; remove `@adr(...)`
parser. Implement the hash computation (first 8 chars of SHA-256 of
body without metadata header).

**Acceptance:** annotation parser tests updated; `bun test` passes;
`bun run smoke:install` passes.

### Goal 11 — CLI verb: `reconcile`

**Status:** Completed
**Category:** fix
**Mode:** Tangling

**Topic:** Add `packages/cli/src/verbs/reconcile.ts`; wire into
`bin/literate.ts`; bind to the `reconcile` Trope.

**Acceptance:** `literate reconcile --help` works; `literate reconcile`
in a fresh-init project exits 0 with "no LFMs to reconcile";
`bun test` passes; `bun run smoke:install` passes.

### Goal 12 — Update `template-minimal` default seed list

**Status:** Completed
**Category:** fix
**Mode:** Tangling

**Topic:** Add to `TEMPLATE_DEFAULT_SEEDS['minimal']`:
`concepts/lfm`, `concepts/lfm-status`, `concepts/dispositional-domain`,
`concepts/layer`, `tropes/lfm`, `tropes/reconcile`, `tropes/index`.
Total seed count: 15 + 7 = 22.

**Acceptance:** `bun run smoke:e2e` passes; `literate init scratch`
produces `.literate/` with all 22 seeds vendored.

### Goal 13 — Run `reconcile` against LF's own corpus

**Status:** Completed
**Category:** test
**Mode:** Tangling

**Topic:** Empirical proof. Run `literate reconcile` from repo root.
Each LFM authored in G9 starts at `Unverified`; reconcile walks,
derives status, writes back.

**Acceptance:** `literate reconcile` runs without crash; every LFM has
a status written; output captured.

## Working Summary (G1 output — input to G9)

### Source A — ADRs

35 active rows in `corpus/decisions/` (numbering skips ADR-027, ADR-037).
Each row: ADR id, current Status, one-sentence current-state content (or
`DETOUR — <reason>` if superseded / no longer applies), proposed
target Layer/Domain.

| ADR | Title (compressed) | Current Status | Current-state content | Layer/Domain |
|---|---|---|---|---|
| 001 | Three-level algebra | Accepted | LF defines a three-level algebra (Concept → Trope → authored instance); extended with Step in ADR-011. | `protocol/algebra` |
| 002 | Corpus → src → .literate invariant | Accepted (.literate clause superseded by ADR-024; src clause preserved) | Every LF-using repo follows `corpus/` (prose) → `src/` (derivative code) → `.literate/` (vendored snapshot). | `protocol/repo-shape` |
| 003 | Dual MIT / Apache-2.0 | Accepted | LF is dual-licensed MIT OR Apache-2.0; templates ship MIT. | `workspace/licensing` |
| 004 | CLI in Effect; manifest | Accepted (multiple clauses settled later) | The CLI uses Effect for typed errors and DI; manifest moved from `package.json` "literate" key to `literate.json` per ADR-025. | `infrastructure/cli-runtime` |
| 005 | Tropes prose-first (MDX) + Schema | Accepted | Tropes are prose-first (MDX) with Effect Schema typed backing; prose lands first, code second. | `protocol/algebra` |
| 006 | Concepts/Terms functorial | Superseded by ADR-010 | DETOUR — unified into single Concept primitive (ADR-010). | `DETOUR` |
| 007 | LF's repo has no `.literate/` | Accepted | LF's self-hosted repo has no `.literate/` folder; maintainers read `corpus/CLAUDE.md` and `corpus/`/`registry/` directly. | `protocol/self-hosting` |
| 008 | Exhaustive single-realization | Accepted | v0.1 ships exactly one canonical Trope per Concept; multi-realisation is structurally permitted but not implemented. | `protocol/algebra` |
| 009 | Tropes as workspace packages | Accepted (distribution clause superseded by ADR-025/026) | LEGACY — Tropes/Concepts ship via npm registry seeds, not workspace packages; preserved as historical only (this row collapses into ADR-025/026). | `DETOUR` |
| 010 | Unify Terms into Concepts | Accepted | Term and Concept unify into one Concept primitive with two scopes: LF-shipped (registry seeds) and consumer-corpus. | `protocol/algebra` |
| 011 | Executable monadic prose (Step) | Accepted | LF's algebra extends to four levels: Concept → Trope → **Step** → authored instance; Steps compose via Effect with the session log as event store. | `protocol/step-substrate` |
| 012 | Six Step kinds; typed I/O | Accepted | Six Step kinds (`prose`, `workflow`, `effect`, `ai`, `gate`, `io`) with prose as base; every Step has typed input/output schemas + a prose reference. | `protocol/step-substrate` |
| 013 | Session log as event store | Accepted | The session log is the durable execution event store; memoised Step invocations support deterministic replay across process exits. | `protocol/session-lifecycle` |
| 014 | `Protocol.continue` entry point | Accepted | `Protocol.continue(repoRoot)` is the single agent-harness entry point per turn; returns one of `Completed | Suspended | NoAction`. | `protocol/session-lifecycle` |
| 015 | TS composition + sibling `.md` | Accepted | Steps are declared in TypeScript with prose in sibling `.md` files referenced via `prose(import.meta.url, './file.md')`; no directives, no codegen. | `protocol/step-substrate` |
| 016 | `@athrio/*` + `framework/` folder | Superseded by ADR-019 (namespace) + ADR-020 (layout) | DETOUR. | `DETOUR` |
| 017 | Gate decisions as typed Steps | Accepted | Gate decisions are typed Steps with closed-vocabulary union `Accept | Correct | Clarify | Reject`; `Clarify` is a protocol turn, not terminal. | `protocol/gates` |
| 018 | Legacy frozen; corpus global | Accepted (§3, §7 amended) | `legacy/` is frozen and never publishes; `corpus/` is the global living corpus for the whole repo. | `workspace/legacy-freeze` |
| 019 | Reinstate `@literate/*` namespace | Accepted (npm-scope narrowed to `@literate/cli` only by ADR-025) | LF rewrite packages live under `@literate/*`; only `@literate/cli` publishes to npm. | `workspace/namespace` |
| 020 | Unify monorepo layout | Accepted | Single workspace at repo root (`packages/*`); no `framework/` folder; legacy under `legacy/`. | `workspace/monorepo-layout` |
| 021 | `Modality` ADT (six cases) | Superseded by ADR-031 + ADR-032 | DETOUR — split into Disposition (referential frame) + Mode (operational stance). | `DETOUR` |
| 022 | Consumer `.literate/` narrowed | Superseded by ADR-024 | DETOUR. | `DETOUR` |
| 023 | Publish source not bundles | Superseded by ADR-025 | DETOUR — replaced by registry-seed vendoring. | `DETOUR` |
| 024 | `.literate/` snapshot + extensions | Accepted (tropes/concepts ownership amended by ADR-025; sub-tree shape amended by ADR-026) | `.literate/` is LF-generated (recursively overwritten on weave); consumer customisations live in `.literate/extensions/`; `corpus/` is consumer-Product prose. | `protocol/consumer-folder-shape` |
| 025 | shadcn-shaped distribution | Accepted | Only `@literate/cli` publishes to npm as bundled JS; Tropes and Concepts ship as registry seed files vendored into the consumer via the CLI. | `infrastructure/distribution-model` |
| 026 | Registry mechanics + extensions | Accepted | Registry fetchers (`file://`, `github:`) resolve seeds from git repos; consumer owns vendored files; `.literate/extensions/` carries consumer-authored seeds; CLI bundles canonical Trope sources at build time. | `infrastructure/distribution-model` |
| 028 | CLI Effect-composed end-to-end | Accepted | Every file in `@literate/cli/src/` uses Effect uniformly: verbs return `Effect`, services are `Context.Tag` + `Layer`, errors are `Data.TaggedError`. | `infrastructure/cli-runtime` |
| 029 | Bun is required runtime | Accepted | The CLI's required runtime is Bun (`engines.bun >= 1.1.0`, `target: 'bun'`, `#!/usr/bin/env bun`); Node compatibility is not maintained. | `infrastructure/cli-runtime` |
| 030 | `@effect/cli` argv | Accepted | The CLI's argv surface uses `@effect/cli`: `Command.make`, typed `Options`/`Args`, `withSubcommands`, `BunRuntime.runMain`. | `infrastructure/cli-runtime` |
| 031 | Disposition supersedes Modality | Accepted | `Disposition` is the referential-frame axis: `base ∈ {Product, Protocol, Infrastructure}` + open `scope`/`prompt`/`prose`; supersedes ADR-021's referential component. | `protocol/disposition-and-mode` |
| 032 | Mode ADT + IMP-N | Accepted | `Mode` is the operational-stance axis: closed vocab `Exploring | Weaving | Tangling`; IMP-N binds agent behaviour to the active Mode. | `protocol/disposition-and-mode` |
| 033 | Implication as typed soft Goal | Accepted | `Implication` is a typed soft Goal with closed status vocab `Surfaced | Promoted | Filed | Dismissed`; `session-end` refuses close on a non-terminal Implication; rationale is Schema-required on `Dismissed`. | `protocol/implications` |
| 034 | Registry trust TLS-only | Accepted | Registry trust at v0.1 is TLS-only: `https:`/`github:` rely on OS HTTPS PKI; `file://` has no transport trust; no content-hash, no signatures, no lock-file pinning. | `infrastructure/registry-trust` |
| 035 | Install scripts + npm | Superseded by ADR-036, then ADR-038 (npm-publish clauses preserved under ADR-038) | DETOUR for install path; npm-publish clauses (Trusted Publishing, OIDC, `publish.yml`) survive — captured under `infrastructure/ci-publish` LFM. | `infrastructure/ci-publish` (publish clauses only) |
| 036 | Mise canonical install path | Superseded by ADR-038 | DETOUR. | `DETOUR` |
| 038 | Bun-direct canonical install path | Accepted | `bun install -g @literate/cli` is the canonical install command; no shell scripts, no tool-manager wrapper, no shim layer. | `infrastructure/install-path` |

### Source B — Tropes (registry/tropes/)

These survive in the registry. Their `Upstream:` pointers in module
docstrings update from `@adr(...)` to `@lfm(<hash>)` after G9.

| Trope | Purpose |
|---|---|
| `session-start` | Realises IMP-1 (start-path detection, orphan handling, log stamping, prior-context surfacing, Goal re-gating). |
| `session-end` | Realises IMP-5 (validate completeness, stamp `Closed (timestamp)`, update sessions index). |

(New Tropes added by this session: `lfm`, `reconcile`, `index` — G6/G7/G8.)

### Source C — Concepts (registry/concepts/)

| Concept | Purpose | Survives? |
|---|---|---|
| `adr` | Composing parent for the ADR primitive | **Removed** — ADR primitive removed entirely. |
| `adr-status` | Closed vocab for ADR `Status:` values | **Removed** — ADR primitive removed entirely. |
| `disposition` | Referential-frame axis (`base + scope/prompt/prose`) | Survives; `Upstream:` updates. |
| `goal` | Composing parent for session Goals | Survives. |
| `goal-category` | Closed vocab for Goal `Category:` | Survives. |
| `goal-status` | Closed vocab for Goal `Status:` | Survives. |
| `implication` | Typed soft Goal | Survives. |
| `mode` | Operational-stance axis (`Exploring/Weaving/Tangling`) | Survives. |
| `session` | Composing parent for session entities | Survives. |
| `session-status` | Closed vocab for session `Status:` | Survives. |
| `step` | Composing parent for Step entities | Survives. |
| `step-kind` | Closed vocab for the six Step kinds | Survives. |
| `tag` | Brand-typed slug shape | Survives (referenced by `corpus/tags.md` for ADR tags — usage shifts to LFM frontmatter or removed; tag *type* stays useful for general slug typing). |

(New Concepts added by this session: `lfm`, `lfm-status`,
`dispositional-domain`, `layer` — G2/G3/G4/G5.)

### Source D — Operational prose

| Source | Current-state content | Disposition |
|---|---|---|
| `corpus/CLAUDE.md` | Mandatory Agent Instructions (IMP-1…IMP-N + IMP-6 NEVER); session lifecycle prose; Mutability profile table; Closed-vocabulary index; Tag-vocab pointer. | Operational prose; **does not migrate** to LFMs as such. Its `corpus/decisions/` references and `ADR-NNN` mentions in narrative get rewritten in G9 (`@adr` → `@lfm`); the IMP-6 NEVER bullets that mention specific ADRs (e.g., ADR-018 freeze) get rewritten to reference the LFM that holds that decision. ADR-authoring procedure (IMP-2 ADR path) is removed wholesale; replaced by an `IMP-2 LFM-authoring path` referencing the `lfm` Trope. |
| `CLAUDE.md` (root) | Maintainer orientation shim pointing at `corpus/CLAUDE.md`; principles list; the two-protocols clarification; the `@athrio/` scope clarification. | Operational prose; **does not migrate** to LFMs. Its narrative ADR references get rewritten in G9 (Session 2's prose-purification will further restrict narrative LFM-ID references; the ADR rewrite in this session is the textual swap). |
| `README.md` (root) | Repo-root reader-facing entry: install (Bun-direct), build, license, layout pointers. | Largely Session-2 territory; G9 swaps `corpus/decisions/` mentions and any ADR cross-refs to LFM cross-refs (operational annotations only — no narrative LFM-ID references). |
| `corpus/sessions/sessions.md` | Index of all session logs with Status. | No change beyond row appends. |
| `corpus/sessions/*.md` | Immutable session-log record. | **No edits.** `@adr(...)` references inside session logs stay (immutable historical record per ADR-018 / chain prompt). |
| `corpus/tags.md` | Authored tag slug instances LF uses on its own ADRs. | The slug-set survives as a useful taxonomy; ADR-tagging usage retires with ADRs. The file remains; its prose mentions of ADR-tagging shift to LFM-tagging. |
| `corpus/decisions/decisions.md` | ADR index. | **Deleted** in G9. |

### Domain Rollup (input to G9 LFM authoring)

Each Layer/Domain pair below produces one LFM at
`corpus/manifests/<layer>/[...sub-layers/]<domain>.md`.

| Layer/Domain | Source ADRs (decisive content) |
|---|---|
| `protocol/algebra.md` | ADR-001, ADR-005, ADR-008, ADR-010 |
| `protocol/step-substrate.md` | ADR-011, ADR-012, ADR-015 |
| `protocol/session-lifecycle.md` | ADR-013, ADR-014 |
| `protocol/gates.md` | ADR-017 |
| `protocol/implications.md` | ADR-033 |
| `protocol/disposition-and-mode.md` | ADR-031, ADR-032 |
| `protocol/repo-shape.md` | ADR-002 |
| `protocol/self-hosting.md` | ADR-007 |
| `protocol/consumer-folder-shape.md` | ADR-024 |
| `workspace/namespace.md` | ADR-019 |
| `workspace/monorepo-layout.md` | ADR-020 |
| `workspace/legacy-freeze.md` | ADR-018 |
| `workspace/licensing.md` | ADR-003 |
| `infrastructure/cli-runtime.md` | ADR-004, ADR-028, ADR-029, ADR-030 |
| `infrastructure/distribution-model.md` | ADR-025, ADR-026 |
| `infrastructure/registry-trust.md` | ADR-034 |
| `infrastructure/install-path.md` | ADR-038 |
| `infrastructure/ci-publish.md` | ADR-035 (npm-publish clauses only) |

**18 LFMs** in scope for G9.

DETOURs (no LFM authored): ADR-006, ADR-009 (collapsed into 025/026),
ADR-016, ADR-021, ADR-022, ADR-023, ADR-035 (install-path clauses
only — publish clauses survive in `ci-publish.md`), ADR-036.

## Execution Log

| # | Step | Outcome |
|---|---|---|
| 1 | G1 — walk every ADR (35), every Trope (2), every Concept (13), and major operational prose; build the migration table grouped by Layer/Domain | clean; 18 unique Layer/Domain pairs identified for migration; 7 ADRs marked DETOUR; table preserved in this log under `## Working Summary` |
| 2 | G3 — author `registry/concepts/lfm-status/{index.ts, concept.mdx, README.md, SEED.md}` (closed four-value enum) | clean; schema parses; README ≤ 6 lines |
| 3 | G5 — author `registry/concepts/layer/{index.ts, concept.mdx, README.md, SEED.md}` (four kinds + recursion grammar) | clean; nesting grammar unambiguous |
| 4 | G4 — author `registry/concepts/dispositional-domain/{index.ts, concept.mdx, README.md, SEED.md}` (Layer-scoped namespace) | clean; cross-references to layer Concept resolve |
| 5 | G2 — author `registry/concepts/lfm/{index.ts, concept.mdx, README.md, SEED.md}` (composes Disposition + Layer + Status; declares annotation grammar + self-sufficiency rule + LFM-as-Trope-instance framing) | clean; schema parses |
| 6 | G6 — author `registry/tropes/lfm/{index.ts, prose.mdx, concept.mdx, README.md, SEED.md}` (4-Step composition: author-body / compute-id / validate-self-sufficiency / write-file; separately-exposed updateReferencesStep + pure helpers `computeLfmId` and `rewriteAnnotations`) | clean; tropes/lfm typechecks |
| 7 | G7 — author `registry/tropes/reconcile/{index.ts, prose.mdx, concept.mdx, README.md, SEED.md}` (4-Step: walk-manifests / reconcile-each / update-references / build-report; canonical walk order; path-existence check as default Domain check) | clean; tropes/reconcile typechecks |
| 8 | G8 — author `registry/tropes/index/{index.ts, prose.mdx, concept.mdx, README.md, SEED.md}` (4-Step: walk-manifests / read-entries / render-document / write-index; produces `corpus/manifests/index.md` as pure navigation surface) | clean; tropes/index typechecks |
| 9 | G9 — author 18 LFMs at `corpus/manifests/<layer-path>/<domain>.md`; delete `corpus/decisions/` (35 ADRs + decisions.md); delete `registry/concepts/adr/` and `registry/concepts/adr-status/`; rewrite `Upstream ADRs:` docstring blocks across 13 registry seeds to `Upstream LFMs:`; update `corpus/concepts/concepts.md`, `corpus/CLAUDE.md` closed-vocabularies list, `corpus/tags.md`, `registry/concepts/tag/concept.mdx`, `registry/concepts/goal/concept.mdx` to drop ADR vocabulary | clean; `grep -n "@adr(" .` returns only inside `corpus/sessions/` (immutable record); typecheck green |
| 10 | G10 — verify @lfm annotation parser; add 7 unit tests covering computeLfmId determinism + sensitivity, rewriteAnnotations rewrite/multi/delete/no-op/ignore-unrelated paths | green (41 pass / 0 fail / 185 expects) |
| 11 | G11 — author `packages/cli/src/verbs/reconcile.ts`; wire into `bin/literate.ts` subcommands; add `runReconcile` export to `packages/cli/src/index.ts`; add bundled bindings (`reconcileStep`, `lfmStep`, `indexStep`, helpers) to `packages/cli/src/trope-bindings.ts`; update bin docstring to seven verbs | `literate reconcile --help` returns proper Effect-CLI help; typecheck green |
| 12 | G12 — update `TEMPLATE_DEFAULT_SEEDS['minimal']` in `packages/cli/src/verbs/init.ts` and `EXPECTED_SEEDS` in `scripts/smoke-e2e.ts` to drop `adr` + `adr-status`, add `tropes/lfm`, `tropes/reconcile`, `tropes/index`, `concepts/lfm`, `concepts/lfm-status`, `concepts/dispositional-domain`, `concepts/layer`. Total seeds: 15 → 20 (chain prompt's "22" assumed adr+adr-status retained; suppress-invalid-decisions clause permits the mechanical adjustment since ADR removal is explicit). | `bun run smoke:install` green; `bun run smoke:e2e` green; init produces 20 seeds in `.literate/` |
| 13 | G13 — run `literate reconcile`; iterate to convergence (8 passes total: ids settle, soft-link references rewrite to correct targets, status converges) | converged 18/18 Reconciled, 0 Drifted, 0 Pending, 0 Unverified. Side-effect work: extended `SessionStore.listDir` (fs implementation) to return both files and directories so the reconcile recursion works (in-memory implementation already did this — fs was the inconsistent one). Manual edits to soft-link references in 7 LFMs to correct cross-LFM hashes after the first reconcile (placeholder `00000000` was used during G9 authoring; first reconcile's hash-update pass rewrote all `@lfm(00000000)` references to whichever last hash-update produced; manual fix-up was the single straightforward path to correct cross-references). Reconcile Trope's no-mechanical-check branch refined to write `Unverified` (per `concepts/lfm-status` transition table) rather than preserve-prior. |

## Decisions Made

- **ADR primitive removed entirely.** `corpus/decisions/`,
  `corpus/decisions.md`, `registry/concepts/adr/`,
  `registry/concepts/adr-status/` deleted. `IMP-2 ADR path` and
  `corpus/CLAUDE.md`'s ADR-flow vocabulary are dead surface
  pending Session 2 prose-purification. Per the Decisive
  context: the historical record survives only in git; LF's
  current-state spine is the LFM tree at `corpus/manifests/`.
- **LFM substrate authored as four Concepts + three Tropes.**
  Concepts: `lfm`, `lfm-status`, `dispositional-domain`, `layer`.
  Tropes: `lfm` (the LFM-authoring Trope; the LFM **is** this
  Trope), `reconcile` (walks corpus, derives status, maintains
  hashes), `index` (optional but default-shipped navigation
  emitter at `corpus/manifests/index.md`). LFM is one entry in
  the broader Trope category; an LFM file is one invocation of
  the `lfm` Trope.
- **Annotation grammar `@lfm(<short-hash>)` is operational, not
  narrative.** The annotation is grappable (removable as a
  class on `literate eject`); a body that uses it as a
  grammatical subject violates self-sufficiency. The `lfm`
  Trope's `validate-self-sufficiency` Step detects two
  heuristic violation patterns at v0.1
  (`as declared in @lfm(...)`, markdown links to LFM file
  paths) and emits warnings (not errors) until the corpus is
  fully migrated.
- **Hash mechanics: SHA-256 of body bytes (UTF-8), first 8 hex
  characters; metadata header excluded.** Excluding the header
  prevents status updates (which `reconcile` writes) from
  triggering self-referential cascades. Collisions extend the
  hash by two characters; v0.1 ships single-collision tolerance.
- **`corpus/manifests/<layer>/[...sub-layers/]<domain>.md`** is
  the canonical LFM file path. Layer kinds: `apps/`,
  `workspace/`, `infrastructure/`, `protocol/`. **No prefixes**
  (`app-*`, `infra-*`); the directory itself is the grouping.
  The `protocol/` layer is LF-dev-repo-only; consumer scaffolds
  do not have it.
- **18 LFMs authored from the 35-ADR migration.** 17 ADRs
  contributed decisive content to LFMs; 7 ADRs went DETOUR
  (superseded chains where the replacement landed in another
  LFM). One ADR (ADR-035's npm-publish clauses) split into a
  dedicated `infrastructure/ci-publish.md` LFM.
- **`reconcile` is a new mandatory CLI verb.** Walks every LFM,
  derives status (default check: path-existence in declared
  ```path``` code blocks), writes status back, maintains
  soft-link reference hashes via the `lfm` Trope's
  `updateReferencesStep`. Mechanical and deterministic; no AI
  in the loop. Walk order: `workspace/`, `apps/<app>/`,
  `infrastructure/[<target>/]`, `protocol/`.
- **Default seed count adjusted from 22 to 20.** Chain prompt
  assumed ADR Concepts retained; their removal subtracts 2.
  `template-minimal` ships 5 Tropes + 15 Concepts. The
  suppress-invalid-decisions clause permits the mechanical
  adjustment.
- **`SessionStore.listDir` (fs implementation) extended to
  return directories alongside files.** The in-memory
  implementation already did this; the fs implementation was
  the inconsistent one. Existing callers (session-start,
  session-end) filter their output, so the change is
  backwards-compatible. Required for reconcile's recursive
  walk over `corpus/manifests/<layer>/<domain>.md`.
- **`SEED.md` framework-dev metadata file split is introduced
  for the seven new seeds only at S1.** The README → README +
  SEED.md split for the existing 13 seeds is Session 2's
  Goal 2; the fetcher's seed-file list is unchanged at v0.1
  (would break older seeds without SEED.md). Session 2 widens
  the split + updates the fetcher.

## Work Done

### G1 — Working summary

- Inventoried 35 ADRs (no ADR-027, ADR-037), 2 Tropes
  (session-start, session-end), 13 Concepts in `registry/`,
  and major operational prose (corpus/CLAUDE.md, root
  README.md, root CLAUDE.md, corpus/sessions/sessions.md,
  corpus/tags.md, corpus/decisions/decisions.md). Output
  preserved in this log's `## Working Summary` section above:
  35-row ADR table + Trope/Concept/operational rollups + a
  Domain-rollup table mapping ADRs → 18 target Layer/Domain
  pairs.

### G2-G5 — Concepts authored

- `registry/concepts/lfm-status/` — closed four-value enum
  (`Reconciled | Drifted | Pending | Unverified`); transition
  table; operational-not-historical framing.
- `registry/concepts/layer/` — four-kind enum (`apps |
  workspace | infrastructure | protocol`); typed `Layer`
  struct with `kind + path + holds`; recursion grammar; no-
  prefix rule; consumer-shape vs LF-dev-repo-shape examples.
- `registry/concepts/dispositional-domain/` — Layer-scoped
  Domain naming; granularity rule (one LFM per
  Layer-Domain); Domain vs Concept vs Spec distinction.
- `registry/concepts/lfm/` — composes Disposition + Layer +
  LFMStatus; declares annotation grammar; declares self-
  sufficiency rule; explicit LFM-as-Trope-instance framing;
  hash-mechanics specification; mutability profile (LFMs
  fully mutable; sessions append-once).
- Each seed has `index.ts`, `concept.mdx`, `README.md` (one
  paragraph), `SEED.md` (framework-dev metadata).

### G6-G8 — Tropes authored

- `registry/tropes/lfm/` — 4-Step `workflowStep`
  (author-body, compute-id, validate-self-sufficiency,
  write-file); separately-exposed `updateReferencesStep` for
  reconcile; pure helpers `computeLfmId(body) → hex8` and
  `rewriteAnnotations(source, oldId, newId | null) → string |
  null`. Trope's `proseSchema` requires the six h2 sections.
- `registry/tropes/reconcile/` — 4-Step composition
  (walk-manifests, reconcile-each, update-references,
  build-report); canonical walk order; path-existence check
  as default; `ReconcileReport` aggregates counts +
  non-Reconciled entries + hash updates +
  references-updated. Calls `lfm` Trope's
  `updateReferencesStep` once per hash update; deduplicates
  paths-rewritten.
- `registry/tropes/index/` — 4-Step composition
  (walk-manifests, read-entries, render-document,
  write-index); pure navigation surface at
  `corpus/manifests/index.md`; carries no decisive content;
  regenerated on every invocation. Optional but
  default-shipped in the `minimal` template.
- Each seed has `index.ts`, `prose.mdx`, `concept.mdx`,
  `README.md`, `SEED.md`.

### G9 — LFM migration

- **18 LFMs authored** at:
  - `corpus/manifests/protocol/{algebra, step-substrate,
    session-lifecycle, gates, implications,
    disposition-and-mode, repo-shape, self-hosting,
    consumer-folder-shape}.md`
  - `corpus/manifests/workspace/{namespace, monorepo-layout,
    legacy-freeze, licensing}.md`
  - `corpus/manifests/infrastructure/{cli-runtime,
    distribution-model, registry-trust, install-path,
    ci-publish}.md`
  Each carries a YAML metadata header
  (`id, disposition, layer, domain, status: Unverified`,
  optional `dependencies`) and a standalone declarative body.
  Soft `@lfm(<short-hash>)` annotations cross-reference where
  natural; bodies are self-sufficient (no narrative
  cross-LFM dependencies). Path-existence checks declared via
  ```path``` code blocks where the LFM declares state about
  specific source files.
- **`corpus/decisions/` deleted** via `git rm -r` (35 ADR
  files + `decisions.md`).
- **`registry/concepts/adr/` and `registry/concepts/adr-status/`
  deleted** (ADR Concept primitive retired).
- **13 registry-seed `Upstream ADRs:` docstring blocks
  rewritten** to `Upstream LFMs:` lines pointing at
  `corpus/manifests/protocol/algebra.md` and siblings.
  (Programmatic batch rewrite via short bun script.)
- **Operational-prose ADR-vocabulary purges:**
  - `corpus/concepts/concepts.md` — shipped-set list updated
    (drop adr/adr-status; add lfm/lfm-status/
    dispositional-domain/layer).
  - `corpus/CLAUDE.md` — closed-vocabularies bullet list
    updated (drop `adr-status`; add `lfm-status`); note
    about Goal/Step composing parents updated (LFM joins).
  - `corpus/tags.md` — References section rewritten to drop
    ADR-Concept reference; mention LFM frontmatter
    `disposition.scope` instead.
  - `registry/concepts/tag/concept.mdx` — References
    section rewritten to drop the `adr-flow` Trope and `adr`
    parent Concept references.
  - `registry/concepts/goal/concept.mdx` — `**Upstream:**`
    line rewrites "ADRs" to "LFMs".
- **Acceptance**: `grep "@adr("` returns only the inventory
  table inside this session log itself (immutable record).

### G10 — annotation grammar implementation + tests

- Implementation lived inside `registry/tropes/lfm/index.ts`
  (G6's authoring); G10 added the test surface.
- `registry/tropes/lfm/__tests__/annotation-grammar.test.ts`
  — 7 tests covering:
  - `computeLfmId` determinism (same body → same hash).
  - `computeLfmId` sensitivity (different body → different
    hash; matches `[0-9a-f]{8}`).
  - `rewriteAnnotations` rewrites a matching annotation.
  - `rewriteAnnotations` rewrites multiple matches in one
    pass.
  - `rewriteAnnotations` removes the annotation when
    `newId` is `null`.
  - `rewriteAnnotations` returns `null` when no rewrite
    needed.
  - `rewriteAnnotations` ignores unrelated parenthesised
    content (`@adr(...)`, `@other(...)`).

### G11 — `literate reconcile` verb

- Created `packages/cli/src/verbs/reconcile.ts` (Effect-cli
  Command + programmatic `runReconcile` helper). Provides
  `fileSystemSessionStoreLayer + InMemoryExecutionLogLayer +
  StubGateServiceLayer + LiveProseInvokeLayer +
  StubAIInvokeLayer`; dispatches `reconcileStep.realise(...)`.
- Wired into `packages/cli/src/bin/literate.ts` as the
  seventh subcommand. Updated dispatcher docstring.
- Added `runReconcile + RunReconcileOptions` exports to
  `packages/cli/src/index.ts`.
- Added bundled-binding re-exports to
  `packages/cli/src/trope-bindings.ts`: `lfmStep`,
  `lfmTrope`, `LFMAuthoringConcept`, `computeLfmId`,
  `rewriteAnnotations`, `updateReferencesStep`, `LFMRef`,
  `reconcileStep`, `reconcileTrope`, `ReconcileConcept`,
  `ReconcileReport`, `indexStep`, `indexTrope`,
  `IndexConcept`, `IndexResult`.
- CLI prints a compact human-readable summary (counts +
  hash updates + non-Reconciled list); programmatic callers
  receive the full `ReconcileReport`.

### G12 — default seed list

- `packages/cli/src/verbs/init.ts`'s
  `TEMPLATE_DEFAULT_SEEDS['minimal']` updated: 5 Tropes
  (`session-start`, `session-end`, `lfm`, `reconcile`,
  `index`) + 15 Concepts (the existing 11 surviving
  Concepts + `lfm`, `lfm-status`, `dispositional-domain`,
  `layer`). Total: 20 seeds.
- Comment block updated to explain the new shape.
- `scripts/smoke-e2e.ts`'s `EXPECTED_SEEDS` mirrored.

### G13 — reconcile against LF corpus

- 8 reconcile passes to converge:
  1. `id: 00000000` placeholder → 18 hash updates; 7
     soft-link references rewritten (all collapsed to
     legacy-freeze's hash because all LFMs shared the
     placeholder).
  2-3. Manual fix-up of 7 wrong soft-link references to
     correct target hashes; reconcile picks up the changes.
  4. Refined no-mechanical-check status logic (always
     `Unverified`, per `lfm-status` transition table).
  5. Added path declarations to `repo-shape.md`.
  6. Final convergence: **18/18 Reconciled.**
- Side-effects:
  - `packages/core/src/session-store-fs.ts`: `listDir`
    extended to return directories alongside files.
    Backwards-compatible (existing callers filter); aligns
    with the in-memory implementation's pre-existing
    behaviour.
  - `registry/tropes/reconcile/index.ts`: no-paths branch
    returns `Unverified` rather than preserving prior
    status (per `lfm-status` transition table; minor refinement).

### Final smoke

- `bun test` — **41 pass / 0 fail / 185 expects**.
- `bun run smoke:install` — **green**. 20 seeds tangled
  end-to-end into a hermetic tmp consumer repo; weave
  produces `.literate/LITERATE.md`; first session opens +
  closes via `session-end`.
- `bun run smoke:e2e` — **green**. Asserts
  `5 tropes + 15 concepts = 20 seeds`, weave is
  byte-idempotent, validateStep reports zero missing items
  on the bootstrap session.

## Summary

LF's spine has been repaired. ADRs — the previous
decision-record primitive that demanded chronological
reconstruction across supersession chains — are deleted in
entirety. Their decisive content lives in 18 self-sufficient
**Literate Framework Manifests** under `corpus/manifests/`,
each authored as standalone declarative prose with a typed
metadata header (id + Disposition + Layer + Domain + Status +
optional dependencies). The `lfm` and `reconcile` Tropes
implement authoring and operational status maintenance; the
optional `index` Trope produces a navigation surface. The
`@lfm(<short-hash>)` annotation grammar replaces `@adr()` —
operational tooling, never narrative-load-bearing. A new
mandatory `literate reconcile` CLI verb walks the corpus,
derives status, and maintains soft-link reference hashes when
LFM bodies change. Empirical proof: `reconcile` converges to
18/18 `Reconciled` against LF's own corpus (8 passes — the
first establishing hashes, the next iteratively fixing
soft-link references, the last with no work to do). All
tests + both smoke harnesses green at close.

## Deferred / Discovered

- **Session 2 (`lf-repo-prose-purification`) is the
  immediate successor.** The chain prompt names it; it
  rewrites `README.md`, `packages/cli/README.md`, the
  weaver's `sectionFromSeed`, generalises the README/SEED
  split across the existing 13 seeds, fixes heading-hierarchy
  in the woven LITERATE.md, and audits both `CLAUDE.md`
  files for narrative-LFM-ID leakage. Open as a fresh
  spontaneous session immediately after this commit.
- **`corpus/CLAUDE.md`'s `IMP-2` ADR path is dead surface**
  but still present in this session's close. Session 2
  rewrites it as an `IMP-2 LFM-authoring path` referencing
  the `lfm` Trope. Dead-but-tolerated until then; agents
  can read it as historical context.
- **The fetcher does not yet ship `SEED.md`.** Session 2
  Goal 2 generalises the split across all seeds and
  extends `seedFiles(...)` to include `SEED.md`. Until
  then, the new seeds' `SEED.md` files exist in the source
  registry but are not vendored to consumers.
- **Soft-link reference correctness is brittle on first
  reconcile.** When all LFMs start at `id: 00000000`, the
  hash-update pass collapses every cross-reference to a
  single hash. The manual fix-up worked here but is not
  scalable. A v0.2 candidate: when the body's `@lfm(<x>)`
  appears alongside a path comment (`@lfm(<x>) <path>`),
  reconcile cross-checks the path against the LFM tree and
  rewrites the hash to the path's target. Defer to a
  dedicated session.
- **The `index` Trope was authored but not invoked.** Its
  first run will produce `corpus/manifests/index.md`.
  Defer to a follow-on session (or chain it after
  `reconcile` in a future CLI flag).
- **CI OIDC publish pipeline session**
  (`2026-04-29T0900-ci-oidc-publish-pipeline`,
  `Status: Planned`) — unaffected by this rewrite. Carry
  forward.
- **Domain-specific reconcile checks** (anything beyond
  path-existence) are a forward question. The `reconcile`
  Trope's prose declares the surface; v0.1 ships only the
  default check. Domains that need richer checks (e.g.,
  "the @literate/cli package.json `engines.bun` field is
  >= 1.1.0") will need Domain-specific Tropes invoked from
  the LFM body.
- **The `dispositional-domain` Concept's instance schema
  composes `LayerSchema` directly** but the LFM's `domain`
  field is just a `Schema.String` (the Domain *name*).
  Recovering the full `DispositionalDomain` instance from
  an LFM requires pairing `lfm.layer` and `lfm.domain`.
  This composition is implicit at v0.1; an explicit helper
  (`lfm.dispositionalDomain` accessor) is a forward
  question.
- **Hash collisions at 8 hex chars** are not auto-detected
  yet. The `lfm` Concept's prose specifies the
  collision-extension protocol (extend by 2 chars; update
  both colliding LFMs and references); the implementation
  is not yet wired. At 18 LFMs, collision probability is
  trivially small (≈ 18² / 2^32 ≈ 7e-8). Defer.
