# Session: 2026-04-24 — CLI bundling + local install (ADR-026 Q1 discharge)

**Date:** 2026-04-24
**Status:** Closed (2026-04-24T20:45)
**Chapter:** — (no chapter yet)
**Agent:** Claude Opus 4.7 (1M context) — fast mode
**Started:** 2026-04-24T20:00
**Planned by:** — (spontaneous)
**Depends on:** corpus/sessions/2026-04-25T0900-registry-and-cli-surface.md (close)

## Pre-work

Per IMP-1 (spontaneous path), abbreviated under Person directive
"Use fast mode as prev session did" — re-gate ceremony suspended
exactly as in S6.

- **Last `Status: Closed` session.** S6
  (`2026-04-25T0900-registry-and-cli-surface`, Closed 2026-04-24T19:00).
  Summary: implemented the P2 arc end-to-end — ADR-026 authored; six
  verbs (`init`/`tangle`/`weave`/`update`/`continue`/`close`) under a
  verb-registry shape; `registry/tropes/{session-start,session-end}/`
  migrated off `@literate/*` packages; `template-minimal` reshaped
  for ADR-024/025; offline e2e against `file://${LF_REPO_ROOT}` passes.
  Zero release-engineering.

- **Carry-forward from S6 Deferred / Discovered.**
  - **ADR-026 Q1 (bundling pipeline).** "CLI runs from source under
    Bun at v0.1. A bundled JS shipping target needs a release-
    engineering session — choose `bun build`/`tsdown`/`tsup`, configure
    `registry/tropes/<id>/index.ts` inline, stand up npm Trusted
    Publishing." **This session.**
  - The e2e smoke uses `file://${LF_REPO_ROOT}` as the registry URL;
    a published CLI has no such root. Consequence: a bundled CLI
    needs either embedded seeds or a default fetcher that works
    without the LF source tree. **Addressed this session.**
  - ADR-026 Q5 (registry trust) remains owned by P8 — TLS-only
    stays the v0.1 default and is unaffected by local install work.

- **ADR index.** ADR-026 newest; resolves ADR-025 §1–§3 + §4. No
  superseding events since S6 close. No ADR directly about bundling
  / packaging / publishing yet.

- **Person directive at open.** "Continue with CLI development so it
  is installable and usable. Use fast mode as prev session did."
  Goals below stand as drafted; `Status: Active` from open; per-Goal
  Accept / Correct / Clarify / Reject ceremony deferred, matching S6.
  Person-ownership of all authored prose recorded retroactively.

## Goals

*Goals are drafted and stand `Status: Active` from open under the
fast-mode directive. The author will record any Person-initiated
course-correction as a Goal-level supersession per IMP-3.*

### Goal 1 — CLI bundling pipeline

**Status:** Completed
**Category:** code-from-prose
**Topic:** Discharge ADR-026 Q1. Produce a bundled JS artefact that
runs under Node ≥18 without Bun. Use `bun build` (matches the
repo's `engines.bun` invariant, native shebang handling, no extra
plugin surface for `.ts` sources). Output `packages/cli/dist/literate.js`
with `#!/usr/bin/env node` banner. Bundle workspace deps
(`@literate/core`, `@literate/template-minimal`) and registry Trope
sources (per ADR-026 §4 — bundled-from-source at build time). Leave
`node:*` and third-party runtime deps (`effect`) marked according to
what produces the smallest reliably-portable bundle.

**Upstream:** ADR-026 Q1; S6 Deferred / Discovered (bundling
pipeline).

**Acceptance:**
- `bun run -F @literate/cli build` (or root `bun run build`)
  produces a single executable JS file at
  `packages/cli/dist/literate.js`.
- `node packages/cli/dist/literate.js --help` prints the usage
  banner.
- Existing `bun test` still passes; typecheck clean.

### Goal 2 — Ship template assets + a default offline registry

**Status:** Completed
**Category:** code-from-prose
**Topic:** `init` copies `packages/template-minimal/files/**` at
runtime; those files must travel inside the shipped CLI package.
Likewise, `init`'s default registry URL is `github:literate/literate`,
which assumes a published public repo and network connectivity;
a freshly-installed CLI should work offline out of the box.

Plan:
1. Bundle template-minimal's `files/` tree into
   `packages/cli/dist/assets/template-minimal/` at build time.
2. Bundle `registry/tropes/*` and `registry/concepts/*` sources
   into `packages/cli/dist/assets/registry/` at build time.
3. Teach the fetcher a `bundled://` scheme that reads from that
   embedded tree via `import.meta.url` resolution.
