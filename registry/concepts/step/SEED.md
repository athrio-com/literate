# `step` — seed metadata (framework-dev)

Framework-dev only. Not woven into a consumer's `LITERATE.md`.

## Files in this seed

- **`concept.mdx`** — prose body. Runtime-vs-declaration
  split.
- **`index.ts`** — `StepDeclarationSchema` (composes
  `StepKindSchema`); `Concept<StepDeclaration>`.
- **`README.md`** — one-paragraph user-facing summary.

## Tangled into a consumer's repo

`literate tangle concepts step`.

## Used by

- The runtime `Step<I, O, E, R>` interface in
  `@literate/core` realises this contract.
- Sibling Concept: `step-kind`.
