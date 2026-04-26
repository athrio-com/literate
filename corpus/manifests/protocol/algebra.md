---
id: 1d2b036a
disposition: { base: 'Protocol', scope: 'algebra' }
layer: { kind: 'protocol', path: 'protocol', holds: 'domains' }
domain: algebra
status: Reconciled
---

# Algebra

LF's algebra is **Concept-primary**. Every authored thing is a
Concept; every Concept presupposes one or more Tropes; Tropes
realise Concepts in Prose or in Code; the realisations are the
substrate's authored and emitted artefacts.

```
Concept                  the typed essence
   ↓ realised in         (one or many Tropes per Concept)
Trope                    typed composable monadic prose
   ↓ realised in         (the Trope's enactment emits instances)
Prose          Code      the authored / emitted instances
```

Concept and Trope are co-primitive. Neither subsumes the other:
a Trope without a Concept has nothing to be the *how* of; a
Concept without a Trope has no enactment surface. Authored
things present both aspects in unity — the Concept names what
they are, the Trope names how they are realised.

## Concept

A Concept declares a typed primitive in LF's vocabulary. It
names what kind of thing the framework recognises — Disposition,
Mode, Implication, LFM, Step, Tag, and so on. Every Concept is a
typed contract paired with prose: the contract lives in
`index.ts` as an Effect Schema; the prose lives in
`concept.mdx`.

A Concept has one or more **Tropes** that realise it. Realising
the same Concept through more than one Trope means alternative
full realisations — different procedural paths to enact the same
typed essence — not complementary partial views. The `session`
Concept is realised by `session-start` and `session-end`; the
`lfm` Concept is realised by `lfm` and `reconcile`. A Concept
with no Trope is incoherent: the Concept presupposes its
realisability.

Concepts ship in two scopes: LF-level Concepts ship as registry
seeds under `registry/concepts/<id>/`; corpus-level Concepts (a
consumer's own primitives) live under `corpus/concepts/`. Same
primitive, two scopes.

Concepts do not carry Disposition or Mode at the type level.
Both fields belong to Tropes. A Concept's effective Disposition
is the aggregate of its Tropes' Dispositions; the Concept itself
is Disposition-free.

## Trope

A Trope realises a Concept. It is typed composable monadic prose
with a typed runtime — prose-first MDX with Effect Schema typed
backing and a Step substrate that composes via Effect's monadic
structure. Every Trope ships with a `proseSchema` declaring what
shape its authored prose must take; the weave-time validator
rejects prose that does not conform.

Each Trope carries:

- `realises: Concept` — the Concept this Trope realises (one
  Trope realises exactly one Concept).
- `disposition: Disposition` — the target this Trope is disposed
  toward (`Product | Protocol | Infrastructure`, with optional
  `scope` naming a Domain inside the base).
- `mode: Mode` — the operational stance of this Trope's
  enactment (`Exploring | Weaving | Tangling`); mandatory on
  atomic Tropes, optional on composite Tropes whose effective
  Mode is derived from sub-Trope composition.
- `prose: ProseRef` — the authored body.
- `proseSchema: Schema.Schema<ParsedMdx>` — the structural
  contract the body must satisfy. May reference other Tropes as
  sub-Tropes; see *Composition* below.
- `realise: AnyStep` — the Step (atomic, or a workflow Step
  composing others) that enacts the Trope.

A Trope is not Code. It is typed prose with a code-bound
substrate; the output of tangling a Trope is Code, and the
output of weaving a Trope is further Prose, but the Trope itself
lives as prose-with-types in the registry.

## Step

A Step is an **atomic Trope** — a Trope whose `mode` and
`disposition` are single-valued, and whose prose body is small
enough to be self-contained without sub-Trope composition. Six
Step kinds (`prose | workflow | effect | ai | gate | io`)
specialise the Step Trope as Variants; see :lfm[step-substrate]{hash=19c7230b}
for the full breakdown.

Steps compose monadically inside a parent Trope's `realise`
field. The parent Trope's effective Mode at any moment is the
active Step's Mode; the parent's effective Disposition is the
aggregate over its Steps' Dispositions.

## Composition (sub-Tropes and the Arc)

A Trope's `proseSchema` may reference other Tropes. When the
weave-time validator encounters a section that names a
sub-Trope, it dispatches to the sub-Trope's own `proseSchema`.
This composition produces the Trope's **Arc** — the graph of
sub-Tropes nested within the parent Trope's typed structure.
The Arc is what makes an LFM (or any compositional Trope)
self-describing: walking the Arc with `learn` returns the
Trope's complete typed shape without re-walking the prose.

Universal sub-Tropes (Metadata is the canonical example) live
once in the registry and compose into many parent Tropes by
reference. The annotation substrate (see :lfm[annotation-substrate]{hash=9a6b8081})
declares the directive syntax for expressing sub-Trope
composition in authored prose.

Composition is **flat** at any level: a parent's body lists
sub-Trope sections at one level; sub-Tropes themselves do not
nest container directives. Hierarchical depth is carried by
Markdown headings (h1/h2/h3) for human readability, not by
directive nesting for type structure. When typed substructure
is genuinely needed inside a sub-Trope, it is expressed by
inline or leaf annotations within the body, or by reference to
a separately authored Trope.

## Authored instance

An authored instance is a consumer-side realisation that
conforms to a Trope's typed contract. An LFM is an authored
instance of the `lfm` Concept's Trope; a session log is an
authored instance of the `session` Concept's `session-start` or
`session-end` Trope; a Goal entry is an authored instance of
the `goal` Concept's Trope.

Authored instances live in the consumer's repo (`corpus/`,
`registry/`, `.literate/extensions/`); they do not ship as
seeds.

## Direction of composition

The algebra composes in one direction: realisations flow from
Concept downward. A Trope realises a Concept; a Step is one
piece of a Trope; an authored instance conforms to a Concept's
contract through the Trope it instantiates. Reverse compositions
— a Concept derived from authored instances, or a Trope
synthesising a Concept — are not part of the algebra.

## LFM as the central Concept

The Literate Framework Manifest (LFM) is a Concept that defines
what the system *is*. LFMs are the typed declarations of
current-state under a `(Layer, Domain)` pair, and the LFM
Concept is realised through Tropes that author and reconcile
those declarations. LFMs carry first-class `lfm-status`
(`Reconciled | Drifted | Pending | Unverified`) precisely
because they are load-bearing for the substrate's coherence; no
other Trope kind requires status of its own at v0.1.

Each LFM file is an authored instance of the LFM Trope; its
`disposition` field is set by its position in the layer/domain
tree (this LFM, at `corpus/manifests/protocol/algebra.md`,
carries `disposition: { base: 'Protocol', scope: 'algebra' }`).

## Pragmatic limit

Not every authored element is formalised as a Trope.
Formalisation requires a Concept in LF (or in the consumer's
corpus) for the kind of thing being formalised; that is
infeasible for arbitrary content. The substrate stays practical:
formalise what is pragmatically reusable; leave the rest as
authored corpus content under existing Concept Tropes.

A bridge between authored content and formal Tropes — a
Recognition mechanism that runs post-session and suggests Trope
candidates within the relevant Disposition — is named here as a
deferred extension. Mechanical at the per-product level (running
in a consumer's repo, surfacing local extensions); research-
level across the LF community (curating universal Tropes for
shared installation). Implementation is out of scope for this
LFM revision.

```path
registry/concepts/disposition/index.ts
```

```path
registry/concepts/lfm/index.ts
```

```path
registry/tropes/session-start/index.ts
```
