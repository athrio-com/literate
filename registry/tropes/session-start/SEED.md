# `session-start` — seed metadata (framework-dev)

Framework-dev only. Not woven into a consumer's `LITERATE.md`.

## Files in this seed

- **`prose.mdx`** — imperative decomposition into ten atomic
  Steps; each section binds to one Step via `prose +
  section:` slicing.
- **`concept.mdx`** — typed contract this Trope realises.
- **`index.ts`** — TypeScript composition of the ten atomic
  Steps into the composing `workflowStep`.
- **`README.md`** — one-paragraph user-facing summary.

## Tangled into a consumer's repo

`literate tangle tropes session-start`.

## Used by

- `@literate/cli`'s `continue` verb (build-time bundled
  binding).
- Consumers' own Step compositions that wrap or extend the
  session-start contract (the vendored copy is theirs to
  edit).
