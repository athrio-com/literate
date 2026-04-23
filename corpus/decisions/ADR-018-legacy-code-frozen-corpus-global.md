# ADR-018 — Legacy code frozen; root corpus is the global living corpus

**Date:** 2026-04-23
**Status:** Accepted (§3, §7 amended by ADR-019; scope relocated to legacy/ by ADR-020)
**Tags:** `#migration` `#self-hosting` `#corpus` `#release`

**Context:**

The legacy Literate Framework scaffold shipped as `@literate/*`
packages under `packages/`, with a Next.js site under `site/` and
the framework Protocol authored at `LITERATE.md`. ADRs 001–010 in
this same corpus captured the founding decisions. By the time
session `2026-04-23T0919-imperatives-for-lf-protocol` landed, the
catalogue of needed next changes had crossed a threshold: every
meaningful step — durable execution, typed AI invocation, gate
flow as first-class, prose emission as a typed Step, a single
entry point the agent runs rather than interprets — required a
reformulation larger than any sequence of small ADRs could carry
coherently.

The responsible move is a **rewrite with continuity**, not a
patchwork of amendments and not a clean-slate discard. Specifically:

- The *code* of the legacy scaffold (`packages/`, `site/`,
  `LITERATE.md` as authoritative Protocol) has reached an end
  state. No further releases; no edits; no additions.
- The *corpus* of the legacy scaffold (`corpus/`, the ADRs,
  sessions, categories, concepts) is the living coordination
  record for LF as a project. The rewrite is a stage of the same
  project, not a new project — ADR-011 through ADR-017 extend the
  algebra established by ADR-001, and their numbering continues
  that series.

This ADR makes that split explicit.

**Decision:**

### 1. Legacy code freeze

Effective the Accepted date of this ADR, the following paths are
frozen:

- `packages/` — the legacy `@literate/*` workspace packages.
- `site/` — the legacy Next.js scaffold.
- `LITERATE.md` — the legacy framework Protocol prose.
- `mise.toml`, `moon.yml`, `tsconfig.base.json`,
  `tsconfig.package.json`, root `package.json`, `bun.lock`,
  `bun.lockb`, root `node_modules/`.

Frozen means:

- No file in the frozen set may be edited.
- No file in the frozen set may be deleted.
- No new file may be added to the frozen paths.
- Reading the frozen paths for historical context is encouraged.
- Agents working on the rewrite must never invoke a tool call
  that modifies a frozen path; if one is necessary, the Person
  must lift the freeze explicitly for a scoped edit (recorded in
  the active session's `## Decisions Made`).

### 2. Root corpus is the global living corpus

The following paths remain **living** (edited by ongoing work):

- `corpus/` — the global corpus. Every new session log, every new
  ADR (continuing the numbering from ADR-018 onwards), every new
  Concept, every new Category member lands here. The rewrite's
  coordination record is the same coordination record as the
  legacy's.
- `CLAUDE.md` at the repository root — maintainer orientation.
  Updated to point at `framework/` as the location of active code
  work and at `corpus/CLAUDE.md` as the operational Protocol.
- `corpus/CLAUDE.md` — operational Protocol for the whole repo.
  Remains authoritative. Its NEVER list gains one item: "never
  edit a path listed as frozen in ADR-018". Its descriptions of
  `packages/` as "LF-the-product" are updated to point at
  `framework/packages/` for new code.

### 3. New code lives in `framework/`

All new executable code lands under `framework/packages/*` and
ships as `@athrio/*` (ADR-016). No new code is added under
`packages/` or `site/`.

### 4. No cross-namespace imports

Packages under `framework/packages/*` must not import from
`../packages/*`. The legacy tree is code-frozen as well as
prose-frozen; cross-namespace imports would couple the rewrite's
release cadence to the legacy's and defeat the purpose of the
separation.

Enforcement: agent discipline in v0.1; by lint rule or package
boundary in a later amendment.

### 5. ADR numbering continues

ADRs in `corpus/decisions/` continue the existing numbering.
ADR-011 through ADR-018 (authored in session
`2026-04-23T1200-athrio-framework-genesis`) are the first ADRs of
the rewrite stage. Legacy ADR-001 through ADR-010 remain
Accepted; their bodies are frozen (they are append-only ADR
bodies per the Mutability table) and their decisions remain in
force except where an ADR in the new series explicitly extends,
refines, or retires specific elements.

### 6. Relationship to legacy ADRs

The new series relates to the legacy series as follows:

| Legacy | Current | Relationship |
|---|---|---|
| ADR-001 (three-level algebra) | ADR-011 | Extends to four levels with Step |
| ADR-002 (corpus-src-literate invariant) | — | Unchanged; ADRs in the new series cite it |
| ADR-003 (dual license) | — | Unchanged |
| ADR-004 (CLI in Effect; Bun; manifest) | ADR-016 | Namespace shift; Effect + Bun preserved |
| ADR-005 (prose-first MDX + Schema) | ADR-015 | Refines: plain `.md` siblings, no MDX directives |
| ADR-007 (no `.literate/` in LF repo) | — | Unchanged |
| ADR-008 (exhaustive single realisation in v0.1) | — | Unchanged |
| ADR-009 (tropes as packages) | ADR-016 | Unchanged in substance; namespace shifts |
| ADR-010 (unify terms into concepts) | — | Unchanged |

Legacy ADRs are not marked Superseded by the new series unless a
later ADR explicitly does so. The relationship table above is
informative.

### 7. Deprecation of `@literate/*`

No further releases of the legacy `@literate/*` npm packages
(published or not). The framework's current state of the legacy
packages at the time of this ADR's Accept is the final state.

Consumers of `@literate/*` (zero at time of writing — the legacy
scaffold is pre-1.0 and unpublished) migrate to `@athrio/*`. A
migration spec is deferred until any consumer materialises.

### 8. Freeze lift procedure

The freeze is lifted only by explicit Person consent for a scoped
edit. A Person-authorised lift is a session-scoped decision
recorded in the session log's `## Decisions Made`; it does not
require a new ADR unless it broadens the scope of permitted
legacy edits beyond the single authorised change.

**Consequences:**

- The legacy tree survives in place. Git log, blame, and file
  inspection remain authoritative for any historical question.
- `@literate/*` packages never publish again.
- No `../packages/*` imports into `framework/packages/*`.
- ADR numbering is continuous; the rewrite is a stage of the
  same project.
- Root `corpus/` is the global living corpus; session logs and
  ADRs tracking framework-rewrite work are authored here, not in
  a separate `framework/corpus/`.
- Root `CLAUDE.md` is updated (scoped edit authorised by this
  ADR) to direct agents at `framework/` for active code work.
- `corpus/CLAUDE.md` is updated (scoped edit authorised) to add
  the freeze rule to its NEVER list and to point at
  `framework/packages/` as the location of LF-the-product code.
- Force-pushing to rewrite git history is **not** authorised by
  this ADR. All rewrite work lands as additive commits.
- A future ADR (when the first `@athrio/*` package publishes)
  handles release cadence, versioning, and changelog convention.
