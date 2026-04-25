# `goal` — seed metadata (framework-dev)

Framework-dev only. Not woven into a consumer's `LITERATE.md`.

## Files in this seed

- **`concept.mdx`** — prose body. The on-disk shape; the v0.1
  passive-type-surface profile.
- **`index.ts`** — `GoalSchema` (composes `GoalStatusSchema` +
  `GoalCategorySchema`); `Concept<Goal>`.
- **`README.md`** — one-paragraph user-facing summary.

## Tangled into a consumer's repo

`literate tangle concepts goal`. Tangling does not transitively
fetch `goal-status` and `goal-category` — list each seed
explicitly.

## Used by

- Sibling Concepts: `goal-status`, `goal-category`.
- Forward: `goal-flow` Trope (deferred).
