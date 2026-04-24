# `tag` — Concept seed

The Tag Concept — slugged labels used on ADRs (and forward,
on other authored prose) for cross-cut search and conflict
detection. Promoted from `corpus/categories/tags.md`; splits
the legacy file: type-level shape becomes this Concept; LF's
specific slug instances move to `corpus/tags.md` as authored
content.

## Shape

```typescript
type Tag = string  // narrowed: matches /^#[a-z][a-z0-9-]*$/, branded 'Tag'
```

Schema constrains shape only. Closed-set membership is
enforced per-consumer (see [`concept.mdx`](./concept.mdx) for
`closedTagSet(slugs)` and the `tag-flow` forward).

## Files in this seed

- **`concept.mdx`** — the prose body. Defines the type-vs-
  instance split, the brand-typed Schema, the
  `closedTagSet(slugs)` helper, and the per-consumer slug-set
  authoring convention.
- **`index.ts`** — `TagSchema` (brand-typed `Schema.String`
  with the slug-shape `Schema.pattern`), `TAG_SLUG_PATTERN`
  exported for forward `tag-flow` use, `closedTagSet(slugs)`
  helper, and the `Concept<Tag>` value.

## Tangled into a consumer's repo

`literate tangle concepts tag`.

## Used by

- The `adr` parent Concept composes `Schema.Array(TagSchema)`
  as the `tags` field of `ADRSchema`.
- LF's own slug set lives at `corpus/tags.md`; consumers
  author their own at the same relative path in their corpus.
