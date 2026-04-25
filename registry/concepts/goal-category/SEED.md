# `goal-category` — seed metadata (framework-dev)

Framework-dev only. Not woven into a consumer's `LITERATE.md`.

## Files in this seed

- **`concept.mdx`** — prose body. Per-member semantics.
- **`index.ts`** — `GoalCategorySchema`; ergonomic
  constructor namespace; `Concept<GoalCategory>`.
- **`README.md`** — one-paragraph user-facing summary.

## Tangled into a consumer's repo

`literate tangle concepts goal-category`.

## Used by

- `concepts/goal` — `goal.category` is typed by
  `GoalCategorySchema`.
