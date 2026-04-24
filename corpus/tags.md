# Tags — LF authored set

The closed set of `#`-prefixed slugs LF uses on its own ADRs
in `corpus/decisions/`. This file is **authored content**,
not a Protocol mechanism — the `Tag` Concept *type* (the
brand-typed slug shape) lives at
[`registry/concepts/tag/`](../registry/concepts/tag/) and
ships to consumers; consumers author their own slug set at
their own `corpus/tags.md`.

The set is additive: new tags are added by gated authorial
change; removing a tag requires a separate gated change and
retagging affected ADRs.

## Members

- **`#process`** — LF's own authoring workflow (sessions,
  gating, review).
- **`#algebra`** — the Concept / Trope / Authored-instance
  structural model.
- **`#protocol`** — the LITERATE.md product surface.
- **`#corpus`** — the corpus-level conventions (folders,
  indexes, file shapes).
- **`#tooling`** — CLI, core library, Effect integration,
  build.
- **`#licensing`** — framework and template licensing
  decisions.
- **`#self-hosting`** — how LF handles its own bootstrap (no
  `.literate/` in LF's own repo).
- **`#release`** — versioning, publishing, distribution.
- **`#site`** — the (legacy) Next.js public documentation
  site.
- **`#template`** — starter templates and their manifests.
- **`#execution`** — runtime, replay, Effect-based Step
  machinery, and the session-log-as-event-store substrate
  (introduced with ADR-011 through ADR-014).
- **`#migration`** — transitions between framework
  generations: legacy-code freeze, corpus-as-global-
  coordination (introduced with ADR-018); namespace-scope
  corrections (ADR-019 reinstating `@literate/*` for
  rewrite packages). Use when a decision moves a structural
  commitment across the legacy/rewrite boundary.

## Morphisms

Tags are flat; there is no hierarchy or implication. Two ADRs
share relevance iff they share a tag. An ADR carrying only a
single tag signals a narrow concern.

## Schema-typed enforcement (optional)

The shape `Tag` is enforced by the Concept's
`Schema.pattern(/^#[a-z][a-z0-9-]*$/)`; closed-set membership
over LF's authored set is not yet enforced at the Schema
level. A future use of `closedTagSet` from the Tag Concept's
`index.ts` over the slug list above is the path to typed
enforcement when needed.

## References

- The `Tag` Concept type ships at
  [`registry/concepts/tag/`](../registry/concepts/tag/).
- The `ADR` Concept (also at `registry/concepts/adr/`)
  composes `Schema.Array(TagSchema)` as the `tags` field of
  `ADRSchema`.
- IMP-2 (Mandatory Agent Instruction in
  [`CLAUDE.md`](./CLAUDE.md)) describes the during-session
  ADR-authoring procedure that consults this file.
