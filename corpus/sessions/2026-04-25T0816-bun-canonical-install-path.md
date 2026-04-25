# Session: 2026-04-25 — Bun-direct as canonical install path

**Date:** 2026-04-25
**Status:** Closed (2026-04-25T09:00)
**Chapter:** — (no chapter yet)
**Agent:** Claude Opus 4.7 (1M context) — fast mode
**Started:** 2026-04-25T08:16
**Disposition:** `{ base: 'Infrastructure' }` (install surface)
**Mode:** Tangling (G2, G3, G4, G5, G6) + Weaving (G1) — Person directive: ADRs authored as Accepted at write time; chain prompt is the gate

## Pre-work

Spontaneous start per IMP-1.2.a: no `Status: Open` orphan. The
prior session (`2026-04-25T0607-mise-canonical-install-path`)
closed at 06:18 and was committed (`fa34019`). The Person
re-ran the empirical test in the meantime and confirmed
`bun install -g @literate/cli` works end-to-end on fresh
`ubuntu:24.04`. The mise direction in ADR-036 was an
overcorrection: the original failure that motivated mise was a
bug in `install.sh`'s rc-edit logic, **not** a flaw in
`bun install -g`. This session reverses the mise direction.

- **Last `Status: Closed` session.**
  `2026-04-25T0607-mise-canonical-install-path` (Closed
  2026-04-25T06:18). Summary: ADR-036 committed mise as
  canonical install path; README rewritten to multi-tool
  `mise use -g node@latest bun@latest npm:@literate/cli`;
  `install.sh` + `install.ps1` deleted. Docker-validated
  end-to-end against the live registry. The empirical anchor
  for ADR-036 was that the bare `mise use -g npm:@literate/cli`
  failed at the shebang (Bun not transitively installed); the
  resolution was multi-tool form.

- **The Person's overnight re-investigation** revealed two
  things ADR-036 missed:
  1. `bun install -g @literate/cli` works directly with no
     wrapper at all. The Docker run cited in this session's
     Decisive context ships proof.
  2. `mise use -g` silently overrides users' existing global
     tool versions (Node, in particular) — a real trust
     violation that ADR-036 didn't surface.
  Both findings invalidate ADR-036's premise that mise was
  the smallest viable install surface.

- **ADR index.** 36 ADRs indexed (numbering skips ADR-027,
  latest ADR-036). ADR-038 authored this session supersedes
  ADR-036. ADR-029 (Bun-only runtime) is unchanged and
  reinforced — the runtime *is* the package manager.

- **Person directive at open.** Six Goals `Active` from open
  per chain prompt's fast-mode discipline. Categories: G1
  `prose`, G2 `prose`, G3 `prose`, G4 `prose`, G5 `prose`, G6
  `test`. Mode = Tangling (G2–G6) + Weaving (G1; gate is the
  chain prompt). Suppress-invalid-decisions clause holds: do
  not re-deliberate the install path; the only legitimate
  IMP-3 surface is G6's Docker run failing in a way that
  contradicts the Decisive context's empirical claim.

- **G5 file-existence concern** (flagged at session open, not
  IMP-3): the chain prompt references "implications.md" said
  to have been "Person filed earlier this chat", but no such
  file exists in the working tree, and no session log carries
  an `## Implications` section. Pausing G5 mid-session to
  ask the Person rather than inventing structure.

## Goals

*(All six stamped `Active` at open per Person directive. Bodies
copied verbatim from the chain prompt's Goal block; no re-gating
ceremony.)*

### Goal 1 — ADR-038: Bun-direct install (supersedes ADR-036, partially supersedes ADR-035)

**Status:** Completed
**Category:** prose
**Mode:** Weaving

**Topic:** Author `corpus/decisions/ADR-038-bun-direct-install-path.md`
as **Accepted** at write time. Body codifies: `bun install -g
@literate/cli` is the canonical install command. No mise, no
shell scripts, no shim layer. ADR-036 (mise as canonical) is
superseded; ADR-035's `install.sh` / `install.ps1` clauses stay
superseded; ADR-029 (Bun-only runtime) is reinforced.

**Upstream:** ADR-029 (Bun-only runtime); ADR-036 (superseded);
the Docker verification run in the Decisive context.

**Acceptance:**

- `corpus/decisions/ADR-038-bun-direct-install-path.md` exists,
  Accepted, parses cleanly.
- `corpus/decisions/decisions.md` updated.
- ADR-036's status updated.

### Goal 2 — Repo-root README install section

**Status:** Completed
**Category:** prose
**Mode:** Tangling

**Topic:** Replace the mise install section in repo-root
`README.md` with the Bun-direct install section. Same content
serves both human readers and agents.

**Acceptance:**

