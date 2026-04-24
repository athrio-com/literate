# Decisions — index

LF-project Architecture Decision Records. Mutable index; ADR bodies
themselves are append-only.

| # | Title | Status | Tags |
|---|---|---|---|
| [001](./ADR-001-three-level-algebra.md) | Three-level algebra: Concept, Trope, Authored Instance | Accepted | `#algebra` `#protocol` |
| [002](./ADR-002-corpus-src-literate-invariant.md) | Corpus → src → .literate invariant relation | Accepted (.literate/ clause superseded by ADR-024; src/ clause preserved) | `#corpus` `#protocol` |
| [003](./ADR-003-dual-license.md) | Dual MIT / Apache-2.0 framework; MIT templates | Accepted | `#licensing` |
| [004](./ADR-004-cli-effect-manifest.md) | CLI in Effect; Bun/Deno/Node compatible; manifest via package.json "literate" key | Accepted (manifest clause unresolved post-ADR-024; runtime matrix trivially satisfied under ADR-025/ADR-026) | `#tooling` `#release` |
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
| [019](./ADR-019-reinstate-literate-namespace.md) | Reinstate `@literate/*` namespace for rewrite packages | Accepted (npm-scope clause narrowed by ADR-025: `@literate/*` applies to `@literate/cli` only) | `#release` `#tooling` `#migration` |
| [020](./ADR-020-unify-monorepo-layout.md) | Unify monorepo layout: single workspace at repo root; legacy moves to `legacy/` | Accepted | `#migration` `#tooling` `#self-hosting` |
| [021](./ADR-021-modality-adt.md) | `Modality` as a general six-case ADT (Protocol, Weave, Tangle, Unweave, Untangle, Attest) | Accepted | `#algebra` `#protocol` |
| [022](./ADR-022-consumer-literate-folder-narrowed.md) | Consumer `.literate/` role narrowed: init marker + `LITERATE.md` entry + config | Superseded by ADR-024 | `#corpus` `#template` `#self-hosting` `#protocol` `#tooling` |
| [023](./ADR-023-publish-source-not-bundles.md) | LF publishes source, not bundles — authored `.ts` + sibling `.md`/`.mdx` ship verbatim; no `dist/`, no compiled binary | Superseded by ADR-025 | `#release` `#tooling` `#protocol` `#self-hosting` |
| [024](./ADR-024-literate-as-generated-snapshot-plus-extensions.md) | `.literate/` as LF-generated snapshot; consumer customizations in `.literate/extensions/`; `corpus/` as Product prose (supersedes ADR-022) | Accepted (tropes/concepts ownership clauses amended by ADR-025; extensions §4 sub-tree shape amended by ADR-026) | `#corpus` `#template` `#protocol` `#tooling` `#self-hosting` |
| [025](./ADR-025-shadcn-shaped-distribution.md) | LF adopts a shadcn-shaped distribution model — CLI as bundled JS on npm; Tropes/Concepts as git-registry seed files vendored into consumer (supersedes ADR-023; amends ADR-019, ADR-024) | Accepted (open Qs §1, §2, §3 resolved by ADR-026) | `#release` `#tooling` `#protocol` `#migration` `#corpus` |
| [026](./ADR-026-registry-mechanics-and-extensions-surface.md) | Registry fetch (`file://` + `github:`), version pinning (verbatim ref, default `main`), overrides collapse, and CLI–Trope bundled-binding | Accepted | `#tooling` `#release` `#protocol` `#template` `#corpus` |
