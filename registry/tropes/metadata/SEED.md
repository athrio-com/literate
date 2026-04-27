# `metadata` — seed metadata (framework-dev)

Framework-dev only. Not woven into a consumer's `LITERATE.md`.

## Files in this seed

- **`trope.mdx`** — imperative decomposition. Parse / serialise
  / validate / composition.
- **`index.ts`** — TypeScript binding: pure parse / serialise
  helpers (`parseMetadataBlock`, `parseMetadataDirective`,
  `parseYamlFrontmatter`, `splitDirectiveAttrs`,
  `serialiseMetadataBlock`); the `validateMetadataStep` and the
  composing `metadataStep`; the `metadataTrope` value bound to
  `MetadataConcept`.
- **`README.md`** — one-paragraph user-facing summary.

## Tangled into a consumer's repo

`literate tangle tropes metadata` places these files at
`.literate/tropes/metadata/{trope.mdx, index.ts, README.md, SEED.md}`.

## Used by

- **`tropes/reconcile`** — calls `parseMetadataBlock` to read
  every walked LFM's frontmatter; calls `serialiseMetadataBlock`
  on every write; the migration step rewrites legacy YAML
  blocks to the directive form by parsing → serialising.
- **Future typed prose surfaces** — any new authored prose
  surface that wants typed head-of-file metadata uses this
  Trope's helpers rather than re-implementing them.
