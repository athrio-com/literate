# ADR-006 — Concepts at LF level are functorial with Terms at corpus level

**Date:** 2026-04-22
**Status:** Superseded by ADR-010
**Tags:** `#algebra` `#corpus`

**Context:**

Two adjacent requirements appeared in the founding discussion. First,
LF needs a metalanguage to declare its own kinds (session, decisions,
category, term, corpus, chapters). That metalanguage has to be
explicit so that extending LF — adding a new kind, swapping a
realisation, subkinding an existing kind — has a clear surface.
Second, consumers need a reserved-vocabulary mechanism inside their
own prose: named, capitalised Terms with definitions, cross-references,
and gated material revisions.

The relationship between these two requirements is structural, not
coincidental. A Concept at the LF level is a "reserved kind" whose
realisation is fixed by LF. A Term at the corpus level is a "reserved
entry" whose realisation is authored by the consumer. Both want the
same machinery: typed schema, declared dependencies, gated creation,
editorial revisions ungated, cross-reference resolution. The shape
is identical; the scope differs.

**Decision:**

Concepts and Terms are functorial:

```
LF level:      Concept  ──► Trope
Corpus level:  Term     ──► (authored definition, references)
```

Same shape, different modality. LF ships one Concept per reserved
kind (`concept`, `trope`, `session`, `decisions`, `category`, `term`,
`corpus`, `chapters`). Each Concept has a canonical realising Trope.
Consumers author Terms inside their `corpus/terms/`; each Term has a
canonical authored definition file. The mechanism — validation,
cross-reference resolution, composition — is shared.

LF's `term` Concept declares what a Term is, structurally. Consumers
instantiate Terms inside that shape. LF does not ship specific Terms
(beyond those LF itself needs internally — `Person`, `AI`,
`Protocol`); consumers add their own.

**Consequences:**

- `src/concepts/term.mdx` ships as part of v0.1. It declares the
  Term contract: frontmatter, sections (`## Used in`, `## See also`),
  mutability profile.
- `src/tropes/term/TROPE.mdx` realises the Term Concept (how Terms
  are done in LF: file shape, index file, review gate behaviour).
- Consumers authoring Terms follow the Term Trope's shape. The
  compiler validates Term files against the Term Trope's Effect
  Schema at `literate check`.
- The same compile and validate machinery that handles Concepts and
  Tropes in `packages/core` handles Terms in a consumer's corpus.
  Only the scope switch (LF-level → corpus-level) differs; the code
  path is shared.
- LF's own project Terms (e.g., `Person`, `AI`, `Protocol`) live in
  `corpus/terms/` as authored instances of the Term Trope. They are
  not shipped as part of `src/`.
