# Session: 2026-04-24 — Publish-readiness fixes for `@literate/cli@0.1.0-alpha.1`

**Date:** 2026-04-24
**Status:** Closed (2026-04-24T20:11)
**Chapter:** — (no chapter yet)
**Agent:** Claude Opus 4.7 (1M context) — fast mode
**Started:** 2026-04-24T20:04
**Disposition:** `{ base: 'Infrastructure' }` (release surface)
**Mode:** Tangling (code + manifest changes derived from ADR-025 / ADR-026 / ADR-035; no new prose-gate artefacts)

## Pre-work

Spontaneous start per IMP-1.2.a: no `Status: Open` orphan in
`corpus/sessions/`; no `Status: Planned` log matches the Person's
prompt (the prompt itself carries the full Plan verbatim). Person
has explicitly directed fast-mode discipline: "Plan blocks above
are authored. Do not re-gate Goals at session open; execute."
All five Goals are stamped `Active` at open per the prompt.

- **Last `Status: Closed` session.**
  `2026-04-24T2030-publish-and-install-scripts` (Closed
  2026-04-24T19:02). Summary: authored `.github/workflows/publish.yml`
  (OIDC Trusted Publishing on `v*` tag push); bumped
  `packages/cli/package.json` 0.0.1 → 0.1.0-alpha.1 with
  publish-correct npm metadata; authored `install.sh` +
  `install.ps1`; restructured README `## Install`; ADR-035
  Accepted. 34 tests pass; bundle 2792.2 kB; both smoke scripts
  green. The actual `git tag && git push && npm publish` was
  explicitly deferred to the Person.

- **Carry-forward from Session 4's Deferred / Discovered.**
  The publish-and-verify loop is blocked on the Person (OIDC
  config on npmjs.com, tag push, publish run). This session's
  G5 queues the CI-OIDC verification work as a Planned
  successor. Engineering follow-ups (shellcheck, pwsh lint,
  Windows smoke runner, Docker fresh-env verification,
  compiled single binary, custom install-script domain,
  mise/asdf integration) remain valid deferrals — none block
  this session's code-level blockers.

- **ADR index.** 33 ADRs indexed (numbering skips ADR-027,
  latest ADR-035). Per the prompt's closing discipline, no
  ADRs this session — inline decisions land as
  `## Decisions Made` bullets. ADR-025 / ADR-026 / ADR-035 are
  the upstream anchors for G1–G4; G5's Planned log is pure
  IMP-4 mechanics and authors no new ADR.

- **Pre-publish readiness review (Person-supplied, in prompt).**
  Two code-level blockers surfaced before a clean local-token
  bootstrap publish: (i) `bin/literate.ts` hardcodes `'0.0.1'`
  in the `Command.run` version option; (ii) `packages/cli/`
  lacks a `README.md` so npm's package page renders barebones;
  (iii) `packages/cli/package.json` declares six Effect /
  remark / unified packages in `dependencies` that the
  bundler already inlines, forcing ~50 MB of parallel side-
  install of unused code on every consumer. G1/G2/G3 close all
  three before G4 verifies the packed tarball's shape.

- **Person directive at open.** Five Goals `Active` from open
  (no re-gating ceremony) per the chain prompt. Categories:
  G1 `fix`, G2 `fix`, G3 `fix`, G4 `test`, G5 `prose`. Mode =
  Tangling (G1–G4 derive mechanically from Accepted ADRs;
  G5 is IMP-4 Plan-entry authoring, not new gate-bearing
  prose). IMP-3 (scope-drift gate) remains in force at three
  named likely sites: JSON-import toolchain friction in G1,
  bundler-graph failure in G3, dry-run shape surprises in G4.

## Goals

*(All five stamped `Active` at open per Person directive. Bodies
copied verbatim from the chain prompt's Plan block; no re-gating
ceremony.)*

### Goal 1 — CLI `--version` reads from `package.json`

**Status:** Completed
**Category:** fix
**Topic:** `packages/cli/src/bin/literate.ts` hardcodes `'0.0.1'`
in the `Command.run` options. Publishing `0.1.0-alpha.1` while
`--version` reports `0.0.1` is incoherent. Source the string
from `package.json` so future bumps touch one file only.

