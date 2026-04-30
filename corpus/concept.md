---
title: Concept
kind: trope
status: draft
---

# Trope: Concept

The corpus uses Concepts to fix the meaning of repeated terms, so that
prose elsewhere can reference an idea by name rather than restate it.
Each Concept is a named definition embedded in a Trope and addressable
through the `:concept[Name]` reference syntax.

This Trope serves two roles at once. As prose, it explains what a Concept
is and how Concepts are authored, referenced, and extracted. As code, it
tangles the typed Schema the rest of the system uses to validate and
manipulate Concept entries. The two roles are bound by the literate
programming tradition (Knuth, 1984, "Literate Programming",
*The Computer Journal* 27(2), §K): one source, two outputs — the woven
document and the tangled artifact.

## The canonical Concept

The first Concept the corpus needs is *Concept* itself. The embedded
directive below establishes the term against which every other use of the
word in the corpus resolves.

:::concept[Concept]
A named idea with a precise definition, embedded in a Trope and
addressable across the corpus by the reference syntax `:concept[Name]`.
A Concept earns its name when more than one Trope refers to the same
idea — until then it is ordinary prose.
:::

## Authoring

Concepts are authored by writing an embedded block directive inside any
Trope. The directive carries the Concept's name in brackets and its
definition in the body. There is no separate file format for Concepts;
they live where the prose that motivates them lives, and a later index
verb collects them into a queryable graph.

The same Concept must not be defined twice. If two Tropes both attempt
to define `:::concept[Authentication]`, the index build fails and the
Person resolves the duplication by demoting one site to a reference.
One definition site, many reference sites — Knuth's named-chunk
discipline applied to terms (Knuth, 1984, §K).

## Schema

The Schema records the minimum fields a Concept entry carries. The
`name` is the identifier other prose reaches with `:concept[Name]`; the
`definition` is the prose body of the embedded directive, retained
verbatim so the index can render it without re-parsing the source.
Future extensions — provenance, status, cross-references — compose on
top through Effect Schema's struct extension.

```typescript tangle="src/concept.ts"
import { Schema } from "effect"

export const Concept = Schema.Struct({
  name: Schema.String,
  definition: Schema.String
})

export type Concept = Schema.Schema.Type<typeof Concept>
```

## References

Knuth, "Literate Programming", *The Computer Journal* 27(2), 1984, §K.
Knuth, Larrabee, and Roberts, *Mathematical Writing*, MAA Notes #14,
1989, §1.