- `## Install` section reads per chain prompt's verbatim block.
- No live mise references in `README.md`.

### Goal 3 — `packages/cli/README.md` install section synced

**Status:** Completed
**Category:** prose
**Mode:** Tangling

**Topic:** Sync `packages/cli/README.md` to the same install
instructions as the repo-root README, adapted to npm-page
audience (no relative repo links).

**Acceptance:**

- Install instructions match repo-root README's content.
- `bun run smoke:install` (sanity).

### Goal 4 — `INSTALL_PROMPT.md` (the agent-install wrapper)

**Status:** Completed
**Category:** prose
**Mode:** Tangling

**Topic:** A repo-root document the user pastes wholesale into
their coding agent. Bounded, explicit, idempotent.

**Acceptance:**

- `INSTALL_PROMPT.md` exists at repo root with the prompt body
  per chain prompt.
- Repo-root README's "Asking an agent" subsection links to it.

### Goal 5 — Implications log update

**Status:** Abandoned
**Category:** prose
**Mode:** Tangling

**Topic:** File implications resolved by ADR-038. **Pending
clarification:** target file does not exist in the working
tree; will pause at this Goal and ask the Person before
proceeding.

**Acceptance:**

- Three entries filed (distribution path; shebang fragility;
  install.sh UX) with rationales referencing ADR-038.
- Surfaced entries unchanged.

**Abandonment rationale (2026-04-25T09:00):** the `implications.md`
target was never identified, and the next session in the chain
(ADR removal + LFM substrate) deletes `corpus/decisions/` in
entirety, dissolving ADR-038's anchor for these implications.
Recording the resolutions inside ADR-038's own body is no longer
load-bearing. Any surviving implication content migrates into
the relevant LFM(s) authored in Session 1 Goal 9.

### Goal 6 — Final Docker verification

**Status:** Completed
**Category:** test
**Mode:** Tangling

**Topic:** End-to-end smoke against the documented install path
in a fresh container. The IMP-3 gate this session.

**Acceptance:**

- Docker run output captured verbatim.
- `literate --version` prints `0.1.0-alpha.1`.
- `literate init` succeeds; sessions index shows closed init
  session.

## Execution Log

| # | Step | Outcome |
|---|---|---|
| 1 | G1: author `corpus/decisions/ADR-038-bun-direct-install-path.md` (Accepted at write time per chain prompt); update `corpus/decisions/decisions.md` (new row + ADR-036 → `Superseded by ADR-038`); edit ADR-036 header `Status:` line to `Superseded by ADR-038` and `Superseded by:` field to `ADR-038` | clean; ADR-038 parses; index reflects supersession; ADR-036's header carries the supersession |
| 2 | G2: rewrite `## Install` section in repo-root `README.md` to Bun-direct path per chain prompt's verbatim block (have-Bun / don't-have-Bun / per-project pinning / asking-an-agent subsections) | clean; `grep "mise\|install\.sh\|install\.ps1" README.md` returns no matches |
| 3 | G3: rewrite `packages/cli/README.md` to npm-page audience (absolute GitHub URL for ADR link, no asking-an-agent subsection per chain prompt's brief); `wc -l` = 56 (≤ 60 cap holds); `bun run smoke:install` → green | clean; full 15-seed scaffold tangled, first session closed in `tmp.*/consumer-repo/`; `==> smoke PASSED` |
| 4 | G4: author `INSTALL_PROMPT.md` at repo root with the agent-prompt body verbatim from the chain prompt | created; ASCII-only |
| 5 | G6: end-to-end Docker verification on fresh `ubuntu:24.04` of the documented Bun-direct install path | **green.** `bun --version` → `1.3.13`; `bun install -g @literate/cli` → `installed @literate/cli@0.1.0-alpha.1 with binaries: literate`; `literate --version` → `0.1.0-alpha.1`; `literate init /tmp/scratch` tangled all 15 seeds, wove `LITERATE.md`, closed first session `corpus/sessions/2026-04-25T0822-init-scaffold.md`. Decisive context's empirical claim confirmed; IMP-3 gate did not trigger. |
| 6 | G5: implications log update | **paused — clarification requested.** The chain prompt names `implications.md` "Person filed earlier this chat" but no such file exists in the working tree, no session log carries an `## Implications` block, and LF's Implication concept tracks implications inside session-log `## Implications` blocks (with Filed implications producing memos under `corpus/memos/<slug>.md`). Three interpretation paths surfaced to the Person: (a) author a new top-level `implications.md`; (b) materialise the entries as an `## Implications` block in this session log per the Implication concept; (c) skip G5. Pending Person decision; Goal stays Active for now. |

## Decisions Made

- **ADR-038 — Bun-direct as canonical install path.** Authored
  Accepted at write time per the chain prompt's fast-mode
  framing. Body subtracts complexity rather than adding more:
  `bun install -g @literate/cli` is the canonical command, no
  shell scripts, no tool-manager wrapper, no shim layer.
  Cites two reasons ADR-036's mise direction was an
  overcorrection — (i) the original `install.sh` failure was a
  wrapper-script rc-edit bug, not a flaw in `bun install -g`;
  (ii) `mise use -g`'s silent-global-Node-clobber was a real
  trust violation that ADR-036 didn't surface. Supersedes
  ADR-036 in full; ADR-035's npm-publish clauses (Trusted
  Publishing, OIDC, `publish.yml`) explicitly survive both
  supersessions and remain in force under ADR-038. ADR-029
  (Bun-only runtime) reinforced — runtime is the package
  manager. Tagged
  `#release` `#tooling` `#self-hosting` `#migration`.
