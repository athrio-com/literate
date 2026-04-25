# ADR-036 — Mise as canonical install path

**Status:** Accepted
**Date:** 2026-04-25
**Tags:** `#release` `#tooling` `#self-hosting` `#migration`
**Supersedes:** ADR-035
**Superseded by:** —

## Context

ADR-035 committed LF's 0.1.0-alpha install surface to a dual
shell-script bootstrap (`install.sh` for POSIX, `install.ps1`
for Windows) that bootstrapped Bun and then ran
`bun add -g @literate/cli`. After `@literate/[email protected]`
shipped to npm and the development-machine self-test passed, a
fresh-environment verification under `docker run --rm
ubuntu:24.04 bash -l -c "literate --version"` failed:

```
/usr/bin/env: 'bun': No such file or directory
```

`~/.bun/bin/literate` exists as a symlink, but the
`#!/usr/bin/env bun` shebang cannot resolve Bun because Bun is
not on the invocation shell's PATH. Three structural problems
underlie this failure mode, none addressable by changes confined
to `install.sh`:

1. **PATH propagation is shell-config-dependent and fragile.**
   Bun's installer writes only to `.bashrc`. Login shells
   (`.profile` / `.bash_profile`) do not source `.bashrc` and so
   never see Bun on PATH. `install.sh`'s rc-edit logic was
   intended to compensate but returned early when PATH was
   already set in the script's own process — the rc edit never
   landed in the consumer's shell config.

2. **`bin/literate`'s `#!/usr/bin/env bun` shebang requires Bun
   on PATH at every invocation.** Cron, IDE-spawned shells,
   non-login `bash -c`, and any shim chain that doesn't
   re-source the shell's PATH all break. Even with PATH
   correctly set in interactive shells, the shebang pathway is
   the load-bearing requirement and is the most likely to
   diverge across consumer environments.

3. **Windows is an untested matrix** — `install.ps1` only
   handles native PowerShell; many Windows developers default to
   WSL, Git Bash, or cmd, and would silently miss the supported
   path. CI verification on `windows-latest` was deferred under
   ADR-035 §"Forward / explicitly deferred"; the gap remains.

[mise](https://mise.jdx.dev) resolves all three. It is a shim
layer above shells: one activation per shell (cross-shell by
design — zsh, bash, fish, PowerShell, cmd, nushell, WSL); shims
that resolve the underlying tool at invocation time without
requiring it on PATH; first-class Windows support. mise
publishes via `npm:` plugins and treats global tool installs as
a managed surface, including Bun and `@literate/cli` as siblings
in the same shim chain.

## Decision

**mise is the canonical install path.** The 0.1.0-alpha install
surface becomes a one- or two-step sequence:

```sh
# If mise is not yet installed:
curl https://mise.run | sh

# Always:
mise use -g npm:@literate/cli
```

The dual `install.sh` / `install.ps1` shell-script approach
from ADR-035 is removed from the working tree. The
`raw.githubusercontent.com/athrio-com/literate/main/install.sh`
fetch URL is no longer published; consumers discovering LF via
the README land on the mise instructions only.

ADR-029 (Bun is the CLI's required runtime) is **unchanged**.
Bun stays the runtime; `engines.bun`, `target: 'bun'`, and the
`#!/usr/bin/env bun` shebang are all preserved. mise manages
only the install layer above the runtime: it installs Bun
transitively when resolving `npm:@literate/cli`'s execution
surface, and its shim chain handles Bun resolution at every
invocation without depending on consumer shell-config state.

The `@literate/cli` publish surface on npm is unaffected. Trusted
Publishing via GitHub Actions OIDC continues per ADR-035's npm
clauses; only the **client-side install surface** changes here.

## Consequences

**Positive:**

- **Cross-shell + cross-platform consistency.** zsh, bash, fish,
  PowerShell, cmd, nushell, and WSL all see the same shim chain
  with one consumer-side activation step. No shell-config
  branching in LF's own code.
- **Shebang fragility eliminated.** mise's shim resolves Bun at
  invocation time regardless of whether Bun is on the
  invocation shell's PATH; the `#!/usr/bin/env bun` shebang
  becomes a non-issue under the canonical install.
- **Removes maintenance burden.** `install.sh` and `install.ps1`
  go. No shellcheck / pwsh-lint queue, no Windows-CI smoke
  job for the installer, no rc-edit logic to maintain.
- **Per-project version pinning becomes available.** `mise use
  npm:@literate/[email protected]` writes `.mise.toml` to the
  repo root; collaborators with mise installed get the same
  version automatically.

**Negative / accepted at 0.1.0-alpha:**

- **One additional bootstrap layer for users without mise.** A
  user who has neither mise nor Bun runs two commands instead
  of one. mise's `curl https://mise.run | sh` is the same
  shape as Bun's own installer (`curl -fsSL https://bun.sh/install
  | bash`); the trust delegation posture is unchanged.
- **mise is a third-party project.** LF's install path now
  depends on mise's continued availability. Acceptable
  tradeoff: mise is widely adopted, OSS, and itself
  cross-shell — the alternatives all carried structural
  failure modes at the install layer that no first-party fix
  could resolve.
- **Windows-native CI verification still deferred.** mise has
  first-class Windows support but LF does not yet exercise it
  in CI. That gap is a Planned-session candidate, not a blocker
  for this ADR.

**Forward / explicitly deferred:**

- **Compiled single binary** via `bun build --compile`. ADR-035
  deferred this post-1.0; ADR-036 keeps that posture. A
  compiled binary would decouple the install surface from any
  runtime requirement entirely; mise would still be a valid
  install path but no longer the only one that worked
  cross-shell.
- **Wrapper-shim `bin/literate`** (`exec bun "$0.js" "$@"` over
  the shebang). Listed as ADR-037 candidate (a) for the case
  where mise's shim chain proves insufficient. ADR-037 fires
  only if Goal 2 of session
  `2026-04-25T0607-mise-canonical-install-path` surfaces a
  shebang issue under mise.
- **Homebrew / apt / aur packaging.** Community-driven per
  ADR-035. Unchanged.

## Considered alternatives

`bun add -g @literate/cli` plus a hand-rolled `install.sh` /
`install.ps1` (rejected: see Context — this is the ADR-035
posture, and its three structural failure modes (PATH
propagation, shebang fragility, Windows matrix) are not
resolvable at the script level. mise is the smallest change
that closes all three).

Cite ADR-025 (npm distribution surface), ADR-026 (registry
mechanics, unaffected), ADR-029 (Bun-only runtime, unaffected),
ADR-034 (TLS-only trust posture, unaffected), ADR-035
(superseded — install surface only; the npm-publish clauses
carry forward implicitly under ADR-036).
