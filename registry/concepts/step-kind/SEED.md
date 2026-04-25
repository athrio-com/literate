# `step-kind` — seed metadata (framework-dev)

Framework-dev only. Not woven into a consumer's `LITERATE.md`.

## Files in this seed

- **`concept.mdx`** — prose body. Per-member semantics; the
  morphisms between kinds.
- **`index.ts`** — `StepKindSchema`; ergonomic constructor
  namespace; `Concept<StepKind>`.
- **`README.md`** — one-paragraph user-facing summary.

## Tangled into a consumer's repo

`literate tangle concepts step-kind`.

## Used by

- `concepts/step` — `step.kind` is typed by `StepKindSchema`.
- The runtime `StepKind` enumeration in `@literate/core`'s
  `step.ts` is the load-bearing implementation surface.
