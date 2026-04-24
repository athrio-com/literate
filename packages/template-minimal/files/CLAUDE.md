# CLAUDE — entry pointer

This repository is governed by the **Literate Framework (LF)**.
Before any action, read **`.literate/LITERATE.md`** for the
Protocol prose, the session lifecycle, and the gating rules.

If `.literate/LITERATE.md` is missing, run `literate weave` to
materialise it from the vendored Tropes/Concepts under
`.literate/{tropes,concepts}/` and consumer customisations
under `.literate/extensions/`. Run `literate init` first if the
repo has no `.literate/manifest.json` yet.

The consumer's **Product** prose (ADRs, specs, sessions, etc.
about what this repo builds) lives in `corpus/`. The
**Protocol** prose (how LF operates this repo) lives in
`.literate/LITERATE.md` plus `.literate/extensions/`.

This pointer file carries no imperatives or Protocol prose of
its own; it is here so agents whose convention is to read
`CLAUDE.md` first land at the authoritative Protocol surface.
