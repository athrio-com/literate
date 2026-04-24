# Literate Framework

> **⚠️ Experimental · Pre-release.** This repository is an active
> research experiment, not a shipping product. The code here has
> never been published to npm, APIs turn over between sessions
> without notice, and there are no stability, security, or support
> guarantees. Do not depend on it in anything you cannot afford to
> rewrite. If you are evaluating LF, read the corpus
> (`corpus/decisions/` + `corpus/sessions/`) first — that is where
> intent lives; the code follows.

> **Status:** Post-S5/P2 stage. Distribution is shadcn-shaped per
> [ADR-025](./corpus/decisions/ADR-025-shadcn-shaped-distribution.md)
> + [ADR-026](./corpus/decisions/ADR-026-registry-mechanics-and-extensions-surface.md):
> `@literate/cli` is the sole npm artefact; Tropes and Concepts
> live as authored TS+MDX seeds under [`registry/`](./registry/)
> and are vendored into consumer repos via `literate tangle`. The
> CLI ships six verbs at v0.1 — `continue`, `close`, `init`,
> `tangle`, `weave`, `update`. The `@literate/core` Step substrate
> (ADR-011…ADR-014) is internal to the CLI bundle.
> **Predecessor:** the legacy `@literate/*` scaffold is preserved
> frozen at [`legacy/`](./legacy) per
> [ADR-018](./corpus/decisions/ADR-018-legacy-code-frozen-corpus-global.md)
> (scope relocated to `legacy/` by
> [ADR-020](./corpus/decisions/ADR-020-unify-monorepo-layout.md)).
> The rewrite shares the `@literate/` scope with the legacy per
> [ADR-019](./corpus/decisions/ADR-019-reinstate-literate-namespace.md)
> (supersedes ADR-016's `@athrio/*` choice); under ADR-025 only
> `@literate/cli` publishes.

## What this is

The Literate Framework (LF) is software that wraps prose as
executable, composable, memoised [Effect][effect] programs. Prose
is the base case; AI invocation is prose bound to an inference
service; gates are prose bound to Person decisions; everything
else is prose bound to typed computation. The corpus stays pure
markdown.

This repository is fully dedicated to LF. The active workspace is
the root `packages/*` (ADR-020, unifying the prior `framework/`
vs. root split). The coordination record — ADRs, sessions,
categories, concepts, specs — lives in the **global living corpus**
at [`./corpus/`](./corpus/).

## Where to look

- [`./CLAUDE.md`](./CLAUDE.md) — maintainer entry point.
- [`./corpus/CLAUDE.md`](./corpus/CLAUDE.md) — operational
  Protocol (session lifecycle, gating, NEVER list).
- [`./corpus/decisions/`](./corpus/decisions/) — all ADRs. Read
  ADR-011 through ADR-020 in numerical order for the rewrite-stage
  foundation.
- [`./packages/`](./packages/) — the active `@literate/*`
  workspace: `cli`, `core`, `template-minimal`. V0.1 publishes
  `@literate/cli` only.
- [`./registry/`](./registry/) — Tropes and Concepts as authored
  TS+MDX seeds (`registry/tropes/<id>/`, `registry/concepts/<id>/`).
  The CLI fetches from here on `tangle` / `update` and bundles
  these sources at build time for `continue` / `close`.
- [`./legacy/`](./legacy/) — the frozen legacy scaffold,
  preserved verbatim as historical reference (ADR-018 + ADR-020).

## Install

The canonical install path bootstraps Bun (per
[ADR-029](./corpus/decisions/ADR-029-bun-is-cli-required-runtime.md))
and installs `@literate/cli` globally. Per
[ADR-035](./corpus/decisions/ADR-035-distribution-install-script-plus-npm.md)
the dual install scripts below are the supported surface;
direct `bun add -g @literate/cli` works for users who already
have Bun.

**macOS / Linux:**

```sh
curl -fsSL https://raw.githubusercontent.com/athrio-com/literate/main/install.sh | sh
```

To pin a version:

```sh
curl -fsSL https://raw.githubusercontent.com/athrio-com/literate/main/install.sh \
  | sh -s -- @0.1.0-alpha.1
```

**Windows (PowerShell):**

```powershell
irm https://raw.githubusercontent.com/athrio-com/literate/main/install.ps1 | iex
```

Windows-native Bun is treated as best-effort at 0.1.0-alpha;
macOS / Linux are the verified targets.

**Direct (any OS with Bun):**

```sh
bun add -g @literate/cli
```

After install:

```sh
literate --version
literate init my-project        # scaffold a fresh LF repo
```

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
from `registry/` at build time (ADR-026 §4), producing a single
Bun-runnable artefact at `packages/cli/dist/literate.js` (ADR-029).

### Using the CLI from this repo

Three additional ways to invoke `literate` from inside this
repo (useful when hacking on LF itself):

**A. From the repo root (dev / hacking on LF):**

```sh
bun run build                             # produces packages/cli/dist/literate.js
bun run literate -- --help                # `--` forwards flags to literate
bun run literate -- init ~/my-lf-project
```

No install, no PATH change. Pass `-- <args>` after the script
name; `bun run` forwards everything past `--` to the binary.

**B. From a packed tarball (zero-install smoke — no global PATH
setup needed, `bunx` runs it ephemerally):**

```sh
cd packages/cli && bun pm pack            # → literate-cli-0.1.0-alpha.1.tgz
TGZ="$(pwd)/literate-cli-0.1.0-alpha.1.tgz"

# Does not need ~/.bun/bin on PATH:
bunx --package="$TGZ" literate init ~/my-lf-project
```

**C. Global install of the locally-packed tarball (once
`~/.bun/bin` is on PATH):**

```sh
bun install -g "$(pwd)/literate-cli-0.1.0-alpha.1.tgz"
literate --help
```

If `literate` isn't found after `bun install -g`, Bun's global
bin directory isn't on `PATH`. Either add
`export PATH="$HOME/.bun/bin:$PATH"` to your shell profile, or
use path **A** or **B** above — they don't need it.

The default registry is `bundled://` — seeds live inside the CLI
package, so `init` / `tangle` work fully offline. To pull from a
remote registry instead, pass `--registry-url github:owner/repo`
or set `LITERATE_REGISTRY_URL`.

## License

Dual MIT / Apache-2.0. See [`./LICENSE-MIT`](./LICENSE-MIT),
[`./LICENSE-APACHE`](./LICENSE-APACHE).

[effect]: https://effect.website
