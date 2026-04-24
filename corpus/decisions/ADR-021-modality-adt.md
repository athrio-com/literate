# ADR-021 — `Modality` as a general six-case ADT

**Date:** 2026-04-23
**Status:** Superseded by ADR-031 (terminology + shape — referential-frame axis lifted into Disposition) + ADR-032 (operational-stance axis lifted into Mode). Body unchanged per IMP-6; metalanguage migration on `Trope<C>` (`modality: Modality` → `disposition: Disposition` + `mode?: Mode`) is a deferred refactor named in `2026-04-24T1712-typed-concepts-disposition-mode-implication.md` Deferred / Discovered.
**Tags:** `#algebra` `#protocol`

**Extends:** ADR-001, ADR-011

**Context:**

ADR-001 established LF's three-level algebra (Concept → Trope →
Authored instance). ADR-011 extended it with Step as the
executable realisation of a Trope's verbs. None of this machinery
distinguishes *what kind of work* a Trope does. In practice, LF
Tropes (and Concepts) cluster into distinct operational modes
with distinct downstream behaviours:

1. **Lifecycle Tropes run unconditionally as part of the
   Protocol.** `session-start`, `session-end`, gate-flow,
   goal-flow. The Protocol dispatches them; the consumer does
   not install them; they version with LF's Protocol version.
2. **Corpus-authoring Tropes produce prose in the consumer's
   corpus.** `adr-flow`, chapter flows, category-member
   additions, Concept-level revisions. These are scaffolds the
   Person and AI reach for when authoring; they mutate
   `corpus/`; they version per package.
3. **Code-producing Tropes produce code in the consumer's
   packages (or `.literate/` snapshots).** Package scaffolds,
   template rendering, CLI `add` verbs. These mutate `src/`
   or `.literate/`; they also version per package.
4. **Prose-comprehending Tropes read corpus and produce
   explanations.** "Where is this Concept used?", "Summarise
   this chapter", "What decisions cite this ADR?". The output
   is decision-oriented or narrative, not a new artefact.
5. **Code-comprehending Tropes read code and produce
   explanations.** Call-graph traces, impact analysis, "What
   Steps does this Trope compose?", "What services does this
   Step require?". Same shape as (4) for the code surface.
6. **Invariant-checking Tropes attest that prose and code
   agree.** Every Concept realised by ≥1 Trope? Every
   closed-vocabulary value declared in the matching
   `categories/*.md`? ADR conflict detection? The output is a
   `ValidationReport` — `Consistent` or `Divergent` with
   citations.

These six modes answer different questions the runtime, the
tooling, the publishing pipeline, and the documentation site
will each ask — and the answers diverge by mode. Without a
typed marker, the classification lives in Trope names,
folder conventions, and tacit lore. With a typed marker, the
Protocol dispatcher can filter on it, `literate add` can
surface only the relevant modes, docs rendering can group
cleanly, and pattern-matching on `Modality._tag` composes with
the rest of the Effect-based algebra.

The lineage is Knuth's *literate programming*: `weave` produced
documentation from the WEB source; `tangle` produced code.
`unweave` and `untangle` are LF's coinages for the comprehension
inversions. `attest` covers consistency checking — a concern
Knuth elided because WEB guaranteed weave and tangle read the
same source; in LF, prose and code can drift (ADR-002's invariant
is a claim, not a guarantee), so attestation is first-class.

**Decision:**

Add `Modality` to `@literate/core`'s metalanguage as a general
six-case ADT. Each variant is a tagged struct; the union is
schema-backed and pattern-matchable; ergonomic constructors are
exported.

### Shape

```typescript
export const Modality = Schema.Union(
  Schema.Struct({ _tag: Schema.Literal('Protocol') }),
  Schema.Struct({ _tag: Schema.Literal('Weave') }),
  Schema.Struct({ _tag: Schema.Literal('Tangle') }),
  Schema.Struct({ _tag: Schema.Literal('Unweave') }),
  Schema.Struct({ _tag: Schema.Literal('Untangle') }),
  Schema.Struct({ _tag: Schema.Literal('Attest') }),
)
export type Modality = Schema.Schema.Type<typeof Modality>

export const Modality_Protocol: Modality = { _tag: 'Protocol' }
export const Modality_Weave: Modality    = { _tag: 'Weave' }
export const Modality_Tangle: Modality   = { _tag: 'Tangle' }
export const Modality_Unweave: Modality  = { _tag: 'Unweave' }
export const Modality_Untangle: Modality = { _tag: 'Untangle' }
export const Modality_Attest: Modality   = { _tag: 'Attest' }
```

Variants are unit cases at v0.1 (no payload). Future extensions
may thread payloads per variant (e.g., `Weave`'s `target`
sub-classification) without breaking consumers that
pattern-match on `_tag` alone, provided the payload is additive
and the existing `_tag` values are preserved.

