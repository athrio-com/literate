# Literate Framework

> **Pre-release · experimental.** Research baseline. No published
> artifacts, no API stability, no support guarantees.

The Literate Framework (LF) treats prose interleaved with code as the
single source of truth, in the literate-programming tradition established
by Knuth (1984, *The Computer Journal* 27(2)). A `literate` CLI tangles
the code from Manifests into runnable artifacts and weaves the prose into
readable documentation.

## Layout

- [`./corpus/`](./corpus/) — Manifests (Concepts and Tropes). Empty at
  this baseline; the first Manifests will be authored here.
- [`./CLAUDE.md`](./CLAUDE.md) — orientation for AI collaborators.
- [`./.literate/LITERATE.md`](./.literate/LITERATE.md) — operational protocol.

## Status

Reset to the LP-revision baseline. Prior scaffolding is archived locally
under `temp/legacy/` (gitignored) and remains accessible via git history.
The next step is the seed `tangle` CLI and the first Concept Manifests.

## Licence

Dual-licensed under [MIT](./LICENSE-MIT) and [Apache-2.0](./LICENSE-APACHE).
