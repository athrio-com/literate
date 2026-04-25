# `goal-status` — seed metadata (framework-dev)

Framework-dev only. Not woven into a consumer's `LITERATE.md`.

## Files in this seed

- **`concept.mdx`** — prose body. Transition rules; the
  `session-end` validation hook.
- **`index.ts`** — `GoalStatusBaseSchema`,
  `GoalStatusSchema` (Union), ergonomic constructor namespace,
  `isTerminalGoalStatus(raw)` predicate,
  `Concept<GoalStatus>`.
- **`README.md`** — one-paragraph user-facing summary.

## Tangled into a consumer's repo

`literate tangle concepts goal-status`.

## Used by

- `concepts/goal` — `goal.status` is typed by
  `GoalStatusSchema`.
- `tropes/session-end` — imports `isTerminalGoalStatus` for
  the close-time validator.