### Semantics per variant

- **`Protocol`** — LF machinery: session lifecycle, gate
  dispatch, `Protocol.continue` dispatch, goal flow. Tropes
  carrying this mode are invoked by the runtime as part of the
  Protocol; they are not authorial moves. Ships with `@literate/*`
  framework packages; installed implicitly by depending on LF.
- **`Weave`** — Produces prose in `corpus/` (or the consumer's
  equivalent prose surface). ADR authoring, chapter authoring,
  Concept material revisions, category additions.
- **`Tangle`** — Produces code in `packages/` / `src/` /
  `.literate/` / the consumer's code surfaces. Package scaffolds,
  template renderings, code generation driven by prose.
- **`Unweave`** — Comprehends prose. Explanations, traces,
  citations, summaries over `corpus/`. No artefact mutation;
  output is a narrative or report.
- **`Untangle`** — Comprehends code. Call graphs, Step
  dependency traversal, impact analysis. No artefact mutation.
- **`Attest`** — Verifies invariants between prose and code,
  or internal invariants within either. Output is a
  `ValidationReport` (`Consistent` | `Divergent` with a list of
  divergences and their locations). No artefact mutation.

### Placement in the algebra

- **`Trope<C>`** gains a required `modality: Modality` field.
  Every Trope must declare its mode at construction.
- **`Concept<D>`** gains an optional `modality?: Modality` field.
  A Concept may elect a default modality (inherited by realising
  Tropes when they omit their own declaration, at a later
  revision — v0.1 keeps Trope's modality required regardless).
  Concepts with no intrinsic modality (e.g., a data-shape
  Concept like `Goal` or `SessionRef`) omit the field.
- **`Variant<C, D>`** does *not* carry modality at v0.1. A
  Variant is an ADT-case of its Concept; its modality, if any,
  is the realising Trope's. Promoting modality to Variants is a
  later extension if use-cases arise.
- **Single value per Trope.** No composite modes. Tropes that
  straddle two modes (e.g., scaffold-a-package-and-document-it)
  should be decomposed into two Tropes (one `Tangle`, one
  `Weave`) composed at the call-site.

### Downstream effects

- **`Protocol.continue` dispatch** filters to `Modality.Protocol`
  Tropes. The Protocol never auto-invokes authorial (`Weave` /
  `Tangle`) or comprehension (`Unweave` / `Untangle` / `Attest`)
  Tropes; those are reached for explicitly.
- **`literate add <trope>`** (v0.2+ CLI verb) filters the
  suggestion list by default to the authorial modes
  (`Weave` | `Tangle`). Users can opt in to showing the full
  set.
- **Documentation rendering** groups Tropes by modality in the
  published docs, replacing the current implicit ordering.
- **Publishing / versioning.** `Protocol` Tropes version with
  LF's Protocol version (breaking change triggers a Protocol
  major). Authorial and comprehension Tropes version per
  package (standard semver).
- **Pattern matching.** Consumers (and LF's own CLI) can
  `switch(t.modality._tag)` or use `Match.type<Modality>()`
  from `effect/Match` for exhaustive dispatch.

**Consequences:**

- `@literate/core`'s `kinds.ts` gains the `Modality` ADT and
  the `modality` field on `Trope<C>` (required) and
  `Concept<D>` (optional). Existing `Trope`-constructing code
  (at v0.1: the `NoteLifecycleTrope` test fixture in
  `kinds.test.ts`) is updated to carry `modality`.
- The CLI, Protocol dispatcher, and docs renderer gain a typed
  classification axis they can key on without parsing
  conventions out of names.
- `Unweave`, `Untangle`, and `Attest` Tropes are now
  first-class types even though none are yet authored in the
  MVP. This makes the absence of such Tropes a visible gap
  rather than an implicit omission, and constrains future
  authorial choices (every Trope picks exactly one mode).
- Composite work remains possible through Trope composition
  (a session or higher-level Trope composes a `Tangle` Trope
  and a `Weave` Trope in sequence). Single-mode Tropes remain
  the atomic unit.
- The `Concept<D>` field is optional to avoid forcing a
  modality onto data-shape Concepts that don't meaningfully
  carry one. Revisit if the optional-field creates
  pattern-matching friction at call-sites.
- Not breaking: `Trope<C>` had no prior `modality` field, and
  only one live Trope exists in the rewrite (the
  `NoteLifecycleTrope` test fixture). The change lands cleanly
  at v0.0.2 of `@literate/core`.
- The taxonomy is closed at six variants. Adding a seventh
  requires a subsequent ADR; extending an existing variant
  with a payload is non-breaking if additive.
