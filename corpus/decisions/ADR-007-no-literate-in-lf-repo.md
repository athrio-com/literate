# ADR-007 — LF's own repo has no .literate/ folder

**Date:** 2026-04-22
**Status:** Accepted
**Tags:** `#self-hosting` `#protocol`

**Context:**

The invariant relation (ADR-002) says every LF-using repo has
`corpus/`, `src/`, and `.literate/`. LF's own repo is LF-using by
definition: LF is authored with LF's own rules. Applied naively, this
implies LF's repo should also carry a `.literate/` folder — a
vendored snapshot of some previous LF version that governs the
repo's authoring.

That naive application introduces a bootstrap problem. On day one
there is no previous LF version to vendor. A contrived solution — LF
vendors a snapshot of itself at each release into its own
`.literate/` — adds a folder whose content is mechanically redundant
with `src/` (minus a version lag). The folder costs maintenance; it
buys nothing a maintainer cannot already read from `src/`.

A cleaner resolution: LF's repo collapses the invariant. `src/` *is*
what `.literate/` is compiled from for consumers. Maintainers read
`src/` directly. There is no snapshot to vendor against yourself.

The question this resolution opens is how maintainer agents orient
at session start. The answer is a root `CLAUDE.md` that explicitly
names this situation — LF is self-hosted, the `.literate/` folder is
intentionally absent, Protocol source is in `src/`, project prose is
in `corpus/` — and delegates Protocol rules to `corpus/CLAUDE.md`
(operational) and `LITERATE.md` (ship surface).

**Decision:**

LF's own repository has no `.literate/` folder. The invariant
(ADR-002) collapses here. Maintainer orientation is handled by two
files:

- Root `CLAUDE.md` — names the collapse explicitly, points to the
  other two files, short.
- `corpus/CLAUDE.md` — operational Protocol rules for LF-project
  work (session lifecycle, mutability, gating, tag vocabulary).

Consumer repos still follow the full invariant with all three
folders. The `literate init` CLI creates `.literate/` in consumer
repos; LF's own repo is explicitly excluded from this rule.

**Consequences:**

- The repo has two `CLAUDE.md` files (root + `corpus/`) plus a
  third in `src/templates/minimal/` for the consumer-facing template.
- The `literate check` CLI verb, when run inside LF's own repo,
  skips the `.literate/`-presence check that applies to consumer
  repos. The check keys off a marker in `package.json` (TBD) or
  the literal absence of a `"literate"` key combined with the
  presence of `src/concepts/`.
- Maintainer documentation points newcomers first to the root
  `CLAUDE.md`, then to `corpus/CLAUDE.md` and `LITERATE.md`. There
  is no "start from `.literate/`" path in this repo.
- LF's public site (`site/`) can render the Protocol prose directly
  from `src/concepts/` and `src/tropes/` rather than from a
  compiled `.literate/`.
