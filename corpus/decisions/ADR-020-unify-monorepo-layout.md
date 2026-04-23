# ADR-020 — Unify monorepo layout: single workspace at repo root; legacy moves to `legacy/`

**Date:** 2026-04-23
**Status:** Accepted
**Tags:** `#migration` `#tooling` `#self-hosting`

**Context:**

ADR-016 established a multi-project split: `framework/` as the
rewrite's project root, root `packages/*` as the frozen legacy
workspace. ADR-018 locked the legacy paths (`packages/`, `site/`,
`LITERATE.md`, root tooling) behind a freeze rule. ADR-019
corrected the publishing namespace back to `@literate/*`. Those
three ADRs left the repository with two parallel workspaces:

- Root: `@literate/monorepo` — legacy `@literate/*` packages,
  frozen, unpublished.
- `framework/`: `@literate/framework` — rewrite packages, active,
  publishable.

The split made sense at genesis (session
`2026-04-23T1200-athrio-framework-genesis`) when the rewrite had
not yet diverged far enough from the legacy to justify moving
either one. Two facts have since accumulated:

1. **The monorepo is fully dedicated to LF.** There is no
   sibling product competing for the repo's top-level. The sister
   repo (`/Users/yegor/Projects/Coding/athrio-com/athrio/`) owns
   the `@athrio/` scope and the Athrio product is authored there,
   not here. LF's repo exists to ship LF. Reserving the repo root
   for a legacy tree that will never publish inverts that
   priority: the active work is buried one level deeper
   (`framework/packages/*`) than the frozen reference
   (`packages/*`).
2. **The `framework/` prefix misreads the "Tropes are
   independently shippable" framing.** ADR-009 (Tropes as
   packages, Accepted), ADR-011 (Step substrate), and ADR-017
   (gate decisions as typed Steps) all treat each Trope as an
   independently shippable npm package. Bundling every future
   Trope under `framework/packages/trope-*` is a filesystem
   convenience, not a release-boundary. The multi-project split
   in ADR-016 §"Multi-project split" was motivated by anticipated
   sibling projects (`docs/`, `runtime/`) with distinct release
   cadences; `docs/` was never scaffolded and `runtime/` ships
   inside `@literate/core` per ADR-016 itself. The split now
   costs two dependency trees, two tooling configs, and an
   awkward `framework/` prefix for every rewrite reference — with
   no sibling project actually benefiting from the isolation.

The responsible move is to collapse the split: one workspace at
the repo root, legacy moved wholesale to `legacy/` as a sibling
reference tree, freeze rule re-scoped accordingly.

**Decision:**

### 1. Single workspace at the repo root

The repository has one workspace. Its manifest is the root
`package.json`, declaring workspaces `packages/*`. Every active
`@literate/*` package lives under `packages/*` at the repo root.
The `framework/` project folder is removed.

Concrete layout after this ADR:

```
literate/                              (repo root)
├── CLAUDE.md                          maintainer entry point (rewritten for unified layout)
├── README.md                          project README
├── package.json                       @literate/monorepo; workspaces: packages/*
├── tsconfig.json                      root TypeScript config
├── bun.lock                           lockfile
├── corpus/                            global living corpus (unchanged)
│   ├── CLAUDE.md                      operational Protocol (unchanged)
│   └── …                              ADRs, sessions, categories, concepts, …
├── packages/                          active @literate/* workspace packages
│   └── core/                          @literate/core (v0.1 substrate)
└── legacy/                            historical reference (frozen; see §3)
    ├── LITERATE.md                    legacy Protocol prose
    ├── package.json                   legacy workspace manifest (does not build)
    ├── packages/                      legacy @literate/* packages (20+ packages)
    ├── site/                          legacy Next.js scaffold
    ├── …                              mise.toml, moon.yml, tsconfig.*.json, .moon/, bun.lock*
```

The legacy `@literate/monorepo` workspace manifest and its
lockfiles move into `legacy/` as-is. The legacy tree does not
build or test from its new location and is not expected to.

### 2. Tropes stay as workspace packages; no `framework/` bundling

Every Trope ships as its own `@literate/trope-*` package under
`packages/*` at the repo root, adjacent to `@literate/core` and
every other rewrite package. ADR-009's "Tropes ship as workspace
packages with typed cross-imports" stays in force verbatim; this
ADR removes the `framework/packages/` prefix that ADR-016
introduced and returns Tropes to the repo root `packages/`
directory where ADR-009 originally placed them.

Consumers depend on the Tropes they need directly
(`@literate/trope-session-start`, `@literate/trope-adr-flow`,
…), not on a monolithic framework umbrella. There is no
`@literate/framework` published package; the repository's root
`package.json` `name` is `@literate/monorepo` (a private
workspace label, not a published artefact).

### 3. Freeze scope moves to `legacy/`

The ADR-018 freeze rule stays in force with its path list
relocated:

- **Frozen paths (post-ADR-020):** `legacy/` and every file
  beneath it.
