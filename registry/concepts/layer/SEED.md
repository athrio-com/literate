# `layer` — seed metadata (framework-dev)

Framework-dev only. Not woven into a consumer's `LITERATE.md`.

## Files in this seed

- **`concept.mdx`** — prose body. Names the four top-level kinds,
  the no-prefix rule, the recursion rule, and the "when to add a
  sub-layer" guidance.
- **`index.ts`** — TypeScript binding: `LayerKindSchema` (closed
  enum of four literals) and `LayerSchema` (struct of `kind` +
  `path` + `holds`).
- **`README.md`** — one-paragraph user-facing summary.

## Tangled into a consumer's repo

`literate tangle concepts layer` places these files at
`.literate/concepts/layer/{concept.mdx, index.ts, README.md, SEED.md}`.

## Used by

- **`concepts/lfm`** — `lfm.layer` is typed by `LayerSchema`.
- **`concepts/dispositional-domain`** — Domains are scoped within a
  Layer.
- **`tropes/reconcile`** — declares the canonical walk order over
  the Layer tree.
- **`tropes/index`** — Layer hierarchy is the primary grouping in
  the produced index.