**Upstream:** ADR-030 (argv surface via `@effect/cli`); Session 4 G1.

**Scope:**
- Import `packages/cli/package.json` via `import … with { type: 'json' }`.
- Replace `version: '0.0.1'` with `version: pkg.version`.
- Bundler inlines JSON at build time — no runtime fs read.
- IMP-3 gate on toolchain friction: fall back to hardcoded
  `'0.1.0-alpha.1'` and log as Deferred.

**Acceptance:**
- `grep -n "version: '0.0.1'" packages/cli/src/bin/literate.ts` empty.
- `bun run build` exits 0.
- `./dist/literate.js --version` prints `0.1.0-alpha.1`.
- `bun test` still passes (34 tests).

### Goal 2 — Minimal `packages/cli/README.md`

**Status:** Completed
**Category:** fix
**Topic:** `packages/cli/README.md` does not exist. npm renders
the package page from this file; absent → barebones. Consumer
first impression lands here.

**Upstream:** ADR-025 (shadcn-shaped distribution).

**Scope:** One-screen README (≤60 lines). Title + tagline;
`## Install` (dual scripts + direct Bun); `## Quick start`
(three commands); `## Docs` (single link to repo root);
`## License`. No feature dump, no architecture prose, no ADR
references. Link, do not duplicate.

**Acceptance:**
- `packages/cli/README.md` exists, ≤60 lines.
- `npm publish --dry-run --access public` from `packages/cli/`
  lists `README.md` in the tarball.

### Goal 3 — Drop the redundant `node_modules/` install

**Status:** Completed
**Category:** fix
**Topic:** `dist/literate.js` is already a tree-shaken,
self-contained bundle; `packages/cli/package.json`'s six
`dependencies` (`@effect/cli`, `@effect/platform`,
`@effect/platform-bun`, `remark-mdx`, `remark-parse`,
`unified`) force npm to side-install full, untree-shaken
copies next to the bundle that never load at runtime. Net:
~50 MB of wasted install cost.

**Upstream:** ADR-025 (CLI is the sole npm artefact, self-
contained binary); ADR-026 §4 (CLI bundles its Trope logic at
build time); `packages/cli/scripts/build.ts`
(`packages: 'bundle'` — Bun bundler tree-shakes non-`node:*`
imports at build time).

**Scope:**
- **Pre-flight**: `bun pm pack` → install tarball into fresh
  tmp Bun project → `rm -rf` the Effect / remark / unified
  folders from `node_modules/` → run `literate --help` and
  `literate init scratch-proj`. If both succeed the manifest
  change is empirically safe.
- On pre-flight pass: move all six packages from
  `dependencies` → `devDependencies`.
- Re-run `bun run build`; re-run `bun run smoke:install`.
- IMP-3 gate on "cannot find module X": retain *only X* in
  `dependencies`, log exact module + package as Deferred for
  a bundler-config session.

**Acceptance:**
- Pre-flight check passes (CLI runs after `rm -rf`).
- `dependencies` is `{}` or absent (or minimal IMP-3 set).
- `bun run build` exits 0; bundle size ≈2792 kB ±10 kB.
- `bun run smoke:install` exits 0.
- `bun test` still passes (34 tests).

### Goal 4 — Dry-run verification

**Status:** Completed
**Category:** test
**Topic:** Before the author burns the version on the live
registry, verify the tarball shape matches the model after
G1–G3 land.

**Upstream:** G1, G2, G3.

**Scope:**
- `npm publish --dry-run --access public` from
  `packages/cli/`. Capture file list + tarball size + unpacked
  size + packed `dependencies` field into
  `## Work Done`.
- Expected present: `package.json`, `README.md`,
  `dist/literate.js`, `dist/assets/template-minimal/**`,
  `dist/assets/registry/tropes/**`, `dist/assets/registry/concepts/**`,
  optional `dist/LICENSE-MIT`, `dist/LICENSE-APACHE`, `dist/NOTICE`.
- Expected absent: `src/**`, `scripts/**`, `tsconfig.json`,
  `__tests__/**`, `node_modules/**`, `.literate/`, any other
  monorepo package's files.
- Expected metadata: `name: @literate/cli`,
  `version: 0.1.0-alpha.1`, `access: public`.
