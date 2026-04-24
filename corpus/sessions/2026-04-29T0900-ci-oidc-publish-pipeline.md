# Session: CI OIDC publish pipeline verification + hardening

**Date:** 2026-04-29 (planned slot; actual open time TBD)
**Status:** Planned
**Chapter:** — (no chapter yet)
**Agent:** (TBD at open)
**Disposition:** `{ base: 'Infrastructure' }` (release surface — CI hardening)
**Mode:** (to be set at open; likely Tangling for G1–G3 + Weaving for G4 doc pass)
**Planned by:** corpus/sessions/2026-04-24T2004-publish-readiness-fixes.md

## Upstream

- `corpus/sessions/2026-04-24T2030-publish-and-install-scripts.md` —
  authored `.github/workflows/publish.yml` under G1 but treated
  shared-state operations (push, publish) as Person-gated and
  explicitly **did not** verify the workflow end-to-end.
- `corpus/sessions/2026-04-24T2004-publish-readiness-fixes.md` —
  closed the three code-level blockers (`--version` from
  `package.json`; CLI README; dropped redundant `dependencies`);
  dry-ran `npm publish` green. Named this Planned successor as G5.
- `corpus/decisions/ADR-035-distribution-install-script-plus-npm.md`
  — distribution surface (OIDC Trusted Publishing) authored but
  unverified in a live `workflow_run` until this session runs.

## Dependencies (out-of-band, Person-action)

This session does **not** open until all of the following are
true. None of them are code changes; the agent enactor cannot
perform them. The parent (`2026-04-24T2004-publish-readiness-fixes`)
lists these verbatim in its `## Deferred / Discovered` block.

1. **Bootstrap publish completed.** The Person has run
   `NPM_CONFIG_PROVENANCE=false npm publish --access public --tag alpha`
   (local npm token active in the shell), and
   `npm view @literate/cli@0.1.0-alpha.1` resolves a real
   package on the public registry.
2. **Trusted Publisher configured on npmjs.com.** The Person
   has navigated to the `@literate/cli` package settings,
   added a Trusted Publisher with `Provider: GitHub Actions`,
   `Owner: athrio-com`, `Repository: literate`, `Workflow
   filename: publish.yml`. Verified in the UI.
3. **The npm token deleted.** Per ADR-035's trust posture —
   the bootstrap token is a one-shot; all subsequent publishes
   run through OIDC.
4. **A `v0.1.0-alpha.2`-or-later tag has been pushed** to
   `athrio-com/literate` **after** step 2 completed, so that
   there exists a real CI `workflow_run` this session can
   inspect via `gh run view`.

Opening this session before step 4 would fail at the first
`gh run view` with "no runs found". The `session-start` Trope
surfaces this dependency check in its Pre-work block; if the
check fails, the session re-enters `Status: Planned` and the
Person is prompted to finish the bootstrap.

## Goals

*(All provisional per IMP-1.6. Gated at open; each Goal
transitions `(provisional)` → `Active` on Accept.)*

### Goal 1 — Verify `.github/workflows/publish.yml` shape

