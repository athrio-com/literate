# `session` — seed metadata (framework-dev)

Framework-dev only. Not woven into a consumer's `LITERATE.md`.

## Files in this seed

- **`concept.mdx`** — prose body. Status semantics; the three
  optional cross-axis fields and their defaults; backward-
  compatibility notes for legacy session logs.
- **`index.ts`** — `SessionSchema` (composes
  `SessionStatusSchema`, `DispositionSchema`, `ModeSchema`,
  `ImplicationSchema`); `Concept<Session>`.
- **`README.md`** — one-paragraph user-facing summary.

## Tangled into a consumer's repo

`literate tangle concepts session`.

## Used by

- Sibling Concepts composed via Schema imports:
  `session-status`, `disposition`, `mode`, `implication`.
- Forward: typed-session decoders that parse a log into a
  `Session` value.
