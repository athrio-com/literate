# Literate Framework

**Prose-first, gated, AI-collaborative software authoring.**

Literate Framework (LF) is a methodology and toolkit for building software
where *prose is the source*. Architectural decisions, behavioural
specifications, chapter plans, persona stories, and session logs are the
primary artefacts. Implementation code is derived from prose by an AI
collaborator, with a person authoring meaning and gating every piece of
new prose before anything downstream follows.

LF differs from Knuth's classical Literate Programming in two pragmatic
ways: prose and code live in separate files (no interleaving), and the
AI replaces the mechanical `tangle` step. The weave output is the prose
corpus itself.

## The algebra

LF is a three-level algebra. Everything in the framework fits one of
these levels:

```
Concept         (interface — declares what something IS)
    ↓ realized by
Trope           (class — describes HOW the Concept is done in LF;
                        prose-first, with Effect Schema backing)
    ↓ instantiated by consumers as
Authored        (file in consumer's corpus, matching the Trope's shape)
```

**Concepts** declare LF's own metalanguage (what a session is, what
a decision is, what a category is). **Tropes** realize each Concept
with prose and schema. Concepts come in two scopes (ADR-010): at
the LF level they ship as TypeScript packages
(`@literate/concept-*`); at the corpus level consumers author their
own as markdown files at `corpus/concepts/<slug>.md`. Same shape,
same machinery, different scope.

## The invariant relation

In every repo that uses LF:

```
corpus/   → src/
   ↑
.literate/  (the vendored LF snapshot — governs authoring)
```

- `corpus/` — prose defining what the product is and becomes.
- `src/` — derivative content (code, compiled docs); derived from corpus.
- `.literate/` — vendored LF: Concepts, Tropes, primitives; guides the
  AI collaborator and humans alike. Managed by the `literate` CLI.

In LF's own repo the invariant collapses: the `src/` role is
realised as `packages/*` workspace packages (LF the product is a
set of typed, npm-publishable units), so no vendored `.literate/`
exists here. See ADR-002 and ADR-009.

## What's in this repo

- `LITERATE.md` — the authoritative Protocol.
- `corpus/` — LF's project-scope prose (decisions, sessions,
  categories, concepts).
- `packages/core` — `@literate/core`: algebra primitives
  (`Concept`, `Trope`, `Subkind`, `Member`), MDX prose loader,
  typed graph composer, manifest schema.
- `packages/concept-*` — seven Concept packages
  (`@literate/concept-concept`, `-trope`, `-corpus`, `-session`,
  `-decisions`, `-category`, `-chapters`).
- `packages/trope-*` — nine Trope packages (canonical realisations
  + workflow Tropes) with typed cross-imports and Effect Schemas.
- `packages/template-minimal` — `@literate/template-minimal`, the
  starter scaffold the CLI's `init` copies.
- `packages/cli` — `@literate/cli`, the CLI built with
  `@effect/cli`, `@effect/platform`, and the bundled Trope
  catalog.
- `site/` — the public documentation site (Next.js); reads MDX
  from `packages/*` and `site/content/`.

## CLI verbs (v0.1)

- `literate init [template]` — scaffold a new consumer repo.
- `literate add trope <id>` — install a Trope into the consumer's
  manifest and recompile.
- `literate compile` — recompile `.literate/` from the manifest.
- `literate check` — validate the consumer's corpus against installed
  Tropes.
- `literate version` — print LF version and installed Tropes.

## Licensing

LF uses a multi-license model so the framework itself stays maximally
permissive while each template can carry its own license:

- **Framework core** (CLI, protocol specs, core prose) is dual-licensed
  under [`MIT`](./LICENSE-MIT) **OR** [`Apache-2.0`](./LICENSE-APACHE).
  The Rust-ecosystem convention: MIT for simplicity, Apache-2.0 for an
  explicit patent grant. Use either or both.
- **Templates** each carry their own `LICENSE`. Default is MIT so
  scaffolded projects stay unencumbered. Templates may replace it;
  generated projects may replace it again.

In LF, prose *is* the source. People and organisations adopting LF
adapt the prose to their context — that is the whole point.
Permissive licensing lets the practice flow freely.

See [`NOTICE`](./NOTICE) for attribution.
