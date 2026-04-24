# `adr` — Concept seed

The typed shape of an Architecture Decision Record. Composes
[`adr-status`](../adr-status/) and [`tag`](../tag/) as typed
properties.

## Shape

```typescript
interface ADR {
  readonly _tag: 'ADR'
  readonly number: number
  readonly title: string
  readonly status: ADRStatus
  readonly tags: ReadonlyArray<Tag>
  readonly date?: string
  readonly supersedes?: ReadonlyArray<number>
  readonly supersededBy?: ReadonlyArray<number>
}
```

See [`concept.mdx`](./concept.mdx) for the on-disk header
convention and the IMP-6 mutability profile.

## Files in this seed

- **`concept.mdx`** — the prose body.
- **`index.ts`** — `ADRSchema` (importing `ADRStatusSchema` +
  `TagSchema`) and the `Concept<ADR>` value.

## Tangled into a consumer's repo

`literate tangle concepts adr`.

The consumer also tangles `adr-status` and `tag` (or
authors their own slug set in `corpus/tags.md`).

## Used by

- The (forward) `adr-flow` Trope will compose this Concept
  for typed draft-and-gate flow.
- The (forward) consumer-side ADR-index validator can use
  `ADRSchema` for typed parsing of `corpus/decisions/`
  contents.
