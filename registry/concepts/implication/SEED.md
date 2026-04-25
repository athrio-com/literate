# `implication` — seed metadata (framework-dev)

Framework-dev only. Not woven into a consumer's `LITERATE.md`.

## Files in this seed

- **`concept.mdx`** — prose body. Defines the four statuses,
  the Implication-vs-Goal contrast, the Mode interactions,
  and the Schema invariant.
- **`index.ts`** — `ImplicationStatusSchema`,
  `ImplicationSchema` with the rationale refinement,
  `isTerminalImplication` predicate, `Concept<Implication>`.
- **`README.md`** — one-paragraph user-facing summary.

## Tangled into a consumer's repo

`literate tangle concepts implication`.

## Used by

- `tropes/session-end` — `validateStep` refuses to close on a
  non-terminal Implication.
- `concepts/session` — `session.implications` is typed as
  `Schema.Array(ImplicationSchema)`.
