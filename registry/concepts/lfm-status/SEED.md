# `lfm-status` — seed metadata (framework-dev)

This file is **framework-dev only**. It does not appear in a
consumer's woven `LITERATE.md`. The user-facing summary lives in
`README.md`; the operational prose lives in `concept.mdx`.

## Files in this seed

- **`concept.mdx`** — prose body. Names the four statuses, the
  transition table, and the operational-not-historical framing
  that distinguishes status from git history.
- **`index.ts`** — TypeScript binding: typed Effect Schema
  (`LFMStatusSchema`) as a closed `Schema.Union` of four literals;
  ergonomic constructors (`LFMStatus.Reconciled`, etc.); the
  `Concept<LFMStatus>` value bound to the prose via
  `prose(import.meta.url, './concept.mdx')`.
- **`README.md`** — one-paragraph user-facing summary.

## Tangled into a consumer's repo

`literate tangle concepts lfm-status` places these files at
`.literate/concepts/lfm-status/{concept.mdx, index.ts, README.md, SEED.md}`
and updates `.literate/manifest.json`.

## Used by

- **`concepts/lfm`** — `lfm.status` is typed by `LFMStatusSchema`.
- **`tropes/reconcile`** — sole writer of this field.
- **`tropes/index`** — emits a status column when present.
