# Session: 2026-04-24 — Publish `@literate/cli@0.1.0-alpha.1` + install scripts

**Date:** 2026-04-24
**Status:** Closed (2026-04-24T19:02)
**Chapter:** — (no chapter yet)
**Agent:** Claude Opus 4.7 (1M context) — fast mode
**Started:** 2026-04-24T18:53
**Disposition:** `{ base: 'Infrastructure' }` (release surface)
**Mode:** Weaving (per chain prompt)
**Planned by:** corpus/sessions/2026-04-24T1818-dissolve-categories-and-ship-scaffold.md
**Depends on:** corpus/sessions/2026-04-24T1818-dissolve-categories-and-ship-scaffold.md

## Pre-work

Planned-path open per IMP-1.5: this log was authored under
the chain prompt as `Status: Planned` at the same time as
Session 3 was opened; with Session 3 now Closed
(2026-04-24T18:52), the dependency is satisfied and this log
transitions to `Open`. Per the chain prompt's fast-mode
discipline, Goals are carried forward from the Plan block
verbatim — no re-gating ceremony.

The parent (`2026-04-24T1818-dissolve-categories-and-ship-scaffold`)
does not carry a `## Plan` block; the Plan was authored in
the chain prompt itself. There is no parent Plan-entry
`Realised by:` field to set (the prompt is not a session
artefact). This Pre-work block records the dependency
resolution verbatim instead.

- **Last `Status: Closed` session.**
  `2026-04-24T1818-dissolve-categories-and-ship-scaffold`
  (Closed 2026-04-24T18:52). Summary: dissolved
  `corpus/categories/` into typed Concept seeds at
  `registry/concepts/<id>/` (six promoted + three composing
  parents = nine new seeds, 27 files); `Tag` Concept type
  ships, LF's authored slug instances moved to
  `corpus/tags.md`; `template-minimal` scrubbed of pre-seeded
  index stubs; `TEMPLATE_DEFAULT_SEEDS['minimal']` expanded
  from 2 to 15; `runInit` writes a fully-formed first
  session log and closes it through `sessionEndStep`'s same
  machinery; ADR-034 records the v0.1 TLS-only registry-trust
  posture; `scripts/smoke-e2e.{sh,ts}` drives init +
  validateStep + weave-idempotence against this repo's
  `registry/` as a `file://` source. 34 tests pass; bundle
  2792.2 kB; both smoke scripts pass.

- **Carry-forward from Session 3's Deferred / Discovered.**
  Person/AI/Protocol Concept promotion to registry seed
  shape; Schema-level transition enforcement on status
  Concepts; closed-set Tag enforcement via `closedTagSet`;
  forward `adr-flow`/`goal-flow`/`tag-flow` Tropes; implicit
  dependency tangling; metalanguage migration on `Trope<C>`
  (Modality field replacement); Mode-setting / Disposition-
  setting Steps on `session-start`; Mode-transition validator
  on `session-end`; `trope-implication-flow` seed;
  `ImplicationNotTerminal` dedicated TaggedError;
  `Disposition.scope` promotion flow. None blocking for this
  session's Goals.

- **ADR index.** 33 ADRs indexed (numbering skips ADR-027).
  This session authors **ADR-035** (distribution: install-
  script + npm). G1 / G2 carry no ADR; their decisions land
  as `## Decisions Made` bullets.

- **Person directive at open.** Three Goals `Active` from
  open per chain prompt (no re-gating ceremony), all three
  carried verbatim from the Plan block in the chain prompt.
  Categories: G1 `feature`, G2 `feature`, G3 `decision-only`.
  Mode = Weaving (mechanical execution against the Plan).
  IMP-3 (scope-drift gate) remains in force.

- **GitHub repo coordinates.** `git remote -v` reports
  `git@github.com:athrio-com/literate.git`. The publish
  workflow's `npm publish --provenance` will bind to that
  repo via OIDC. `raw.githubusercontent.com/athrio-com/literate/main/`
  is the canonical install-script-fetch base URL.

