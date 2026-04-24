# ADR-002 — Corpus → src → .literate invariant relation

**Date:** 2026-04-22
**Status:** Accepted (.literate/ clause superseded by ADR-024; src/ clause preserved)
**Tags:** `#corpus` `#protocol`

**Context:**

A methodology that governs both its own repo and every repo that
uses it needs a directory invariant that holds across modalities.
Without one, different consumers invent different folder layouts,
the CLI cannot operate mechanically, and agents cannot orient
themselves at session start. A single triple — one folder for prose
about the product, one for derived code, one for the framework
governance — resolves the ambiguity and lets the CLI, the agents,
and human readers all locate the same things in the same places.

**Decision:**

In every repo that uses LF, the invariant relation is:

```
corpus/   → src/
   ↑
.literate/  (the vendored LF snapshot; governs authoring)
```

- `corpus/` — prose defining what the product is and becomes (ADRs,
  specs, chapters, stories, sessions, categories, terms, memos).
- `src/` — derivative content (code, compiled docs, generated
  assets); derived from `corpus/`.
- `.literate/` — vendored LF snapshot: Concepts, Tropes, primitives.
  Guides agents and humans. Managed by the `literate` CLI (init,
  upgrade, add).

In LF's own repo the invariant collapses: the code surface that
plays the `src/` role is realised as `packages/*` (see ADR-009),
because LF the product is a set of npm-publishable workspace
packages. No vendored `.literate/` exists in LF's repo (see
ADR-007).

**Consequences:**

- Consumer repos contain `corpus/`, `src/`, and `.literate/` at the
  root. The CLI depends on this layout.
- `corpus/` is undotted (it is the main content of the repo).
  `.literate/` is dotted (it is framework plumbing, vendored, not
  directly authored).
- The `literate init` command creates all three folders.
- The `literate compile` command reads the consumer's manifest,
  resolves the Trope graph against LF, and writes `.literate/`.
- LF's own repo ships `corpus/` and `packages/*` (its `src/`
  realisation) but no `.literate/`. A maintainer opening LF reads
  the root `CLAUDE.md` to orient, then `corpus/CLAUDE.md` for
  Protocol rules.
