# `adr-status` — Concept seed

The closed vocabulary of `Status:` values an Architecture
Decision Record can carry. Promoted from the legacy
`corpus/categories/adr-status.md` category file as part of the
category-dissolution refactor (S3 of the chain that ships LF
0.1.0-alpha).

## Shape

```typescript
type ADRStatus =
  | 'Open' | 'Accepted' | 'Deferred'
  | `Superseded by ADR-${number}` (open string family)
```

The `Superseded by ADR-NNN` family is encoded as a
`Schema.String` constrained by
`Schema.pattern(/^Superseded by ADR-\d+/)`. See
[`concept.mdx`](./concept.mdx) for the full prose, the
transition diagram, and the v0.1 deferred-enforcement note.

## Files in this seed

- **`concept.mdx`** — the prose body. Defines the four members,
  the Schema shape, the transition diagram, and the deferred
  Schema-level enforcement note.
- **`index.ts`** — TypeScript binding: `ADRStatusBaseSchema`,
  `ADRStatusSchema` (the Union), the `ADRStatus` ergonomic
  constructor namespace (`ADRStatus.Open`, `ADRStatus.supersededBy(31, 'note')`),
  the `isTerminalADRStatus(raw)` predicate, and the
  `Concept<ADRStatus>` value bound to the prose via
  `prose(import.meta.url, './concept.mdx')` per ADR-015.

## Tangled into a consumer's repo

`literate tangle concepts adr-status` places these files at
`.literate/concepts/adr-status/{concept.mdx, index.ts, README.md}`
and updates `.literate/manifest.json`. The vendored copy is the
consumer's; per ADR-026 §4 LF's CLI bundles its own copy for
any framework-side composition.

## Used by

- Forward: the `adr` parent Concept (see
  `registry/concepts/adr/`) composes `ADRStatusSchema` as the
  `status` field of `ADRSchema`.
- Forward: the (deferred) `adr-flow` Trope reads
  `isTerminalADRStatus` to validate ADR transitions.
