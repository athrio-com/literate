# `dispositional-domain` — seed metadata (framework-dev)

Framework-dev only. Not woven into a consumer's `LITERATE.md`.

## Files in this seed

- **`concept.mdx`** — prose body. Names the granularity rule,
  the Layer-scoped namespace, and the Domain vs Concept vs Spec
  distinction.
- **`index.ts`** — TypeScript binding: `DispositionalDomainSchema`
  composing `LayerSchema` + a `name` string.
- **`README.md`** — one-paragraph user-facing summary.

## Tangled into a consumer's repo

`literate tangle concepts dispositional-domain` places these files
at `.literate/concepts/dispositional-domain/{concept.mdx, index.ts,
README.md, SEED.md}`.

## Used by

- **`concepts/lfm`** — `lfm.domain` references a Domain.
- **`concepts/layer`** — Layers contain Domains (or sub-layers
  that contain Domains).
- **`tropes/reconcile`** — walks Domains in alphabetical order
  within each Layer.
