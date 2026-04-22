# ADR-003 — Dual MIT / Apache-2.0 framework; MIT templates

**Date:** 2026-04-22
**Status:** Accepted
**Tags:** `#licensing`

**Context:**

LF's deliberate premise is that prose is the source. Consumers who
adopt LF will adapt its prose — renaming categories, tuning gating
rules, extending schemas — for their context. That adaptation is the
framework's core value. A copyleft licence (GPL, AGPL) would
weaponise against the very thing that makes LF useful: adaptation
into closed or semi-closed environments would be legally fraught,
and the ordinary act of "rename this Trope to fit our project" could
trigger license questions.

Separately, the framework is a genuinely novel arrangement of known
ideas. Without an explicit patent grant, a contributor could
theoretically hold a patent on some clever piece of the machinery
and enforce it against other users. Apache-2.0 closes this gap with
its explicit patent grant and retaliation clause. MIT does not.

Templates are a different artefact. A template ships a shape that
consumers embed into their own projects. The licence on the template
file itself should not encumber the generated project. A template's
`LICENSE` file is a default that consumers may and often do replace.

**Decision:**

- **Framework core** — the top-level repo, the `packages/core`
  library, the `packages/cli` binary, the Concept and Trope files
  in `src/`, the compiled `LITERATE.md`, the schemas, and the
  site — is dual-licensed under **MIT OR Apache-2.0**. Both licence
  files are present at the repo root (`LICENSE-MIT`,
  `LICENSE-APACHE`). Attribution lives in `NOTICE`.
- **Templates** in `src/templates/*` each ship their own `LICENSE`
  file. The default is **MIT**. Consumers scaffolding with the CLI
  may replace the template's `LICENSE` file for their generated
  project without further obligation.

Consumers may choose either MIT or Apache-2.0 for the framework
core; they do not need to honour both simultaneously.

**Consequences:**

- The repo ships `LICENSE-MIT` and `LICENSE-APACHE` at root, plus
  `NOTICE` for Apache attribution.
- The dual-licence choice is documented in `README.md` with the
  rationale (patent grant + permissive adaptation).
- `package.json` declares `"license": "(MIT OR Apache-2.0)"` at the
  root and in each workspace package.
- Future templates will each ship their own `LICENSE` file. Removal
  of the default MIT licence from a template requires a gated
  decision.
- Relicensing future LF versions is possible; the author retains
  copyright. Existing releases remain under their original dual
  licence.
