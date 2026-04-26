# Session: 2026-04-26 — Algebra revision: Concept-primary substrate, `:` annotation syntax, learn verb

**Date:** 2026-04-26
**Status:** Closed (2026-04-26T13:54)
**Chapter:** — (no chapter yet)
**Agent:** Claude Opus 4.7 (1M context) — fast mode
**Started:** 2026-04-26T07:15
**Disposition:** `{ base: 'Protocol', scope: 'algebra' }` (algebra + substrate
  surface, including annotation syntax and the `learn` verb)
**Mode:** Exploring (G1) → Weaving (G2–G7) — Mode shift gated by Person
  directive at chain prompt; FAST mode discipline (Goals stamped Active at
  open per Person directive; chain prompt is the gate; no per-Goal
  re-deliberation; no intermediate red states).
**Planned by:** — (spontaneous)

## Pre-work

Spontaneous start per IMP-1.2.a, opened mid-thread after a Person Q&A
exchange that probed the framework's Mode/Concept substrate. The Person
flagged that the prior thread had been operating without an opened
session (acknowledged: IMP-1 was skipped at thread start) and directed
this session open to capture a single Implication surfaced from the
exchange.

- **Last `Status: Closed` session.** `2026-04-25T1432-lf-repo-prose-purification`
  (Closed 2026-04-25T14:55). Summary: purified LF dev repo's user-facing
  prose; stripped narrative LFM/ADR references from README and CLAUDE.md
  surfaces; generalised README/SEED.md split across registry seeds;
  fence-aware heading demotion in weave; purified `packages/cli/README.md`.
  Carry-over: `corpus/specs/` and `corpus/chapters/` directories
  referenced by `corpus/CLAUDE.md`'s review-gate list but do not
  currently exist (deferred).
- **Carry-forward from Deferred / Discovered.** None directly relevant
  to this session's narrow scope.
- **LFM tree walk.** `corpus/manifests/protocol/algebra.md`
  (`:lfm[algebra]{hash=65d72909}`) is the current-state declaration this session's
  Implication targets. It declares the four-level algebra (Concept →
  Trope → Step → Authored instance) and names Concepts as "typed
  contract paired with prose" — no mention of a `modality` field on
  the contract. The runtime `Concept<D>` interface in
  `packages/core/src/kinds.ts:55-64` carries `modality?: Modality`,
  which is drift from the LFM. No `literate reconcile` invocation
  needed: this session does not author or revise an LFM; the
  Implication targets a future session.
- **Pending Planned sessions.** `2026-04-29T0900-ci-oidc-publish-pipeline`
  is `Planned`; orthogonal to this session's scope. No collision.

## Goals

### Goal 1 — Surface the Concept.modality legacy-field Implication

**Status:** Completed
**Category:** prose
**Mode:** Exploring

**Topic:** Journal the observation that
`packages/core/src/kinds.ts:63` carries `readonly modality?: Modality`
on the `Concept<D>` interface, which is a vestigial field from
the old six-case Modality ADT. The term `Modality` was ambiguous
because it conflated two axes under one ADT: a *target* axis
(values like `Protocol`) and a *stance* axis (values like `Weave`,
`Tangle`, `Attest`). Session
`2026-04-24T1712-typed-concepts-disposition-mode-implication`
disambiguated this:
the target axis was **renamed** to `Disposition`; the stance axis
was **extracted** as the standalone `Mode` Concept.
Implication is orthogonal — same session, unrelated motivation.
The `modality` field on `Concept<D>` has no consumer in production
code and is drift relative to `:lfm[algebra]{hash=65d72909}`
(`protocol/algebra`). Capture the framing precisely so a future
Weaving session can pick the right remediation (strip vs. retype
vs. document).

**Upstream:**
- `:lfm[algebra]{hash=65d72909}` (`corpus/manifests/protocol/algebra.md`) — the
  current-state declaration of the algebra; names Concept as
  "typed contract paired with prose" with no modality slot.
- `packages/core/src/kinds.ts:55-64` — the runtime `Concept<D>`
  interface carrying the legacy field.
- `packages/core/src/kinds.ts:30-50` — `ModalitySchema` and
  `Modality` value namespace (six-case ADT).
- `packages/core/src/__tests__/kinds.test.ts:108-158` — the
  remaining test surface that exercises Modality.
- `registry/concepts/disposition/concept.mdx`,
  `registry/concepts/mode/concept.mdx`,
  `registry/concepts/implication/concept.mdx` — the three Concepts
  that supersede Modality semantically.
- `2026-04-24T1712-typed-concepts-disposition-mode-implication` —
  the session that authored the supersession.

**Acceptance:**
- A single Surfaced Implication entry lands in `## Implications`,
  carrying the precise framing (what the field was, what superseded
  it, what the field is today).
- The session is closed with the Implication still `Surfaced` —
  this session does not adjudicate; it surfaces. **Caveat:** per
  the `implication` Concept's session-end validator (IMP-5 / the
  Concept's `## Session-end validation` section), every Implication
  must carry a terminal status (`Promoted | Filed | Dismissed`) at
  close. To honour both this session's narrow scope (surface only)
  and the validator, the close step **gates** with the Person on
  the terminal status. Default proposal at close: `Filed` to
  `corpus/memos/concept-modality-legacy-field.md` for a future
  Weaving session.

**Out of scope:**
- Editing `packages/core/src/kinds.ts` (Tangling action; needs
  prose-side decision first).
- Editing `corpus/manifests/protocol/algebra.md` (no LFM revision
  warranted yet — the LFM's prose is consistent with how the
  algebra *should* be; the kinds.ts file is the drifted artefact).
- Stripping `Trope<C>.modality: Modality` (kinds.ts:142). Same
  legacy origin, different shape (required, not optional). The
  Implication's framing names this as part of the same cleanup
  surface so the future session inherits the full picture.

### Goal 2 — Revise `protocol/algebra.md` LFM (Concept-primary algebra)

**Status:** Completed
**Category:** prose
**Mode:** Weaving

**Topic:** Replace the four-level algebra body in
`corpus/manifests/protocol/algebra.md` with the Concept-primary
framing surfaced in this session's Exploring deliberation. New
shape: every Concept presupposes one or more Tropes; Tropes
realise Concepts in Prose or Code; Mode and Disposition are
Trope-level (atomic at the Step layer); Steps are atomic Tropes
carrying single Mode + single Disposition; multi-Trope Concepts
are explicit; LFM is a Concept whose Tropes realise the system's
current-state declarations; the pragmatic limit (not every
authored thing is a Trope) is named with the deferred
Recognition-Trope bridge as the path past it.

**Upstream:**
- Implications 1 and 4 (this session) — promoted into this Goal.
- `corpus/manifests/protocol/algebra.md` — the LFM being revised.
- `packages/core/src/kinds.ts` — the runtime substrate the LFM
  declares.

**Acceptance:**
- LFM body reflects: Concept primary; Tropes realise Concepts;
  Mode + Disposition at Trope level; Steps as atomic Tropes;
  multi-Trope Concepts; LFM as central Concept; pragmatic limit.
