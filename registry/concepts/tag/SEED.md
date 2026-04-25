# `tag` — seed metadata (framework-dev)

Framework-dev only. Not woven into a consumer's `LITERATE.md`.

## Files in this seed

- **`concept.mdx`** — prose body. Type-vs-instance split;
  brand-typed Schema; `closedTagSet(slugs)` helper; per-
  consumer slug-set authoring convention.
- **`index.ts`** — `TagSchema` (brand-typed `Schema.String`
  with `Schema.pattern`); `TAG_SLUG_PATTERN`;
  `closedTagSet(slugs)`; `Concept<Tag>`.
- **`README.md`** — one-paragraph user-facing summary.

## Tangled into a consumer's repo

`literate tangle concepts tag`.

## Used by

- A consumer's authored slug set (typically
  `corpus/tags.md`).
- Anywhere a sub-axis beyond Disposition is useful (LFM
  metadata, session annotations, prose surfaces).
