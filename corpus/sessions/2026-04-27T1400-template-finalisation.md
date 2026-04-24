# Session: 2026-04-27 — Template finalisation + registry trust

**Date:** 2026-04-27 (provisional; rename on open per IMP-1.5 if drift)
**Status:** Abandoned (2026-04-24T18:18 — superseded by chain `2026-04-24T1818-dissolve-categories-and-ship-scaffold` + `2026-04-24T2030-publish-and-install-scripts`; this log's three Goals expanded into S3-G2/S3-G3/S3-G4 with a new S3-G1 covering category dissolution + the S4 publish/install-scripts arc)
**Chapter:** — (no chapter yet)
**Agent:** (to be filled on open)
**Started:** (to be filled on open)
**Planned by:** corpus/sessions/2026-04-23T2100-ship-surface.md
**Depends on:** corpus/sessions/2026-04-25T0900-registry-and-cli-surface.md, corpus/sessions/2026-04-26T1400-mode-concept-and-imperative.md

## Goals

*Provisional — re-gate per IMP-1.6 at session open.*

### Goal 1 — Update `template-minimal` to the shadcn shape

**Topic:** Under ADR-025 seeds live in LF's own repo at
`registry/tropes/` and `registry/concepts/`, not as published
`@literate/trope-*` packages. `template-minimal` is the
consumer-seed recipe the CLI uses at `literate init minimal`.

What the minimal seed ships (per exploration §7 + ADR-024 +
ADR-025):

- `corpus/` with empty indexes (sessions/, decisions/, memos/,
  categories/).
- `.literate/extensions/.keep` (placeholder; role settled by
  P2's Goal 2).
- `CLAUDE.md` at repo root — a thin pointer to
  `.literate/LITERATE.md`. Optional automation; everything works
  without it.
- `literate.json` at repo root — consumer config (registries
  list, default agent, version pins).
- `package.json` — minimal consumer manifest; `@literate/cli` as
  dev dep (or not, if consumer installs the CLI globally).
- `README.md`, `.gitignore`, licence files as appropriate.
- No `.literate/` subtree shipped; the first `literate init`
  runs tangle over the seeded Tropes/Concepts and then weave
  over the resulting vendored tree, producing `.literate/tropes/
  ...`, `.literate/concepts/...`, `.literate/LITERATE.md`,
  `.literate/manifest.json`.

The template's seeded Trope set: at minimum `session-start`,
`session-end`, `goal-flow`, `implication-flow`. Concept set:
`session`, `goal`, `implication`, `mode`, `disposition`. Exact
default set resolved at session open.

**Upstream:** ADR-024 §7; ADR-025 §1–§6; exploration §7 + §13.8.

**Acceptance:**
- `registry/templates/minimal/` exists in LF's own repo
  carrying the scaffold files.
- `literate init minimal <target>` in a fresh tmp dir produces a
  ready-to-use LF-governed consumer repo.
- `literate continue .` in that repo reaches the gate without
  errors (integration smoke test).
- `.literate/LITERATE.md` after first weave includes IMP-N (Mode
  discipline) and the Disposition section.

### Goal 2 — Decide registry trust mechanics

**Topic:** When the CLI fetches a seed from a registry, what
trust guarantees apply? Candidates:

- **TLS-only** — trust the git source's HTTPS endpoint. Simplest;
  relies on the HTTPS PKI. v0.1 default candidate.
- **Content-addressable** — each seed's checksum is recorded in
  `.literate/manifest.json`; a re-fetch validates against the
  recorded hash.
- **Signed** — registries sign their seed files (GPG or
  sigstore); the CLI verifies signatures. Most robust; heaviest.

Pick one for v0.1, document the trade-offs, leave room for
upgrade.

**Upstream:** ADR-025 open question §5.

**Acceptance:** Decision recorded as a short ADR or inline
`## Decisions Made` bullet. If checksums or signatures are chosen,
the registry-directory convention from ADR-025 §4 extends to
include the trust artefacts.

### Goal 3 — MVP-2 closing: end-to-end smoke across the arc

**Topic:** An integration smoke test that exercises the full
arc delivered by P2–P8:

1. Scaffold `template-minimal` into a fresh tmp dir (via
   `literate init minimal`).
2. `literate continue .` opens a session; Mode set to Exploring
   via scripted stdin; Implication surfaced.
3. Mode shifted to Weaving via gated transition; a Goal drafted
   and Accepted (under the gate); Implication promoted to Goal
   status.
4. Session closed (`literate close`); session-end validates
   Goal + Plan + Implication terminal states.
5. `literate weave` verified idempotent (running twice produces
   byte-identical `.literate/`).
6. `literate update` on one seed re-fetches and overwrites a
   vendored file; consumer's git sees the diff.

**Upstream:** Whole P2–P8 arc.

**Acceptance:** Integration test passes; becomes the MVP-2
capstone demonstrating LF is runnable end-to-end under the
shadcn pivot.
