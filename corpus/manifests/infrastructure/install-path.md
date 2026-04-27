::metadata{id=6ee10bd5, disposition={ base: 'Infrastructure', scope: 'install-path' }, layer={ kind: 'infrastructure', path: 'infrastructure', holds: 'domains' }, domain=install-path, status=Reconciled}

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

The runtime *is* the package manager.
`:lfm[cli-runtime]{hash=0a1c969d}` `infrastructure/cli-runtime.md`
declares Bun as the required runtime; `bun install -g` is the
install command Bun ships, so the install path collapses onto
the runtime with no wrapper layer.

Two properties keep the path direct:

1. **No tool-manager wrappers.** Tool managers that resolve
   global packages (e.g. `mise use -g npm:<pkg>`) silently
   shadow other global tools (Node in particular). Installing
   the LF CLI must not change a user's `node` global or any
   other tool already on PATH; `bun install -g` touches only
   Bun's own global namespace.
2. **No shell-rc edits beyond Bun's installer.** Bun's
   official installer handles cross-shell PATH setup; the LF
   install path adds nothing on top. A user's shell-rc files
   are written only by the Bun installer step, not by anything
   LF ships.

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