- Body uses `:lfm[<hash>]` annotations for cross-LFM references
  (new form per Goal 3); existing `@lfm(<hash>)` references in
  the touched body migrate inline.
- `literate reconcile` recomputes the LFM hash and derives
  `status: Reconciled` after Goals 2–7 settle (Goal 9).

### Goal 3 — New LFM `protocol/annotation-substrate.md` (`:` unified annotation surface)

**Status:** Completed
**Category:** prose
**Mode:** Weaving

**Topic:** Author a new LFM at
`corpus/manifests/protocol/annotation-substrate.md` declaring the
`:` unified annotation surface: inline `:trope[id]` for
citation/reference; leaf `::role{key=val}` for parameterised
emit; container `:::role{key=val}...:::` for parameterised body.
Flat-containers rule (no `:::` nesting; depth carried by
cross-references). 1:1 directive-name → Trope-id mapping. The
`@lfm(<hash>)` legacy form is named as the migration source;
reconcile is named as the migrator (Tangling successor).

**Upstream:**
- Implication 3 (this session) — promoted into this Goal.
- The probe sequence in this session's Exploring exchange where
  the syntax was resolved (most recent prompt: unify on `:`).

**Acceptance:**
- LFM exists at the named path with
  `disposition: { base: 'Protocol', scope: 'annotation-substrate' }`
  and `domain: annotation-substrate`.
- Body declares the three directive shapes, the flat-containers
  rule, the 1:1 mapping, and the `@`→`:` migration plan.

### Goal 4 — Update `protocol/disposition-and-mode.md` LFM (Trope-level Mode + Disposition)

**Status:** Completed
**Category:** prose
**Mode:** Weaving

