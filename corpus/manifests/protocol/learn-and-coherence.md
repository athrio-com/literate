::metadata{id=c3606f28, disposition={ base: 'Protocol', scope: 'learn-and-coherence' }, layer={ kind: 'protocol', path: 'protocol', holds: 'domains' }, domain=learn-and-coherence, status=Reconciled}

# Learn and coherence

LF ships a single CLI verb — `literate learn <ref>` — that
resolves any annotation, any Trope, any Concept, any reference
in the substrate to its typed spec plus bound prose. There is
no `learn-trope`, `learn-concept`, `learn-imperative`. One verb,
universal, because under the Concept-primary algebra (see
:lfm[algebra]{hash=1d2b036a}) every entry in the substrate is reachable through
the Concept → Trope → instance chain, and the same lookup
mechanism walks all three levels.

The verb is read-only. It does not mutate the substrate; it
returns a typed view of what is already there.

## Universal resolution

`learn` accepts any of the substrate's reference forms:

- a bare directive name, e.g. `learn metadata` — resolves to the
  Trope at `registry/tropes/metadata/`.
- an inline directive, e.g. `learn :trope[session-start]` —
  resolves the same as the bare form `learn session-start`.
- a leaf or container directive name, e.g. `learn ::metadata` or
  `learn :::declaration` — resolves to the same Trope as the
  bare directive name (the density does not change the lookup
  target).
- an LFM reference, e.g. `learn :lfm[algebra]{hash=1d2b036a}` or
  `learn :lfm[algebra]{hash=1d2b036a}` during the migration window — resolves
  to the LFM at `corpus/manifests/<layer>/<domain>.md`.
- a raw id, e.g. `learn session-start` — same as `:trope[…]`.
- the annotation substrate itself, `learn @` — returns this
  surface's spec (the inline/leaf/container distinction, the
  flat-containers rule, the directive-to-Trope mapping).

Each invocation returns the resolved Trope's `id`, `version`,
`disposition`, `mode`, prose body, and the bound Concept's
`id`, `version`, `instanceSchema` (rendered readably), and prose
body. Output forms: pretty Markdown for human reading; JSON via
a `--json` flag for programmatic agent consumption.

## Self-description

The substrate must be able to describe itself in its own terms.
That requires a Concept-of-Concept seed at
`registry/concepts/concept/` and a Concept-of-Trope seed at
`registry/concepts/trope/`, each with `instanceSchema` set to
`Concept<D>` and `Trope<C>` respectively (the meta-types
declared in `packages/core/src/kinds.ts`). Without these seeds
the meta-level is unreachable through `learn`; the substrate's
top is a hole.

Authoring those seeds is itself a Trope-of-the-meta-Concept
realisation: the seed's prose declares what a Concept (or a
Trope) *is*, and its bound `instanceSchema` validates incoming
Concept-shaped (or Trope-shaped) values. The recursion bottoms
out in the axiomatic `kinds.ts` types; the substrate's
self-description is grounded but not closed.

The annotation substrate is also self-describing: a Trope at
`registry/tropes/annotation/` carries the typed shape of `@`
and the `:` family, so `learn @` returns a real seed rather
than a special-cased verb output.

## Coherence as a property of the substrate

LF defines coherence operationally. The substrate is **coherent
when every annotation in authored prose resolves through
`learn`.** This is not a static spec but a property the substrate
either has or lacks at any given moment, checkable mechanically.

Coherence inconsistencies — drift between an LFM and its
cross-references, broken `:trope[id]` annotations, undocumented
roles, dangling Concept seeds — surface as failed `learn`
invocations. Run as a batch, the failures form a coherence
report.

## Reconcile as coherence-checker

`literate reconcile` extends to walk every authored prose file
under `corpus/`, `registry/`, and `.literate/`, parse each
annotation, and invoke the resolution path that `learn` uses.
References that fail to resolve surface as diagnostics in the
existing `lfm-status` channel (a sibling status applies for
non-LFM Tropes; the v0.1 implementation can piggyback on
`lfm-status` and refine later).

In other words: `learn` is the **point lookup**; `reconcile` is
the **batch coherence run**. Together they make the substrate's
internal consistency a checkable invariant rather than a
stylistic ideal.

## What the verb does not do

`learn` does not mutate state. It does not author Tropes,
modify session logs, or trigger code generation. It is purely a
typed view of the substrate. Authoring goes through Weaving;
code generation goes through Tangling; coherence verification
goes through Reconcile. The four verbs cover four orthogonal
operations on the same typed surface.

## Versioning

Tropes carry a `version` field (semver). At v0.1 `learn`
resolves to the version present in the substrate at invocation
time (the only version). Per-call version selection is deferred;
once the registry begins to ship multiple versions of the same
Trope id, `learn` grows a `--version` flag and a default
resolution policy.

```path
packages/cli/src/verbs/learn.ts
```

```path
registry/concepts/concept/index.ts
```

```path
registry/concepts/trope/index.ts
```
