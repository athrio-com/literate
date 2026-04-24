# `session-status` — Concept seed

The closed vocabulary of `Status:` values a session log can
carry. Promoted from `corpus/categories/session-status.md`;
replaces the inline `SessionStatusSchema` previously declared
in `registry/concepts/session/index.ts`.

## Shape

```typescript
type SessionStatus = 'Planned' | 'Open' | 'Closed' | 'Abandoned'
```

See [`concept.mdx`](./concept.mdx) for the lifecycle diagrams,
the `Closed (timestamp)` / `Abandoned (rationale)` suffix
convention, and the v0.1 mutability profile.

## Files in this seed

- **`concept.mdx`** — the prose body.
- **`index.ts`** — `SessionStatusSchema` (`Schema.Literal`),
  the `SessionStatus` ergonomic constructor namespace,
  `parseSessionStatusBase(raw)` for stripping on-disk
  timestamp / rationale suffixes, `isTerminalSessionStatus(raw)`
  predicate, and the `Concept<SessionStatus>` value.

## Tangled into a consumer's repo

`literate tangle concepts session-status`.

## Used by

- `registry/concepts/session/index.ts` imports
  `SessionStatusSchema` for the `status` field of
  `SessionSchema` (post-G1; supersedes the inline declaration
  from Session 2026-04-24T1712).
