# `lfm` — seed metadata (framework-dev)

Framework-dev only. Not woven into a consumer's `LITERATE.md`.

## Files in this seed

- **`prose.mdx`** — imperative Trope decomposition (five Steps:
  author-body, compute-id, validate-self-sufficiency,
  write-file, update-references; plus a composition section).
- **`concept.mdx`** — typed contract: input shape, output
  shape, hash mechanics, reference-maintenance contract,
  self-sufficiency validation rules, errors, services.
- **`index.ts`** — TypeScript binding: Schemas, four primary
  Steps + the separately-exported `updateReferencesStep`;
  pure helpers `computeLfmId` and `rewriteAnnotations` exported
  for `reconcile`'s use.
- **`README.md`** — one-paragraph user-facing summary.

## Tangled into a consumer's repo

`literate tangle tropes lfm` places these files at
`.literate/tropes/lfm/{prose.mdx, concept.mdx, index.ts, README.md, SEED.md}`.

## Used by

- **`tropes/reconcile`** — calls `updateReferencesStep` and
  `computeLfmId` for hash maintenance.
- **The CLI's `init` verb** — included in the default
  `template-minimal` seed list.
