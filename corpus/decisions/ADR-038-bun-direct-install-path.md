# ADR-038 — Bun-direct as canonical install path

**Status:** Accepted
**Date:** 2026-04-25
**Tags:** `#release` `#tooling` `#self-hosting` `#migration`
**Supersedes:** ADR-036
**Superseded by:** —

## Context

ADR-035 committed LF's 0.1.0-alpha install surface to a dual
shell-script bootstrap (`install.sh` for POSIX, `install.ps1`
for Windows). A bug in `install.sh`'s rc-edit logic — it
short-circuited when PATH was already set in the script's own
process, so the `~/.bun/bin` PATH export never landed in the
consumer's shell config — produced a Docker `bash -l -c
"literate --version"` failure that pointed at PATH propagation
fragility. ADR-036 read that failure as a structural distribution-
path flaw and pivoted the install surface to mise. That reading
was wrong on two counts.

First, the failure was a wrapper-script bug, not a flaw in
`bun install -g`. Re-running the verification without any
wrapper — `curl -fsSL https://bun.sh/install | bash; export
PATH="$HOME/.bun/bin:$PATH"; bun install -g @literate/cli;
literate --version` — succeeds end-to-end on fresh
`ubuntu:24.04`. Bun's own installer configures `~/.bun/bin`
on PATH for interactive shells (writing to `.bashrc`,
`.zshrc`, etc.); the canonical user flow opens a shell where
this has already happened. The shebang `#!/usr/bin/env bun`
resolves correctly because Bun was the tool that installed
the binary in the first place — Bun and `literate` live in
the same `~/.bun/bin` directory and Bun's PATH setup covers
both.

Second, ADR-036's mise direction surfaced its own structural
problem: `mise use -g` silently overrides users' existing
global tool versions. Installing `@literate/cli` via mise
required also declaring `node@latest` and `bun@latest` in the
same invocation — and because mise's `-g` semantics are "this
is now your global version of these tools", users with
existing pinned Node or Bun versions would have those silently
clobbered. A CLI install reaching into the user's other tool
configurations is a trust violation.

ADR-035 → ADR-036 conflated two different problems:
wrapper-script bugs (real; resolved by removing the wrapper)
and install-vector flaws (assumed; not present in
`bun install -g`). The correction subtracts complexity rather
than adding more: runtime and install vector are now the
same tool. ADR-029 (Bun-only runtime) is reinforced — the
runtime *is* the package manager.

## Decision

**`bun install -g @literate/cli` is the canonical install
command.** No mise, no shell scripts, no shim layer, no wrapper.

The two-step path for users without Bun:

```sh
curl -fsSL https://bun.sh/install | bash
bun install -g @literate/cli
```

We point users at Bun's official installer; we do not wrap it.
Bun's installer handles PATH propagation across shells via
its own well-tested rc-edit logic. The `literate` binary lands
at `~/.bun/bin/literate` and is on PATH for any interactive
shell where Bun has been installed.

Per-project pinning is standard JS-project hygiene: declare
`@literate/cli` as a dev dep in `package.json` (`bun add --dev
@literate/cli`); collaborators get the pinned version on
`bun install`; invoke via `bun run literate` to use the
project-pinned binary in preference to any global one. No
framework-specific machinery; the per-project surface uses
Bun's standard package-manager semantics.

The `@literate/cli` publish surface on npm is unaffected.
Trusted Publishing via GitHub Actions OIDC continues per
ADR-035's npm-publish clauses (those clauses survived
ADR-036's supersession and remain in force under ADR-038).

A separate repo-root document, `INSTALL_PROMPT.md`, packages
the manual install path as a paste-into-agent prompt for users
who want a coding agent to perform the install. The prompt is
a wrapper over the manual path — same instructions, agent
context. The manual path is canonical; the agent prompt does
not fork it.

## Consequences

**Positive:**

- **Three-line install path.** No shell scripts to maintain;
  no tool-manager dependency; no rc-edit logic in our code;
  no decision tree of supported install vectors. The user runs
  `bun install -g @literate/cli` and is done.
- **No silent global pollution.** `bun install -g` installs one
  binary at `~/.bun/bin/literate` and changes nothing else
  about the user's environment. Users with existing Node, Bun,
  or other tool versions are not touched.
- **Cross-shell PATH propagation handled upstream.** Bun's
  installer is the canonical authority on getting Bun on
  PATH across shells. We rely on it; we do not duplicate or
  patch it.
- **Shebang resolves cleanly.** `#!/usr/bin/env bun` requires
  Bun on PATH at every `literate` invocation. Bun is on PATH
  in any shell where Bun has been installed via Bun's
  installer — same shell, same PATH, same Bun.
- **Runtime and package manager unified.** ADR-029 commits
  Bun as runtime; ADR-038 commits Bun as install vector. One
  tool, one mental model.

**Negative / accepted at 0.1.0-alpha:**

- **Two commands when Bun is absent.** A user without Bun
  runs the Bun installer first, then the LF install. Same
  shape as installing any other Bun-published CLI; not
  framework-specific.
- **Windows-native install paths through Bun's Windows
  installer.** Same as macOS / Linux conceptually — install
  Bun, then `bun install -g`. WSL users use the Linux path
  unchanged. Bun's Windows-native support has its own
  maturity curve; LF inherits whatever that curve currently
  produces.
- **No tool-manager integration out of the box.** Users on
  mise / asdf / volta who want project-scoped versions can
  declare `@literate/cli` as a dev dep in `package.json` and
  let their tool manager handle Bun separately. LF does not
  ship a `.tool-versions` or `.mise.toml` template; that's
  consumer-side configuration, not framework concern.

**Forward / explicitly deferred:**

- **Compiled single binary** via `bun build --compile`.
  Deferred post-1.0 since ADR-035; ADR-038 keeps that posture.
  Would decouple install surface from Bun-as-runtime
  entirely.
- **Homebrew / apt / aur packaging.** Community-driven per
  ADR-035 / ADR-036; unchanged under ADR-038.
- **Custom install-script domain** (e.g. `literate.dev/install`).
  Now moot — there is no install script; the install URL is
  `bun.sh/install` (third-party) and `@literate/cli`
  (registry coordinate).

## Considered alternatives

mise as install layer (ADR-036, superseded): adds tool-manager
dependency and silent global Node clobber. Subtracted by
recognizing Bun is already the package manager.
Shell-scripted install (ADR-035 partial, superseded): rc-edit
logic introduced bugs the wrapper attempted to fix.
Subtracted by removing the wrapper.

Cite ADR-025 (npm distribution surface, unaffected), ADR-026
(registry mechanics, unaffected), ADR-029 (Bun-only runtime,
reinforced), ADR-034 (TLS-only trust posture, unaffected),
ADR-035 (install-surface clauses superseded since ADR-036;
npm-publish clauses remain in force under ADR-038), ADR-036
(superseded — install surface only; the same npm-publish
chain carries through).
