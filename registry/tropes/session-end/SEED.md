# `session-end` — seed metadata (framework-dev)

Framework-dev only. Not woven into a consumer's `LITERATE.md`.

## Files in this seed

- **`prose.mdx`** — imperative decomposition into five atomic
  Steps (read, validate, stamp-closed, update-index, return).
- **`concept.mdx`** — typed contract; the seven validations;
  preconditions and invariants preserved.
- **`index.ts`** — TypeScript composition of the five Steps
  into the composing `workflowStep`.
- **`README.md`** — one-paragraph user-facing summary.

## Tangled into a consumer's repo

`literate tangle tropes session-end`.

## Used by

- `@literate/cli`'s `close` verb (build-time bundled
  binding).
- `init`'s bootstrap session closure (the same machinery
  every subsequent session uses).
- Consumers' own validation extensions or session-end
  automation that wraps this composition.