- **The install path is dual-audience by content, not by
  duplication.** The repo-root README's `## Install` section
  is the canonical source of truth; `INSTALL_PROMPT.md` is a
  paste-into-agent wrapper over the same instructions, not a
  fork. Agents and humans follow the same three commands.
- **`packages/cli/README.md`'s install section diverges only
  in audience-specific ways** — no relative repo links (npm
  page renders without repo context); no "asking an agent"
  subsection (npm-page readers are evaluating, not deploying);
  the ADR-038 link uses the absolute GitHub URL. Content
  otherwise mirrors the repo-root README.
- **G5 paused mid-session for Person clarification.** The
  Goal's target file does not exist in the working tree, and
  the chain prompt's "Person filed earlier this chat"
  reference does not match any artifact in this thread or any
  session log. Three interpretation paths surfaced; Goal
  stays `Active` pending decision. Per IMP-1.4 ("when in
  doubt, ask the Person"), this is the right surface — not an
  IMP-3 trigger (the Decisive context's empirical claim was
  confirmed by G6).

## Work Done

### G1 — ADR-038 + index updates

- **Created `corpus/decisions/ADR-038-bun-direct-install-path.md`**
  — Status: Accepted (2026-04-25); Tags:
  `#release` `#tooling` `#self-hosting` `#migration`;
  Supersedes: ADR-036.
  Sections: `## Context` (the wrapper-script-bug reframing
  and the silent-global-Node-clobber finding); `## Decision`
  (`bun install -g @literate/cli` canonical; two-step path
  for users without Bun; standard `bun add --dev` for
  per-project pinning; `INSTALL_PROMPT.md` as agent wrapper);
  `## Consequences` (positive: three-line install, no silent
  global pollution, cross-shell PATH handled upstream by
  Bun's installer, shebang resolves cleanly, runtime+pm
  unified; negative: two commands when Bun absent, Windows
  inherits Bun's curve, no tool-manager integration; forward:
  compiled binary post-1.0, community packaging, custom
  install-script domain now moot); `## Considered alternatives`
  (one paragraph each on the mise and shell-script directions).
- **Modified `corpus/decisions/decisions.md`** — added the
  ADR-038 row at the bottom (numerically ordered); rewrote
  the ADR-036 row's `Status` cell to `Superseded by ADR-038`;
  amended the ADR-035 row's `Status` cell to extend the
  npm-publish-clauses-remain-in-force note with "under
  ADR-038" so the chain ADR-035 → ADR-036 → ADR-038 is
  unambiguous in the index.
- **Modified `corpus/decisions/ADR-036-mise-canonical-install-path.md`**
  — single-line edits to the header `Status:` field
  (`Accepted` → `Superseded by ADR-038`) and the
  `Superseded by:` field (`—` → `ADR-038`). Body untouched
  (ADR bodies are append-only post-Accept).

### G2 — Repo-root README install section

- **Modified `README.md`** — replaced the entire
  `## Install` section. Removed the mise four-block structure
  (mise install, activation, multi-tool `mise use -g`,
  `.mise.toml` per-project pinning). Added the chain prompt's
  verbatim Bun-direct block: have-Bun two-liner; don't-have-Bun
  three-liner via `curl -fsSL https://bun.sh/install | bash`;
  Windows pointer to Bun's Windows installer / WSL;
  per-project pinning via `bun add --dev @literate/cli`;
  asking-an-agent subsection linking to `INSTALL_PROMPT.md`.
  ADR references rewritten: ADR-029 + ADR-038. The "Build
  (developing LF itself)" and "Using the CLI from this repo"
  sections lower in the README are unrelated to consumer
  install and were left untouched.

### G3 — `packages/cli/README.md`

- **Rewrote `packages/cli/README.md`** — 56 lines (under the
  60-line cap). Same have-Bun / don't-have-Bun / per-project
  pinning structure as the repo-root README; trimmed the
  asking-an-agent subsection (npm-page audience); ADR-038
  link uses absolute GitHub URL
  (`https://github.com/athrio-com/literate/blob/main/corpus/decisions/ADR-038-bun-direct-install-path.md`)
  so the npm page renders without relative-link breakage. Quick
  start, Docs, License sections retained.
- **Smoke test** — `bun run smoke:install` → green.
  `==> smoke PASSED`. Hermetic pack-and-install from a fresh
  tmp Bun project; full 15-seed scaffold tangled; first
  session closed in the tmp consumer repo.

### G4 — `INSTALL_PROMPT.md`

- **Created `INSTALL_PROMPT.md`** at repo root. Verbatim
  agent-prompt body from the chain prompt: four numbered
  steps (Bun check + install if absent → `bun install -g
  @literate/cli` → verify → optional `literate init`) with
  six explicit constraints (no tool managers unless
  pre-configured; no global tool-version mods beyond Bun;
  no shell scripts; no shell-rc edits beyond Bun's
  installer; report-and-stop on `bun install -g` failure;
  report which steps were skipped). ASCII-only; designed for
  copy-paste from a GitHub render into an agent chat.

### G6 — Docker verification (capture verbatim)

```
### Step 1: install Bun
bun was installed successfully to ~/.bun/bin/bun
Added "~/.bun/bin" to $PATH in "~/.bashrc"

### bun --version
1.3.13

### Step 2: bun install -g @literate/cli
bun add v1.3.13 (bf2e2cec)
Resolving dependencies
Resolved, downloaded and extracted [4]
Saved lockfile

installed @literate/cli@0.1.0-alpha.1 with binaries:
 - literate

1 package installed [1.68s]

### Step 3: literate --version
0.1.0-alpha.1

### Step 4: literate init /tmp/scratch
initialised LF consumer repo at /tmp/scratch
  scaffolded: 3 file(s)
  tangled tropes/session-start … concepts/step-kind   (15 seeds)
  wove /tmp/scratch/.literate/LITERATE.md
  first session: corpus/sessions/2026-04-25T0822-init-scaffold.md (Closed 2026-04-25T08:22)

### corpus/sessions/sessions.md
| 2026-04-25T0822-init-scaffold.md | Scaffold via `literate init minimal` | Closed (2026-04-25T08:22) |
```

End-to-end clean against the live `@literate/[email protected]`
publish. The Decisive context's empirical claim is reproducible.

### G5 — Paused (no work product)

No file created. Goal entry above carries the pause rationale;
three interpretation paths surfaced for the Person.

### Checks

- `git status` — `README.md`, `packages/cli/README.md`,
  `corpus/decisions/ADR-036-…md`, `corpus/decisions/decisions.md`,
  `corpus/sessions/sessions.md` modified;
  `corpus/decisions/ADR-038-bun-direct-install-path.md`,
  `INSTALL_PROMPT.md`,
  `corpus/sessions/2026-04-25T0816-bun-canonical-install-path.md`
  added.
- `bun run smoke:install` — green.
- No code (TypeScript / build / runtime) changed; bundle
  unaffected; `bun test` not re-run (no code path touched).

## Summary

ADR-038 reverses ADR-036's mise direction and codifies
`bun install -g @literate/cli` as the canonical install path.
Repo-root README, `packages/cli/README.md`, and a new
`INSTALL_PROMPT.md` agent wrapper carry the three-line
install instructions; `install.sh` and `install.ps1` stay
deleted from the prior session. Docker verification on fresh
`ubuntu:24.04` confirmed the path end-to-end against the live
`@literate/[email protected]` publish (G6 captured verbatim).
G5 (implications log update) was abandoned without work
product — its target file was never identified, and the
follow-on session removes ADRs entirely, dissolving the anchor.

## Deferred / Discovered

- **Implication-tracking semantics need a target.** The chain
  prompt's "implications.md" reference did not resolve to any
  artifact in the working tree, no session log carries an
  `## Implications` block, and three interpretation paths
  (top-level file / per-session block / skip) remained open at
  abandonment. The follow-on `adr-removal-and-lfm-substrate`
  session reframes the question entirely (LFMs replace ADRs;
  implication content migrates into LFM bodies where applicable),
  so this carry-over is informational, not actionable.
- **The Bun-direct install path is empirically green** against
  the live registry (Docker run captured in G6). Subsequent
  sessions touching install/distribution surfaces inherit this
  baseline.
- **CI OIDC publish pipeline session** (`2026-04-29T0900-ci-oidc-publish-pipeline.md`,
  `Status: Planned`) carries forward unchanged; not affected
  by the install-path reversal.
