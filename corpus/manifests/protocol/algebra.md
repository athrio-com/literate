---
id: 65d72909
disposition: { base: 'Protocol', scope: 'algebra' }
layer: { kind: 'protocol', path: 'protocol', holds: 'domains' }
domain: algebra
status: Reconciled
---

# Algebra

LF is built on a **four-level algebra**: every authored thing
slots into one of four levels, and the levels compose in
exactly one direction.

```
Concept   →  what LF recognises
   ↓
Trope     →  how a Concept is realised
   ↓
Step      →  the executable unit of a Trope's how
   ↓
Authored  →  one consumer-side instance
```

## Concept

A **Concept** declares a typed primitive in LF's vocabulary. It
names what kind of thing the framework recognises — Disposition,
Mode, Implication, LFM, Step, Tag. Every Concept is a typed
contract paired with prose: the contract lives in `index.ts` as
an Effect Schema; the prose lives in `concept.mdx` referenced
via `prose(import.meta.url, './concept.mdx')`.

Concepts ship in two scopes: **LF-level** Concepts ship as
registry seeds under `registry/concepts/<id>/`; **corpus-level**
Concepts (a consumer's own primitives) live under
`corpus/concepts/`. Same primitive, two scopes.

## Trope

A **Trope** realises a Concept as an executable workflow. Tropes
are prose-first (MDX) with Effect Schema typed backing. Every
Trope ships with a `proseSchema` declaring what shape its
authored prose must take; the weave-time validator rejects
prose that doesn't conform.

At v0.1, each Concept has **exactly one** canonical Trope
(exhaustive single realisation). Multiple realisations are
structurally permitted but not implemented; the structural
preservation matters because it keeps the algebra honest.

## Step

A **Step** is the executable unit of a Trope's "how." Steps
compose via Effect: every Step has typed input and output
schemas, an InvocationKey for memoisation, and a ProseRef
binding it to a section of authored prose. Six Step kinds
exist (`prose`, `workflow`, `effect`, `ai`, `gate`, `io`); see
`@lfm(bf82d07a)` (`step-substrate`) for the full breakdown.

The Step layer was added after the original three-level algebra
(`Concept → Trope → instance`); it sits between Trope and
authored instance because Tropes had become too coarse a unit
to compose mechanically.

## Authored instance

An **authored instance** is one consumer-side realisation of a
Concept that conforms to the Trope's contract. An LFM is an
authored instance of the `lfm` Concept; a session log is an
authored instance of the `session` Concept; a Goal entry is an
authored instance of the `goal` Concept.

Authored instances live in the consumer's repo (`corpus/`,
`registry/`, `.literate/extensions/`); they do not ship as
seeds.

## Direction of composition

The algebra composes in one direction: lower levels consume
higher ones. A Trope realises a Concept; a Step is one piece of
a Trope; an authored instance conforms to a Concept's contract.
Reverse compositions (a Concept derived from authored instances,
a Trope synthesising a Concept) are not part of the algebra.

```path
registry/concepts/disposition/index.ts
```

```path
registry/concepts/lfm/index.ts
```

```path
registry/tropes/session-start/index.ts
```
