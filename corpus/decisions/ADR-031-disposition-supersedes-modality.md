# ADR-031 — Disposition supersedes Modality (terminology + shape)

**Date:** 2026-04-24
**Status:** Accepted
**Tags:** `#algebra` `#protocol`

**Supersedes:** ADR-021 (`Modality` six-case ADT). ADR-021's
body stays frozen per IMP-6; its `Status:` line is annotated
to record the supersession.

**Context:**

ADR-021 introduced `Modality` as a typed marker on Tropes
(required) and Concepts (optional) — a six-case ADT
(`Protocol | Weave | Tangle | Unweave | Untangle | Attest`)
intended to classify *what kind of work* a Trope does. Two
problems surfaced once the marker was in load-bearing use:

- **Term mismatch.** "Modality" carries linguistic weight from
  formal logic and natural-language philosophy — modal logic
  is about *epistemic / deontic / alethic* stances ("possibly",
  "necessarily", "obligatorily"). The intended meaning here was
  *referential frame* ("about what subject matter") and
  *operational stance* ("how the work is being done") — neither
  reading natively fits "modality". Every reading of the field
  required mental translation, and authoring conversations kept
  drifting back to the linguistic confusion.
- **Conflated axes.** ADR-021's six values mixed two
  orthogonal axes into one ADT. `Protocol` is a referential
  frame (the subject is the framework's own machinery).
  `Weave` / `Tangle` / `Unweave` / `Untangle` / `Attest` are
  operational stances (drafting prose, deriving code,
  comprehending prose / code, attesting consistency). Forcing
  the two into one tagged union made `(modality === 'Weave',
  modality === 'Protocol')` syntactically possible — but
  meaningfully, a Trope can be *both* (drafting Protocol prose
  about the framework). The conflation showed up as awkward
  dispatch logic and missing classifications.

The fix is to split the axes: **Disposition** names the
referential domain (what the work is about); **Mode** names
the operational stance (how the work is being done; ADR-032
adopts it). Both axes are typed; both are first-class on
sessions, Tropes, and authored instances.

**Decision:**

`Modality` is superseded by **Disposition** (this ADR) +
**Mode** (ADR-032). Disposition is a parametrised struct, not
a closed ADT — its `base` is a closed three-value set
(`Product | Protocol | Infrastructure`); its `scope`,
`prompt`, and `prose` fields are open optional strings.

### Shape

```typescript
interface Disposition {
  readonly base: 'Product' | 'Protocol' | 'Infrastructure'
  readonly scope?: string   // open, freeform sub-domain
  readonly prompt?: string  // first-class — agent reads first
  readonly prose?: string   // long-form authored declaration
}
```

Effect Schema:

```typescript
Schema.Struct({
  base: Schema.Literal('Product', 'Protocol', 'Infrastructure'),
  scope:  Schema.optional(Schema.String),
  prompt: Schema.optional(Schema.String),
  prose:  Schema.optional(Schema.String),
})
```

### The three bases

- **`Product`** — work about *what this repository builds*.
  For an LF consumer, this is their application surface; for
  LF itself, it is the framework's customer-facing surface
  (CLI verbs, template seeds).
- **`Protocol`** — work about *how the framework operates*.
  The Concept algebra, the Trope substrate, the session
  lifecycle, the Step substrate. LF's `corpus/decisions/` is
  overwhelmingly Protocol-disposition.
- **`Infrastructure`** — work about *the operational substrate
  underneath both Product and Protocol*. Build tooling,
  package management, CI, runtime constraints, monorepo
  layout. ADR-004, ADR-029, ADR-030 are Infrastructure-tagged
  in spirit.

The triple is exhaustive at v0.1. New `base` values land
through a subsequent ADR plus a Concept revision (gated).

### Distribution

`Disposition` ships as a registry seed at
`registry/concepts/disposition/` (ADR-025/026 distribution
shape). `concept.mdx` carries the prose body; `index.ts` the
typed Schema and ergonomic constructors
(`Disposition.Product` / `Disposition.Protocol` /
`Disposition.Infrastructure`).

### Where Disposition lands

- **Sessions** carry `disposition?` (optional at v0.1; see
  `concept-session`). Default for sessions authoring LF
  itself: `{ base: 'Protocol' }`. Setting Disposition at
  session-start through a typed Step is **deferred** to a
  follow-up session per the ADR-032 + ADR-033 fast-mode
  scope-narrowing — the Concept seed lands here so successors
  can wire against a typed surface.
- **Tropes** will carry `disposition` (replacing ADR-021's
  `modality`) once the metalanguage migration lands. v0.1
  keeps existing Tropes' `modality: Modality.Protocol`
  declarations in place; the migration is a follow-up
  refactor scoped under a future session (named in this
  session's `## Deferred / Discovered`). The wire is
  Disposition `Protocol` ⇔ legacy `Modality.Protocol`; other
  legacy values (`Weave / Tangle / Unweave / Untangle / Attest`)
  belong to **Mode**, not Disposition.
- **ADRs** carry an implicit Disposition through their
  existing `Tags:` vocabulary; an explicit `Disposition:`
  header line is a forward question.

**Boundary:**

- This ADR scopes the **referential-frame axis** only. The
  operational-stance axis (`Exploring | Weaving | Tangling`)
  is ADR-032's domain.
- The retired Modality ADT stays in `@literate/core` at v0.1
  (legacy compatibility); existing Tropes keep their
  `modality: Modality.Protocol` declaration. The metalanguage
  migration that replaces `modality: Modality` with
  `disposition: Disposition` on `Trope<C>` (and removes the
  `Modality` ADT) is a separate refactor session — listed in
  this session's `## Deferred / Discovered` as
  *"metalanguage migration: Modality → Disposition + Mode"*.

**Consequences:**

- `registry/concepts/disposition/{concept.mdx, index.ts, README.md}`
  is the new authoritative typed surface for the
  referential-frame axis.
- `concept-session` (authored alongside this ADR; see
  `registry/concepts/session/`) carries `disposition?:
  Disposition` in its instance Schema.
- ADR-021's body is unchanged (IMP-6); its `Status:` line is
  annotated `Superseded by ADR-031 (terminology + shape) +
  ADR-032 (operational-stance split)`.
- Existing session logs that predate Disposition remain
  valid — the field is optional at v0.1.
- The metalanguage migration on `Trope<C>` is deferred; the
  Concept seed is the typed surface successors wire against.

**Superseded by:** —
