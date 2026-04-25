# @literate/cli

The Literate Framework CLI. Wraps prose as executable,
composable, memoised programs; the corpus stays pure markdown.

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

Windows: use Bun's
[Windows installer](https://bun.sh/docs/installation#windows)
or WSL, then run the same `bun install -g` command.

### Per-project pinning

```sh
bun add --dev @literate/cli
```

Then `bun install` (run on clone) resolves the pinned version;
invoke via `bun run literate`.

## Quick start

```sh
literate init my-project
cd my-project
literate continue .
```

## Docs

Full repo, corpus, and source:
<https://github.com/athrio-com/literate>.

## License

MIT OR Apache-2.0.
