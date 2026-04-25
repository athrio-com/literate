# `reconcile` — seed metadata (framework-dev)

Framework-dev only. Not woven into a consumer's `LITERATE.md`.

## Files in this seed

- **`prose.mdx`** — imperative Trope decomposition (four
  Steps: walk-manifests, reconcile-each, update-references,
  build-report; plus a composition section).
- **`concept.mdx`** — typed contract: input/output, walk
  order, per-LFM procedure, hash-maintenance pass, errors,
  services.
- **`index.ts`** — TypeScript binding: Schemas (including the
  full `ReconcileReport` shape), the four Steps, and the
  `reconcile` Trope value bound to the prose.
- **`README.md`** — one-paragraph user-facing summary.

## Tangled into a consumer's repo

`literate tangle tropes reconcile` places these files at
`.literate/tropes/reconcile/{prose.mdx, concept.mdx, index.ts, README.md, SEED.md}`.

## Used by

- **The CLI's `reconcile` verb** — the bundled invoker.
- **`tropes/index`** — typically chained after `reconcile` so
  the produced index reflects the latest statuses.