**Status:** (provisional)
**Topic:** Session 4 authored the workflow but did not run it.
Verify the file's shape against npm's current OIDC publishing
requirements (moving target — npm has bumped the minimum CLI
version for provenance several times in 2025–2026). The
`session-end` Trope is the authority on what "verified shape"
means, but concretely: `permissions.id-token: write` present;
`npm install -g npm@latest` step present (provenance needs
npm ≥ 11.5.1 per npm's 2026-Q1 docs); `actions/setup-node@v4`
with `registry-url: 'https://registry.npmjs.org'`;
`working-directory: packages/cli` on the publish step; tag
filter matches `v*` (broad) or `v0.*` (narrow) without
excluding valid release tags.

**Upstream:** Session 4 G1; ADR-035.
**Acceptance:**
- Workflow file inspected against the above spec; any
  missing field added via a gated edit.
- A live `workflow_run` (from dependency step 4 above)
  inspected via `gh run view --log`; provenance attestation
  present in the job summary; npm's `Publishing…` step
  includes the `--provenance` flag.
- `npm view @literate/cli@<pushed-version>` reports the
  published version with the provenance badge.

### Goal 2 — Post-publish install smoke job

**Status:** (provisional)
**Topic:** Add a second job in `publish.yml` (or a sibling
workflow) that runs after `publish` succeeds on a fresh
`ubuntu-latest` (and, separately, `windows-latest` for
parity with `install.ps1`). The job installs `@literate/cli`
from the live registry using the README's install command,
then asserts `literate --version` matches the pushed tag.
Catches the class of bug where the publish succeeds but the
install path is broken (PATH issues, missing bin symlink,
registry tag mismatch).

**Upstream:** Session 4 deferred ("Windows-native CI
verification" + "Docker-based fresh-env install
verification" in its `## Deferred / Discovered`).
**Acceptance:**
- New job (or workflow) runs on `push` of `v*` tags,
  depends on the `publish` job (`needs: publish`).
- Linux path: `curl … install.sh | sh`; verifies
  `literate --version` matches the tag.
- Windows path: `irm … install.ps1 | iex`; verifies
  `literate --version` matches the tag.
- Both jobs green on the next real tag push after this
  session closes.

### Goal 3 — Tag-to-version reconciliation

**Status:** (provisional)
**Topic:** Prevent the class of bug where a `v0.1.0-alpha.3`
tag gets pushed while `packages/cli/package.json`'s `version`
is still `0.1.0-alpha.2`. Either a workflow step that fails
if the two don't match, or a `bun run` pre-commit hook, or a
tiny `bun run check:version` script that tag-push is
conditioned on. One paragraph of trade-off analysis in the
session log picks the mechanism; no new ADR unless the choice
is load-bearing (see ADR-035's precedent for inlining
release-engineering decisions as session-log bullets).

**Upstream:** Session 4 (observed class of bug); general
release-engineering hygiene.
**Acceptance:**
- Chosen mechanism implemented and exercised on a fake tag
  push (e.g., a mismatched version on a draft branch); the
  check fails loudly; the mechanism is removed from the draft
  and the real `v*` tag succeeds.
- Decision captured as a `## Decisions Made` bullet in the
  session log.

### Goal 4 — Documentation pass

**Status:** (provisional)
**Topic:** Update the repo-root `README.md` "Status" callout
(currently says "the code here has never been published to
npm") to reflect live-on-npm status. Update `install.sh` +
`install.ps1` if any path assumptions broke during the G1 /
G2 verification. Update `packages/cli/README.md` if the
package-page content drifted (unlikely — it was authored to
be minimal in Session 5).

**Upstream:** Session 4 `## Deferred / Discovered` ("Update
the README Status callout"); G1, G2 findings.
**Acceptance:**
- `README.md` callout reflects live-on-npm status with a link
  to the npm package page.
- `install.sh` / `install.ps1` unchanged unless G1 / G2
  surfaced a concrete bug; in which case the fix is gated and
  applied.
- `packages/cli/README.md` unchanged unless the npm
  package-page rendering at live URL surfaced a concrete
  formatting bug.

## Hard out-of-scope

**Configuring Trusted Publisher on npmjs.com is a Person-action
item, not a code change.** The Person does this between the
bootstrap publish (Session 5's post-close action list) and this
session opening. Do **not** attempt to automate it — the npm
web UI has no public API for Trusted Publisher configuration at
the time of writing, and the bootstrap-then-configure-then-
automate flow is deliberate (prevents a race where the first
OIDC publish goes out before the trust anchor is in place).

**Compiled single binary via `bun build --compile` is not in
scope here.** It is deferred post-1.0 per ADR-035 and will
have its own session.

**No ADRs in this session.** The pipeline mechanics are
Session-4 continuation work; ADR-035 already covers the
distribution decision. If G3's tag-to-version reconciliation
grows beyond a session-log bullet (unlikely), it can author
its own ADR at that point.

## Notes

Session-start discipline reminder for whoever opens this:

- Re-gate every Goal above. The `Status: (provisional)` stamps
  are drafts; they land authoritatively only on Accept.
- Set Mode at open. G1 and G3 are Tangling (CI shape edits +
  new script derived from already-Accepted ADR-035). G2 is
  split (the workflow-file edit is Tangling; the smoke-assertion
  authoring is Weaving if the assertion shape is novel).
  G4 is editorial. A single Mode stamp at open probably
  suffices — re-stamp mid-session if G2's split matters.
- The dependency check above is load-bearing. If any of the
  four prerequisites are not true at open, re-Plan this
  session rather than opening it half-satisfied.
