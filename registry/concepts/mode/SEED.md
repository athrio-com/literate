# `mode` — seed metadata (framework-dev)

Framework-dev only. Not woven into a consumer's `LITERATE.md`.

## Files in this seed

- **`concept.mdx`** — prose body. The three modes; the
  enactor axis (Agent vs CLI); discipline expectations per
  (Mode, enactor) pair; the Mode × Disposition product space.
- **`index.ts`** — typed `ModeSchema`; ergonomic constructors
  (`Mode.Exploring`, `Mode.Weaving`, `Mode.Tangling`); the
  `Enactor` schema (`'Agent' | 'CLI'`); `Concept<Mode>`.
- **`README.md`** — one-paragraph user-facing summary.

## Tangled into a consumer's repo

`literate tangle concepts mode`.

## Used by

- **IMP-N** in `corpus/CLAUDE.md` and the consumer's
  `CLAUDE.md` cite this Concept by name.
- `concepts/session` — `session.mode` is typed by
  `ModeSchema`.
- Cross-axis: `concepts/disposition`.
