---
id: 13d5f10c
disposition: { base: 'Infrastructure', scope: 'monorepo-layout' }
layer: { kind: 'workspace', path: 'workspace', holds: 'domains' }
domain: monorepo-layout
status: Reconciled
---

# Monorepo Layout

LF's repo has **one active workspace** at the repo root. There
is no `framework/` umbrella folder. Active packages live at
`packages/*`; legacy code lives at `legacy/`; the canonical
Concept and Trope sources live at `registry/`; project prose
lives at `corpus/`.

## Top-level layout

```
literate/                  the repo root
├── packages/              active workspace (npm workspaces target)
│   ├── cli/               @literate/cli (the only published artefact)
│   ├── core/              @literate/core (bundled into CLI)
│   └── template-minimal/  @literate/template-minimal (bundled)
├── registry/              canonical Concept and Trope sources
│   ├── concepts/<id>/
│   └── tropes/<id>/
├── corpus/                project prose
│   ├── sessions/          immutable session-log record
│   ├── manifests/         current-state LFMs
│   ├── memos/             ephemeral notes (when present)
│   ├── tags.md            authored tag set
│   └── CLAUDE.md          Mandatory Agent Instructions
├── legacy/                frozen pre-rewrite code (never publishes)
├── package.json           workspace root
├── README.md              user-facing entry
└── CLAUDE.md              maintainer orientation shim
```

## One workspace, one root

`package.json` at the repo root declares
`"workspaces": ["packages/*"]`. The legacy tree under
`legacy/packages/*` is structurally **isolated** — it is not
enumerated by the workspace, never installs as a sibling, and
imports between active and legacy packages are forbidden. The
isolation is by subtree, not by namespace; both trees share
the `@literate/` scope (per `@lfm(435e223f)`
`workspace/namespace.md`).

## Why no `framework/` folder

An earlier attempt grouped the rewrite under a `framework/`
folder while legacy code stayed at `packages/`. The split
created two parallel workspace roots, two `package.json`
files, two install graphs. Collapsing to a single
repo-root workspace eliminates the duplication; the legacy
code lives at `legacy/` (frozen) and the active code lives at
`packages/` (live).

## What `registry/` is

`registry/` is the **canonical authored source** for every
Concept and Trope LF ships. The CLI's `tangle` verb reads
from here when the configured registry is `bundled://`; for
remote registries (`github:`), the CLI fetches from the
remote at the configured ref. Either way, the consumer ends
up with vendored copies under `.literate/`.

`registry/` is not published as an npm package and does not
need to be — the CLI bundles it from source at build time
(see `@lfm(eff0d243)` `infrastructure/distribution-model.md`).

## What `legacy/` is

`legacy/` is **frozen** (see `@lfm(5842b2de)`
`workspace/legacy-freeze.md`). Its contents are preserved
verbatim as historical reference. It contains the previous
`packages/*` tree (the legacy `@literate/*` packages), the
previous `site/` scaffold, the legacy `LITERATE.md`, and the
pre-rewrite root tooling.

```path
package.json
```

```path
packages/cli/package.json
```

```path
registry/concepts/disposition/index.ts
```

```path
legacy/LITERATE.md
```
