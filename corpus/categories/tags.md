# Category — Tags

Closed set of tags used on ADRs in this repo. Every ADR must carry at
least one tag drawn from this set. The set is additive: new tags are
added by gated authorial change; removing a tag requires a separate
gated change and retagging affected ADRs.

Tags exist to make cross-cutting concerns queryable. They are not
categorical types; one ADR can carry multiple tags.

## Members

- `#process` — LF's own authoring workflow (sessions, gating, review).
- `#algebra` — the Concept / Trope / Authored-instance structural model.
- `#protocol` — the LITERATE.md product surface.
- `#corpus` — the corpus-level conventions (folders, indexes, file shapes).
- `#tooling` — CLI, core library, Effect integration, build.
- `#licensing` — framework and template licensing decisions.
- `#self-hosting` — how LF handles its own bootstrap (no `.literate/`).
- `#release` — versioning, publishing, distribution.
- `#site` — the Next.js public documentation site.
- `#template` — starter templates and their manifests.
- `#execution` — runtime, replay, Effect-based Step machinery, and the
  session-log-as-event-store substrate (introduced with ADR-011
  through ADR-014).
- `#migration` — transitions between framework generations:
  legacy-code freeze, corpus-as-global-coordination (introduced
  with ADR-018); namespace-scope corrections (ADR-019 reinstating
  `@literate/*` for rewrite packages). Use when a decision moves a
  structural commitment across the legacy/rewrite boundary.

## Morphisms

Tags are flat; there is no hierarchy or implication. Two ADRs share
relevance iff they share a tag. An ADR carrying only a single tag
signals a narrow concern.

## References

- Used in every ADR in `corpus/decisions/`.
- The `adr-flow` Trope requires at least one tag at draft time.
