# Session: 2026-04-25 — mise canonical install path

**Date:** 2026-04-25
**Status:** Closed (2026-04-25T06:18)
**Chapter:** — (no chapter yet)
**Agent:** Claude Opus 4.7 (1M context) — fast mode
**Started:** 2026-04-25T06:07
**Disposition:** `{ base: 'Infrastructure' }` (install surface)
**Mode:** Tangling (G2, G3, G4, G5) + Weaving (G1, G6 conditional) — Person directive: ADRs authored as Accepted at write time; no separate gate cycle

## Pre-work

Spontaneous start per IMP-1.2.a: no `Status: Open` orphan in
`corpus/sessions/`; the only `Status: Planned` log
(`2026-04-29T0900-ci-oidc-publish-pipeline.md`) concerns publish
verification, not the installation surface, and the chain prompt
explicitly notes the two are independent. The Person's prompt is
self-contained and carries the full session content; all six
Goals are stamped `Active` at open per fast-mode discipline.

- **Last `Status: Closed` session.**
  `2026-04-24T2004-publish-readiness-fixes` (Closed
  2026-04-24T20:11). Summary: `--version` routed through
  `package.json`; minimal `packages/cli/README.md`; six Effect /
  remark / unified packages moved from `dependencies` →
  `devDependencies` (~69 MB consumer-side savings); dry-run
  publish green (56 files, 605.7 kB packed); Planned CI OIDC
  successor queued. Bootstrap publish + Trusted Publisher
  configuration deferred to the Person.

- **Carry-forward into this session.** The Person has now
  completed the bootstrap publish (`@literate/[email protected]`
  is live on the registry) and a development-machine self-test
  passed. A Docker post-publish verification then surfaced a
  PATH/shebang failure (`/usr/bin/env: 'bun': No such file or
  directory`) under `ubuntu:24.04` `bash -l -c "literate
  --version"`. Root cause is structural: (i) Bun's installer
  writes only to `.bashrc` and the rc-edit logic in
  `install.sh` short-circuits when PATH is already set in the
  current process; (ii) `bin/literate`'s `#!/usr/bin/env bun`
  shebang requires Bun on PATH at every invocation; (iii)
  Windows is an untested matrix across PowerShell, cmd, Git
  Bash, WSL. The Person has decided **mise is the canonical
  install path**. This session ships that decision end-to-end.

- **ADR index.** 33 ADRs indexed, latest ADR-035. ADR-036
  authored this session supersedes ADR-035. ADR-029 (Bun-only
  runtime) is unchanged — Bun stays the runtime; mise only
  manages the install layer. ADR-037 fires conditionally on
  G2's outcome (shebang strategy).

- **Person directive at open.** Six Goals `Active` from open
  (no re-gating ceremony) per the chain prompt. Categories:
  G1 `prose`, G2 `test`, G3 `prose`, G4 `fix`, G5 `test`, G6
  `prose` (conditional). Mode = Tangling for G2–G5; Weaving
  for G1 and (conditional) G6, but with the Person-supplied
  framing that ADR bodies stamp `Accepted` at write time —
  the chain prompt is the gate. IMP-3 is held at one site
  only: G2's mise validation. If `mise use -g
  npm:@literate/cli` fails in a way that can't be resolved by
  documentation or build adjustment, mark G2 partial and
  proceed; do not pivot away from mise; the Person decides
  between sessions.

## Goals

*(All six stamped `Active` at open per Person directive. Bodies
copied verbatim from the chain prompt; no re-gating ceremony.)*

### Goal 1 — ADR-036: Mise as canonical install path (supersedes ADR-035)

**Status:** Completed
**Category:** prose
**Mode:** Weaving

**Topic:** Author `corpus/decisions/036-mise-canonical-install-path.md`
as **Accepted** at write time. Body codifies: mise is the
canonical install path; `mise use -g npm:@literate/cli` is the
single install command; `curl https://mise.run | sh` is the
prerequisite for users without mise; ADR-035's `install.sh` /
`install.ps1` dual-script approach is superseded; ADR-029 (Bun-only
runtime) is unchanged — Bun remains the runtime, mise only
manages the install layer.

**Upstream:** ADR-029 (Bun-only runtime); ADR-035 (superseded);
post-publish verification findings (cited inline as the empirical
basis for the supersession).