**Topic:** Revise
`corpus/manifests/protocol/disposition-and-mode.md` to lift Mode
and Disposition to the Trope level (both fields on Tropes, not
on sessions or Concepts). Add: `Domain = Disposition.scope` (the
Domain Concept's instances are valid `Disposition.scope` values).
Add: atomic Tropes (Steps) carry single Mode + single
Disposition; composite Tropes compose sub-Tropes with their own
Mode + Disposition.

**Upstream:**
- Implication 2 (this session) — promoted into this Goal.
- The probe sequence resolving Mode + Disposition as Trope-level.

**Acceptance:**
- LFM body reflects Trope-level Mode + Disposition;
  Domain = Disposition.scope; atomic-vs-composite distinction.

### Goal 5 — Update `protocol/step-substrate.md` LFM (Steps as atomic Tropes)

**Status:** Completed
**Category:** prose
**Mode:** Weaving

**Topic:** Revise `corpus/manifests/protocol/step-substrate.md`
to declare Steps as atomic Tropes — each Step carries single
Mode + single Disposition; Steps compose monadically inside a
parent Trope's `realise` field; the six Step kinds
(`prose | workflow | effect | ai | gate | io`) are Variants of
the Step Trope (the existing `Variant<C, D>` mechanism applies).

**Upstream:**
- Goal 2 (algebra LFM) — depends on the Concept-primary framing.

**Acceptance:**
- LFM body declares Steps as atomic Tropes; Step kinds as
  Variants; Mode + Disposition per Step.

### Goal 6 — New LFM `protocol/learn-and-coherence.md` (universal `learn` verb + coherence thesis)

**Status:** Completed
**Category:** prose
**Mode:** Weaving

**Topic:** Author a new LFM at
`corpus/manifests/protocol/learn-and-coherence.md` declaring
`literate learn <ref>` as the universal lookup verb that
resolves any annotation, any Trope, any Concept, any reference;
Concept-of-Concept and Concept-of-Trope seeds are named as
preconditions for full self-description; the
coherence-via-self-description thesis (every `:role[id]` and
`@lfm(<hash>)` annotation in authored prose, when invoked
through `learn`, must resolve; coherence is demonstrated by the
substrate's ability to teach itself). The verb is read-only.
Reconcile is named as the substrate's coherence-checker that
runs the resolution validation in batch.

**Upstream:**
- Implication 5 (this session) — promoted into this Goal.
- Goal 3 (annotation substrate) — depends on the `:` syntax.

**Acceptance:**
- LFM exists at the named path with appropriate frontmatter.
- Body declares `learn` semantics, Concept-of-Concept +
  Concept-of-Trope seed requirements, the coherence thesis,
  reconcile-as-coherence-checker.

### Goal 7 — Concept-revision decisions (gated prose; Tangling deferred)

**Status:** Completed
**Category:** prose
**Mode:** Weaving

**Topic:** Author the gated prose decisions for the
`packages/core/src/kinds.ts` field changes implied by the
algebra revision. Decisions to gate (in this session, by Person
directive at chain prompt — fast-mode Accept):

1. Drop `modality?: Modality` from `Concept<D>` and
   `modality: Modality` from `Trope<C>`. Drop `ModalitySchema`
   and `Modality` value namespace; drop the re-exports from
   `packages/core/src/index.ts`.
2. Add `tropes: ReadonlyArray<AnyTrope>` to `Concept<D>` (lazy
   resolution to avoid circular imports — declared as
   id-strings or thunks; the Tangling successor picks the
   exact mechanism).
3. Add `disposition: Disposition` to `Trope<C>`.
4. Add `mode: Mode` to `Trope<C>` (mandatory atomic; optional
   composite — exact type-system encoding chosen by the
   Tangling successor).
5. When the new sub-Trope-aware proseSchema helper is
   authored, name it `arcSchema` (not `composedMdxStructure`).
   Existing `requireMdxStructure` keeps its name.

The actual code edits are deferred to the Planned Tangling
successor (named in the `## Plan` block below); this Goal is
the prose-side gate.

**Upstream:**
- Goal 2 (algebra LFM) — declares the runtime shape these
  decisions land.
- Implication 1 (this session) — promoted into this Goal.

**Acceptance:**
- A `## Decisions Made` entry per decision (1–5) lands at
  session-end.
- The Planned Tangling successor inherits these decisions as
  its `## Goals` upstream references.

## Plan

### Slug — `tangle-substrate-revision`

**Realised by:** corpus/sessions/2026-04-26T1354-tangle-substrate-revision.md (Status: Planned)

**Topic:** Tangling successor for this Weaving session.
Implements the substrate-level changes named in Goals 2–7:
directive parser via `remark-directive`; `arcSchema` helper for
sub-Trope-aware proseSchema composition; `kinds.ts` field
changes (drop `modality`; add `tropes` on Concept; add
`disposition` + `mode` on Trope); `prose.mdx` → `trope.mdx`
rename across existing Tropes; `literate learn` CLI verb;
Concept-of-Concept and Concept-of-Trope seed authoring;
`@lfm(<hash>)` → `:lfm[<hash>]` migration via reconcile.

**Depends on:** This session
(`2026-04-26T0715-concept-modality-legacy-implication.md`)
`Status: Closed`.

**Goals (provisional — re-gated at successor open):**

1. **Directive parser integration.** Add `remark-directive` to
   the weaver's remark pipeline. Verify parsed directive nodes
   (`textDirective`, `leafDirective`, `containerDirective`)
   appear in the `ParsedMdx` mdast tree.
2. **`arcSchema` helper.** Author `arcSchema({ h1, sections:
   [{ slug, trope }, ...] })` in `packages/core/src/mdx.ts`.
   Recurses into directive nodes; dispatches to sub-Trope
   `proseSchema`. Composes alongside `requireMdxStructure`.
3. **`kinds.ts` field changes.** Drop `modality?` and
   `modality`; drop `ModalitySchema` + `Modality` namespace; add
   `tropes` on Concept; add `disposition` + `mode` on Trope;
   update `concept(...)` and `trope(...)` constructors; update
   tests; update re-exports in `packages/core/src/index.ts`.
4. **Filename rename.** `registry/tropes/<id>/prose.mdx` →
   `registry/tropes/<id>/trope.mdx` for every existing Trope
   (`session-start`, `session-end`, `lfm`, `reconcile`, `index`,
   any others); update `prose(import.meta.url, './prose.mdx')`
   calls in each `index.ts`.
5. **`literate learn` CLI verb.** Implement in
   `packages/cli/src/verbs/`; resolves any reference (`:trope[id]`,
   `:lfm[hash]`, raw id); output forms (pretty Markdown +
   `--json`).
6. **Meta-Concept seeding.** Author
   `registry/concepts/concept/` and `registry/concepts/trope/`
   seeds — `instanceSchema` is `Concept<D>` and `Trope<C>` from
   `kinds.ts` respectively; prose body declares the meta-types.
7. **Reconcile update + migration.** Extend `literate reconcile`
   to parse `:lfm[<hash>]` and other `:` annotations; migrate
   existing `@lfm(<hash>)` throughout `corpus/manifests/` and
   `corpus/sessions/`; validate `:trope[<id>]` resolves.
8. **Recognition Trope.** Deferred entirely — not in this
   successor's scope.

## Implications

### Implication 1 — `Concept.modality?: Modality` is a vestigial field

**Status:** Promoted (see `## Decisions Made` — *Implications adjudicated*)
**Id:** `concept-modality-legacy-field`

**What the field is.** `packages/core/src/kinds.ts:63` declares
`readonly modality?: Modality` on the `Concept<D>` interface. The
companion `concept(...)` smart constructor at
`kinds.ts:80-89` passes it through verbatim if set. The field's
type, `Modality`, is the six-case tagged-union ADT defined at
`kinds.ts:30-50` (`Protocol | Weave | Tangle | Unweave | Untangle
| Attest`).

**What it was for.** The old `Modality` ADT (since dissolved into
LFMs alongside the wider ADR removal in
`2026-04-25T0905-adr-removal-and-lfm-substrate`) was a single
six-case tagged union applied to Tropes (required) and Concepts
(optional). Its motivation: one typed slot per artefact for
"the mode of work this participates in."

The term `Modality` was **ambiguous**: its six values mixed two
distinct axes under one ADT:

- *Target* values (e.g. `Protocol`) — what the work is about.
- *Stance* values (e.g. `Weave`, `Tangle`, `Unweave`,
  `Untangle`, `Attest`) — how the work is being done.

Conflating these under one ADT meant a single `modality` field
couldn't express both axes simultaneously, and the term itself
didn't disambiguate which axis a given value belonged to.

**What superseded it.** Session
`2026-04-24T1712-typed-concepts-disposition-mode-implication`
disambiguated the two axes:

1. **`Disposition`** (`registry/concepts/disposition/`) — the
   *target* axis, **renamed** from Modality. Answers: what is
   the Mode disposed *toward*? Parametrised
   (`base: 'Product' | 'Protocol' | 'Infrastructure'` plus open
   `scope`/`prompt`/`prose`). The choice of the term
   `Disposition` over alternatives like `Target` or `Object` was
   deliberate: Disposition is more general — it composes with
   Layer and Domain in the LFM tree, where `Target` would not.
2. **`Mode`** (`registry/concepts/mode/`) — the *stance* axis,
   **extracted** as a standalone Concept. Answers: how is the
   work being done? The v0.1 stance set is
   `Exploring | Weaving | Tangling`, narrower than the old
   stance values under Modality (`Weave | Tangle | Unweave |
   Untangle | Attest`). Whether v0.1's narrower set retains
   Attest-like / Unweave-like / Untangle-like stances is a
   separate question outside this Implication's scope.
3. **`Implication`** (`registry/concepts/implication/`) — the
   *soft-Goal substrate* for surfaced-but-unadjudicated work
   items. **Orthogonal to the Modality refactor.** Authored in
   the same session for unrelated reasons; not part of the
   target/stance disambiguation. Naming this here precisely
   because earlier framings in this thread incorrectly mapped
   Implication to Modality.Attest — it does not.

Both `Disposition` and `Mode` live at the **session level**, not
the Concept level. A Concept does not carry a Disposition or a
Mode; the session authoring the Concept does. So the per-Concept
Modality slot became semantically empty — there is nothing
meaningful to bind to the Concept itself at v0.1.

**What the field is today.** Vestigial. No production code path
in `packages/core/src/` or `packages/cli/src/` reads
`Concept.modality` or `Trope.modality`. The remaining consumers
are tests (`packages/core/src/__tests__/kinds.test.ts:14-15,
63, 94, 108-158`) and the `@literate/core` index re-exports
(`packages/core/src/index.ts:142-152`). The field's existence on
the runtime interface is drift from `:lfm[algebra]{hash=65d72909}`
(`protocol/algebra`), which describes Concept as "typed contract
paired with prose" with no Modality slot.

**Person's framing (recorded verbatim from the correcting
prompt).** "Disposition is the Modality in sense of target the
mode is disposed to. Modality was ambiguous as a term. This was
pure renaming. Why now [not] target or something like object,
because it is more general than this and used for layers and
domains." The journalled framing above incorporates this
correction: Modality → Disposition is renaming of the target axis;
Mode is extraction of the stance axis; Implication is independent
machinery surfaced in the same session for orthogonal reasons.

Earlier in this same thread, an agent-side framing claimed
Modality "split three ways" with Implication absorbing
Modality.Attest. That framing was wrong on both counts and is
superseded by the body above. Recording the prior framing
explicitly so a future reader inheriting the journal can see
what the correction was correcting.

**Remediation surface (for the future Weaver).** Three paths,
named here without preference:

1. **Strip.** Delete `ModalitySchema`, `Modality`, the
   `modality` field on `Concept<D>` and `ConceptDefinition<D>`,
   the `modality` field on `Trope<C>` and `TropeDefinition<C>`,
   the corresponding lines in `concept(...)` and `trope(...)`
   constructors, the index re-exports, and the test surface that
   exercises them. Update the file's docstring (`kinds.ts:1-15`)
   to remove Modality references. Smallest typed surface; most
   invasive diff.
2. **Retype.** Replace the `modality` field with
   `disposition?: Disposition` on Concepts (and similarly on
   Tropes), preserving the *idea* of an authorial-side hint
   while moving to the current vocabulary. Probably wrong:
   Disposition lives at the session, not at the Concept.
3. **Document and freeze.** Annotate the field with
   `@deprecated` JSDoc citing this Implication and the
   superseding triad; leave the runtime shape untouched until a
   downstream consumer breaks. Lowest churn; preserves drift.

The Implication does not pick. A future `Weaving` session
inherits the three options, gates one, and Tangles the result.

**Why Surfaced not Promoted.** Promoting requires a Goal in this
session, which would require a Mode shift to Weaving and the
gated three-way decision above. The Person's prompt narrowly
asked to surface and journal, not to remediate. Promoting would
exceed scope.

**Why not Filed yet.** Filing produces a memo at
`corpus/memos/<slug>.md` — gated. Default proposal at
session-end: file to `corpus/memos/concept-modality-legacy-field.md`
unless the Person directs otherwise.

### Implication 2 — Domain ≈ Concept + Disposition

**Status:** Promoted (see `## Decisions Made` — *Implications adjudicated*)
**Id:** `domain-as-concept-plus-disposition`

**The observation.** The Person, while correcting Implication 1's
framing, surfaced a sharper claim about the algebra: a *Domain*
(in the LFM-tree sense — `corpus/manifests/<layer>/<domain>.md`)
is structurally like the *union* `Concept + Disposition`. A
Domain isn't a freestanding primitive; it's a Concept-like
declarative surface *disposed* somewhere — the (Layer × Domain)
addressing that LFMs carry is the externalised expression of
that pairing.

**Why this matters.** v0.1 has separate Concepts for
`disposition`, `dispositional-domain`, and `layer` in
`registry/concepts/`. The Person's framing suggests the
relationship between these is tighter than three independent
Concepts: Domain is *parametrised* over Concept × Disposition,
and the algebra LFM (`:lfm[algebra]{hash=65d72909}`) currently treats
Concept and Disposition as independent without naming this
composition.

**Canonical phrase form (from the same prompt).** "In Mode X,
disposed to Domain Y" is the natural-language schema for
locating a piece of work. This session: Mode = `Exploring`,
disposed to LF-as-product-in-this-repo's algebra Domain. (Note
the LF dev-repo carries `disposition.base = 'Protocol'` for
algebra work per CLAUDE.md convention; the Person's "as a
product in this repo" parenthetical signals the colloquial
sense — what the repo *produces* — rather than overriding the
typed convention.)

