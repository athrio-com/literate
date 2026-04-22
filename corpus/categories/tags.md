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

## Morphisms

Tags are flat; there is no hierarchy or implication. Two ADRs share
relevance iff they share a tag. An ADR carrying only a single tag
signals a narrow concern.

## References

- Used in every ADR in `corpus/decisions/`.
- The `adr-flow` Trope requires at least one tag at draft time.