- IMP-3 gate on any surprise: close G4 partial, log as
  Deferred, block the Person from running the real publish.

**Acceptance:**
- Dry-run exits 0.
- File list + packed `dependencies` recorded in session log.
- No surprises (or surprises surfaced as Deferred gates).

### Goal 5 — Plan the CI OIDC session

**Status:** Completed
**Category:** prose
**Topic:** Author a Planned session log that queues the CI
OIDC verification + hardening work. Do **not** execute it in
this session — it opens only after the Person has completed
the bootstrap publish + Trusted Publisher UI configuration
on npmjs.com. Running it before those exist would fail at
the first `gh run view`.

**Upstream:** Session 4 (publish workflow scaffolded but
unverified); ADR-035 (distribution).

**Scope:** Standard Planned-log shape at
`corpus/sessions/<stamp>-ci-oidc-publish-pipeline.md`. Four
provisional Goals (G1 workflow shape verify; G2 post-publish
install smoke job; G3 tag-to-version reconciliation;
G4 documentation pass). Hard out-of-scope clause on the
Trusted Publisher UI configuration (Person-action, not code).
No ADRs in the Planned session.

**Acceptance:**
- Planned log file exists at the canonical path.
- `corpus/sessions/sessions.md` carries a new `Planned` row.
- The log parses as a valid session-start input under
  `literate continue .` (G1–G4 list, each `Status:
  (provisional)`, `Upstream:` block present).

## Execution Log

| # | Step | Outcome |
|---|---|---|
| 1 | G1: add `import pkg from '../../package.json' with { type: 'json' }`; replace `version: '0.0.1'` → `version: pkg.version` | clean; typecheck green; build green (2793.5 kB); `--version` prints `0.1.0-alpha.1` |
| 2 | G2: author `packages/cli/README.md` | 40 lines (≤60 target); shape per Plan |
| 3 | G3 pre-flight: `bun pm pack` → install into fresh `tmp` Bun project → `rm -rf node_modules/@effect node_modules/effect node_modules/remark-* node_modules/unified` → `literate --help` + `literate init scratch-proj` | both CLI invocations succeed fully after the `rm -rf`; all 15 template seeds tangled; `.literate/` scaffolded; first session closed. Bundle is provably self-contained |
| 4 | G3 manifest: move six packages (`@effect/cli`, `@effect/platform`, `@effect/platform-bun`, `remark-mdx`, `remark-parse`, `unified`) from `dependencies` → `devDependencies`; `dependencies` key dropped entirely | `bun install` no-op; rebuild 2793.5 kB (unchanged); `bun run smoke:install` green; 34 tests pass |
| 5 | G4 first attempt: `NPM_CONFIG_PROVENANCE=false npm publish --dry-run --access public` | exit 1 — two findings: (i) `npm pkg fix` normalized `bin.literate` `"./dist/literate.js"` → `"dist/literate.js"` (applied); (ii) npm refused the prerelease version without `--tag` |
| 6 | G4 second attempt: `NPM_CONFIG_PROVENANCE=false npm publish --dry-run --access public --tag alpha` | **green.** 56 files, 605.7 kB packed, 3.0 MB unpacked. File list + metadata match the Plan's expected shape exactly; packed `package.json` has no `dependencies` field (clean manifest confirmed) |
| 7 | G5: author Planned session log at `corpus/sessions/2026-04-29T0900-ci-oidc-publish-pipeline.md` with four provisional Goals; add Planned row to `corpus/sessions/sessions.md` | log parses as valid session-start input; dependency-check block makes the session non-openable until the Person finishes the bootstrap + Trusted Publisher UI work |

## Decisions Made

No ADRs this session — per the chain-prompt's closing
discipline, inline decisions land as bullets.

- **`bin.literate` path normalized to `"dist/literate.js"`
  (no `./` prefix).** Mechanical npm-preferred format applied
  by `npm pkg fix` during the first G4 dry-run attempt. Kept
  the fix. `main` and `exports` keep their `./` prefix
  (npm's normalization retained those — different key, same
  tool). This is metadata-only and ships without functional
  change.
