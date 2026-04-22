# ADR-001 — Three-level algebra: Concept, Trope, Authored Instance

**Date:** 2026-04-22
**Status:** Accepted
**Tags:** `#algebra` `#protocol`

**Context:**

LF's distinctive move is treating prose as the source and code as the
derivative. For that move to hold across repos, across product
shapes, and across time, LF needs a small, stable structural model
that tells authors where a new piece of prose goes, how it composes
with the rest, and what a consumer receives when they pin to a
version of LF.

The working vocabulary that emerged out of the founding discussion
placed three levels in tension: the *interface* level (what something
is), the *class* level (how the thing is done in LF), and the
*instance* level (what a consumer actually authors in their own
corpus). Without naming these explicitly, authors would keep
conflating "the concept of a session" with "the trope that realises
sessions in LF" with "a specific session log someone wrote."

**Decision:**

LF is a three-level algebra. Everything in the framework fits one of
these levels:

```
Concept      (interface — declares what something IS)
    ↓ realized by
Trope        (class — describes HOW the Concept is done in LF;
                     prose-first, with Effect Schema backing)
    ↓ instantiated by consumers as
Authored     (file in consumer's corpus, matching the Trope's shape)
```

- **Concepts** are LF's metalanguage. They declare kinds of things
  LF recognises — session, decisions, category, term, corpus,
  chapters, trope, concept. A Concept is pure declaration: schema,
  invariants, relationships. It carries no operational content and
  is not directly installed by a consumer.
- **Tropes** realise Concepts. Each Trope is prose — how the Concept
  is done in LF — plus an Effect Schema that types and validates the
  shape. Tropes are the composable units consumers import.
- **Authored instances** are consumer files. A consumer's ADR,
  session log, or tag is an instance of the corresponding Trope.
  Instances live in the consumer's `corpus/`. They are not shipped
  by LF and not themselves leaves of the algebra.

Concept and Trope are exhaustive-algebra-paired. At v0.1 each Concept
has exactly one canonical realising Trope; the algebra permits
alternates (see ADR-008), but v0.1 does not ship multi-realisation
machinery.

**Consequences:**

- LF's `src/concepts/` holds one file per Concept. LF's `src/tropes/`
  holds one folder per Trope.
- Consumers import Tropes; Tropes bring their Concepts transitively.
- The CLI resolves a Trope graph into a compiled `.literate/`.
- Cross-reference between Tropes is by Concept identifier: "this
  Trope realises the `session` Concept" or "depends on the `corpus`
  Concept."
- Future multi-realisation (ADR-008) substitutes at the Trope level
  without changing the Concept contract.
- A new prose kind LF wants to recognise requires a new Concept *and*
  a new Trope; declaring a Concept without a canonical Trope ships
  an interface with no implementation.
