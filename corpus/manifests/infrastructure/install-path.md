---
id: d666893b
disposition: { base: 'Infrastructure', scope: 'install-path' }
layer: { kind: 'infrastructure', path: 'infrastructure', holds: 'domains' }
domain: install-path
status: Reconciled
---

# Install Path

The canonical install command for the LF CLI is:

```
bun install -g @literate/cli
```

There is **no** shell-script bootstrap, **no** tool-manager
wrapper, **no** shim layer. Users who do not yet have Bun
installed run Bun's installer first
(`curl -fsSL https://bun.sh/install | bash` on Unix, or Bun's
Windows installer); then the global install above.

## Two-step path for users without Bun

```
curl -fsSL https://bun.sh/install | bash
bun install -g @literate/cli
```

Bun's installer handles cross-shell PATH setup. The CLI's
`#!/usr/bin/env bun` shebang resolves cleanly because Bun
itself is on PATH after step 1.

## Per-project pinning

A consumer who wants the CLI pinned to their project's
package.json (rather than installed globally) uses:

```
bun add --dev @literate/cli
```

Then invokes via `bunx literate <verb>` or via a package.json
script.

## Why direct, not via a tool manager

A prior install-path direction used `mise` as a wrapper:
`mise use -g npm:@literate/cli`. Two findings retired that
direction:

1. **Bun is the runtime.** `bun install -g` works directly
   without any wrapper. The wrapper-script failure that
   originally motivated `mise` was a bug in the wrapper's
   shell-rc-edit logic, not a flaw in `bun install -g`.
2. **`mise use -g` silently overrides users' existing global
   tool versions** (Node in particular). That is a real trust
   violation — installing the LF CLI should not change a
   user's `node` global. `bun install -g @literate/cli` does
   not touch the user's other globals.

The runtime *is* the package manager. `:lfm[cli-runtime]{hash=0a1c969d}`
`infrastructure/cli-runtime.md` declares Bun as the required
runtime; this LFM declares the install path that follows from
that.

## `INSTALL_PROMPT.md` for agents

A consumer who wants their coding agent to perform the install
pastes `INSTALL_PROMPT.md` into the agent's chat. The prompt is
bounded, explicit, and idempotent: install Bun if absent;
install `@literate/cli`; verify; optionally `literate init`.

The prompt explicitly forbids the agent from invoking tool
managers, modifying shell-rc files beyond Bun's installer, or
installing other globals. Failure halts the agent (no
"creative" recovery).

## Forward: compiled binary

Post-1.0, Bun's compile-to-binary capability may package the
CLI as a single executable. That replaces the install path
with `curl -fsSL <release> -o /usr/local/bin/literate &&
chmod +x …` and removes the Bun-runtime requirement at the
install surface. For v0.1, the Bun-direct path is canonical.

```path
INSTALL_PROMPT.md
```

```path
packages/cli/package.json
```

```path
README.md
```