- **No edits, no deletions, no additions to `legacy/`** except
  under an explicit, session-scoped Person-authorised freeze
  lift recorded in the active session's `## Decisions Made`
  (ADR-018 §8 procedure stays).
- **ADR-018 §4** (no cross-namespace imports from rewrite into
  legacy) is preserved in substance. Cross-imports are now
  physically implausible: the rewrite is at `packages/*`; legacy
  is at `legacy/packages/*`; the root `package.json` workspaces
  array only enumerates `packages/*`, so `bun`'s workspace
  resolver will not wire legacy packages into the rewrite's
  `node_modules/`. Agent discipline backs this up.

The *one-time* move of legacy files into `legacy/` performed by
the session that Accepts this ADR is authorised by this ADR
itself and does not require a separate freeze lift. The ADR-018
freeze applies to edits of content; relocation is a mechanical
path change that preserves content verbatim.

### 4. Amendments to prior ADRs

- **ADR-016** — `Status:` becomes `Superseded by ADR-020 (layout
  clause)`. Its namespace clause is already superseded by
  ADR-019. Its multi-project-split clause (the `framework/` folder
  and the sibling `docs/` anticipation) is superseded by this
  ADR. Its package-manager clause (Bun; workspaces in root
  `package.json`) and its relationship-to-legacy clause (ADR-004
  and ADR-009 preserved in substance) remain in force. The ADR
  body is untouched.
- **ADR-018** — `Status:` annotated `Accepted (scope relocated to
  legacy/ by ADR-020)`. The freeze rule stays; the paths it
  targets move. The ADR body is untouched; §1's path enumeration
  is treated as equivalent to "those paths now under `legacy/`".
- **ADR-019** — unaffected. `@literate/*` remains the publishing
  scope for every active package. The "name-collision handling"
  §3 of ADR-019 simplifies under the unified layout: there is one
  workspace, so legacy package names are not enumerated at all;
  the rewrite's names resolve unambiguously.
- **ADR-009** — unaffected. "Tropes as packages" is the
  governing principle for Trope placement and publishing.

### 5. Living prose updates

The following mutable surfaces are updated as part of this
decision (editorial scope; not gated):

- Root `CLAUDE.md` — rewritten. "Where you are" collapses to one
  active area (`packages/`) plus `corpus/` plus the frozen
  `legacy/`. References to `framework/` are removed.
- `corpus/CLAUDE.md` — "Working with `packages/` and
  `framework/packages/`" section becomes "Working with
  `packages/`"; the NEVER-list bullet on legacy imports is
  re-anchored to `legacy/`.
- `corpus/categories/step-kind.md` and any other mutable
  corpus prose still referencing `framework/packages/*` is
  edited for the new path.
- `README.md` at repo root replaces the former
  `framework/README.md`; framework-prefixed install instructions
  become repo-root instructions.
- Removed files: `framework/CLAUDE.md`, `framework/README.md`
  (content merged into root equivalents).

Frozen ADR bodies (ADR-011 through ADR-019) are not edited;
their prose remains the append-only historical record. Session
log bodies (including the two genesis-stage logs) are not
edited; their content is append-once.

### 6. Workspace name

The root `package.json` retains `name: @literate/monorepo`. It
is a private label for Bun's workspace resolver, not a published
artefact. The name `@literate/framework` is retired; there is
no "framework" publishable package.

**Consequences:**

- The repo has one active workspace. `bun install` runs at repo
  root; `bun test --filter '*'` runs every workspace package's
  tests.
- Every new `@literate/*` rewrite package lands at `packages/*`.
  Trope packages sit alongside core, concept packages, templates,
  and the CLI — all flat, all independently shippable, all sharing
  one `node_modules/`.
- The legacy tree survives verbatim at `legacy/`. Git blame on
  `legacy/packages/cli/src/bin.ts` (renamed from `packages/cli/src/bin.ts`)
  traces cleanly through the move commit.
- The ADR-018 freeze rule now targets `legacy/`. No content edit
  to any file under `legacy/` is permitted without a scoped
  freeze lift.
- ADR-016's folder layout is historically recorded in its body
  and superseded by this ADR; its `Status:` line reflects the
  supersession.
- Cross-workspace imports from rewrite into legacy become
  physically awkward (different subtrees; no shared workspace
  resolution). ADR-018 §4 is preserved by construction.
- Documentation referencing `framework/packages/*` paths
  (including the JSDoc in the currently-scaffolded
  `@literate/core` source files, and the mutable prose in
  `framework/CLAUDE.md` and `framework/README.md`) is rewritten
  at the same time as the physical move.
- Smoke tests that exercised `@literate/core` under
  `framework/packages/core/` are moved to `packages/core/`
  verbatim and re-run under the unified workspace. The expected
  outcome is 2 pass, 0 fail (same as the prior session).
- A future ADR handles release-cadence and changelog convention
  if and when the first `@literate/*` package publishes.
