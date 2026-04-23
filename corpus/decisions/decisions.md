# Decisions — index

LF-project Architecture Decision Records. Mutable index; ADR bodies
themselves are append-only.

| # | Title | Status | Tags |
|---|---|---|---|
| [001](./ADR-001-three-level-algebra.md) | Three-level algebra: Concept, Trope, Authored Instance | Accepted | `#algebra` `#protocol` |
| [002](./ADR-002-corpus-src-literate-invariant.md) | Corpus → src → .literate invariant relation | Accepted | `#corpus` `#protocol` |
| [003](./ADR-003-dual-license.md) | Dual MIT / Apache-2.0 framework; MIT templates | Accepted | `#licensing` |
| [004](./ADR-004-cli-effect-manifest.md) | CLI in Effect; Bun/Deno/Node compatible; manifest via package.json "literate" key | Accepted | `#tooling` `#release` |
| [005](./ADR-005-prose-first-mdx-with-schema.md) | Tropes are prose-first (MDX); Effect Schema provides typed backing | Accepted | `#protocol` `#tooling` |
| [006](./ADR-006-concepts-terms-functorial.md) | Concepts at LF level are functorial with Terms at corpus level | Superseded by ADR-010 | `#algebra` `#corpus` |
| [007](./ADR-007-no-literate-in-lf-repo.md) | LF's own repo has no .literate/ folder | Accepted | `#self-hosting` `#protocol` |
| [008](./ADR-008-exhaustive-single-realization.md) | Exhaustive single-realization in v0.1; multi-realization structurally permitted | Accepted | `#algebra` `#release` |
| [009](./ADR-009-tropes-as-packages.md) | Tropes ship as workspace packages with typed cross-imports | Accepted | `#algebra` `#tooling` `#release` |
| [010](./ADR-010-unify-terms-into-concepts.md) | Unify Terms into Concepts (one primitive, two scopes) | Accepted | `#algebra` `#corpus` `#protocol` |
| [011](./ADR-011-executable-monadic-prose.md) | Executable monadic prose: algebra extended with `Step` | Accepted | `#algebra` `#protocol` `#execution` |
| [012](./ADR-012-prose-as-base-step-kind.md) | Prose as the base Step kind; six kinds; typed I/O | Accepted | `#algebra` `#execution` |
| [013](./ADR-013-session-log-event-store.md) | Session log as the execution event store; deterministic replay | Accepted | `#execution` `#protocol` |
| [014](./ADR-014-protocol-continue-entry-point.md) | `Protocol.continue` as the single entry point | Accepted | `#execution` `#protocol` |
| [015](./ADR-015-typescript-composition-md-siblings.md) | TypeScript as composition surface; `.md` siblings via `prose()` | Accepted | `#protocol` `#tooling` |
| [016](./ADR-016-athrio-namespace-framework-folder.md) | `@athrio/*` namespace; `framework/` project folder; multi-project split | Superseded by ADR-019 (namespace clause) and ADR-020 (layout clause) | `#release` `#tooling` `#migration` |
| [017](./ADR-017-gate-decisions-as-typed-steps.md) | Accept / Correct / Clarify / Reject as typed Steps | Accepted | `#algebra` `#execution` `#protocol` |
| [018](./ADR-018-legacy-code-frozen-corpus-global.md) | Legacy code frozen; root corpus is the global living corpus | Accepted (§3, §7 amended by ADR-019; scope relocated to legacy/ by ADR-020) | `#migration` `#self-hosting` `#corpus` `#release` |
| [019](./ADR-019-reinstate-literate-namespace.md) | Reinstate `@literate/*` namespace for rewrite packages | Accepted | `#release` `#tooling` `#migration` |
| [020](./ADR-020-unify-monorepo-layout.md) | Unify monorepo layout: single workspace at repo root; legacy moves to `legacy/` | Accepted | `#migration` `#tooling` `#self-hosting` |