**Acceptance:**

- `corpus/decisions/036-mise-canonical-install-path.md` exists and
  parses cleanly.
- `corpus/decisions/decisions.md` updated.
- ADR-035's status updated to `Superseded by 036` in its own header
  (single-line edit).

### Goal 2 — Validate `mise use -g npm:@literate/cli` against live registry

**Status:** Completed
**Category:** test
**Mode:** Tangling

**Topic:** Empirical validation that the path works before
committing to it in docs. The Docker test that surfaced the
shebang problem is the same test bed.

**Acceptance:**

- Docker run output captured verbatim in `## Work Done`.
- Either green (full chain works) or partial with specific error
  documented as Deferred.

### Goal 3 — Update README.md install section

**Status:** Completed
**Category:** prose
**Mode:** Tangling

**Topic:** The repo-root README is the canonical install
documentation. Replace the dual-script section with the mise
path. `packages/cli/README.md` synchronised.

**Acceptance:**

- Both READMEs updated.
- No live (non-corpus) references to `install.sh` / `install.ps1`
  / `bun add -g @literate/cli` remain in README files.

### Goal 4 — Remove `install.sh` and `install.ps1`

**Status:** Completed
**Category:** fix
**Mode:** Tangling

**Topic:** The dual-script approach is superseded by ADR-036.
The scripts go.

**Acceptance:**

- Both files absent from the working tree.
- No live (non-corpus) references to them remain.

### Goal 5 — Smoke test in fresh Docker via the documented path

**Status:** Completed
**Category:** test
**Mode:** Tangling

**Topic:** End-to-end delivery test using exactly the README's
instructions.

**Acceptance:**

- Output captured.
- `literate --version` prints `0.1.0-alpha.1`.
- `literate init` produces full scaffold with closed first session.
- Documentation gap (if surfaced) closed in Goal 3's edits.

### Goal 6 — ADR-037: Shebang strategy under mise (conditional on G2)

**Status:** Dismissed
**Category:** prose
**Mode:** Weaving

*Rationale:* Goal 2 surfaced the shebang issue under the bare
`mise use -g npm:@literate/cli` command (Bun is not a transitive
dep of `@literate/cli`'s npm package, so mise's `npm:` backend
does not auto-install it). The issue is **resolved entirely by
documentation**: when Bun is included in the same `mise use -g`
invocation (`mise use -g node@latest bun@latest npm:@literate/cli`),
mise's shim chain resolves the shebang correctly at every
`literate` invocation. Goal 5 verified this end-to-end against
the README's documented command. Option (c) of the chain
prompt's three candidates ("status quo with mise: rely on
mise's shim chain to resolve Bun") is empirically validated;
no shebang ADR is required. Per the chain prompt's IMP-3
discipline, no new ADR was authored beyond the budget
(G1 only).

**Topic:** Conditional. Skip if Goal 2 ran clean; author if
G2 surfaced a shebang resolution issue under mise. Default
choice if firing: (a) wrapper-shim approach.

**Acceptance (only if firing):**

- `corpus/decisions/037-shebang-strategy.md` exists, Accepted.
- Index updated.

