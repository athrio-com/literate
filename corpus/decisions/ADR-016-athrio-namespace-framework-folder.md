# ADR-016 — `@athrio/*` namespace; `framework/` project folder; multi-project split

**Date:** 2026-04-23
**Status:** Superseded by ADR-019 (namespace clause) and ADR-020 (layout clause). Package-manager and relationship-to-legacy clauses remain Accepted in substance.
**Tags:** `#release` `#tooling` `#migration`

**Context:**

The legacy scaffold publishes under `@literate/*` (legacy ADR-009).
The rewrite introduced by ADR-011 through ADR-015 is not a
refinement of the legacy algebra but a reformulation — Step is a
new layer, the log becomes an event store, `Protocol.continue` is
a function not a document. Reusing the `@literate/` scope would
publish version-number fiction (`@literate/core@1.0.0` silently
replacing `@literate/core@0.1.0` with an incompatible interface).

A second question addressed here is the repository's *project-level*
split. "Framework", "docs", and possibly "runtime" are distinct
products with distinct release cadences. Co-locating them as
workspace packages inside one project conflates their release
boundaries; splitting them into separate top-level project folders
keeps release surfaces clean while allowing shared tooling.

**Decision:**

### Namespace

Every rewrite-shipped npm package is scoped `@athrio/`. There is
no `@literate/` package in the rewrite. Anticipated names under
`@athrio/` (not all published in v0.1):

- `@athrio/core` — the core algebra: `Step`, `ProseRef`,
  `ExecutionLog`, `Suspend`, combinators, schemas, the runtime
  substrate, `Protocol.continue`.
- `@athrio/runtime` — the agent harness: loads a repo, constructs
  `StepContext` Layers, runs `Protocol.continue`. (Ships inside
  `@athrio/core` in v0.1; extracted as a separate package if its
  release cadence diverges.)
- `@athrio/cli` — the consumer-facing CLI (`init`, `add`,
  `compile`, `check`, `version`).
- `@athrio/concept-<id>` — one package per Concept.
- `@athrio/trope-<id>` — one package per Trope.
- `@athrio/template-<name>` — starter scaffolds. V0.1 ships
  `@athrio/template-minimal` only.
- `@athrio/eslint-plugin` — determinism rules (deferred,
  ADR-013).

### Multi-project split

The repository holds multiple top-level *projects* (each with its
own `package.json`). V0.1 only `framework/` ships content:

```
literate/                              (repo root)
├── corpus/                            global living corpus (ADR-018)
├── framework/                         @athrio/framework (this project)
│   ├── package.json                   workspaces: packages/*
│   └── packages/                      @athrio/* workspace packages
├── docs/                              @athrio/docs (anticipated; empty v0.1)
├── packages/                          legacy @literate/* — frozen (ADR-018)
├── site/                              legacy Next.js scaffold — frozen
├── LITERATE.md                        legacy Protocol prose
├── CLAUDE.md                          maintainer orientation (updated)
└── ...
```

- A **project** is a top-level folder with its own `package.json`
  and its own release cadence. Projects depend on each other's
  *published* packages, not on each other's `node_modules`.
- A **workspace package** lives under a project's `packages/*`
  and shares the project's `node_modules`.

`@athrio/framework` is the project root of `framework/`; it is
not itself published to npm. Packages inside
`framework/packages/*` are published individually once their
release cadence is declared.

### Package manager and tooling

Default package manager: [Bun][bun]. Workspaces declared in root
`package.json`'s `workspaces`. No Lerna / Nx / Turbo in v0.1.
[Moon][moon] deferred until multi-project orchestration outgrows
pure-Bun scripts.

Node compatibility is preserved at the package level: shipped
`@athrio/*` packages target ES2022, `"type": "module"`, and use
only portable APIs. The CLI's runtime is Bun-first but callable
under Node.

### Relationship to legacy ADR-004 and ADR-009

Legacy ADR-004 ("CLI in Effect; Bun/Deno/Node compatible;
manifest via `package.json`'s `literate` key") stays Accepted. The
Effect + Bun commitment, the manifest-in-package.json pattern, and
the tri-runtime support carry forward unchanged. The consumer
manifest key is renamed `athrio` (from `literate`) in a future ADR
when the CLI first writes it.

Legacy ADR-009 ("Tropes ship as workspace packages") stays
Accepted in substance — new Tropes still ship as workspace
packages. The namespace shift from `@literate/` to `@athrio/` is
the mechanical change this ADR introduces; ADR-009's structural
choice is preserved.

[bun]: https://bun.sh
[moon]: https://moonrepo.dev

**Consequences:**

- Every package the rewrite ships carries `@athrio/`. No
  `@literate/*` package is published by this repository ever
  again (ADR-018).
- The repository's top-level layout is by *project*. Within each
  project, `packages/*` holds workspace packages.
- V0.1 ships `framework/` only. `docs/` is named here as a
  sibling project but not scaffolded in v0.1.
- Cross-project dependencies go through published packages once
  there's a release; during pre-1.0 development, cross-project
  imports are via relative path or `file:` dependency and are
  flagged as technical debt for later cleanup.
- The consumer manifest key `literate` in `package.json` becomes
  `athrio` for v1 consumers; a future ADR details the migration.
- A later ADR formalises release process, versioning policy, and
  changelog convention.
- The workspace-package-vs-project split gives room to extract
  `runtime/` as a separate project if its release cadence
  diverges. Until then it stays inside `framework/packages/core/`.
