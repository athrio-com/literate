# @literate/cli

Literate Framework CLI — the harness binding for `Protocol.continue`.

## Install

Literate runs on [Bun](https://bun.sh). Installation is via
Bun's package manager directly.

**If you have Bun:**

```sh
bun install -g @literate/cli
literate init my-project
```

**If you don't:**

```sh
curl -fsSL https://bun.sh/install | bash
bun install -g @literate/cli
literate init my-project
```

Windows users: install Bun via the
[Windows installer](https://bun.sh/docs/installation#windows)
or use WSL, then run the same `bun install -g` command.

### Per-project pinning

```sh
bun add --dev @literate/cli
```

Then `bun install` (run by collaborators on clone) resolves
the pinned version; invoke via `bun run literate`.

## Quick start

```sh
literate init my-project
cd my-project
literate continue .
```

## Docs

Full Protocol, ADRs, and session corpus live in the repo:
<https://github.com/athrio-com/literate>.

Distribution rationale:
[ADR-038](https://github.com/athrio-com/literate/blob/main/corpus/decisions/ADR-038-bun-direct-install-path.md).

## License

MIT OR Apache-2.0.
