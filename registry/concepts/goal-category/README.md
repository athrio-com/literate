# `goal-category` — Concept seed

The closed vocabulary of `Category:` values a session-Goal can
carry. Promoted from `corpus/categories/goal-category.md`;
adds `decision-only` to name Goals whose Acceptance is a
single ADR with no code change.

## Shape

```typescript
type GoalCategory =
  | 'exploration' | 'feature' | 'bugfix' | 'refactor'
  | 'prose' | 'process' | 'migration' | 'decision-only'
```

See [`concept.mdx`](./concept.mdx) for the per-member semantics.

## Files in this seed

- **`concept.mdx`** — the prose body.
- **`index.ts`** — `GoalCategorySchema`, the `GoalCategory`
  ergonomic constructor namespace, and the
  `Concept<GoalCategory>` value.

## Tangled into a consumer's repo

`literate tangle concepts goal-category`.

## Used by

- The `goal` parent Concept composes `GoalCategorySchema` as
  the `category` field of `GoalSchema`.
