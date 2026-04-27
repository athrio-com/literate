# `metadata` — seed metadata (framework-dev)

Framework-dev only. Not woven into a consumer's `LITERATE.md`.

## Files in this seed

- **`concept.mdx`** — prose body. The two wire forms (canonical
  `::metadata{...}` directive, legacy YAML `---`), the typed
  shape, the typical LFM fields, the rationale for retiring
  YAML, the resolution path through `learn`.
- **`index.ts`** — TypeScript binding: `MetadataSchema` (a
  `Schema.Record({ key: Schema.String, value: Schema.String })`)
  and the `Concept<Metadata>` value bound to the prose.
- **`README.md`** — one-paragraph user-facing summary.

## Tangled into a consumer's repo

`literate tangle concepts metadata` places these files at
`.literate/concepts/metadata/{concept.mdx, index.ts, README.md, SEED.md}`.

## Used by

- **`tropes/metadata`** — the Trope that parses and serialises
  metadata blocks in both the canonical directive form and the
  legacy YAML form.
- **`tropes/reconcile`** — invokes `tropes/metadata`'s parse /
  serialise helpers on every walked LFM; orchestrates the
  one-shot YAML → directive migration.
- **All LFMs** at `corpus/manifests/<layer>/<domain>.md` — each
  LFM's frontmatter is one Metadata-block instance.
