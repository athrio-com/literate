# ADR-010 — Unify Terms into Concepts (one primitive, two scopes)

**Date:** 2026-04-22
**Status:** Accepted
**Tags:** `#algebra` `#corpus` `#protocol`

**Supersedes:** ADR-006

**Context:**

ADR-006 declared `Term` as a separate Concept that mirrored
`Concept` at the corpus level — same machinery, different scope.
The intent was to give consumers a way to author reserved
vocabulary inside their own corpus while keeping LF-level Concepts
as the framework metalanguage.

In practice, the two-name model paid no architectural rent. The
shape, schema, mutability profile, and gating rules of a Term file
were identical to those of a Concept declaration; only the location
and the audience differed. Documenting both forced the same
explanation twice — once for "Concept" (LF level) and once for
"Term" (corpus level). Authors and agents had to learn two words
for one thing and remember which scope each applied to.

The cleaner move is to keep one primitive — `Concept` — with two
scopes:

- **LF level**: a Concept ships as a TypeScript workspace package
  (`@literate/concept-<id>`) carrying an Effect Schema for its
  instance shape, an MDX prose body, and dependency references to
  other Concepts. This is how LF declares its own metalanguage.
- **Corpus level**: a Concept is authored as a markdown file at
  `corpus/concepts/<slug>.md` carrying a definition, *Used in*
  references, and optional disambiguation. This is how a consumer
  declares the reserved vocabulary of their product.

Both forms are instances of the same `concept` Concept; the scope
is implicit in the location.

**Decision:**

The `term` Concept and the `term` Trope are removed from LF's
shipped surface. The corpus folder for authored concepts is
renamed `corpus/terms/` → `corpus/concepts/`. The shipped
`concept` Concept's prose is updated to acknowledge the dual
scope.

Concrete changes:

- Delete `packages/concept-term/` and `packages/trope-term/`.
- Rename `corpus/terms/` → `corpus/concepts/` in LF's own corpus.
- Rename the index file `terms.md` → `concepts.md`.
- The `corpus` Trope's prose updates to list `concepts/` (not
  `terms/`) as one of the optional folders.
- The CLI's bundled catalog drops `@literate/trope-term`.
- Documentation collapses: a single Concepts topic page covers
  both scopes (the LF-level packages and the corpus-level files).

**Consequences:**

- ADR-006's framing — Concept/Term as functorial mirror at two
  levels — is replaced by a single primitive with two scopes.
  The functoriality is preserved structurally (same shape, same
  machinery) but no longer named with two words.
- Consumer corpora that followed the pre-ADR-010 shape have to
  rename `corpus/terms/` to `corpus/concepts/` on upgrade. The
  pre-1.0 status of LF makes this acceptable; future major-version
  migrations will be supported by a `literate upgrade` command.
- LF's own corpus loses the `corpus/terms/` folder; `Person`,
  `AI`, and `Protocol` are now authored Concepts under
  `corpus/concepts/`.
- The capitalisation convention (capitalise reserved vocabulary
  in prose) survives unchanged; it now applies to authored
  Concepts at the corpus level.
- Documentation reads more naturally: one chapter on "Concepts"
  covers both how LF declares its metalanguage and how consumers
  declare theirs.