4. Make `bundled://` the default in `init` when neither
   `--registry-url` nor `LITERATE_REGISTRY_URL` is provided.

**Upstream:** ADR-026 §4 (bundled-from-source binding, extended to
cover the seed files tangle / init read); S6 Deferred / Discovered
(e2e uses `file://${LF_REPO_ROOT}` — replace with `bundled://`
for the default install path).

**Acceptance:**
- `literate init /tmp/x` on a freshly-installed CLI (no env, no
  network) yields the minimal scaffold + vendored Tropes + woven
  `LITERATE.md`.
- `scaffold()` resolves the template path against
  `import.meta.url`, works from both source tree and bundle.
- Existing `file://` + `github:` fetchers continue to work.

### Goal 3 — Shape `packages/cli/package.json` for publish

**Status:** Completed
**Category:** code-from-prose
**Topic:** Point `bin`/`main`/`types`/`exports` at the built
artefacts; add a `files` array so `npm pack` / `bun pm pack` only
ships `dist/` + README + LICENSE-*; add the build script; drop the
workspace-dev-only deps from the published shape (they're bundled).
Keep `effect` as a runtime dependency (if Goal 1 does not bundle it)
or as a bundled input (if Goal 1 does). Decide inline; document as
a `## Decisions Made` bullet.

**Upstream:** Goal 1 + Goal 2 outputs.

**Acceptance:**
- `bun pm pack --dry-run` (or `npm pack --dry-run`) lists only the
  published artefacts.
- Package still versioned at `0.0.1`; wiring only, no release.

### Goal 4 — Local install smoke

**Status:** Completed
**Category:** code-from-prose
**Topic:** A hermetic local-install smoke: pack the CLI tarball;
install it into a fresh tmp dir with `npm install <tarball>`
(Node-only, no Bun dep); run `literate --help` and
`literate init <tmpdir2>` from Node; verify scaffold appears.

**Upstream:** Goals 1–3.

**Acceptance:**
- Reproducible command sequence that packs, installs, and smoke-tests
  from Node only. Recorded in README's "Getting started" or a small
  script in `packages/cli/`.
- No new Bun dependency at the install side.

### Goal 5 — Record bundler choice

**Status:** Completed
**Category:** prose-only
**Topic:** Ratify the bundler choice (`bun build`) — either as ADR-027
(if the choice warrants a historical anchor) or as an inline
`## Decisions Made` bullet (if the reasoning is light and the choice
is revisable without precedent-value). Decide at Goal 1 close.

**Upstream:** ADR-026 Q1 closure.

**Acceptance:** Decision recorded; if ADR-027 authored, index row
added and tags assigned.

## Decisions Made

- **Bundler: `bun build` (inline bullet, no ADR).** Chosen over
  `tsup` / `tsdown` for three reasons that are light enough not to
  warrant an ADR-027: (i) zero additional plugin surface — the repo
  is already bun-first per `engines.bun`; (ii) native handling of
  `.ts` entry + `--target=node` crosscompile; (iii) `Bun.build()`
  exposes a programmatic API the build script calls directly, so
  the pipeline is a single `scripts/build.ts` file with no
  bundler-config file. Revisable: the choice has no ADR-authored
  precedent-value; a future session can swap bundlers without
  re-gating.
- **`bundled://` registry scheme.** `selectFetcher` dispatches the
  `bundled:` URL prefix to `LocalFetcher` against
  `bundledRegistryRoot()` (returns `dist/assets/` when running from
  bundle, repo root when running from source). The fetcher contract
  is unchanged — `bundled://` is a path lookup, not a new transport.
  This is an extension of ADR-026 §4's bundled-from-source
  principle from Trope *code* to seed *files*; the seed set the
  installed CLI vends is fixed at build time, matching the CLI
  version. Remote registry use (via `--registry-url github:…`)
  continues unchanged.
- **Publish shape.** `packages/cli/package.json` drops runtime
  dependencies; workspace deps (`@literate/core`,
  `@literate/template-minimal`) and `effect` migrate to
  `devDependencies`. All three are inlined by the bundle. `files`
  narrows to `["dist"]`; LICENSE and NOTICE are copied into `dist/`
  by the build script so the tarball is self-contained.
- **Build → pack → install pipeline stands in for an ADR-026 Q1
  "release-engineering session".** v0.1 needs neither npm Trusted
  Publishing nor a release-versioning convention to be *installable
  and usable*; those are separable from the bundling decision. The
  tarball is a local-install artefact; publishing remains P8 work.

## Work Done

### Corpus

- **Created** `corpus/sessions/2026-04-24T2000-cli-bundling-and-install.md`
  (this session log).
- **Modified** `corpus/sessions/sessions.md` — row added for this
  session (Open → Closed at close).

### Active packages

- **Created** `packages/cli/scripts/build.ts` — build script.
  Runs `Bun.build({ target: 'node', format: 'esm', packages:
  'bundle' })` on `src/bin/literate.ts`, normalises the shebang
  to `#!/usr/bin/env node`, `chmod 0755` the output, then copies
  `packages/template-minimal/files/` → `dist/assets/template-minimal/`
  and repo-root `registry/` → `dist/assets/registry/` (skipping
  `__tests__/`), and finally copies `LICENSE-MIT`, `LICENSE-APACHE`,
  `NOTICE` from the repo root into `dist/`.
- **Created** `packages/cli/scripts/smoke-install.sh` — hermetic
  pack-then-install smoke. Packs the tarball, creates a tmp npm
  project, `npm install`s the tarball (Node only; no Bun required
  on the consumer side), runs `literate --help` and
  `literate init consumer-repo`, and asserts the woven
  `.literate/LITERATE.md` + `manifest.json` + Trope dirs exist.
- **Created** `packages/cli/src/assets.ts` — runtime asset-root
  resolver. Detects bundled vs. source mode by checking for a
  sibling `assets/` directory via `import.meta.url`; exports
  `templateMinimalRoot()` and `bundledRegistryRoot()`. The two
  helpers give `init` + the `bundled://` fetcher uniform paths
  whether the CLI is running from source (dev) or from the
  shipped bundle (install).
- **Modified** `packages/cli/src/registry/fetcher.ts` —
  `LocalFetcher` now resolves `bundled://` URLs against
  `bundledRegistryRoot()`. `selectFetcher` gained one branch.
  No new module; the three-scheme set is now documented in the
  file header.
- **Modified** `packages/cli/src/verbs/init.ts` — imports
  `templateMinimalRoot` and passes it to `scaffold({ root, … })`
  so the template tree is resolved correctly in both source and
  bundle modes. Default `registryUrl` changed from
  `github:literate/literate` to `bundled://` (env override still
  honoured). Usage banner updated.
- **Modified** `packages/cli/package.json` — shaped for publish:
  `main` / `bin` / `exports` point at `./dist/literate.js`;
  `files: ["dist"]`; `scripts.build` + `scripts.prepack` added;
  runtime deps moved to `devDependencies` (the bundle is
  self-contained); `engines.node: ">=18"`.
- **Modified** `packages/cli/tsconfig.json` — `include` extended
  to pick up `scripts/**/*.ts`.
- **Modified** `packages/template-minimal/src/index.ts` —
  `ScaffoldOptions` gained an optional `root: string` field;
  `scaffold()` uses `opts.root ?? TEMPLATE_ROOT`. Back-compat
  preserved for any source-tree caller; the CLI passes an
  explicit root so bundled mode resolves correctly.

### Repo root

- **Modified** `package.json` — added `scripts`:
  `build` (`bun run --filter @literate/cli build`), `test`
  (`bun test`), `typecheck` (`bun run --filter '*' typecheck`),
  `smoke:install` (packages/cli/scripts/smoke-install.sh).
- **Modified** `.gitignore` — added `*.tgz` (packed tarballs from
  `bun pm pack` / `npm pack` should not be committed).
- **Modified** `README.md` — "Install and build" section
  rewritten: `bun run build` named; new sub-section "Using the
  CLI (pre-publish, local install)" documents the pack → install
  → run path; default `bundled://` registry named.

### Tests

- **Result:** `bun test` from repo root → 32 pass / 0 fail / 166
  expect() calls / 7 files (unchanged from S6 close). All three
  packages typecheck clean. `bun run build` produces a 935 kB
  bundle at `packages/cli/dist/literate.js`; `node dist/literate.js
  --help` prints the usage banner. `bun pm pack` produces
  `literate-cli-0.0.1.tgz` (216 KB compressed, 1.0 MB unpacked,
  18 files). `scripts/smoke-install.sh` passes end-to-end
  (`npm install <tarball>` → `literate --help` →
  `literate init consumer-repo` → verified scaffold + woven
  `LITERATE.md`).

## Deferred / Discovered

### Carry-forward

- **npm publishing proper.** This session stops at
  install-from-tarball. Actual npm publish requires: (a) a stable
  version-bump policy, (b) npm Trusted Publishing / OIDC setup
  per ADR-026 deferred Q1, (c) a release-branch workflow. All
  three are P8 / release-engineering territory.
- **ADR-026 Q5 (registry trust).** Still owned by P8. TLS-only
  remains the v0.1 default for remote registries; `bundled://`
  is trust-by-package — whoever installed the CLI tarball trusts
  its embedded seeds by the same contract as the bundled Trope
  code.
- **ADR-026 deferred Q2 (`versions.json` / `literate:resolve`).**
  Unchanged; v0.2 candidate.
- **ADR-026 deferred Q3 (manifest collision detection).**
  Unchanged; per-registry namespacing is a later ADR.
- **ADR-026 deferred Q4 (extensions reading order).** Unchanged;
  consumer extensions still materialise in their own section.
- **Remaining P-arc sessions (P3, P5, P6, P7, P8) still Planned.**
  This session is orthogonal — it discharges ADR-026 Q1 without
  touching the Concept work those sessions own.

### Discovered in this session

- **`scaffold()` gained an explicit `root` option.** The
  `@literate/template-minimal` package's `TEMPLATE_ROOT` is
  computed via `import.meta.url` and resolves correctly only in
  source-tree mode. When the bundler inlines that code into the
  CLI's `dist/literate.js`, `import.meta.url` points at the
  bundle, not the package. The CLI now passes
  `templateMinimalRoot()` explicitly. The default fallback
  preserves back-compat for source-tree callers (including the
  test suite).
- **`bundled://` is a *path* scheme, not a *transport* scheme.**
  The LocalFetcher delegate is deliberate — it means the bundled
  seeds are tangled the same way a `file://` registry is tangled
  (one copy, no hashing, no signature). This keeps the fetcher
  interface unextended and lets consumers treat
  `.literate/tropes/<id>/` identically regardless of where the
  seed came from. The one behavioural difference is that
  `literate update` against a `bundled://` registry is a no-op
  in practice: the source is pinned to the installed CLI
  version. Re-fetching yields byte-identical content. This is
  consistent with ADR-026 §2's "verbatim ref" pinning model
  (the ref is effectively the CLI version).
- **Build-time seed copy skips `__tests__/`.** The `copyDir`
  helper in `scripts/build.ts` filters out test directories so
  the shipped tarball doesn't include `__tests__/trope-*.test.ts`
  files. Tests are framework-development concerns, not consumer
  concerns. The filter also elides `node_modules/` as a safety
  net, though no such directory exists under `registry/` today.
- **`npm install` of the tarball resolves `@literate/cli`
  correctly despite workspace deps being `devDependencies`.**
  Node treats a packed tarball as a complete install unit; devDeps
  are skipped by `npm install` at the consumer side by default.
  The bundle's self-contained nature means no workspace resolution
  happens at install time. Verified end-to-end by
  `smoke-install.sh`.
- **`bun pm pack` auto-runs `prepack`.** Confirmed: the script's
  first invocation shows `bun run scripts/build.ts` before the
  pack output. This means the tarball is always built from the
  current source, removing a class of "stale dist/" release bugs.

## Summary

Discharged ADR-026 Q1 (bundling pipeline) end-to-end. Produced a
`bun build`-based pipeline at `packages/cli/scripts/build.ts` that
bundles `src/bin/literate.ts` to `packages/cli/dist/literate.js`
(935 kB, Node-runnable, `#!/usr/bin/env node` shebang), copies the
template-minimal `files/` tree and the repo-root `registry/` tree
into `dist/assets/`, and stages LICENSE + NOTICE for the tarball.
Extended ADR-026 §4's bundled-from-source principle from Trope
code to seed files via a new `bundled://` URL scheme on the
fetcher, made it the `init` default, and added an `assets.ts`
helper that routes to the right asset root in source vs. bundle
mode. Shaped `packages/cli/package.json` for publish (bin / main /
exports / files / engines) and moved runtime deps to devDeps now
that the bundle is self-contained. Authored a hermetic install
smoke (`scripts/smoke-install.sh`) that packs the tarball,
`npm install`s it into a fresh tmp project, runs `literate --help`
and `literate init consumer-repo` under Node, and asserts the
woven `.literate/LITERATE.md` + manifest + Trope dirs appear. The
smoke passes; all 32 existing tests still pass; all three packages
typecheck clean. The CLI is now installable from a local tarball
and usable offline out of the box — the Person's stated Goal.

npm publishing proper, Trusted Publishing setup, and release
versioning remain deferred (P8 / release engineering).

**Status:** Closed (2026-04-24T20:45)
