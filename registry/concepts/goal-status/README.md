# `goal-status` — Concept seed

The closed vocabulary of `Status:` values a session-Goal can
carry. Promoted from `corpus/categories/goal-status.md`.

## Shape

```typescript
type GoalStatus =
  | 'Active' | 'Completed' | 'Abandoned'
  | `Superseded by Goal ${number}` (open string family)
```

See [`concept.mdx`](./concept.mdx) for the transitions and the
`session-end` validation hook.

## Files in this seed

- **`concept.mdx`** — the prose body.
- **`index.ts`** — `GoalStatusBaseSchema`, `GoalStatusSchema`
  (the Union), `GoalStatus` ergonomic constructor namespace,
  `isTerminalGoalStatus(raw)` predicate, and the
  `Concept<GoalStatus>` value.

## Tangled into a consumer's repo

`literate tangle concepts goal-status`.

## Used by

- The `goal` parent Concept composes `GoalStatusSchema` as
  the `status` field of `GoalSchema`.
- `registry/tropes/session-end/index.ts` imports
  `isTerminalGoalStatus` for its post-G1 validator.
