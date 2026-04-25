# `disposition` — seed metadata (framework-dev)

Framework-dev only. Not woven into a consumer's `LITERATE.md`.

## Files in this seed

- **`concept.mdx`** — prose body. Defines the three bases with
  examples; explains Disposition vs Mode.
- **`index.ts`** — TypeScript binding: typed Effect Schema
  (`DispositionSchema`); ergonomic constructors
  (`Disposition.Product`, `Disposition.Protocol`,
  `Disposition.Infrastructure`); `Concept<Disposition>`.
- **`README.md`** — one-paragraph user-facing summary.

## Tangled into a consumer's repo

`literate tangle concepts disposition`.

## Used by

- `concepts/session` — `session.disposition` is typed by
  `DispositionSchema`.
- `concepts/lfm` — `lfm.disposition` is typed by
  `DispositionSchema`.
- Cross-axis: `concepts/mode` is the orthogonal
  operational-stance axis.
