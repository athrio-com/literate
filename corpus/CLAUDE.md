# LF-Project Protocol — Operational Rules

*This file defines the imperative rules that govern work inside `corpus/`
— LF's own project-scope prose. It is the operational counterpart to
[`LITERATE.md`](../LITERATE.md) (the framework Protocol LF ships to
consumers) and the root [`CLAUDE.md`](../CLAUDE.md) (the maintainer
orientation shim).*

---

## Session lifecycle

1. **Start.** Every session starts by creating a new session log at
   `corpus/sessions/YYYY-MM-DDTHHMM-<slug>.md`. The `session-start`
   Trope at `packages/trope-session-start/src/prose.mdx` defines
   the template and pre-work (read last session's Summary; surface
   Deferred / Discovered; check the ADR index).
2. **Goal drafting and gating.** Write Goal(s) into the log's
   `## Goals` section. Each Goal declares `Topic`, `Upstream`,
   optional `Scope`, `Out of scope`, `Acceptance`, `Notes`. Present
   to the Person for Accept / Correct / Clarify / Reject. On Accept,
   the Goal's `Status` and `Category` fields are added.
3. **Work.** Author prose (ADRs, specs, chapter plans) as needed for
   the Goal; gate each; on Accept, proceed to the code the prose
   motivates.
4. **End.** Write the `## Summary`. Populate `## Work Done` with
   files touched and rationale. Capture carry-over in
   `## Deferred / Discovered`. Execute the `session-end` Trope:
   validate completeness, stamp `Status: Closed (YYYY-MM-DDTHH:MM)`.

## Review gate

Identical to the LF Protocol review gate (see
[`LITERATE.md#6-the-review-gate`](../LITERATE.md#6-the-review-gate)).
The authored prose covered by the gate in this repo:

- ADRs in `corpus/decisions/`
- Specs in `corpus/specs/`
- Chapters in `corpus/chapters/`
- Stories if any are added
- Session `## Goals` entries in `corpus/sessions/`
- Concept files in `corpus/concepts/` (corpus-level Concepts —
  the unified Term/Concept primitive per ADR-010)
- Category member additions and removals in `corpus/categories/`

The gate does **not** apply to: journal bodies of session logs, index
and navigation files, `Status:` transitions that flow atomically from
accepted ADRs, editorial revisions of Concepts and Categories, code
and config changes derived from accepted prose.

## Mutability

| Kind | Profile |
|---|---|
| ADR body | Append-only; `Status:` line sole mutable part |
| Spec | Fully mutable; material revisions gated |
| Chapter | Fully mutable living plan; material revisions gated |
| Session log | Append-once body; `## Goals` entries gated; `Summary` written once at end |
| Memo | Ephemeral input; creation and material reduction gated |
| Category file | Fully mutable body; member additions/removals gated; editorial ungated |
| Concept file (corpus level) | Fully mutable body; new files and material revisions gated; editorial ungated |
| Index files | Fully mutable; mechanical reflections of the folder |

## Closed vocabularies

All enumerated types used in LF-project prose live in
`corpus/categories/`. At v0.1 the folder seeds four category files:

- `tags.md` — tag set for ADR conflict detection and cross-cut search
- `adr-status.md` — ADR `Status:` values and transitions
- `goal-status.md` — session-Goal `Status:` values and transitions
- `goal-category.md` — session-Goal `Category:` values

New vocabularies land as new files plus an index row in
`categories/categories.md`. Editing a member list is a gated authorial
change. Editing the prose around the list (clearer phrasing, examples,
*Used in* references) is ungated.

## NEVER

- Write code before the prose motivating it is authored and gated.
- Edit an accepted ADR's body. The `Status:` line is the only mutable
  surface for supersession or deferral.
- Invent a value of a closed vocabulary before the corresponding
  member file exists and is accepted.
- Capitalise a corpus-level Concept in prose before its file exists
  in `corpus/concepts/`.
- End a session without running the `session-end` Trope or without
  writing `## Summary`.

## Working with `packages/`

`corpus/` governs decisions about LF-the-project (tooling, releases,
layout, CI). `packages/` *is* LF-the-product — each Concept, each
Trope, the starter template, the core library, and the CLI ship as
a workspace package (`@literate/concept-*`, `@literate/trope-*`,
`@literate/template-minimal`, `@literate/core`, `@literate/cli`).
When a corpus decision lands that affects what LF ships, implement
it in the relevant package as a code-after-prose step.

Do not edit `packages/concept-*/src/concept.mdx` or
`packages/trope-*/src/prose.mdx` prose bodies without a gated
Protocol-scope decision. Those files are part of LF's ship
surface and are governed by the framework Protocol in
[`LITERATE.md`](../LITERATE.md), not by this file.

## Tag vocabulary

See `corpus/categories/tags.md` for the current tag set. Every ADR
must carry at least one tag drawn from the closed set.