- **Prerelease versions publish under `--tag alpha`, not the
  default `latest` tag.** npm refused the dry-run without
  `--tag alpha` (error: "You must specify a tag using --tag
  when publishing a prerelease version"). Accepted — this is
  npm's default posture for prerelease SemVer. The Person's
  post-session publish command list needs `--tag alpha`
  appended; flagged in `## Deferred / Discovered`.
- **All six `dependencies` are bundler-traceable at build
  time; none leak through as dynamic requires at runtime.**
  The pre-flight `rm -rf` check was the load-bearing
  empirical assertion — after deleting `@effect/*`,
  `effect`, `remark-*`, and `unified` from the installed
  `node_modules/`, both `literate --help` and
  `literate init scratch-proj` ran fully, including the full
  15-seed tangle + weave + first-session-close chain. No
  IMP-3 gate triggered; the full six-package manifest
  cleanup landed.
- **Planned successor timestamped `2026-04-29T0900` as a
  forward-dated placeholder slot.** Per prior-session
  convention (e.g., `2026-04-28T0900-bootstrap-literate-docs.md`
  was forward-dated when authored). The actual open time
  is TBD — the session's dependency block conditions it on
  four Person-action prerequisites completing first.

## Work Done

### G1 — `--version` from `package.json`

- **Modified `packages/cli/src/bin/literate.ts`** —
  added `import pkg from '../../package.json' with
  { type: 'json' }` (TypeScript import attribute syntax,
  Bun / `tsc --noEmit` both accept); replaced `version:
  '0.0.1'` with `version: pkg.version` in the `Command.run`
  options. No toolchain friction; IMP-3 JSON-import-fallback
  gate not triggered. Future version bumps are
  single-file (`package.json`).

### G2 — `packages/cli/README.md`

- **Created `packages/cli/README.md`** — 40 lines.
  Sections: title + one-line description; `## Install`
  (curl `install.sh`, PowerShell `install.ps1`, direct
  `bun add -g`); `## Quick start` (three-command flow
  `init → cd → continue`); `## Docs` (single link to
  `https://github.com/athrio-com/literate`); `## License`
  (MIT OR Apache-2.0). No feature dump; no ADR references;
  the repo-root README remains the canonical full-prose
  entry point.

### G3 — Redundant `dependencies` dropped

- **Modified `packages/cli/package.json`** — removed the
  `dependencies` block entirely; moved `@effect/cli`,
  `@effect/platform`, `@effect/platform-bun`, `remark-mdx`,
  `remark-parse`, `unified` into `devDependencies`
  alongside the existing entries. Sorted `devDependencies`
  alphabetically. `npm pkg fix` (applied under G4) also
  normalized `bin.literate` to `"dist/literate.js"`.
- **Pre-flight verification.** Hermetic `mktemp` +
  `bun pm pack` + `bun add <tgz>` + `rm -rf
  node_modules/@effect node_modules/effect
  node_modules/remark-* node_modules/unified` + `literate
  --help` + `literate init scratch-proj`. All green. Before
  `rm -rf`: 36M (`@effect`) + 33M (`effect`) + ~0.3M
  (`remark-*` + `unified`) ≈ **69 MB** of side-installed
  code that the bundle never loads. After `rm -rf`:
  `literate --version` → `0.1.0-alpha.1`; `literate init
  scratch-proj` tangled all 15 seeds and closed the first
  session at `corpus/sessions/2026-04-24T2308-init-scaffold.md`.

### G4 — Dry-run verification

- **`NPM_CONFIG_PROVENANCE=false npm publish --dry-run
  --access public --tag alpha`** from `packages/cli/`.
  Exit 0.
- **Tarball file list (56 files).** Present: `package.json`
  (1.4 kB), `README.md` (658 B), `dist/literate.js` (2.9 MB),
  `dist/LICENSE-APACHE` (11.4 kB), `dist/LICENSE-MIT` (1.1 kB),
  `dist/NOTICE` (184 B), 3 files under
  `dist/assets/template-minimal/` (CLAUDE.md, package.json,
  `.literate/extensions/.keep`), 47 files under
  `dist/assets/registry/` split into 13 `concepts/*`
  (adr, adr-status, disposition, goal, goal-category,
  goal-status, implication, mode, session, session-status,
  step, step-kind, tag) + 2 `tropes/*` (session-end,
  session-start), each with `concept.mdx` / `index.ts` /
  `README.md` (+ `prose.mdx` for the two Tropes).
- **Absent as expected:** `src/**`, `scripts/**`,
  `tsconfig.json`, `__tests__/**`, `node_modules/**`,
  `.literate/`, any non-CLI workspace package's files.
- **Packed manifest metadata.** `name: @literate/cli`,
  `version: 0.1.0-alpha.1`, `filename: literate-cli-0.1.0-alpha.1.tgz`,
  `package size: 605.7 kB`, `unpacked size: 3.0 MB`,
  `total files: 56`, `tag: alpha`, `access: public`,
  `registry: https://registry.npmjs.org/`.
- **Packed `dependencies` field: absent.** The manifest
  change under G3 flowed through clean — the packed
  `package.json` declares no runtime deps.

### G5 — Planned CI OIDC session log

- **Created `corpus/sessions/2026-04-29T0900-ci-oidc-publish-pipeline.md`**
  — `Status: Planned`. Standard Planned-log shape: header,
  `## Upstream`, `## Dependencies` (the four Person-action
  prerequisites that gate opening), `## Goals` with four
  provisional entries (G1 workflow shape verify; G2
  post-publish install-smoke job Linux + Windows; G3
  tag-to-version reconciliation; G4 docs pass), `## Hard
  out-of-scope` block (Trusted Publisher UI is Person-action;
  compiled single binary is post-1.0; no new ADRs), `## Notes`
  with session-start discipline reminders.
- **Modified `corpus/sessions/sessions.md`** — inserted a
  `Planned` row above the current Open row, pointing at
  the new log.

### Checks

- `cd packages/cli && bun run typecheck` → clean.
- `bun test` (repo root) → **34 pass / 0 fail / 177
  expect() calls / 8 files.**
- `cd packages/cli && bun run build` → bundle **2793.5 kB**
  (vs. 2792.2 kB pre-session; +1.3 kB, within the Plan's
  ±10 kB envelope — accounted for by the G1 JSON import
  adding the package.json shape to the bundle).
- `bun run smoke:install` (repo root) → green; both
  `literate --help` and `literate init` pass against the
  packed tarball in a fresh tmp Bun project.
- `bun run smoke:e2e` — not re-run this session (no
  change to the init/validate/weave path; G1's
  `--version` change is orthogonal to the e2e harness).
  Last green run was Session 4 close.

## Summary

Five code-level / prose-level blockers closed before the
Person runs the bootstrap publish. CLI `--version` now
sources from `packages/cli/package.json` via a JSON import
(one place to bump on future version changes). Authored a
minimal `packages/cli/README.md` (40 lines) so the npm
package page renders with substance. Pre-flight-verified
that the Bun-built bundle is empirically self-contained,
then moved all six Effect / remark / unified packages from
`dependencies` to `devDependencies` — freeing the consumer
from ~69 MB of side-installed code that never executes.
Dry-ran `npm publish` successfully (56 files, 605.7 kB
packed, 3.0 MB unpacked); the packed `package.json`
carries no runtime `dependencies` field. Queued a
`Status: Planned` successor at `corpus/sessions/2026-04-29T0900-ci-oidc-publish-pipeline.md`
for CI OIDC end-to-end verification after the Person
completes the bootstrap publish + Trusted Publisher UI
configuration. All checks green: 34 tests pass; typecheck
clean; bundle 2793.5 kB; smoke:install green.

## Deferred / Discovered

### Person-action — next moves (ordered)

1. **Commit the diff** generated by this session (CLI code
   change, new `packages/cli/README.md`, `packages/cli/package.json`
   cleanup, new Planned session log, index updates).
2. **Dry-run locally:** `cd packages/cli && NPM_CONFIG_PROVENANCE=false
   npm publish --dry-run --access public --tag alpha`.
   Already-known output: 56 files, 605.7 kB packed. Re-run
   as a belt-and-braces sanity check before burning the
   version on the live registry.
3. **Bootstrap publish:** `cd packages/cli &&
   NPM_CONFIG_PROVENANCE=false npm publish --access public
   --tag alpha`. This is the one-shot local-token publish.
   `NPM_CONFIG_PROVENANCE=false` overrides `publishConfig.provenance:
   true` for this bootstrap only; subsequent OIDC publishes
   leave provenance enabled.
4. **Delete the npm token** on npmjs.com. Per ADR-035's
   trust posture, the bootstrap token is a one-shot.
5. **Configure Trusted Publisher** on the `@literate/cli`
   npm package settings: Provider `GitHub Actions`, Owner
   `athrio-com`, Repository `literate`, Workflow filename
   `publish.yml`.
6. **Tag and push `v0.1.0-alpha.2`** (after the Trusted
   Publisher UI change lands). The version bump is a
   single-file change (`packages/cli/package.json`) now
   that G1 routes `--version` through it. This tag-push
   triggers the first real OIDC-driven workflow run.
7. **Open the Planned CI OIDC session** at
   `corpus/sessions/2026-04-29T0900-ci-oidc-publish-pipeline.md`
   via `literate continue .` once the `v0.1.0-alpha.2` run
   is visible in GitHub Actions.

### Discovered in this session

- **`npm publish` requires `--tag <value>` for prerelease
  versions.** Otherwise it refuses with "You must specify a
  tag using --tag when publishing a prerelease version." The
  Person's stated publish command in the chain-prompt
  (`NPM_CONFIG_PROVENANCE=false npm publish --access
  public`) will fail without `--tag alpha` appended. The
  `## Person-action — next moves` list above captures the
  corrected command. Future publish workflows should bake
  `--tag alpha` into the CI step for any pre-1.0 release;
  the `publish.yml` file will need an audit for this in the
  CI OIDC session G1.
- **`npm pkg fix` normalizes `bin.<name>` paths by
  stripping the `./` prefix.** `main` and `exports` keep
  theirs. The mechanical fix was applied to
  `packages/cli/package.json` under G4 and has no functional
  consequence; noted here so future sessions that see the
  asymmetry don't re-apply the prefix.
- **~69 MB of `node_modules/` bloat eliminated.** Concrete
  measured before/after sizes from the pre-flight check:
  `@effect` = 36M, `effect` = 33M, `remark-mdx` + `remark-parse`
  + `unified` ≈ 256K. All that is gone from the consumer
  install as of this session. Measurable win for any
  downstream aggregator (Dockerfiles bundling LF, CI caches,
  `bun pm cache`) that previously paid the parallel-install
  tax.
- **Bundle grew by +1.3 kB (2792.2 → 2793.5).** Tracked to
  G1's JSON import: the bundler inlined the full
  `package.json` shape to resolve `pkg.version`. Not a
  concern — the author prefers one-place version truth over
  a handful of kB.
- **Session 4's claim that bundle size would be "unchanged
  ±10 kB" under the manifest change held exactly.** G3
  produced zero bundle-size delta (the rebuild before and
  after the manifest edit both came in at 2793.5 kB); the
  +1.3 kB from G1 is the only delta this session. Tree-
  shaking was already producing the correct output; only
  metadata shifted.

### Deferred — engineering follow-ups (carry-forward)

- **Verify `publish.yml` end-to-end against a live
  `workflow_run`.** Queued in the Planned successor; not
  actionable until the Person completes the bootstrap +
  Trusted Publisher UI work.
- **Post-publish install-smoke job** (Linux `curl | sh` +
  Windows `irm | iex`). Queued as the successor's G2.
- **Tag-to-version reconciliation mechanism.** Queued as
  the successor's G3.
- **`shellcheck install.sh` + `pwsh` lint of `install.ps1`.**
  Still not actioned — the shellcheck and pwsh tools are not
  installed on the authoring machine; Session 4's framing
  carries forward verbatim. A CI-side lint
  (`reviewdog/action-shellcheck` + PSScriptAnalyzer) is the
  right place for this, not the author's machine.
- **Windows-native CI verification** of `install.ps1` in a
  fresh `windows-latest` environment. Queued in the
  Planned successor's G2.
- **Docker-based fresh-env install verification** (Alpine
  + Debian slim). Not queued in the successor — it's a
  nice-to-have that catches install-surface drift rather
  than release-pipeline drift. Keep as a background item.
- **Compiled single binary** via `bun build --compile`.
  Post-1.0 per ADR-035 — unchanged.
- **Custom install-script domain.** Post-1.0 per ADR-035 —
  unchanged.
- **`mise` / `asdf` integration.** Community-driven per
  ADR-035 — unchanged.
