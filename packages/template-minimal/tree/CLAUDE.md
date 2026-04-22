# Project Entry Point

This repo uses the [Literate Framework](https://literate.dev).

## Where to read first

- `.literate/concepts/` — the seven Concepts (interfaces).
- `.literate/tropes/` — installed Tropes (realisations).
- `.literate/manifest.json` — what's installed and at what version.
- `corpus/decisions/decisions.md` — ADR index (initially empty).
- `corpus/sessions/sessions.md` — session log index (initially empty).

## Where to author

- `corpus/` — all your authored prose.
- `src/` — your product source. Derived from `corpus/` under LF's
  prose-first discipline.

## Principles

1. **Prose before code.** Draft the prose (ADR, session Goal, spec)
   before the code it motivates.
2. **Gate every new piece of authored prose.** Accept / Correct /
   Clarify / Reject.
3. **Append-only ADR bodies.** Once accepted, only the `Status:`
   line is mutable.
4. **Closed vocabularies.** Use only tags and values declared in
   `corpus/categories/`.
