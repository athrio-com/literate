# Sessions — index

Session logs, newest first. Each log is append-once; the `## Goals`
entries are gated, the rest is ungated journal material.

| File | Topic | Status |
|---|---|---|
| [2026-04-24T2030-publish-and-install-scripts.md](./2026-04-24T2030-publish-and-install-scripts.md) | Publish `@literate/cli@0.1.0-alpha.1` to npm + dual install scripts (`install.sh` + `install.ps1`) + ADR-035 | Closed (2026-04-24T19:02) |
| [2026-04-24T1818-dissolve-categories-and-ship-scaffold.md](./2026-04-24T1818-dissolve-categories-and-ship-scaffold.md) | Dissolve `corpus/categories/` into typed Concepts; scrub template-minimal; init logs first session; ADR-034 registry trust; e2e smoke (P8 expanded) | Closed (2026-04-24T18:52) |
| [2026-04-24T1712-typed-concepts-disposition-mode-implication.md](./2026-04-24T1712-typed-concepts-disposition-mode-implication.md) | Typed Concepts: Disposition + Mode + Implication (P5+P6+P7 collapsed) — ADR-031, ADR-032, ADR-033, ADR-021 annotation | Closed (2026-04-24T17:26) |
| [2026-04-24T1700-effect-cli-argv-surface.md](./2026-04-24T1700-effect-cli-argv-surface.md) | Adopt `@effect/cli` for argv parsing (ADR-030) | Closed (2026-04-24T17:07) |
| [2026-04-24T1613-cli-effect-and-bun-only.md](./2026-04-24T1613-cli-effect-and-bun-only.md) | CLI Effect-composed end-to-end + Bun-only runtime (ADR-028, ADR-029) | Closed (2026-04-24T16:37) |
| [2026-04-24T1548-p3-cleanup.md](./2026-04-24T1548-p3-cleanup.md) | P3 conformance cleanup — `ProseSchemaViolations` → `Data.TaggedError`; `npx` swept from README | Closed (2026-04-24T16:13) |
| [2026-04-24T2000-cli-bundling-and-install.md](./2026-04-24T2000-cli-bundling-and-install.md) | CLI bundling pipeline (ADR-026 Q1 discharge) + local install smoke | Closed (2026-04-24T20:45) |
| [2026-04-27T1400-template-finalisation.md](./2026-04-27T1400-template-finalisation.md) | P8 — `template-minimal` shadcn shape; registry trust; MVP-2 end-to-end smoke | Abandoned (2026-04-24T18:18 — superseded by `2026-04-24T1818-dissolve-categories-and-ship-scaffold` + `2026-04-24T2030-publish-and-install-scripts`) |
| [2026-04-27T0900-implication-concept.md](./2026-04-27T0900-implication-concept.md) | P7 — `@literate/concept-implication` (typed); `trope-implication-flow`; session-end validation | Abandoned (2026-04-24T17:07 — collapsed into `2026-04-24T1712-typed-concepts-disposition-mode-implication`) |
| [2026-04-26T1400-mode-concept-and-imperative.md](./2026-04-26T1400-mode-concept-and-imperative.md) | P6 — `@literate/concept-mode` (typed, enactor axis); IMP-N Mode-discipline imperative; memos formalised | Abandoned (2026-04-24T17:07 — collapsed into `2026-04-24T1712-typed-concepts-disposition-mode-implication`) |
| [2026-04-26T0900-disposition-concept.md](./2026-04-26T0900-disposition-concept.md) | P5 — `@literate/concept-disposition` (parametrised struct, supersedes ADR-021's Modality) | Abandoned (2026-04-24T17:07 — collapsed into `2026-04-24T1712-typed-concepts-disposition-mode-implication`) |
| [2026-04-24T1533-prose-schema.md](./2026-04-24T1533-prose-schema.md) | P3 — `proseSchema` on `Trope<C>`; mdast validation during weave | Closed (2026-04-24T15:44) |
| [2026-04-25T0900-registry-and-cli-surface.md](./2026-04-25T0900-registry-and-cli-surface.md) | P2 — `literate tangle` + `weave` + `update` + `init`; registry fetcher (file://+github:); ADR-026; trope migration to `registry/`; CLI verb refactor | Closed (2026-04-24T19:00) |
| [2026-04-23T2100-ship-surface.md](./2026-04-23T2100-ship-surface.md) | LF's ship surface — `.literate/` framing (ADR-024) + shadcn distribution pivot (ADR-025); P2–P8 arc planned | Closed (2026-04-24T17:00) |
| [2026-04-23T1920-cli-template-and-e2e-smoke.md](./2026-04-23T1920-cli-template-and-e2e-smoke.md) | CLI, `template-minimal`, end-to-end smoke (MVP capstone) | Closed (2026-04-23T20:30) |
| [2026-04-23T1800-live-services-and-file-execution-log.md](./2026-04-23T1800-live-services-and-file-execution-log.md) | Interactive `GateService` + file-backed `ExecutionLog` (ADR-013) | Closed (2026-04-23T19:10) |
| [2026-04-23T1649-workflow-tropes-session-lifecycle.md](./2026-04-23T1649-workflow-tropes-session-lifecycle.md) | `@literate/trope-session-start` + `@literate/trope-session-end` + ADR-021 `Modality` ADT | Closed (2026-04-23T17:43) |
| [2026-04-23T1311-core-metalanguage.md](./2026-04-23T1311-core-metalanguage.md) | `Concept<D>` + `Trope<C>` + `Variant<C, D>` types in `@literate/core` | Closed (2026-04-23T13:38) |
| [2026-04-28T0900-bootstrap-literate-docs.md](./2026-04-28T0900-bootstrap-literate-docs.md) | Bootstrap `@literate/docs` via CLI | Abandoned (2026-04-23T16:30 — superseded by MVP arc) |
| [2026-04-27T0900-cli-multi-template.md](./2026-04-27T0900-cli-multi-template.md) | CLI multi-template support | Abandoned (2026-04-23T16:30 — superseded by MVP arc) |
| [2026-04-26T0900-dev-overlay-trope-and-docs-template.md](./2026-04-26T0900-dev-overlay-trope-and-docs-template.md) | `trope-dev-overlay` and `template-docs` packages | Abandoned (2026-04-23T16:30 — superseded by MVP arc) |
| [2026-04-25T0900-templating-mechanism.md](./2026-04-25T0900-templating-mechanism.md) | Templating mechanism choice (ADR-012) | Abandoned (2026-04-23T16:30 — superseded by MVP arc) |
| [2026-04-24T0900-primitives-template-and-dev-overlay.md](./2026-04-24T0900-primitives-template-and-dev-overlay.md) | `concept-template`, `concept-dev-overlay`, ADR-011 | Abandoned (2026-04-23T16:30 — legacy-algebra scope, superseded by rewrite) |
| [2026-04-23T1600-unify-monorepo-layout.md](./2026-04-23T1600-unify-monorepo-layout.md) | Unify monorepo layout (ADR-020); archive legacy to `legacy/`; scope MVP arc | Closed (2026-04-23T16:40) |
| [2026-04-23T1500-literate-namespace-reinstated.md](./2026-04-23T1500-literate-namespace-reinstated.md) | Reinstate `@literate/*` namespace for rewrite packages (ADR-019 supersedes ADR-016 namespace clause) | Closed (2026-04-23T15:30) |
| [2026-04-23T1200-athrio-framework-genesis.md](./2026-04-23T1200-athrio-framework-genesis.md) | Genesis of `@athrio/framework` — ADR-011…ADR-018 and `@athrio/core` scaffold (2 smoke tests pass) | Closed (2026-04-23T14:45) |
| [2026-04-23T0919-imperatives-for-lf-protocol.md](./2026-04-23T0919-imperatives-for-lf-protocol.md) | Imperatives preamble for LF agent-entry files (root + corpus CLAUDE.md) | Closed (2026-04-23T09:25) |
| [2026-04-23T0818-planned-sessions-and-arc.md](./2026-04-23T0818-planned-sessions-and-arc.md) | Planned-Sessions lifecycle + multi-session arc for `@literate/docs` | Closed (2026-04-23T09:06) |
| [2026-04-22T1801-deferred-cleanup.md](./2026-04-22T1801-deferred-cleanup.md) | Discharge actionable deferred items; smoke-test `add trope` + `compile` | Closed (2026-04-22T18:04) |
| [2026-04-22T1315-v0.1-migration.md](./2026-04-22T1315-v0.1-migration.md) | v0.1 migration from seed to working scaffold | Closed (2026-04-22T17:27) |
