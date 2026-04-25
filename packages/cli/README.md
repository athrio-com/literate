# @literate/cli

Literate Framework CLI — the harness binding for `Protocol.continue`.

## Install

Distributed via [mise](https://mise.jdx.dev) for consistent
installation across shells and platforms (macOS, Linux, Windows
including WSL).

If you don't already have mise:

```sh
curl https://mise.run | sh
eval "$(~/.local/bin/mise activate bash)"   # or zsh / fish / pwsh
```

Then install Literate together with its required runtime:

```sh
mise use -g node@latest bun@latest npm:@literate/cli
```

`node` is needed so mise can query npm metadata; `bun` is the
runtime `literate`'s shebang executes under.

## Quick start

```sh
literate init my-project
cd my-project
literate continue .
```

## Docs

Full Protocol, ADRs, and session corpus live in the repo:
<https://github.com/athrio-com/literate>.

## License

MIT OR Apache-2.0.
