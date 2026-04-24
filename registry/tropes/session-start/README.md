# `session-start` — Trope seed

The Protocol-mode workflow Trope that opens an LF session.
Realises the `session-start-procedure` Concept.

## What it does

Detects the start path (spontaneous, planned, or open-orphan) by
reading `corpus/sessions/`, opens the chosen log with `Status:
Open` and a populated header, surfaces prior context into a
`## Pre-work` block, and (on the planned path) re-gates each
provisional Goal before stamping it `Status: Active`.

The procedural decomposition is in [`prose.mdx`](./prose.mdx);
the typed contract is in [`concept.mdx`](./concept.mdx).

## Files in this seed

- **`index.ts`** — TypeScript composition of ten atomic Steps
  into the composing `workflowStep`. Imports from `@literate/core`.
- **`concept.mdx`** — the typed contract this Trope realises.
- **`prose.mdx`** — the procedural decomposition; each section
  binds to one atomic Step via `prose(import.meta.url, …)`
  + section slicing per ADR-015.

## Tangled into a consumer's repo

`literate tangle tropes session-start` places these three files
at `.literate/tropes/session-start/{index.ts, prose.mdx,
README.md}` and updates `.literate/manifest.json`. The
consumer's vendored copy is theirs to edit; per ADR-026 §4 the
CLI uses its bundled Trope logic for `literate continue`, not
the vendored copy. The vendored TS is reference scaffolding for
the consumer's own scripts and for prose-level customisation
discoverable by agents reading the source.

## Used by

- `@literate/cli`'s `continue` verb (build-time import).
- Consumers' own Step compositions that wrap or extend the
  session-start contract (their concern; vendored TS is the
  starting point).
