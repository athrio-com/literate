# `session` — Concept seed

The Session instance Concept. Declares the typed shape of an
LF session — its log path, slug, `Status` lifecycle, agent
identity, timestamps, and the three optional cross-axis fields
(`disposition`, `mode`, `implications`) added by ADR-031,
ADR-032, and ADR-033.

Distinct from `session-start-procedure` and
`session-end-procedure`, which declare the typed contracts for
the *operations* that open and close a session. This Concept
declares the shape of the *session instance* itself.

## Shape (highlights)

```typescript
interface Session {
  readonly _tag: 'Session'
  readonly path: string
  readonly slug: string
  readonly date: string
  readonly status: 'Planned' | 'Open' | 'Closed' | 'Abandoned'
  readonly agent?: string
  readonly startedAt?: string
  readonly closedAt?: string
  readonly disposition?: Disposition
  readonly mode?: Mode
  readonly implications?: ReadonlyArray<Implication>
}
```

`disposition`, `mode`, and `implications` are optional at
v0.1 to preserve backward compatibility with existing logs.
See [`concept.mdx`](./concept.mdx) for the Status semantics
and the deferred forward-mandatory plans.

## Files in this seed

- **`concept.mdx`** — prose body. Status semantics; the three
  optional cross-axis fields and their defaults; backward-
  compatibility notes for legacy session logs.
- **`index.ts`** — typed Effect `Schema` (`SessionStatusSchema`,
  `SessionSchema`), the `SessionStatus` ergonomic constructor,
  and the `Concept<Session>` value. Imports `DispositionSchema`,
  `ModeSchema`, and `ImplicationSchema` from sibling Concept
  seeds.

## Tangled into a consumer's repo

`literate tangle concepts session` places these files at
`.literate/concepts/session/{concept.mdx, index.ts, README.md}`.
The Concept is a passive type surface at v0.1 (the
session-lifecycle Tropes operate over markdown directly);
forward of v0.1 a parsing helper here may decode a log into a
typed `Session` value.

## Used by

- `concept-disposition`, `concept-mode`, `concept-implication`
  — sibling Concepts that this one composes via Schema
  imports.
- Forward: `session-start` Trope's pending Mode-setting and
  Disposition-setting Steps.
- Forward: `session-end` Trope's pending Mode-transition
  validator. The Implication validator is already active in
  this Concept's authoring session.
