# ADR-008 — Exhaustive single-realization in v0.1; multi-realization structurally permitted

**Date:** 2026-04-22
**Status:** Accepted
**Tags:** `#algebra` `#release`

**Context:**

The three-level algebra (ADR-001) separates Concept from Trope. One
reason for keeping them as distinct artefacts is that, in principle,
a Concept can have more than one realising Trope: a consumer might
prefer a different workflow for sessions, a different shape for
decisions, or a third-party author might publish an alternative
realisation for some Concept.

v0.1 does not ship the machinery this would require. Multi-realisation
needs a selection mechanism (how does the compiler pick among
alternatives? per-Concept pin? tag-based dispatch?), a conflict
policy (what happens when two installed Tropes both realise the same
Concept?), and a compatibility story (can alternates interoperate, or
do they fork the ecosystem?). Answering those questions ahead of
demand risks building for imaginary consumers.

On the other hand, shipping v0.1 as strictly one-to-one — collapsing
Concept and Trope into the same artefact — would foreclose the
possibility. Later adding multi-realisation would be a breaking
reshape of the artefact inventory every consumer has vendored.

The pragmatic path is to preserve the structural possibility without
exercising it. Ship exactly one canonical Trope per Concept in v0.1.
Keep Concept and Trope as separate artefacts, with separate files
and separate identity. When multi-realisation is needed, add the
selection machinery without breaking the existing shape.

**Decision:**

v0.1 ships exactly one canonical realising Trope per Concept.
Concept and Trope remain separate artefacts — separate folders
(`src/concepts/` and `src/tropes/`), separate MDX files, separate
schema files. The algebra permits multiple Tropes per Concept; v0.1
does not implement the selection, conflict, or compatibility
machinery.

Concrete constraints for v0.1:

- Each of the eight v0.1 Concepts (`concept`, `trope`, `corpus`,
  `session`, `decisions`, `category`, `term`, `chapters`) has one
  canonical Trope folder under `src/tropes/`.
- A consumer's manifest lists Tropes by id, not by Concept. The
  identifier `"session"` in a manifest names the session Trope
  (currently the only realising Trope of the `session` Concept).
- The compiler, on encountering a manifest entry, looks up the
  Trope by id. It does not select by Concept.
- A future multi-realisation change would introduce a per-Concept
  selection field in the manifest, not change the current
  by-id lookup.

**Consequences:**

- The v0.1 `src/` tree has a 1:1 correspondence between
  `src/concepts/<concept>.mdx` and `src/tropes/<concept>/`.
- Subkinds (e.g., `decisions/subkinds/ADR.mdx`) are *not* alternative
  realisations of the Concept. A subkind is a refinement *within* a
  Trope (the ADR flavour of the decisions Trope). Multi-realisation
  would be at the Trope level, not the subkind level.
- Documentation language consistently pairs Concept with its
  realising Trope. Authors writing about "the session Trope" are
  speaking of the singular v0.1 realisation; "the session Concept"
  is the interface.
- The open question of what multi-realisation selection should look
  like is deferred to a later ADR, to be drafted when demand is
  concrete.