**What a future Weaving session would address.** Three
possible refinements, named without preference:

1. **Document the relationship.** Add prose to
   `:lfm[algebra]{hash=65d72909}` (`protocol/algebra`) naming Domain as
   `Concept × Disposition` parametrisation. Lowest churn;
   makes the algebra LFM honour the Person's framing without
   restructuring the Concept seeds.
2. **Restructure `dispositional-domain`.** Rewrite
   `registry/concepts/dispositional-domain/` so its prose and
   Schema explicitly express Domain as the typed pairing
   `(Concept, Disposition)`. Higher churn; surfaces the
   composition in the typed substrate.
3. **Treat as a wider algebra evolution.** The Person's
   framing may imply more than a Domain refactor — e.g. that
   the four-level algebra (Concept → Trope → Step → instance)
   gains a fifth notion of *located instance* via Disposition.
   This is too large to settle inside this Implication.

**Why Surfaced.** Same as Implication 1 — this session is
narrowly scoped to surfacing. Adjudication (Promote / File /
Dismiss) is the gate the Person controls.

**Default proposal at close.** File to
`corpus/memos/domain-as-concept-plus-disposition.md`.

### Implication 3 — Mechanical Trope lookup substrate for guiding universals

**Status:** Promoted (see `## Decisions Made` — *Implications adjudicated*)
**Id:** `trope-lookup-substrate`

