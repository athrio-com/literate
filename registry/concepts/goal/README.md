# `goal` — Concept seed

The typed shape of a session-Goal. Composes
[`goal-status`](../goal-status/) and
[`goal-category`](../goal-category/) as typed properties.

## Shape

```typescript
interface Goal {
  readonly _tag: 'Goal'
  readonly number: number
  readonly title: string
  readonly status: GoalStatus
  readonly category: GoalCategory
  readonly topic: string
  readonly upstream: string
  readonly scope?: ReadonlyArray<string>
  readonly outOfScope?: ReadonlyArray<string>
  readonly acceptance?: ReadonlyArray<string>
  readonly notes?: string
}
```

See [`concept.mdx`](./concept.mdx) for the on-disk shape and
the v0.1 passive-type-surface profile.

## Files in this seed

- **`concept.mdx`** — the prose body.
- **`index.ts`** — `GoalSchema` (importing
  `GoalStatusSchema` + `GoalCategorySchema`) and the
  `Concept<Goal>` value.

## Tangled into a consumer's repo

`literate tangle concepts goal`.

Tangling `goal` does **not** automatically tangle
`goal-status` and `goal-category` — the manifest tracks
explicit dependencies forward; for v0.1 the consumer tangles
each seed they need. (Forward question: implicit dependency
tangling. Deferred.)
