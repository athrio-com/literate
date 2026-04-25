# `index` — seed metadata (framework-dev)

Framework-dev only. Not woven into a consumer's `LITERATE.md`.

## Files in this seed

- **`prose.mdx`** — imperative Trope decomposition (four
  Steps: walk-manifests, read-entries, render-document,
  write-index; plus a composition section).
- **`concept.mdx`** — typed contract, the index document
  shape, walk order, idempotence guarantee, errors.
- **`index.ts`** — TypeScript binding: Schemas, the four
  Steps, the `index` Trope value bound to the prose.
- **`README.md`** — one-paragraph user-facing summary.

## Tangled into a consumer's repo

`literate tangle tropes index` places these files at
`.literate/tropes/index/{prose.mdx, concept.mdx, index.ts, README.md, SEED.md}`.

## Used by

- **The CLI's `reconcile` verb** (or a future aggregator) —
  typically chained after `reconcile` so the produced index
  reflects the latest statuses.
- **Direct invocation** — a consumer can run the Trope
  directly via a custom verb or a programmatic call.