(If G2 ran clean, this Goal is `Dismissed` with rationale
"Goal 2 validated mise's shim chain end-to-end; no shebang ADR
required.")

## Execution Log

| # | Step | Outcome |
|---|---|---|
| 1 | G1: author `corpus/decisions/ADR-036-mise-canonical-install-path.md` (Accepted at write time per chain prompt); update `corpus/decisions/decisions.md` (new row + ADR-035 → `Superseded by ADR-036`); edit ADR-035 header `Status:` line to mirror | clean; ADR-036 parses; index reflects supersession; ADR-035's `Status:` line carries the supersession scope ("install-surface clauses; npm-publish clauses remain in force") |
| 2 | G2 first attempt: `docker run --rm ubuntu:24.04 bash -c '… mise use -g npm:@literate/cli …'` | **partial** — `mise use -g npm:@literate/cli` failed: `mise WARN  npm may be required but was not found.` `mise ERROR Failed to install npm:@literate/cli@latest`. Findings: (i) mise's `npm:` backend requires npm itself for package metadata lookup, even when using bun for execution; (ii) `node@latest` install needed `libatomic1` on `ubuntu:24.04` (mise-bundled node v25.9.0's dynamic-link prerequisite). |
| 3 | G2 second attempt: install `node@latest` first via mise (with `libatomic1` apt-installed), then `mise use -g npm:@literate/cli` | mise installed `npm:@literate/cli@0.1.0-alpha.1` and shimmed `literate`; `literate --version` → **`/usr/bin/env: 'bun': No such file or directory`**. Bun is **not** transitively installed by mise's `npm:` backend; `@literate/cli`'s `package.json` declares `engines.bun` but no `dependencies` block, so the `npm install` mise runs internally never touches Bun. |
| 4 | G2 third attempt: `mise use -g node@latest bun@latest npm:@literate/cli` (multi-tool form), `mise reshim` | **green.** `literate --version` → `0.1.0-alpha.1`; `literate init /tmp/scratch` tangled all 15 seeds, wove `LITERATE.md`, closed first session at `corpus/sessions/2026-04-25T0614-init-scaffold.md`. Option (c) of G6 ("rely on mise's shim chain to resolve Bun") empirically validated. |
| 5 | G3: rewrite `## Install` section in repo-root `README.md` to mise path; mirror in `packages/cli/README.md`; remove the "never been published to npm" callout (alpha is live, alpha-tagged) | both READMEs reflect `mise use -g node@latest bun@latest npm:@literate/cli`; `.mise.toml` per-project pinning section added to repo-root README; `bun add -g @literate/cli` and `install.sh` / `install.ps1` mentions removed from README install sections (the dev/hacking section's `bun install -g <local-tgz>` is unrelated and stays); experimental warning updated to "published at the `0.1.0-alpha.1` tag (`alpha` dist-tag)". |
| 6 | G4: `git rm install.sh install.ps1`; sweep with `Grep "install\.sh\|install\.ps1"` repo-wide excluding `corpus/**` | both files removed; only remaining hit is `package.json`'s `smoke:install` script entry pointing at `packages/cli/scripts/smoke-install.sh` — this is the local pack-and-install smoke harness, unrelated to the consumer install entry-point files; left untouched. No `.github/workflows/**` or `packages/**` references. |
| 7 | G5: `docker run --rm ubuntu:24.04 bash -c '… curl https://mise.run \| sh; eval "$(~/.local/bin/mise activate bash)"; mise use -g node@latest bun@latest npm:@literate/cli; eval "$(~/.local/bin/mise activate bash)"; literate --version; literate init /tmp/test-project; …'` | **green.** Output: `literate --version` → `0.1.0-alpha.1`; `literate init` tangled all 15 seeds, wove `LITERATE.md`, closed first session `corpus/sessions/2026-04-25T0617-init-scaffold.md`; `manifest.json` well-formed with vendored Trope/Concept entries; `corpus/sessions/sessions.md` shows the closed init row. **Documentation gap surfaced**: in non-interactive `bash -c` scripts, `eval "$(mise activate ...)"` must be re-run after `mise use -g` to pick up the new shims (mise's prompt-hook fires on each interactive prompt; non-interactive scripts have no prompt). For human users in interactive shells this is invisible — the next prompt picks up the shims. Logged as a Deferred discovery; the README's documented path remains correct for its (interactive) audience. |
| 8 | G6: dismiss with rationale (option (c) validated end-to-end; no build-side change required; no new ADR per chain-prompt budget) | `Dismissed` with rationale recorded under the Goal entry. |

## Decisions Made

- **ADR-036 — Mise as canonical install path.** Authored Accepted
  at write time per the chain prompt's fast-mode framing. Body
  cites the three structural failure modes of ADR-035's
  approach (PATH propagation, shebang fragility, untested
  Windows matrix), each with a Docker-verified empirical
  anchor; commits the install surface to
  `mise use -g npm:@literate/cli` (with `node` + `bun`
  prerequisites included in the same invocation per the G2
  finding); supersedes ADR-035's install-surface clauses
  while leaving the npm-publish clauses (Trusted Publishing,
  OIDC, `publish.yml`) in force; ADR-029 (Bun as required
  runtime) and ADR-026 (registry mechanics) are unaffected.
  Tagged `#release` `#tooling` `#self-hosting` `#migration`.
  No ADR-037 authored — Goal 6 dismissed (see below).
- **The canonical install command is multi-tool, not single-tool.**
  The chain prompt projected `mise use -g npm:@literate/cli` as a
  single-step path. Goal 2 surfaced that mise's `npm:` backend
  needs both `node` (for npm metadata lookup) and `bun` (for the
  `@literate/cli` shebang) installed via mise alongside the CLI.
  The README documents the canonical form as
  `mise use -g node@latest bun@latest npm:@literate/cli`. The
  three tools are siblings in mise's shim chain; the user types
  one `mise use -g` invocation. ADR-036's `## Decision`
  section captures this empirical refinement inline (under
  "managed by mise's shim chain so their installation here is
  purely declarative").
- **Goal 6 (ADR-037) dismissed; option (c) validated.** The
  chain prompt's IMP-3 gate triggered at G2 (the bare
  `mise use -g npm:@literate/cli` command failed at the shebang).
  Per the chain prompt's instructions ("Do not pivot away from
  mise. Do not draft a new ADR. The Person decides between-session
  whether the failure blocks the path or requires a build-side
  adjustment"), no new ADR was authored. The remediation is
  documentation only. Option (c) — rely on mise's shim chain
  to resolve Bun — is empirically validated by Goal 5's
  end-to-end smoke test.
- **`@literate/cli`'s `package.json` does not declare a runtime
  dep on Bun, by design.** `engines.bun` is the runtime
  requirement; `dependencies` would force a parallel npm
  install of Bun-as-a-package (npm:bun is the unofficial Bun
  npm package, and depending on it would force Bun bytes to
  ship redundantly). The mise canonical install command
  declares Bun explicitly as a sibling tool — clean separation
  between "the CLI requires Bun at runtime" (engine assertion)
  and "the user has Bun installed" (mise tool declaration). No
  `package.json` change made or planned.

## Work Done

### G1 — ADR-036 + index updates

- **Created `corpus/decisions/ADR-036-mise-canonical-install-path.md`**
  — Status: Accepted (2026-04-25); Tags:
  `#release` `#tooling` `#self-hosting` `#migration`;
  Supersedes: ADR-035 (install-surface clauses).
  Sections: `## Context` (three structural problems with
  ADR-035's approach, each cited from the Docker
  verification run); `## Decision` (mise as canonical, two-step
  bootstrap with multi-tool install command, ADR-029 unchanged,
  npm publish surface unchanged); `## Consequences` (positive:
  cross-shell consistency, shebang fragility eliminated,
  maintenance burden removed, per-project pinning available;
  negative: extra bootstrap step, mise dependency, Windows-CI
  still deferred; forward: compiled-binary post-1.0, wrapper-shim
  available as ADR-037 candidate if mise's chain ever proves
  insufficient); `## Considered alternatives` (one paragraph
  rejecting the ADR-035 approach by reference to Context).
- **Modified `corpus/decisions/decisions.md`** — added the
  ADR-036 row; rewrote the ADR-035 row's `Status` cell to
  `Superseded by ADR-036 (install-surface clauses); npm-publish
  clauses (Trusted Publishing, OIDC, publish.yml) remain in
  force` (the supersession is partial — install surface only).
- **Modified `corpus/decisions/ADR-035-distribution-install-script-plus-npm.md`**
  — single-line edits to the header `Status:` and `Superseded by:`
  fields. Body untouched (ADR bodies are append-only post-Accept).

### G2 — Docker validation (capture verbatim)

Three Docker runs against `ubuntu:24.04`. The first two
failed with structurally distinct errors that informed the
final command shape; the third established the canonical
form.

**First attempt** — `mise use -g npm:@literate/cli` (bare):

```
mise WARN  npm may be required but was not found.

To use npm packages with mise, you need to install Node.js first:
mise use node@latest

Note: npm is required for querying package information, even when using aube, bun, or pnpm for installation.
mise WARN  Failed to resolve tool version list for npm:@literate/cli: [--runtime] npm:@literate/cli@latest: No such file or directory (os error 2)
mise ERROR Failed to install npm:@literate/cli@latest: No such file or directory (os error 2)
```

**Second attempt** — `mise use -g node@latest`, then
`mise use -g npm:@literate/cli`:

```
mise node@25.9.0     [3/3] node -v
/root/.local/share/mise/installs/node/25.9.0/bin/node: error while loading shared libraries: libatomic1.so.1: cannot open shared object file: No such file or directory
mise ERROR Failed to install core:node@latest
```

After `apt-get install -y libatomic1`, node installed
cleanly (`node v25.9.0`, `npm 11.12.1`), `npm:@literate/cli`
resolved and installed via mise's shim, but invoking
`literate --version` failed:

```
=== which literate ===
/root/.local/share/mise/shims/literate
=== literate --version ===
/usr/bin/env: 'bun': No such file or directory
```

— the shebang failure mode that was the structural anchor
of ADR-036's authoring.

**Third attempt** — `mise use -g node@latest bun@latest npm:@literate/cli`:

```
mise node@25.9.0     ✓ installed
mise bun@1.3.13      ✓ installed
mise npm:@literate/cli@0.1.0-alpha.1 ✓ installed
mise ~/.config/mise/config.toml tools: node@25.9.0, bun@1.3.13, npm:@literate/cli@0.1.0-alpha.1

=== which literate ===
/root/.local/share/mise/shims/literate
=== literate --version ===
0.1.0-alpha.1
=== literate init /tmp/scratch ===
initialised LF consumer repo at /tmp/scratch
  scaffolded: 3 file(s)
  tangled tropes/session-start
  tangled tropes/session-end
  tangled concepts/disposition … concepts/step-kind   (15 seeds)
  wove /tmp/scratch/.literate/LITERATE.md
  first session: corpus/sessions/2026-04-25T0614-init-scaffold.md (Closed 2026-04-25T06:14)
```

End-to-end green.

### G3 — README updates

- **Modified `README.md`** — replaced `## Install` block:
  removed `curl … install.sh | sh`, `irm … install.ps1 | iex`,
  and `bun add -g @literate/cli`; added the mise path
  (mise install if absent → activate → multi-tool
  `mise use -g`); added `## Install / Per-project pinning`
  subsection documenting `.mise.toml` via `mise use bun@latest
  npm:@literate/[email protected]` at repo root. Updated the
  experimental-warning paragraph to drop the "never been
  published to npm" claim (replaced with "`@literate/cli` is
  published to npm at the `0.1.0-alpha.1` tag (`alpha`
  dist-tag)"). The lower "Using the CLI from this repo"
  section (orthogonal to consumer install — covers
  hacking-on-LF dev flows) was left untouched.
- **Modified `packages/cli/README.md`** — replaced the three
  install code blocks with the same mise multi-tool form.
  Kept the file under 60 lines (G2 of the previous session's
  README acceptance criterion still holds).

### G4 — Install scripts removed

- **Deleted `install.sh`** (`git rm`).
- **Deleted `install.ps1`** (`git rm`).
- Repo-wide grep `install\.sh|install\.ps1` returns only
  `package.json:18: "smoke:install": "packages/cli/scripts/smoke-install.sh"`
  — the local hermetic pack-and-install harness, unrelated to
  consumer install entry points. Left untouched. No
  `.github/workflows/**` references. No `packages/**`
  references.

### G5 — Smoke test (capture verbatim)

```
### Step 0: prereqs
(apt-get install curl ca-certificates libatomic1 unzip — silent)

### Step 1: install mise (per README)
mise: installed successfully to /root/.local/bin/mise

### Step 2: activate (per README)
eval "$(~/.local/bin/mise activate bash)"

### Step 3: install Literate (per README)
mise node@25.9.0     ✓ installed
mise bun@1.3.13      ✓ installed
mise npm:@literate/cli@0.1.0-alpha.1 ✓ installed
mise ~/.config/mise/config.toml tools: node@25.9.0, bun@1.3.13, npm:@literate/cli@0.1.0-alpha.1

### Step 4: verify (per README)
0.1.0-alpha.1

### Step 5: real workflow (per README)
initialised LF consumer repo at /tmp/test-project
  scaffolded: 3 file(s)
  tangled tropes/session-start … concepts/step-kind   (15 seeds)
  wove /tmp/test-project/.literate/LITERATE.md
  first session: corpus/sessions/2026-04-25T0617-init-scaffold.md (Closed 2026-04-25T06:17)

### .literate/manifest.json (head)
{
  "$schema": "literate-manifest/v0",
  "vendored": [
    { "kind": "tropes", "id": "session-start", "registry": "literate", "ref": "main", … },
    …
  ]
}

### corpus/sessions/sessions.md
| 2026-04-25T0617-init-scaffold.md | Scaffold via `literate init minimal` | Closed (2026-04-25T06:17) |
```

End-to-end green. Required one quirk between Steps 3 and 4
inside the `bash -c` block: a re-eval of
`eval "$(~/.local/bin/mise activate bash)"` to refresh PATH
with the newly-shimmed `literate` (mise's prompt-hook fires
once per interactive prompt; non-interactive scripts have no
prompt and need an explicit refresh). For human users in
interactive shells this is invisible. Captured under
`## Deferred / Discovered`.

### G6 — Dismissed (no work product)

No file created. Dismissal rationale recorded under the Goal
entry above.

### Checks

- `git status` — `install.sh` + `install.ps1` deleted;
  `README.md`, `packages/cli/README.md`,
  `corpus/decisions/ADR-035-…md`, `corpus/decisions/decisions.md`,
  `corpus/sessions/sessions.md` modified;
  `corpus/decisions/ADR-036-mise-canonical-install-path.md`,
  `corpus/sessions/2026-04-25T0607-mise-canonical-install-path.md`
  added.
- No code (TypeScript / build / runtime) changed; bundle is
  unaffected; tests not re-run (no code path touched).

## Summary

ADR-036 commits LF to mise as the canonical install path,
superseding ADR-035's `install.sh` / `install.ps1` dual-script
approach (install-surface clauses; ADR-035's npm Trusted
Publishing clauses remain in force). The structural failure
modes of the previous approach — PATH propagation, shebang
fragility, untested Windows matrix — were anchored in the
post-publish Docker verification that motivated this session.
End-to-end Docker validation against the live registry
(`@literate/[email protected]`) established the canonical
install command shape: `mise use -g node@latest bun@latest
npm:@literate/cli`, a single mise invocation declaring all
three sibling tools at once. README install sections were
rewritten in lock-step (repo root + `packages/cli/`); both
install scripts removed. The chain prompt's IMP-3 gate
triggered at G2 when the bare `mise use -g
npm:@literate/cli` command failed at the shebang — per the
prompt's discipline, no new ADR was authored; G6 (ADR-037,
shebang strategy) dismissed since the issue resolves entirely
through documentation under option (c) of the G6 candidate
set. mise's shim chain handles Bun resolution at every
`literate` invocation; the `#!/usr/bin/env bun` shebang is
preserved and ADR-029 is unchanged.

## Deferred / Discovered

### Person-action — next moves (ordered)

1. **Commit the diff** generated by this session
   (ADR-036, ADR-035 status edit, `corpus/decisions/decisions.md`
   row updates, `README.md` rewrite, `packages/cli/README.md`
   rewrite, `install.sh` + `install.ps1` deletions, this
   session log + `corpus/sessions/sessions.md` Open-then-Closed
   row).
2. **Push to `main`.** The hosted README on GitHub now shows the
   mise path; any future user lands on current canonical
   instructions. No re-publish needed — `0.1.0-alpha.1` stays
   canonical (only documentation + the `corpus/` record changed
   this session; the published bundle is unaffected).
3. **(Optional) bump to `0.1.0-alpha.2`.** Skip unless a future
   session changes the bundle. The chain prompt's
   Person-action item #3 made this conditional on G6 firing,
   which it did not.

### Discovered in this session

- **mise's `npm:` backend has a hard `node`/`npm` prerequisite
  for package metadata lookup, even when execution uses a
  different runtime.** Surfaced at G2 attempt 1: `mise WARN
  npm may be required but was not found … npm is required for
  querying package information, even when using aube, bun, or
  pnpm for installation.` The canonical install command
  therefore declares `node@latest` alongside `bun@latest` and
  `npm:@literate/cli`. Documented in both READMEs.
- **Bun is not a transitive dep of `@literate/cli`'s npm
  package, by design.** `engines.bun` is the runtime
  assertion; `dependencies` is empty (per Session 4's
  manifest cleanup). mise's `npm:` backend therefore does not
  install Bun automatically. The README's canonical command
  declares Bun explicitly. Clean separation between engine
  assertion and tool declaration; not a bug.
- **`ubuntu:24.04`'s default base image lacks `libatomic1`,
  which mise-bundled node v25.9.0 requires for dynamic
  linking.** Surfaced at G2 attempt 2:
  `node: error while loading shared libraries: libatomic1.so.1`.
  Real consumers running mise on `ubuntu:24.04` would hit
  this. Possible documentation amendment: a "Linux
  prerequisites" line under the README's mise step calling
  out `libatomic1` explicitly (apt) for Debian/Ubuntu
  bare-image users. Deferred — most consumer machines have
  a build-essentials chain installed, and the error message
  is self-explanatory; addressing this is a polish pass, not
  a blocker.
- **mise's prompt-hook PATH refresh assumes interactive
  shells.** Surfaced at G5: in a `bash -c` script, after
  `mise use -g` adds new shims, the next command in the same
  script doesn't see them on PATH because no prompt fires
  between commands. Workaround in scripts: re-eval
  `mise activate`, or call `mise reshim && export
  PATH="$HOME/.local/share/mise/shims:$PATH"`, or invoke
  through `mise exec`. **This is a non-issue for the
  README's audience** (humans typing in interactive shells)
  but worth a callout if a future doc covers CI / scripted
  install paths.
- **`mise reshim` is sometimes implicit, sometimes explicit.**
  Empirically observed during G2: `mise use -g
  npm:@literate/cli` triggered an automatic `Reshimming mise
  latest...` line, but `mise use -g node@latest bun@latest`
  in the same invocation did not always (G2 attempt 4 needed
  an explicit `mise reshim`). Possibly mise-version-dependent.
  Not a blocker; if a consumer hits "command not found" after
  `mise use -g`, an explicit `mise reshim` resolves it. Worth
  a future README note if reports come in.
- **`@literate/cli`'s package shape works under mise's
  `npm:` backend with no further changes.** No
  `package.json` `bin` rewriting, no shebang change, no
  `postinstall` script needed. The package as published at
  `0.1.0-alpha.1` is mise-compatible out of the box once
  Bun is mise-managed alongside it. Confirmed by Goals 2
  and 5 against the live registry.

### Deferred — engineering follow-ups (carry-forward)

- **`.mise.toml` for LF's *own* dev environment.** The
  README documents `.mise.toml` for *consumer* repos; LF's
  own repo does not yet have one. Pinning Bun + node + (CI
  tools) at the repo root via `.mise.toml` would give
  contributors a one-command reproducible toolchain
  (`mise install` from the repo root). Candidate for a
  future Tooling session, not blocking. Independent from
  the LF Protocol commitment under ADR-036 (which governs
  consumer install only).
- **Windows-native verification of the mise install path.**
  mise has first-class Windows support but LF still does
  not exercise it in CI. Candidate for the queued
  `2026-04-29T0900-ci-oidc-publish-pipeline` Planned session's
  scope, or a separate Planned successor under the same
  arc. Unchanged from ADR-036's `## Consequences` framing.
- **Compiled single binary** via `bun build --compile`.
  Post-1.0 per ADR-035 / ADR-036 — unchanged.
- **Custom install-script domain.** Now moot — the install
  scripts are removed; the install URL is `mise.run`
  (third-party) and `npm:@literate/cli` (registry coordinate).
  No first-party domain needed at the install layer.
- **Homebrew / apt / aur packaging.** Community-driven per
  ADR-035 / ADR-036 — unchanged.
- **Wrapper-shim `bin/literate` (`exec bun "$0.js" "$@"`).**
  Listed in ADR-036's `## Consequences / Forward` as an
  ADR-037 candidate if mise's shim chain ever proves
  insufficient. Not currently needed; option (c) is
  validated.

### Carry-forward from prior sessions (unchanged)

- **Verify `publish.yml` end-to-end against a live
  `workflow_run`.** Queued in `2026-04-29T0900-ci-oidc-publish-pipeline.md`.
  Independent from this session per the chain prompt.
- **`shellcheck install.sh` + `pwsh` lint of `install.ps1`.**
  Now moot — both scripts are deleted under G4. Strike from
  carry-forward.