**The claim (Person, recorded verbatim from this session's prompt).**
"We should have mechanical system which enables lookups and
signals instantly that you deal with a trope (because any
guiding universal is a trope disposed to Protocol). It can be
annotation and CLI can be `Trope.learn(...)`. Tropes must have
concepts so trope returns concept + trope spec."

**Why this is well-founded in the existing algebra.** Every
agent-binding imperative in `corpus/CLAUDE.md` (IMP-1 through
IMP-6 + IMP-N) is structurally a *realisation*: it has a
triggering condition, an ordered procedure, and an output state
change. That is exactly the Trope shape. Two of the imperatives
already have backing Tropes:

- IMP-1 ↔ `registry/tropes/session-start/` (realises `session`).
- IMP-5 ↔ `registry/tropes/session-end/` (realises `session`).

The remaining imperatives (IMP-2 / IMP-3 / IMP-4 / IMP-6 /
IMP-N) do not have typed Tropes — they live only as prose in
`corpus/CLAUDE.md`. The Person's proposal generalises the
existing pattern.

**Concrete mechanism.**

1. **Annotation.** `@trope(<id>)` syntax in prose, analogous to
   `@lfm(<hash>)`. A soft cross-reference that signals "this is
   a Trope, look it up." Reconcile validates that every
   `@trope(<id>)` resolves to an existing seed in
   `registry/tropes/<id>/`; broken references surface as
   `lfm-status: Drifted` (or a sibling status for trope-refs).
2. **CLI verb.** `literate trope learn <id>`. Output shape: the
   Trope's `id`, `version`, `realises: Concept` (resolved), the
   Trope's `prose: ProseRef` body, and the bound Concept's
   `id`, `version`, `instanceSchema` (rendered readably), and
   `prose: ProseRef` body. Two output formats — pretty Markdown
   for human reading, JSON for programmatic agent consumption.
3. **TS API.** `Trope.learn(id: string)` on `@literate/core`,
   returning an Effect that yields `{ concept: AnyConcept, trope:
   AnyTrope }` or fails with a typed `TropeNotFound`. The CLI
   verb is a thin wrapper over the TS API.
4. **Disposition.** All guiding-universal Tropes carry
   `disposition.base = 'Protocol'`. The Person's framing is
   precise here: "any guiding universal is a trope disposed to
   Protocol." Whether Disposition lands on Tropes as a typed
   field or is *derived* from the realised Concept's domain is
   a separate decision (the Concept lives under
   `corpus/manifests/protocol/`, so the Disposition is
   recoverable without a Trope-level field).

**Coverage extension required.** Author Trope seeds for the
imperatives that lack them. Tentative mapping:

| Imperative | Realises Concept | Status |
|---|---|---|
| IMP-1 (session start) | `session` | exists (`session-start`) |
| IMP-2 (architectural decision) | `lfm` + `concept` (branches) | new |
| IMP-3 (scope change) | `goal` | new |
| IMP-4 (multi-session arc) | `session` (or new `plan`) | new |
| IMP-5 (session end) | `session` | exists (`session-end`) |
| IMP-6 (NEVER list) | meta-Concept `prohibition` *or* fan-out per bullet | open |
| IMP-N (Mode discipline) | `mode` | new |

**Existing prose stays.** This Implication does not propose
deleting `corpus/CLAUDE.md`'s IMP prose. The prose remains as
the agent-friendly summary read at thread-start; the typed
Tropes become the lookup target. Authoring those Tropes lets
`corpus/CLAUDE.md` add `@trope(<id>)` self-annotations next to
each IMP heading, so the prose imperatives and the typed seeds
travel together.

**What `Trope.learn` lets the agent do that grep cannot.**

- *Resolve cross-references mechanically.* When session prose
  says `@trope(session-start)`, the agent calls
  `Trope.learn('session-start')` and gets a structured object
  including the realised Concept's `instanceSchema`. No prose
  scan; no risk of stale recall.
- *Validate at reconcile.* Broken `@trope(<id>)` annotations
  surface mechanically, like broken `@lfm(<hash>)` annotations
  do today. Drift between LF's `corpus/CLAUDE.md` and the
  consumer template's `CLAUDE.md` becomes catchable.
- *Compose with the gate.* Future work can typed-validate
  session log structures against the Trope spec they realise
  — e.g. a `## Decisions Made` block whose entries fail the
  IMP-2 LFM-authoring-path Trope's expected shape surfaces as
  a session-end validation error.

**Open questions for a future Weaving session.**

1. **IMP-6 (NEVER) granularity.** Is the NEVER list one Trope
   realising a meta-Concept (`prohibition` or
   `protocol-imperative`), or does each NEVER bullet become its
   own Trope bound to the relevant domain Concept? The fan-out
   has cleaner type-theory but heavier authoring cost.
2. **Sub-step correspondence.** IMP-1 has 7 numbered sub-steps;
   the existing `session-start` Trope's `proseSchema` enforces
   10 `h2` slugs. Are these in 1:1 correspondence (with three
   sub-steps absorbed into Composition / Pre-work)? If yes,
   adding `@trope(session-start)` to IMP-1's heading makes the
   correspondence visible without rewriting either side.
3. **Trope-level Disposition field vs. derived.** Whether
   Tropes should carry `disposition: Disposition` as a typed
   field (parallel to Sessions) or whether Disposition is
   recovered from the realised Concept's location in the LFM
   tree (cheap, lossy on edge cases). Probably derived at
   v0.1; revisit if exhaustive `(Mode, Disposition)` matching
   ever lands on `Step.realise`.
4. **Annotation parser placement.** `@lfm(<hash>)` annotations
   are parsed by `literate reconcile`. `@trope(<id>)` would
   need parallel parsing — same parser surface (mdast
   traversal) plus a different resolution target.

**Relationship to Implications 1 and 2.**

- Implication 1 (`Concept.modality?` legacy field) — orthogonal.
  Stripping `modality` doesn't depend on this Trope substrate.
- Implication 2 (Domain ≈ Concept + Disposition) — adjacent.
  If Disposition becomes a Trope-level field, the Domain ≈
  Concept × Disposition framing extends naturally to
  Trope-disposition-domain triples. A future algebra revision
  could unify all three.

**Default proposal at close.** File to
`corpus/memos/trope-lookup-substrate.md`. This Implication is
near-spec — the future Weaving session inherits enough detail
to draft Goals directly from the memo without further
deliberation.

**Promotion candidacy.** This is the Implication of the three
[at the time of writing] that most warrants Promotion to a Goal
in this session. Doing so requires a Mode shift
`Exploring → Weaving`, which IMP-N makes explicit and gated.
Deferred to Person-direction at session-close (or earlier if
Person directs).

#### Resolution by Person (subsequent prompt this session)

The Person's directive at a later turn supersedes parts of the
body above:

1. **Annotation syntax resolved as `@<role>(<id>)`.** The
   parens-bearing id portion is *optional*; bare `@<role>` is
   valid for pure labelling (no cross-reference needed); the
   parameterised form `@<role>(<id>)` is used when round-trip
   lookup is required. The earlier proposal of `@trope(<id>)`
   as the canonical form is superseded — the canonical form is
   `@<role>(<id>)` where `<role>` ranges over all Trope-shaped
   things in the substrate (per Implication 4's unification:
   *everything is a Trope*).
2. **CLI verb resolved as `literate learn <ref>`.** Not
   `literate trope learn` — the unification per Implication 4
   means there is no `trope`-prefixed sub-verb. One universal
   verb. See Implication 5.
3. **`@` itself is a Trope.** `literate learn @` returns the
   annotation system's own spec. The substrate is
   self-describing through the same verb that resolves
   everything else.

The body above stays as journalled deliberation that led to the
resolution. The resolution itself is the binding form for any
future Weaving session that picks this up.

### Implication 4 — Algebra revision: "Everything is a Trope"

**Status:** Promoted (see `## Decisions Made` — *Implications adjudicated*)
**Id:** `everything-is-a-trope`

**The claim (Person, recorded verbatim from this session's
prompt).** *"In LF — everything is a trope. Even concepts are
tropes which guide people' and agents' understanding. Trope is
the how, hence everything is in sake of some 'how'. So, this is
revision and conceptual stance in LF."*

**The structural move.** `:lfm[algebra]{hash=65d72909}` (`protocol/algebra`)
currently declares a four-level algebra:

```
Concept   →  what LF recognises
   ↓
Trope     →  how a Concept is realised
   ↓
Step      →  the executable unit of a Trope's how
   ↓
Authored  →  one consumer-side instance
```

The revision collapses Concept into Trope: **Trope is the only
top-level primitive**, with Variants accommodating different
shapes of Trope. The algebra becomes:

```
Trope     →  the how (universal primitive; takes Variants)
   ↓
Step      →  the executable unit of a Trope's how
   ↓
Authored  →  one consumer-side instance
```

**Reasoning (Person's framing).** A Concept exists *for the
sake of* guiding recognition — which kinds of instances are
valid, how to read the prose body, what the bound Schema
validates. That guidance is itself a "how" — a procedure for
recognising and applying. Trope already names the "how"; the
Concept-vs-Trope distinction is therefore a sub-distinction
*within* the Trope category, not a peer level above it.

**Mapping to the existing type system.** The unification is
naturally expressed via the existing `Variant<C, D>` machinery
(`packages/core/src/kinds.ts:96-127`):

- `Trope<...>` is the only typed primitive at the top level.
- *Concept-shaped* Variant: carries `instanceSchema: Schema.Schema<D, ...>`,
  no `realise: AnyStep` field, prose declares what the schema
  validates and the recognition procedure. (The current
  `Concept<D>` interface, retyped as a Trope-Variant.)
- *Procedure-shaped* Variant: carries `realise: AnyStep` and
  `proseSchema`, prose declares the ordered procedure.
  (The current `Trope<C>` interface, retyped as a different
  Variant of Trope.)
- *Imperative-shaped*, *gate-shaped*, *prohibition-shaped*
  Variants follow the same pattern. (See Implication 3 for
  the existing imperative coverage map.)

**LFM implications.** This is a **material revision** of
`:lfm[algebra]{hash=65d72909}` (`protocol/algebra`) per IMP-2's LFM-authoring
path. A future Weaving session edits the LFM body, gates the
revision, and reconciles. Downstream LFMs that reference the
algebra (`step-substrate`, `disposition-and-mode`,
`session-lifecycle`) likely need parallel updates.

**Open questions for a future Weaving session.**

1. **Variants of Trope vs. sub-Tropes.** If everything is a
   Trope and Concepts are Variants of Trope, are the *cases*
   of a Trope (per the existing `Variant<C, D>` machinery)
   still called Variants? Naming matters because Variant is
   itself a typed primitive at v0.1. Two paths: (a) keep
   Variant as the within-Trope sum-case mechanism and
   introduce a new word (e.g. *Shape*) for the Concept-vs-
   procedure distinction; (b) collapse Variant entirely into
   the same mechanism that distinguishes Concept-shape from
   procedure-shape.
2. **Step-substrate preservation.** A Step is the unit of how
   inside a Trope. Is a Step a small Trope? Or is the Step
   substrate preserved as a sub-primitive that Tropes
   compose? Probably preserved — the granularity differs
   meaningfully (a Trope has identity and prose; a Step has
   typed I/O and a memoisation key).
3. **Migration path on the file system.** The 15 existing
   Concept seeds in `registry/concepts/<id>/`: do they move
   to `registry/tropes/<id>/` under the unification, or does
   the file layout preserve a human-readable distinction even
   when the type system collapses it? Migration churn vs.
   cognitive-load-on-readers tradeoff.
4. **Methodological consistency with prose-before-code.**
   ADR-005 (since dissolved) said: author Concept prose
   before deriving code. Under unification: author
   guide-understanding-Trope before authoring procedure-Trope.
   Same imperative, different vocabulary. The prose-before-
   code stance survives; only the words change.
5. **Backward compatibility of the type system.** The
   existing `concept(...)` and `trope(...)` smart constructors
   (`kinds.ts:80-89`, `kinds.ts:159-172`) — do they survive
   as ergonomic aliases for Variant constructors of a unified
   `trope(...)` constructor, or are they retired entirely?

**Cross-references.**
- Implication 3 (`trope-lookup-substrate`) — its proposed
  annotation syntax becomes universal under this
  unification.
- Implication 5 (`learn-as-coherence-proof`) — the operational
  expression of this algebra revision.
- Implication 1 (`concept-modality-legacy-field`) — the
  cleanup of the legacy Modality field is upstream of this
  revision; both touch `kinds.ts`.

**Default proposal at close.** File to
`corpus/memos/everything-is-a-trope.md`. This is gate-bearing
prose for a future Weaving session that revises
`:lfm[algebra]{hash=65d72909}` (`protocol/algebra`) and the dependent LFMs.

**Promotion candidacy.** This is the *foundation* of
Implications 3 and 5. Promoting it shifts Mode to Weaving and
authors the algebra LFM revision in this session. Largest
scope move available; defer to Person-direction.

### Implication 5 — CLI-driven self-describing learning system as coherence proof

**Status:** Promoted (see `## Decisions Made` — *Implications adjudicated*)
**Id:** `learn-as-coherence-proof`

**The claim (Person, recorded verbatim from this session's
prompt).** *"@ itself is a trope: literate learn @ — would
return explanation on tropes annotations. ... cli-driven
learning system is the best way to prove LF coherence
conceptually and methodologically."*

**The mechanism.** A single CLI verb — `literate learn <ref>`
— that resolves any annotation, any Trope (including
Concept-shaped Variants under Implication 4), any guiding
universal, any algebra primitive, to its typed spec + bound
prose. Under Implication 4's unification, *everything is a
Trope*, so there is no `trope learn` vs `concept learn` vs
`imperative learn` verb fan-out. **One universal verb.**

**Self-description.** The annotation system itself is a Trope
(per Implication 3's resolution: `@` is the canonical
prefix). Invoking `literate learn @` returns the annotation
system's prose body — syntax conventions, bare-vs-
parameterised semantics, resolution rules. *The system
describes itself in its own terms.* Any extension to the
annotation system is automatically learnable through the same
verb because the system's own description is one of the things
the system can teach.

**Methodological claim.** *"CLI-driven learning is the best way
to prove LF coherence conceptually and methodologically."* The
criterion: every `@<role>` in authored prose, every Trope-id,
every cross-reference, when invoked through `literate learn`,
must resolve. Coherence inconsistencies — drift between LFMs
and their cross-references, broken annotation references,
undocumented roles, dangling Concept seeds — surface
mechanically as failed `learn` invocations. **Coherence is
demonstrated by the substrate's ability to teach itself.** Gaps
in coherence become gaps in self-description.

**Why this is more than ergonomics.** A typed lookup verb is a
developer-experience feature. A *self-describing* lookup verb
is a substrate-level invariant: the framework's internal
consistency is checked by its own learnability. This inverts
the usual relationship between a system and its documentation
— the documentation isn't a static artefact, it's an
executable view of the substrate. The documentation is *the
substrate viewed through the learn-verb*; if the view is
broken, so is the substrate.

**Concrete shape (extends Implication 3's resolution).**

1. **Single CLI verb.** `literate learn <ref>`. `<ref>` is any
   annotation form: `@<role>`, `@<role>(<id>)`, or raw `<id>`.
2. **TS API surface.** `Trope.learn(ref)` on `@literate/core`,
   returning `Effect<TropeLookupResult, TropeNotFound>` where
   `TropeLookupResult` carries id, version, Variant kind,
   prose body, bound Schema (where applicable), bound parents
   (Tropes referenced via dependencies / realises chains),
   and bound annotation surface.
3. **Output format.** Pretty Markdown for human reading; JSON
   via a `--json` flag for programmatic agent consumption.
4. **Reconcile integration.** `literate reconcile` cross-checks
   every `@<role>(<id>)` and `@<role>` annotation in authored
   prose under `corpus/`, `registry/`, and `.literate/`. Broken
   references surface as a `lfm-status: Drifted`-like
   diagnostic. **Reconcile becomes the substrate's coherence
   checker.**
5. **Self-description seeds.** A new `registry/tropes/<id>/`
   for the annotation system itself (`@`), so
   `literate learn @` resolves to a real seed.
   Likely candidates for self-description seeds: `@`,
   `learn`, `reconcile`, `weave`, `tangle`, `update`. Each
   gets a typed Trope seed describing its own semantics.

**Open questions for a future Weaving session.**

1. **Does `learn` mutate state?** No — it's read-only by
   design. But: should it record an *access log* (which Tropes
   the agent has consulted in this session)? Useful for
   session-end auditing; risks coupling agent state to the
   verb's purity.
2. **Does `learn` work on consumer repos?** Yes — the
   substrate is the same in any repo carrying `.literate/`.
   Coherence is a per-repo invariant; the verb runs against
   whatever Tropes the repo carries (LF's own + extensions).
3. **What about partial coherence?** A repo where some
   `@<role>` annotations don't resolve is still functional;
   `literate reconcile` reports the drift but doesn't refuse
   to run. Coherence is a target, not a hard precondition.
4. **Versioning semantics.** Tropes carry a `version` field
   (semver). Does `learn` resolve to the version named in the
   reference, or always the latest? Per-call flag vs. global
   resolution policy.
5. **Output schema for JSON mode.** Needs a typed Schema (per
   the framework's own discipline). Likely a small new
   Concept-shaped Trope-Variant: `LearnResult`.

**Cross-references.**
- Implication 4 (`everything-is-a-trope`) — the algebra
  unification this verb operates over.
- Implication 3 (`trope-lookup-substrate`, with the resolution
  block) — the annotation syntax this verb resolves.
- Implication 1 (`concept-modality-legacy-field`) — orthogonal
  cleanup.

**Default proposal at close.** File to
`corpus/memos/learn-as-coherence-proof.md`.

**Promotion candidacy.** Co-promotable with Implication 4;
the `learn` verb depends on the unified algebra. A future
Weaving session can author both at once or stage them
(algebra LFM revision first, then verb implementation,
then per-Variant Trope seeds for self-description).

## Summary

The session opened in Exploring Mode for what looked like a
narrow Implication-surfacing task — the legacy `Concept.modality?`
field cleanup — and through Person-driven probing widened into a
substrate revision of the LF algebra itself. By close, five
Implications had Surfaced and all five Promoted into a Weaving
arc that revised three existing LFMs (`algebra`,
`disposition-and-mode`, `step-substrate`) and authored two new
LFMs (`annotation-substrate`, `learn-and-coherence`). The
revision lands four substrate moves: the algebra is now
**Concept-primary** with Concept-presupposes-Tropes as the
ontological frame; **Mode and Disposition both live on Tropes**
(atomic at the Step layer, derived on composite Tropes); the
**annotation surface unifies on `:`** (inline, leaf, container
densities, flat-containers rule, 1:1 directive-to-Trope
mapping); and **`literate learn` becomes the universal lookup
verb**, with coherence defined operationally as every
annotation resolving through `learn`. Concept-revision
decisions for `kinds.ts` are gated as prose (drop `modality`,
add `tropes`, add `disposition` + `mode` on Trope, name the new
helper `arcSchema`); the actual code edits are deferred to a
Planned Tangling successor (`tangle-substrate-revision`) that
will also implement the directive parser, the `learn` CLI verb,
the meta-Concept seeds, and the `@`→`:` migration via reconcile.
The Recognition Trope concept is deferred entirely. All five
LFMs touched carry non-`Reconciled` status awaiting the
Tangling successor's reconcile extension.

## Decisions Made

### Algebra revision (Goal 2)

- **Algebra is Concept-primary.** Every authored thing is a
  Concept; every Concept presupposes one or more Tropes;
  Tropes realise Concepts in Prose or Code; the realisations
  are the substrate's authored and emitted artefacts. The
  earlier "everything is a Trope" framing is retracted in
  favour of Concept-Trope co-primacy with Concept-presupposes-
  Tropes.
- **Concepts do not carry Disposition or Mode.** Both fields
  live on Tropes. A Concept's effective Disposition is the
  aggregate of its Tropes' Dispositions.
- **A Concept has one or more Tropes.** Multiple Tropes for one
  Concept means alternative full realisations, not partial
  views. Tropes are not complementary; they are alternative.
- **Tropes are typed composable monadic prose, not Code.** The
  output of tangling a Trope is Code; the Trope itself lives
  as prose-with-types.
- **Steps are atomic Tropes.** Each Step carries a single Mode
  and a single Disposition; the six Step kinds become Variants
  of the Step Trope.
- **Composition produces an Arc.** A Trope's `proseSchema` may
  reference sub-Tropes; the validator dispatches recursively;
  the resulting graph is the Trope's Arc.
- **Composition is flat.** Container directives do not nest;
  hierarchical depth is carried by Markdown headings (h1/h2/h3)
  for human readability, not by directive nesting.
- **LFM is the central Concept.** First-class `lfm-status`
  reflects LFMs' load-bearing role for substrate coherence.
- **Pragmatic limit.** Not every authored element is a formal
  Trope; formalisation requires a Concept; the Recognition
  Trope (deferred entirely per Person directive) bridges
  authored content and formal Tropes when introduced later.

### Annotation substrate (Goal 3)

- **Unify on `:` for the annotation surface.** Three densities:
  inline `:trope[id]` (citation), leaf `::role{key=val}`
  (parameterised emit), container `:::role{key=val}…:::`
  (parameterised body). The earlier proposal `@<role>(<id>)` is
  retracted in favour of the `:`-prefixed directive family
  (CommonMark / `remark-directive` standard syntax).
- **Flat-containers rule.** Container directives do not nest;
  inline and leaf directives may appear inside a container's
  body without opening recursive validation contexts.
- **1:1 directive-name → Trope-id mapping.** No alias map at
  v0.1; aliasing added only on actual collision.
- **Migration plan.** `@lfm(<hash>)` legacy form preserved in
  existing prose; new authoring uses `:lfm[<id-or-hash>]`;
  reconcile (extended in the Tangling successor) migrates
  mechanically.
- **Frontmatter migrates to leaf directive.** YAML `---` blocks
  retire in favour of `::metadata{key=val}` for substrate
  uniformity. (Tangling task — actual rewrite of existing
  frontmatter is deferred.)

### Disposition and Mode (Goal 4)

- **Mode and Disposition are Trope-level fields.** Sessions
  inherit them from composing sub-Tropes. Atomic Tropes
  (Steps) carry single values; composite Tropes derive
  effective values from their sub-Tropes.
- **`Domain = Disposition.scope`.** The Domain Concept's
  instances are valid `Disposition.scope` values. Domain is
  the open-vocabulary refinement of `Disposition.base`, not a
  third axis.

### Step substrate (Goal 5)

- **Steps are atomic Tropes.** The atomicity constraint is
  single Mode + single Disposition + body small enough to be
  self-contained without sub-Trope composition.
- **Step kinds as Variants.** The six closed kinds (`prose |
  workflow | effect | ai | gate | io`) specialise the Step
  Trope as Variants in the existing `Variant<C, D>` sense.

### Learn and coherence (Goal 6)

- **`literate learn <ref>` is the universal lookup verb.** No
  per-kind sub-verb. The verb is read-only; it returns a typed
  view of the substrate.
- **Coherence is a substrate-level invariant.** Defined
  operationally: the substrate is coherent when every
  annotation in authored prose resolves through `learn`.
- **Reconcile is the coherence-checker.** Point lookup via
  `learn`; batch coherence run via `reconcile`.
- **Concept-of-Concept and Concept-of-Trope seeds are
  required.** Without them the meta-level is unreachable
  through `learn`. Authoring is part of the Tangling
  successor's scope.

### Concept-revision decisions (Goal 7 — gated prose, Tangling deferred)

The following decisions about `packages/core/src/kinds.ts` are
Accepted at this Weaving session (per FAST-mode chain-prompt
gate) and authoritative for the Tangling successor:

1. **Drop `modality?: Modality`** from `Concept<D>` (kinds.ts:63)
   and `modality: Modality` from `Trope<C>` (kinds.ts:142).
   Drop `ModalitySchema` and the `Modality` value namespace
   (kinds.ts:30-50). Drop the re-exports from
   `packages/core/src/index.ts:151-152`. Update tests that
   reference these (`packages/core/src/__tests__/kinds.test.ts`).
2. **Add `tropes: ReadonlyArray<AnyTrope>` to `Concept<D>`.**
   Resolution mechanism (eager imports vs id-string lazy
   resolution vs thunked) chosen by the Tangling successor.
3. **Add `disposition: Disposition` to `Trope<C>`** —
   replacing the legacy `modality: Modality` field's role.
4. **Add `mode: Mode` to `Trope<C>`.** Mandatory for atomic
   Tropes (Steps); optional for composite Tropes whose
   effective Mode is derived. Exact type-system encoding
   (`AtomicTrope` / `CompositeTrope` split vs. single `Trope`
   with optional `mode`) chosen by the Tangling successor.
5. **Name the new sub-Trope-aware proseSchema helper
   `arcSchema`.** Existing `requireMdxStructure` keeps its
   name. The helper recurses into directive nodes and
   dispatches to sub-Trope schemas.

### LFM bodies authored (Work Done — see below)

- `corpus/manifests/protocol/algebra.md` — body rewritten;
  `status: Drifted` until Tangling-extended `reconcile` runs.
- `corpus/manifests/protocol/annotation-substrate.md` — new
  LFM authored; `status: Pending`.
- `corpus/manifests/protocol/disposition-and-mode.md` — body
  rewritten; `status: Drifted`.
- `corpus/manifests/protocol/step-substrate.md` — body
  rewritten; `status: Drifted`.
- `corpus/manifests/protocol/learn-and-coherence.md` — new
  LFM authored; `status: Pending`.

### Implications adjudicated

All five Implications surfaced earlier in this session move to
terminal status:

- **Implication 1** (`concept-modality-legacy-field`) — **Promoted**
  into Goal 7, decision (1).
- **Implication 2** (`domain-as-concept-plus-disposition`) —
  **Promoted** into Goal 4 (the `Domain = Disposition.scope`
  decision in `disposition-and-mode.md`).
- **Implication 3** (`trope-lookup-substrate`) — **Promoted**
  into Goal 3 (the annotation-substrate LFM, refined to the
  `:` unified surface) and Goal 6 (the `learn` verb).
- **Implication 4** (`everything-is-a-trope`) — **Promoted**
  into Goal 2 (the algebra LFM revision), substantially
  refined: the framing landed as Concept-primary with
  Concept-presupposes-Tropes, not the original
  "everything is a Trope" claim.
- **Implication 5** (`learn-as-coherence-proof`) — **Promoted**
  into Goal 6.

The Recognition Trope concept (briefly considered as a sixth
Implication in earlier deliberation) is **deferred entirely**
per Person directive — explicitly removed from both this
session's scope and the Tangling successor's scope.

### Mode shifts

- `2026-04-26T07:15` — session opened in `Exploring`.
- `2026-04-26T~13:15` (chain-prompt time) — Mode shift
  `Exploring → Weaving`, gated by Person directive (FAST mode
  invocation: *"Start multisession in FAST mode … Derive order
  from the nature of work defined here"*). Goals 2–7 stamped
  Active at open per FAST-mode discipline.

## Work Done

- `corpus/sessions/2026-04-26T0715-concept-modality-legacy-implication.md`
  — created at session-open; iteratively revised through the
  Exploring deliberation; Goals 2–7 added on Mode shift; this
  Decisions Made + Work Done block populated at session close.
- `corpus/sessions/sessions.md` — index row appended at open;
  topic line revised twice as the Implication set grew; final
  topic reflects the substrate revision arc.
- `corpus/manifests/protocol/algebra.md` — body fully rewritten
  for Concept-primary algebra (Goal 2). `status: Drifted`
  pending Tangling-extended `reconcile`.
- `corpus/manifests/protocol/annotation-substrate.md` — new
  LFM authored (Goal 3). Declares the `:` unified annotation
  surface; three directive densities; flat-containers rule;
  1:1 directive-to-Trope mapping; `@`→`:` migration plan.
  `status: Pending`.
- `corpus/manifests/protocol/disposition-and-mode.md` — body
  rewritten (Goal 4) to lift Mode and Disposition to Trope
  level; declare `Domain = Disposition.scope`; declare
  atomic-vs-composite Trope distinction. `status: Drifted`.
- `corpus/manifests/protocol/step-substrate.md` — body
  rewritten (Goal 5) to declare Steps as atomic Tropes; Step
  kinds as Variants of the Step Trope; single Mode + single
  Disposition per Step. `status: Drifted`.
- `corpus/manifests/protocol/learn-and-coherence.md` — new
  LFM authored (Goal 6). Declares `literate learn` as
  universal verb; coherence-via-self-description thesis;
  reconcile as coherence-checker; Concept-of-Concept +
  Concept-of-Trope seed requirements. `status: Pending`.

## Deferred / Discovered

- **Tangling successor is named and Planned.** See `## Plan`
  block above for the slug and provisional Goals. The
  successor's scope: directive parser integration; `arcSchema`
  helper; `kinds.ts` field changes per Goal 7; `prose.mdx` →
  `trope.mdx` rename; `literate learn` CLI verb;
  Concept-of-Concept and Concept-of-Trope seeds; reconcile
  extension + `@`→`:` migration.
- **Reconcile not run in this session.** The current
  `literate reconcile` parses `@lfm(<hash>)` references but
  does not yet parse `:lfm[<id>]` annotations. Running
  reconcile now would leave the new `:` references
  unverified. Defer to the Tangling successor's reconcile
  extension.
- **Recognition Trope deferred.** Out of scope for both this
  session and the named Tangling successor. May surface in a
  later thread once the universal-Trope library question
  becomes pragmatic.
- **`Concept.tropes` resolution mechanism open.** Eager
  imports risk circularity (Concept ↔ Trope mutual
  references); id-string lazy resolution loses compile-time
  type binding; thunked imports are intermediate. The
  Tangling successor picks one based on what the type system
  actually accepts.
- **`Trope.mode` mandatory-vs-optional encoding open.** Two
  candidate shapes named in Goal 7 decision (4): an
  `AtomicTrope` / `CompositeTrope` split with mandatory `mode`
  on the atomic variant, or a single `Trope` with `mode?:
  Mode` and a discipline rule. The Tangling successor
  decides.
- **LFM statuses left as `Drifted` / `Pending`.** All five
  LFMs touched in this session carry non-`Reconciled` status
  awaiting the Tangling successor's reconcile extension.
  Treat the substrate as transitionally inconsistent until
  that successor closes.
