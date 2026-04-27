::metadata{id=6c6aee81, disposition={ base: 'Infrastructure', scope: 'monorepo-layout' }, layer={ kind: 'workspace', path: 'workspace', holds: 'domains' }, domain=monorepo-layout, status=Reconciled}

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
├── legacy/                frozen reference subtree (never publishes)
├── package.json           workspace root
├── README.md              user-facing entry
└── CLAUDE.md              maintainer orientation shim
```

## One workspace, one root

`package.json` at the repo root declares
`"workspaces": ["packages/*"]` — a single workspace, a single
`package.json`, a single install graph, no `framework/`
umbrella around the active tree. The `legacy/packages/*`
subtree is structurally **isolated**: not enumerated by the
workspace, never installs as a sibling, and imports between
active and legacy packages are forbidden. The isolation is by
subtree, not by namespace; both trees share the `@literate/`
scope (per `:lfm[namespace]{hash=06997960}` `workspace/namespace.md`).

## What `registry/` is

`registry/` is the **canonical authored source** for every
Concept and Trope LF ships. The CLI's `tangle` verb reads
from here when the configured registry is `bundled://`; for
remote registries (`github:`), the CLI fetches from the
remote at the configured ref. Either way, the consumer ends
up with vendored copies under `.literate/`.

`registry/` is not published as an npm package and does not
need to be — the CLI bundles it from source at build time
(see `:lfm[distribution-model]{hash=32aa53dc}` `infrastructure/distribution-model.md`).

## What `legacy/` is

`legacy/` is **frozen** (see `:lfm[legacy-freeze]{hash=bf4e66f8}`
`workspace/legacy-freeze.md`). It is a read-only reference
subtree containing a parallel `packages/*` of `@literate/*`
modules, a `site/` scaffold, the framework Protocol prose at
`legacy/LITERATE.md`, and root tooling files. Nothing under
`legacy/` publishes, builds, or installs as part of the active
workspace.

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
