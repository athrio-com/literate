# Literate Framework

> **⚠️ Experimental · Pre-release.** This repository is an active
> research experiment, not a shipping product. The code here has
> never been published to npm, APIs turn over between sessions
> without notice, and there are no stability, security, or support
> guarantees. Do not depend on it in anything you cannot afford to
> rewrite. If you are evaluating LF, read the corpus
> (`corpus/manifests/` + `corpus/sessions/`) first — the manifests
> declare what is, the sessions record what was decided.

## What this is

The Literate Framework (LF) wraps prose as executable, composable,
memoised [Effect][effect] programs. Prose is the base case; AI
invocation is prose bound to an inference service; gates are prose
bound to Person decisions; everything else is prose bound to typed
computation. The corpus stays pure markdown.

## Where to look

- [`./CLAUDE.md`](./CLAUDE.md) — maintainer entry point.
- [`./corpus/CLAUDE.md`](./corpus/CLAUDE.md) — operational
  Protocol (session lifecycle, gating, NEVER list).
- [`./corpus/manifests/`](./corpus/manifests/) — current-state
  manifests. The framework's spine.
- [`./corpus/sessions/`](./corpus/sessions/) — append-only
  session-log record. Why decisions were made.
- [`./packages/`](./packages/) — the active `@literate/*`
  workspace: `cli`, `core`, `template-minimal`. Only
  `@literate/cli` publishes.
- [`./registry/`](./registry/) — canonical Tropes and Concepts
  as authored TS+MDX seeds. The CLI fetches from here on
  `tangle` / `update`.
- [`./legacy/`](./legacy/) — the frozen legacy scaffold,
  preserved verbatim as historical reference.

## Install

LF requires [Bun][bun] (the runtime *is* the package manager).
If you have Bun:

```sh
bun install -g @literate/cli
literate --version
literate init my-project
```

If you don't have Bun yet:

```sh
curl -fsSL https://bun.sh/install | bash
bun install -g @literate/cli
```

Windows: use Bun's Windows installer or WSL.

### Per-project pinning

```sh
bun add --dev @literate/cli
```

Then invoke via `bunx literate <verb>` or via a `package.json`
script.

### Asking an agent to install

Paste [`./INSTALL_PROMPT.md`](./INSTALL_PROMPT.md) into a
coding agent's chat. The prompt is bounded, explicit, and
idempotent: install Bun if absent; install `@literate/cli`;
verify; optionally `literate init`.

## Build (developing LF itself)

```sh
bun install
bun run typecheck
bun test
bun run build           # bundle @literate/cli to packages/cli/dist/
bun run smoke:e2e       # init → validate → weave-idempotence
bun run smoke:install   # hermetic local pack-and-install
```

The CLI bundles its `@literate/core` dependency and seed files
from `registry/` at build time, producing a single Bun-runnable
artefact at `packages/cli/dist/literate.js`.

### Using the CLI from this repo

Three ways to invoke `literate` from inside this repo while
hacking on LF itself:

**A. From the repo root (dev / hacking):**

```sh
bun run build                  # produces packages/cli/dist/literate.js
bun run literate -- --help     # `--` forwards flags to literate
bun run literate -- init ~/my-lf-project
```

No install, no PATH change. `bun run` forwards everything past
`--` to the binary.

**B. From a packed tarball (zero-install smoke):**

```sh
cd packages/cli && bun pm pack            # → literate-cli-0.1.0-alpha.1.tgz
TGZ="$(pwd)/literate-cli-0.1.0-alpha.1.tgz"
bunx --package="$TGZ" literate init ~/my-lf-project
```

**C. Global install of the locally-packed tarball:**

```sh
bun install -g "$(pwd)/literate-cli-0.1.0-alpha.1.tgz"
literate --help
```

The default registry is `bundled://` — seeds ship inside the CLI
package, so `init` / `tangle` work fully offline. To pull from a
remote registry instead, pass `--registry-url github:owner/repo`
or set `LITERATE_REGISTRY_URL`.

## License

Dual MIT / Apache-2.0. See [`./LICENSE-MIT`](./LICENSE-MIT),
[`./LICENSE-APACHE`](./LICENSE-APACHE).

[effect]: https://effect.website
[bun]: https://bun.sh