- **Pragmatic constraint surfaced before authoring.**
  The chain prompt says: "Requires npm org `@literate` with
  Trusted Publishing configured (OIDC trust to the GitHub
  repo) — manual setup on npm's web UI. If not done at
  session open, surface and halt G1 until resolved." The
  agent enactor cannot verify npm-side OIDC configuration
  (no programmatic access to npm's web settings). The
  workable interpretation in fast-mode: ship the
  substrate (`.github/workflows/publish.yml`, version bump
  to `0.1.0-alpha.1`) **without** running the destructive
  publish flow (no `git tag`, no `git push`, no `npm publish`).
  The Person verifies OIDC, tags, and pushes when ready.
  G1's Acceptance is therefore **substrate-ready**, not
  **published-and-verified**; the publish-and-verify step
  is named explicitly in `## Deferred / Discovered` as
  blocked on the Person.

## Goals

*(Per chain prompt: fast-mode, no re-gating ceremony — all
three Goals carried verbatim from the Plan block and stamped
`Active` at open. Person retains the standing right to
Correct mid-flight.)*

### Goal 1 — GitHub Actions workflow + OIDC Trusted Publishing + version bump

**Status:** Completed
**Category:** feature
**Topic:** Author `.github/workflows/publish.yml` triggered
on `push` of `v*` tags. Steps: checkout, setup Bun,
`bun install`, `bun test`, `bun run build`,
`npm publish --provenance --access public` with
`id-token: write` permission. No manually-stored npm token.

Update `packages/cli/package.json` version to
`0.1.0-alpha.1`. Add `repository`, `homepage`, `bugs`, and
`publishConfig` fields. The actual `git tag v0.1.0-alpha.1
&& git push` step is **deferred to the Person** — the agent
enactor cannot verify npm-side OIDC configuration and treats
shared-state operations (push, publish) as requiring
explicit Person consent (see `## Pre-work` for the Person-
directive interpretation).

**Upstream:** chain prompt S4-G1; ADR-025 (npm distribution);
ADR-026 (registry mechanics); ADR-029 (Bun runtime); ADR-035
(authored under G3 below).

**Acceptance (substrate-ready scope):**
- `.github/workflows/publish.yml` exists, triggers on `v*`
  tags, runs typecheck + test + build + publish.
- `packages/cli/package.json` `version` is `0.1.0-alpha.1`.
- `repository` / `homepage` / `bugs` / `publishConfig`
  fields populated for npm metadata correctness.
- The publish flow is documented in the workflow file's
  header comment (one-time npm-side OIDC setup) so the
  Person can verify and run it without re-deriving the
  procedure.

**Notes:** The Plan-block Acceptance ("`bun add -g
@literate/cli@0.1.0-alpha.1` from a fresh shell resolves")
requires the publish to have actually run. That step is
named in `## Deferred / Discovered` as blocked on Person
verifying OIDC + tagging. G1 closes Completed at the
substrate-ready boundary per the chain prompt's halt-and-
discipline guidance.

### Goal 2 — Dual install scripts (`install.sh` + `install.ps1`) + README

**Status:** Completed
**Category:** feature
**Topic:** POSIX `sh` `install.sh` and PowerShell
`install.ps1` at repo root. Both detect/bootstrap Bun then
`bun add -g @literate/cli`. Update `README.md` `## Install`
section with both commands and the direct `bun add -g` path.

**Upstream:** chain prompt S4-G2; ADR-029 (Bun-only runtime);
ADR-035 (authored under G3 below).

**Acceptance:**
- `install.sh` exists at repo root; passes `sh -n`
  syntax check.
- `install.ps1` exists at repo root; authored to known-good
  PowerShell idioms.
- `README.md` `## Install` section documents both scripts
  + the direct `bun add -g @literate/cli` fallback.
- The `## Using the CLI` section is renamed `## Using the
  CLI from this repo` to disambiguate from the install
  surface.

**Notes:** `shellcheck` is not installed on the authoring
machine; `install.sh` was checked with `sh -n` instead.
`pwsh` (PowerShell Core) is not installed either; `install.ps1`
was authored to documented PowerShell idioms but not
linted. Fresh-environment verification (Docker container,
clean VM) is **deferred** — both scripts are syntactically
valid and follow Bun's documented installer pattern; first
real-world failures will guide hardening.

### Goal 3 — ADR-035: distribution via install-script-plus-npm

**Status:** Completed
**Category:** decision-only
**Topic:** Codify the dual-script + npm distribution surface
in an ADR. Compiled single-binary via `bun build --compile`
deferred post-1.0. Cite ADR-025 + ADR-029 + ADR-034.

**Upstream:** chain prompt S4-G3; ADR-025; ADR-029; ADR-034.

**Acceptance:**
- `corpus/decisions/ADR-035-distribution-install-script-plus-npm.md`
  Accepted.
- `corpus/decisions/decisions.md` updated with the ADR-035
  row.

## Decisions Made

One ADR authored and accepted this session:

- **ADR-035 — Distribution: install scripts + npm.**
  Accepted. Canonical install path is the dual `install.sh`
  / `install.ps1` shell-script bootstrap that installs Bun
  if absent, then `bun add -g @literate/cli`. `@literate/cli`
  publishes to npm via GitHub Actions Trusted Publishing
  (OIDC) on `v*` tag push. Compiled single-binary via
  `bun build --compile` deferred post-1.0. Tags `#release`
  `#tooling` `#self-hosting`. File:
  `corpus/decisions/ADR-035-distribution-install-script-plus-npm.md`.

No additional ADRs. Three small additive decisions land as
session-log bullets per the standard pattern:

- **`packages/cli/package.json` npm metadata.** Added
  `homepage`, `repository: { type, url, directory }`,
  `bugs`, and `publishConfig: { access: 'public',
  provenance: true }` alongside the version bump. Required
  for npm to render the package page correctly + for the
  `--provenance` flag to attest correctly. Mechanical
  consequence of the publish-readiness work.
- **GitHub Actions workflow paths.** `.github/workflows/publish.yml`
  is the canonical CI artefact at v0.1; the workflow file's
  header comment carries the one-time npm-side OIDC setup
  procedure verbatim so the Person can act on it without
  re-deriving the steps. Future workflows (e.g., a
  `windows-latest` smoke runner for `install.ps1`) land as
  sibling files under `.github/workflows/`.
- **Install-script-fetch base URL is `raw.githubusercontent.com/athrio-com/literate/main/`.**
  Per ADR-035; a custom domain (e.g. `literate.dev/install.sh`)
  is deferred. The README references the GitHub-coupled URL
  verbatim for 0.1.0-alpha.

## Work Done

### Goal 1 — Publish workflow + version bump

- **Created `.github/workflows/publish.yml`** — name
  `publish`; triggers on `push` of tags matching `v*`;
  permissions `contents: read` + `id-token: write` (the
  latter required for npm Trusted Publishing OIDC token
  issuance). Steps: checkout (`actions/checkout@v4`,
  fetch-depth 0), setup Bun (`oven-sh/setup-bun@v2`,
  bun-version `>=1.1.0`), setup Node (`actions/setup-node@v4`,
  node-version 20, registry-url
  `https://registry.npmjs.org`), `bun install --frozen-lockfile`,
  `bun run typecheck`, `bun test`, `bun run build`, finally
  `npm publish --provenance --access public` (working-
  directory `packages/cli`). Header comment documents the
  one-time manual setup on npm's web UI.
- **Modified `packages/cli/package.json`** — version
  `0.0.1` → `0.1.0-alpha.1`; added `homepage`, `repository:
  { type: 'git', url: 'git+https://github.com/athrio-com/literate.git',
  directory: 'packages/cli' }`, `bugs:
  'https://github.com/athrio-com/literate/issues'`,
  `publishConfig: { access: 'public', provenance: true }`.

### Goal 2 — Install scripts + README

- **Created `install.sh`** — POSIX `sh`. Optional first
  arg pins the version (`@<version>`). Detects OS (rejects
  Windows with a pointer to `install.ps1`). Bootstraps Bun
  via `curl -fsSL https://bun.sh/install | bash` if absent,
  prepending `~/.bun/bin` to PATH for the current session.
  Runs `bun add -g @literate/cli${VERSION}`. Verifies
  `literate --version` resolves. Made executable
  (`chmod +x`).
- **Created `install.ps1`** — PowerShell. `$env:LITERATE_VERSION`
  pins the version. Bootstraps Bun via
  `irm https://bun.sh/install.ps1 | iex` if absent.
  Runs `bun add -g @literate/cli`. Verifies
  `literate --version` resolves.
- **Modified `README.md`** — restructured `## Install and
  build` into two top-level sections:
  - `## Install` — dual-script commands + direct
    `bun add -g @literate/cli` fallback + post-install next
    steps.
  - `## Build (developing LF itself)` — the existing
    `bun install / typecheck / test / build` workflow plus
    `bun run smoke:e2e` and `bun run smoke:install`.
  - `### Using the CLI` renamed to `### Using the CLI from
    this repo` to disambiguate from the global install.
    Updated tarball filename references from
    `literate-cli-0.0.1.tgz` to `literate-cli-0.1.0-alpha.1.tgz`
    to match the bumped version.

### Goal 3 — ADR-035

- **Created `corpus/decisions/ADR-035-distribution-install-script-plus-npm.md`**
  — Accepted; full prose body documenting the three install
  surfaces (POSIX, PowerShell, direct), the npm Trusted
  Publishing flow, the trust-posture inheritance from
  ADR-034, and the four explicitly deferred forward
  surfaces (compiled binary, custom domain, signed releases,
  third-party packaging).
- **Modified `corpus/decisions/decisions.md`** — added the
  ADR-035 row.

### Tests, typecheck, build, smoke

- **`bun run --filter '*' typecheck`** → all three packages
  clean.
- **`bun test`** → **34 pass / 0 fail / 177 expect() calls /
  8 files**. The version bump in `packages/cli/package.json`
  did not affect any test (no test asserts on the package
  version).
- **`bun run --filter '@literate/cli' build`** → bundle
  rebuilt at **2792.2 kB** (unchanged from Session 3 close;
  no source-code delta).
- **`scripts/smoke-e2e.sh`** → PASSED. All eight assertions
  green.
- **`scripts/smoke-install.sh`** → PASSED. Hermetic local
  pack-and-install still works against the bumped version.
- **`sh -n install.sh`** → syntax OK.
- **`shellcheck install.sh`** → not run (shellcheck not
  installed locally; deferred).
- **`pwsh` lint of `install.ps1`** → not run (pwsh not
  installed locally; deferred).

## Summary

Authored `.github/workflows/publish.yml` for OIDC Trusted
Publishing of `@literate/cli` to npm on `v*` tag push;
bumped `packages/cli/package.json` version `0.0.1` →
`0.1.0-alpha.1` with publish-correct npm metadata
(`homepage`, `repository`, `bugs`, `publishConfig`).
Authored dual install scripts at repo root: `install.sh`
(POSIX `sh`, bootstraps Bun then `bun add -g`) and
`install.ps1` (PowerShell equivalent). Restructured
`README.md` `## Install` section to lead with the
shell-script commands; updated tarball-filename references
to `0.1.0-alpha.1`. ADR-035 codifies the dual-script + npm
distribution surface, inheriting ADR-034's TLS-only trust
posture and deferring four forward mechanisms (compiled
binary, custom domain, signed releases, third-party
packaging). The actual `git tag v0.1.0-alpha.1 && git push`
+ npm-publish + post-publish verification is **deferred to
the Person** — the agent enactor treats shared-state
operations as requiring explicit Person consent. All checks
green: 34 tests pass; all three packages typecheck clean;
bundle 2792.2 kB; both smoke scripts pass; `install.sh`
passes `sh -n`.

## Deferred / Discovered

### Deferred — blocked on the Person

- **Tag, push, and verify the v0.1.0-alpha.1 release.**
  Substrate is ready; the publish requires:
  1. Verify npm `@literate` org exists and Trusted
     Publishing is configured (Provider = GitHub Actions,
     Owner = `athrio-com`, Repository = `literate`,
     Workflow filename = `publish.yml`). One-time setup on
     npm's web UI; CI cannot do it.
  2. Commit the chain's session logs + ADRs + workflow +
     scripts + version bump.
  3. `git tag v0.1.0-alpha.1 && git push origin main --tags`.
  4. Verify the `publish` workflow run succeeded; verify
     `npm view @literate/cli` reports `0.1.0-alpha.1`;
     verify `bun add -g @literate/cli@0.1.0-alpha.1`
     installs from a fresh shell.
- **Update the README "Status" callout.** The current
  callout says "the code here has never been published to
  npm" — true at the time of authoring but false after the
  publish-and-verify step lands. The Person updates the
  callout when verifying publication, or a follow-up
  session does it as the first post-publish action.

### Deferred — engineering follow-ups

- **`shellcheck install.sh`** — install shellcheck and lint
  the script. Likely catches POSIX-portability issues
  beyond `sh -n`.
- **`pwsh` lint of `install.ps1`** — install PowerShell
  Core (or use PSScriptAnalyzer in CI) to lint the script.
  Likely catches PowerShell idiom issues.
- **Windows-native CI verification.** A `windows-latest`
  runner in `.github/workflows/` exercising `install.ps1`
  end-to-end against a fresh Windows environment. Currently
  not in the publish workflow because the publish workflow
  runs only on `ubuntu-latest`; a separate
  `smoke-windows.yml` triggered on PR / push to main is the
  right shape.
- **Docker-based fresh-env install verification.** A
  `Dockerfile` for `alpine:latest` and `debian:slim` that
  runs `curl … | sh` against a published version (or a
  local file:// staging copy). Catches install-time runtime
  assumption breakages (missing curl, missing bash, missing
  PATH-update semantics).
- **Compiled single binary** via `bun build --compile`.
  Per ADR-035, deferred post-1.0; named here as the canonical
  forward path.
- **Custom install-script domain.** Per ADR-035, deferred
  until adoption + brand warrant the cost of running the
  redirect.
- **Mise / asdf integration.** Community-driven per
  ADR-035; LF won't author or maintain at 0.1.0-alpha.

### Discovered in this session

- **`packages/cli/package.json` had no `repository` /
  `homepage` / `bugs` fields before this session.** Required
  by `npm publish --provenance` to render the npm package
  page correctly + for the provenance attestation to point
  at the source repo. Added alongside the version bump as a
  mechanical correctness fix, not a separate decision.
- **`publishConfig.provenance: true` is the cleanest way
  to enable provenance attestation.** Avoids requiring every
  publisher (including `npm publish` invocations from a CI
  workflow) to remember the `--provenance` flag. The
  workflow keeps `--provenance` explicit anyway as a belt-
  and-braces measure.
- **README's `## Install and build` section conflated
  "install the published CLI" with "build LF from source".**
  Split into two top-level sections (`## Install`,
  `## Build (developing LF itself)`); the prior `### Using
  the CLI` renamed to `### Using the CLI from this repo`
  for clarity.
- **Tarball-filename example references update with the
  version bump.** The README's `bun pm pack` example used
  `literate-cli-0.0.1.tgz`; bumped to
  `literate-cli-0.1.0-alpha.1.tgz` in the same edit pass.
  Worth a future linting rule that catches version-string
  drift between `package.json` and README examples; not in
  scope for this session.
- **GitHub Actions workflow file's header comment doubles
  as ops documentation.** The one-time npm-side OIDC setup
  (npm web UI navigation) lives verbatim in the workflow
  file's header comment — the Person can act on it without
  finding a separate runbook. Future workflows should
  follow the same convention.

