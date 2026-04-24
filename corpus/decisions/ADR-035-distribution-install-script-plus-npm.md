# ADR-035 — Distribution: install scripts + npm

**Status:** Accepted
**Date:** 2026-04-24
**Tags:** `#release` `#tooling` `#self-hosting`
**Supersedes:** —
**Superseded by:** —

## Context

ADR-025 commits LF to a shadcn-shaped distribution: only
`@literate/cli` publishes to npm; Tropes/Concepts ship as
registry seeds vendored into consumer repos. ADR-029 commits
the CLI to Bun-only at runtime (`engines.bun`, `target: 'bun'`,
`#!/usr/bin/env bun`). What ADR-025 + ADR-029 leave open is
the **install entry point a consumer types** at the
command-line — what comes before `literate init my-project`.

Three candidate install surfaces were on the table at
0.1.0-alpha:

- **`bun add -g @literate/cli`** — requires the user to
  already have Bun. Excludes anyone who's never installed Bun
  and creates an awkward "first install Bun, then install
  LF" two-step.
- **Compiled single binary** (`bun build --compile`) —
  produces a self-contained executable per OS/arch. Zero
  runtime dependencies. Heaviest distribution surface
  (multiple per-arch builds, hosting the binaries, signing,
  release automation). Right answer eventually; wrong answer
  for 0.1.0-alpha.
- **Shell-script installer that bootstraps Bun then
  `bun add -g @literate/cli`** — single command, handles the
  Bun bootstrap automatically, mirrors the install pattern
  Bun itself uses (`curl -fsSL https://bun.sh/install | bash`).
  Two scripts (`install.sh` for POSIX, `install.ps1` for
  Windows) cover the supported OS matrix.

The shell-script approach is the same shape Bun, Rust
(`rustup`), Deno, Mise, and several other developer-tool
projects use. It's familiar, debuggable, and trivially
extensible (the script can pin a version, set up shell
completion, install plugins) without changing the
distribution surface.

## Decision

**The canonical install path at 0.1.0-alpha is the dual
shell-script + npm surface.** Three documented ways:

1. **POSIX (macOS / Linux):**

   ```sh
   curl -fsSL https://raw.githubusercontent.com/athrio-com/literate/main/install.sh | sh
   ```

   `install.sh` lives at the repo root. It detects the OS
   (rejects Windows with a pointer to `install.ps1`),
   bootstraps Bun via `https://bun.sh/install` if absent,
   then runs `bun add -g @literate/cli` (optionally pinned
   via `sh -s -- @<version>`).

2. **Windows (PowerShell):**

   ```powershell
   irm https://raw.githubusercontent.com/athrio-com/literate/main/install.ps1 | iex
   ```

   `install.ps1` lives at the repo root. Same logic adapted
   to PowerShell idioms; bootstraps Bun via
   `https://bun.sh/install.ps1` if absent. Windows-native
   Bun is best-effort at 0.1.0-alpha; macOS / Linux are
   the verified targets.

3. **Direct (any OS with Bun already installed):**

   ```sh
   bun add -g @literate/cli
   ```

   Documented as a fallback. Functionally identical to what
   the install scripts run after Bun is in place.

`@literate/cli` publishes to npm via GitHub Actions Trusted
Publishing (OIDC). The publish workflow lives at
`.github/workflows/publish.yml`; it triggers on `v*` tags,
runs `bun install` / `bun test` / `bun run build`, and
invokes `npm publish --provenance --access public` with
`id-token: write`. No npm token in repo secrets.

The `raw.githubusercontent.com/athrio-com/literate/main/`
URL is the install-script-fetch base for 0.1.0-alpha. A
custom domain (e.g. `literate.dev/install.sh`) is deferred
until adoption warrants it.

## Consequences

**Positive:**

- **Single command per OS to "I have `literate`."** No
  prerequisites beyond `curl` (or PowerShell). The Bun
  bootstrap is invisible to the user.
- **No new release automation.** GitHub Actions Trusted
  Publishing is one workflow file; tag and push triggers
  the publish.
- **Familiar shape.** Matches Bun's, Rust's, Deno's,
  Mise's install patterns; existing developer reflex applies.
- **Forward-compatible.** A future compiled-single-binary
  release (post-1.0) can land alongside without changing
  the script surface; the script can detect and prefer the
  binary if available.

**Negative / accepted at 0.1.0-alpha:**

- **`curl … | sh` is a trust delegation.** Users running
  the script trust GitHub's TLS chain + the `athrio-com/literate`
  repo's main branch + the script's contents. Same
  posture as Bun's own installer. Per ADR-034, registry
  trust at v0.1 is TLS-only; the install-script trust
  posture is consistent.
- **GitHub-coupled URL.** If we move the repo, the
  install-script URLs change. Acceptable tradeoff at
  0.1.0-alpha; a custom domain (deferred) decouples this
  later.
- **Manual one-time npm setup.** The npm `@literate` org
  must exist with Trusted Publishing configured (OIDC trust
  to the GitHub repo + workflow filename). The repo
  maintainer does this once on npm's web UI before the first
  publish; CI cannot do it.
- **Windows-native verification deferred.** The
  `install.ps1` script is authored to known-good
  PowerShell idioms but not exercised in CI at 0.1.0-alpha.
  Consumers reporting Windows issues will guide a future
  hardening pass.

**Forward / explicitly deferred:**

- **Compiled single binary** via `bun build --compile`.
  Right answer post-1.0 once the API surface stabilises.
  No commitment to timing.
- **Custom install-script domain** (e.g.
  `literate.dev/install.sh`). Deferred until adoption +
  brand warrant the cost of running the redirect.
- **Signed releases / Sigstore attestations** beyond what
  npm's `--provenance` flag already records. Per ADR-034,
  the trust posture at 0.1.0-alpha is intentionally minimal.
- **Mise / asdf / Homebrew / apt / aur** packaging.
  Community-driven; LF won't author or maintain these at
  0.1.0-alpha.
- **Windows CI verification.** A `windows-latest` runner
  in `.github/workflows/publish.yml` (or a separate smoke
  workflow) would catch Windows-specific install
  regressions. Deferred until either CI or a Windows user
  reports breakage.

Cite ADR-025 (npm distribution), ADR-029 (Bun-only runtime),
ADR-034 (registry trust = TLS-only). This ADR commits the
install surface; ADR-026's registry mechanics and ADR-024's
`.literate/` consumer-repo shape are unaffected.
