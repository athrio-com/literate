# `lfm` — seed metadata (framework-dev)

Framework-dev only. Not woven into a consumer's `LITERATE.md`.

## Files in this seed

- **`concept.mdx`** — prose body. Shape, file format, the
  self-sufficiency rule, hash mechanics, the soft-link grammar,
  the LFM-as-Trope-instance framing, and the mutability split
  vs sessions.
- **`index.ts`** — TypeScript binding: `LFMSchema` composing
  `DispositionSchema` + `LayerSchema` + `LFMStatusSchema`; the
  `Concept<LFM>` value bound to the prose.
- **`README.md`** — one-paragraph user-facing summary.

## Tangled into a consumer's repo

`literate tangle concepts lfm` places these files at
`.literate/concepts/lfm/{concept.mdx, index.ts, README.md, SEED.md}`.

## Used by

- **`tropes/lfm`** — the Trope that authors LFM instances.
- **`tropes/reconcile`** — walks LFMs.
- **`tropes/index`** — navigation summary.
- **All LFM files** at `corpus/manifests/<layer>/.../<domain>.md` —
  every LFM is an instance of this Concept.
