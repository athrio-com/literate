# `implication` — Concept seed

A typed *soft Goal*. An Implication is something the work has
surfaced that *might* become a Goal — here, in a future
session, or not at all. Parallel machinery to Goal; different
status set; different gating profile.

## Shape

```typescript
interface Implication {
  readonly _tag: 'Implication'
  readonly id: string
  readonly status: 'Surfaced' | 'Promoted' | 'Filed' | 'Dismissed'
  readonly rationale?: string  // Schema-required when status='Dismissed'
}
```

`Surfaced` is non-terminal; the other three are terminal. The
`session-end` Trope's validator refuses to close a session
with any non-terminal Implication.

See [`concept.mdx`](./concept.mdx) for the full prose, the
status semantics, and the rationale-required-on-Dismissed
Schema invariant.

## Files in this seed

- **`concept.mdx`** — prose body. Defines the four statuses,
  the Implication-vs-Goal contrast, the Mode interactions,
  and the Schema invariant.
- **`index.ts`** — typed Effect `Schema`
  (`ImplicationStatusSchema`, `ImplicationSchema` with the
  rationale refinement), an `isTerminalImplication`
  predicate the session-end validator uses, and the
  `Concept<Implication>` value.

## Tangled into a consumer's repo

`literate tangle concepts implication` places these files at
`.literate/concepts/implication/{concept.mdx, index.ts, README.md}`
and updates `.literate/manifest.json`.

## Used by

- `session-end`'s `validateStep` (extended in this Concept's
  authoring session) refuses to close on a non-terminal
  Implication; failures surface as the existing
  `SessionEndIncomplete` aggregate with an
  `Implication[<id>].terminal-status` line in `missing`.
- Forward: `concept-session` extends to carry
  `implications: ReadonlyArray<Implication>` (append-only
  journal field added in this Concept's session).
- Forward: a dedicated `trope-implication-flow` (deferred at
  v0.1) will provide typed Steps for the surface →
  promote / file / dismiss transitions; v0.1 ships the
  Concept + the session-end validator only.
