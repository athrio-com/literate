# `session-end` — Trope seed

The Protocol-mode workflow Trope that closes an LF session.
Realises the `session-end-procedure` Concept.

## What it does

Reads the session log at `sessionPath`, runs the seven
validations listed in `concept.mdx#validations` (Goals
terminal, `## Summary` populated, Plan entries terminal, etc.),
and either raises `SessionEndIncomplete { missing }` (the
session stays Open until the caller addresses every gap) or
stamps `Status: Closed (YYYY-MM-DDTHH:MM)` atomically and
updates the `corpus/sessions/sessions.md` index row.

The procedural decomposition is in [`prose.mdx`](./prose.mdx);
the typed contract is in [`concept.mdx`](./concept.mdx).

## Files in this seed

- **`index.ts`** — TypeScript composition of five atomic Steps
  (read, validate, stamp, update-index, return). Imports from
  `@literate/core`.
- **`concept.mdx`** — the typed contract this Trope realises.
- **`prose.mdx`** — the procedural decomposition; each section
  binds to one atomic Step.

## Tangled into a consumer's repo

`literate tangle tropes session-end` places these three files
at `.literate/tropes/session-end/{index.ts, prose.mdx,
README.md}`. The CLI uses its bundled Trope logic for `literate
close`, not the consumer's vendored copy (ADR-026 §4).

## Used by

- `@literate/cli`'s `close` verb (build-time import).
- Consumers' own validation extensions or session-end automation
  that wraps this composition.
