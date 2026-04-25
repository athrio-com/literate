# `session-status` — seed metadata (framework-dev)

Framework-dev only. Not woven into a consumer's `LITERATE.md`.

## Files in this seed

- **`concept.mdx`** — prose body. Lifecycle diagrams; the
  `Closed (timestamp)` / `Abandoned (rationale)` suffix
  convention; the v0.1 mutability profile.
- **`index.ts`** — `SessionStatusSchema` (`Schema.Literal`),
  `parseSessionStatusBase(raw)` to strip on-disk suffixes,
  `isTerminalSessionStatus(raw)` predicate,
  `Concept<SessionStatus>`.
- **`README.md`** — one-paragraph user-facing summary.

## Tangled into a consumer's repo

`literate tangle concepts session-status`.

## Used by

- `concepts/session` — `session.status` is typed by
  `SessionStatusSchema`.
- `tropes/session-end` — validates the transition.
