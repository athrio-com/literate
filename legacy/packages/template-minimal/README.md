# @literate/template-minimal

The bare LF consumer scaffold. Used by `literate init minimal`.

## What it ships

The `tree/` folder contains the files copied into the consumer's
target directory:

- `corpus/` with empty indexes for `decisions/`, `categories/`,
  `sessions/`.
- `package.json` declaring the `"literate"` manifest with the
  default Trope set.
- `CLAUDE.md`, `README.md`, `.gitignore`, `LICENSE`.

After copy, the CLI runs `compile` to materialise `.literate/`.

The `src/` folder exports `templateRoot`, the absolute path the CLI
imports.
