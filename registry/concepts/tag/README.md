# `tag` — Concept seed

The Tag Concept — brand-typed slug shape for cross-cut labels.
Schema constrains shape only (`/^#[a-z][a-z0-9-]*$/` branded
`'Tag'`); closed-set membership is enforced per-consumer via
the `closedTagSet(slugs)` helper. The slug-set authoring
convention lives at `corpus/tags.md` (LF's set) and at the
same relative path in a consumer's corpus.
