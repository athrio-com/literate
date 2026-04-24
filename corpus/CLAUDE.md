# LF-Project Protocol — Operational Rules

*This file defines the imperative rules that govern work inside `corpus/`
— LF's own project-scope prose. It is the operational counterpart to
[`LITERATE.md`](../LITERATE.md) (the framework Protocol LF ships to
consumers) and the root [`CLAUDE.md`](../CLAUDE.md) (the maintainer
orientation shim).*

---

## Mandatory Agent Instructions

These instructions apply to **every** Claude (or other LLM) session
that touches this repo. They are imperative, not advisory. The
descriptive lifecycle / mutability / vocabulary sections that follow
are reference material the imperatives point at; do not skip the
imperatives in favour of skimming the descriptive sections.

The two **canonical procedure sources** (authoritative historical
prose, authored on the legacy algebra; preserved verbatim under
the ADR-020 freeze) are:

- `legacy/packages/trope-session-start/src/prose.mdx` — the
  start procedure (spontaneous + planned paths, pre-work steps).
- `legacy/packages/trope-session-end/src/prose.mdx` — the end
  procedure (validations including Plan-entry coverage, Closed
  stamp).

The rewrite re-authors these Tropes on the Step substrate as
registry seeds at `registry/tropes/session-start/` and
`registry/tropes/session-end/` per ADR-025/026 (the
`@literate/trope-*` workspace packages from S2/S3 were collapsed
into registry seeds during P2).

The imperatives below inline the *decision points* a fresh agent
needs before opening any file; the trope prose is the authority on
the deep procedure if a step needs disambiguation.

### IMP-1 — AT SESSION START (before any other tool call)

Execute these steps **in order**. Do **not** read package code, run
greps, or open exploratory tool calls before step 5.

1. **Read this file** (`corpus/CLAUDE.md`) **fully**. You are reading
   it now. Continue.
2. **Detect the start path.** Run `ls corpus/sessions/` (or use the
   built-in directory listing) and inspect each filename. Then read
   `corpus/sessions/sessions.md` for the index with current Status.
   Determine which path applies:
   - **(a) Spontaneous start.** No `Status: Planned` log is ready
     to begin, *and* the Person's prompt does not name a specific
     planned session, *and* the Person's prompt is unambiguously a
     new request that does not match any planned slug.
   - **(b) Planned start.** A `Status: Planned` log exists whose
     dependencies (other planned sessions) are satisfied (closed),
     *and either* the Person's prompt names it explicitly, *or* the
     Person's prompt is a vague continuation ("continue", "let's
     keep going", "next", "continue with goals") with exactly one
     ready-to-start planned session — in which case proceed with
     that one **after asking** the Person to confirm it is the
     intended one. If multiple are ready, list them and ask.
   - **(c) Resume an Open orphan.** A non-`Planned` log shows
     `Status: Open` from a prior thread. **Do not start a new
     session.** Surface the orphan to the Person and ask whether to
     resume, close, or revert. **Never** stamp a fresh `Status:
     Open` while an orphan exists without explicit Person consent.
3. **Surface prior context.** Read the most recent
   `Status: Closed` session log's `## Summary` and
   `## Deferred / Discovered` sections. Print a one-paragraph
   recap to the Person.
4. **Read the ADR index** at `corpus/decisions/decisions.md`.
   Note any `Superseded` rows that affect the current scope.
5. **Stamp the session log header** per the chosen path:
   - Spontaneous: create `corpus/sessions/YYYY-MM-DDTHHMM-<slug>.md`
     with `Status: Open`, `Started: YYYY-MM-DDTHH:MM` (UTC),
     `Agent: <model id>`. Add a `## Pre-work` block recording the
     items surfaced in steps 3 and 4.
   - Planned: open the existing log, change `Status: Planned` →
     `Status: Open`, fill in `Started:` (UTC current time) and
     `Agent:`. Append a `## Pre-work` block. **In the parent
     session referenced by `Planned by:`**, freeze the matching
     Plan entry by setting its `Realised by:` field to this log's
     path. (Mechanical edit; ungated.) If the filename's encoded
     timestamp differs from the actual start time by more than the
     same calendar day, propose a rename to the Person; do not
     rename without consent.
6. **Re-gate every Goal** before any other work:
   - Spontaneous: draft the session's Goal(s) per the *Goal shape*
     below and present each to the Person for **Accept / Correct /
     Clarify / Reject**. Do not proceed past a Goal until Accepted.
   - Planned: re-present each provisional Goal copied from the
     parent's Plan entry. Provisional Goals are *drafts*; they
     land authoritatively only on this re-gate. The Person may
     Accept verbatim, Correct, Clarify, or Reject. Mark the
     accepted set with `Status: Active` and the chosen `Category:`.
7. **Begin work** only after at least one Goal is `Active`.

### IMP-2 — DURING the session, on every architectural decision

LF distinguishes two architectural artefacts:

- **Concept-level material revision** — the *higher-order* and
  *flowing* canon. Use this for new architectural primitives, new
  contracts, or refinements to existing Concepts. Concept files at
  `packages/concept-*/src/concept.mdx` are fully mutable; material
  revisions are gated. Per the Person's framing, **the Concept
  update IS the architectural decision artefact** — no separate
  ADR is required for changes that fit the Concept shape.
- **ADR** — the *frozen* and *one-shot* artefact. Use this for
  tooling commitments ("we use library X"), append-only amendments
  to prior ADRs (because ADR bodies are immutable post-Accept), or
  decisions that benefit from an unambiguous historical anchor.

Procedure (apply the matching path):

**Concept-level path:**

1. Identify the Concept package whose prose changes
   (`packages/concept-*/`).
2. Draft the revised `concept.mdx` and (if needed) `index.ts`
   Schema delta.
3. Present the diff to the Person for **Accept / Correct /
   Clarify / Reject**.
4. On Accept: write the revised files; cross-update any
   downstream Trope prose / schema / category file affected;
   typecheck the affected packages.
5. Append a bullet to the session log's `## Decisions Made`
   describing the revision and the files touched.

**ADR path:**

1. Determine the next ADR number:
   `ls corpus/decisions/ADR-*.md | sort | tail -1`, increment.
2. Identify tags from `corpus/categories/tags.md`. If no existing
   tag fits, add one to `tags.md` first (gated as a category
   change).
3. Check for conflicts: for each tag, grep
   `corpus/decisions/ADR-*.md` for prior ADRs with overlapping
   tags. If the new ADR overrides a prior one, prepare to set the
   prior's `Status:` to `Superseded by ADR-NNN` (do **not** apply
   yet — wait until step 5).
4. Draft the ADR file. Present to the Person for **Accept /
   Correct / Clarify / Reject**. On Reject, delete the file.
5. After Accept: update `corpus/decisions/decisions.md` (new
   row); apply any supersession `Status:` edits; append a bullet
   to the session log's `## Decisions Made`.

### IMP-3 — DURING the session, on every material scope change

If the work mid-session diverges materially from the current Goal:

1. **Do not edit the current Goal in place.** Append a new Goal
   entry to the session log's `## Goals` section using the *Goal
   shape* below.
2. Present the new Goal to the Person for **Accept / Correct /
   Clarify / Reject**.
3. On Accept: set the prior Goal's `Status:` to
   `Superseded by Goal N` atomically (ungated). The new Goal's
   `Status:` becomes `Active`. The journal of intent is preserved.
4. Minor typo fixes to an accepted Goal do not require re-gating.
   Material changes to `Topic`, `Scope`, `Upstream`, or
   `Acceptance` do.

### IMP-4 — DURING the session, optional: pre-scope a multi-session arc

If this session's work warrants a deliberate multi-session arc:

1. Author a `## Plan` block in this session log. Each entry
   declares `Slug`, `Topic`, optional `Depends on`, and a `Goals`
   list whose entries carry `Topic`, `Upstream`, `Acceptance`.
2. Present each Plan entry to the Person for **Accept / Correct /
   Clarify / Reject**.
3. On Accept: create the successor `Status: Planned` log at
   `corpus/sessions/YYYY-MM-DDTHHMM-<slug>.md` with the
   provisional Goals copied verbatim. Annotate the parent's Plan
   entry with the successor's path (`Realised by:` is set later
   when the successor opens). Add the successor row to
   `corpus/sessions/sessions.md` with `Status: Planned`.
4. While `Planned`, the successor's Goals remain revisable
   (gated). Once the successor opens (`Status: Open`), the
   parent's Plan entry is frozen.

### IMP-5 — AT SESSION END

1. Confirm every Goal carries a terminal `Status:` (`Completed`,
   `Superseded by Goal N`, or `Abandoned`). No Goal may remain
   `Active` at session close.
2. If a `## Plan` block exists, confirm every Plan entry is in
   one of: `Realised by …` (successor opened), or
   `Planned` (successor exists; carry forward in
   `## Deferred / Discovered`), or `Abandoned` (with a one-line
   rationale beneath the entry). No indeterminate state.
3. Write `## Summary` (2–4 sentences) — what landed, what
   shifted, how it relates to upstream.
4. Confirm `## Work Done` enumerates the files created /
   modified / deleted with rationale.
5. Confirm `## Decisions Made` references every ADR or Concept
   revision Accepted in this session.
6. Populate `## Deferred / Discovered` with any carry-over
   items, including unrealised Plan entries and any newly
   surfaced gaps.
7. Stamp the header `Status:` line: `Closed (YYYY-MM-DDTHH:MM)`
   in UTC.
8. Update the row for this session in
   `corpus/sessions/sessions.md` to the Closed Status.
9. (Optional, only when the Person asks for a commit:) Stage and
   commit per repo style. Never push.

### IMP-6 — NEVER

- Never write code before the prose motivating it is authored and
  gated. (`prose-before-code`, see ADR-005.)
- Never edit an accepted ADR's body. The `Status:` line is the
  sole mutable part.
- Never invent a value for a closed vocabulary before the
  corresponding member file exists and is accepted.
- Never capitalise a corpus-level Concept in prose before its
  file exists in `corpus/concepts/`.
- Never end a session without running the `session-end` procedure
  (IMP-5) or without writing `## Summary`.
- Never stamp `Status: Open` on a `Planned` session without first
  re-gating its provisional Goals (IMP-1.6).
- Never stamp a fresh `Status: Open` on a new spontaneous session
  while a non-`Planned` log shows `Status: Open` from a prior
  thread without explicit Person consent (IMP-1.2.c).
- Never spend tool calls on repo investigation when a `Status:
  Planned` session ready to start would answer the Person's
  prompt — surface it instead and ask.
- Never add a value to a closed vocabulary without first updating
  the matching `corpus/categories/*.md` file (gated authorial
  change).
- Never bypass the Goal gate, even for "trivial" work. The gate
  exists to make intent visible; trivial work skipped past the
  gate becomes invisible work.
- Never edit a file inside the frozen `legacy/` tree (legacy
  `packages/`, `site/`, `LITERATE.md`, and pre-rewrite root
  tooling, all now under `legacy/` per
  [ADR-020](./decisions/ADR-020-unify-monorepo-layout.md); freeze
  rule from
  [ADR-018](./decisions/ADR-018-legacy-code-frozen-corpus-global.md))
  without an explicit Person-authorised freeze lift recorded in
  the active session's `## Decisions Made`. Reading `legacy/`
  for historical context is encouraged; editing is not.
- Never import from `legacy/packages/*` into active `packages/*`.
  The rewrite is structurally isolated from the legacy by the
  ADR-020 layout (separate subtrees; the root workspace only
  enumerates `packages/*`, not `legacy/packages/*`) in addition
  to the ADR-018 §4 rule. Both trees share the `@literate/`
  scope per ADR-019; isolation is by subtree, not by namespace.

### Goal shape

A Goal entry uses the following shape. `Status:` and `Category:`
are post-Accept fields; omit them from the draft presented at the
gate.

```markdown
### Goal N — short title

**Status:** (post-Accept; one value from goal-status.md)
**Category:** (post-Accept; one value from goal-category.md)
**Topic:** one paragraph of what the work is and why now.
**Upstream:** the ADRs / Concepts / specs / sessions / files this
work derives from. If none exist, the first sub-task of the Goal
is to draft the missing prose.
**Scope:** (optional bullets — what is in)
**Out of scope:** (optional bullets — what is not)
**Acceptance:** (optional bullets — what "done" looks like)
**Notes:** (optional — tradeoffs, constraints)
```

---

## Session lifecycle

A session is `Planned`, `Open`, `Closed (timestamp)`, or
`Abandoned` (closed vocabulary in
`corpus/categories/session-status.md`). Two entry paths exist:
*spontaneous* (the default — open, gate, work, close) and
*planned* (a parent session pre-scoped this one in its `## Plan`).

1. **Start.** Spontaneous: create a new session log at
   `corpus/sessions/YYYY-MM-DDTHHMM-<slug>.md` with `Status:
   Open`. Planned: open an existing `Status: Planned` log, stamp
   `Status: Open` and `Started: YYYY-MM-DDTHH:MM`, freeze the
   parent's Plan entry by setting its `Realised by` field, and
   re-gate every provisional Goal copied from the parent. Either
   way the `session-start` Trope at
   `packages/trope-session-start/src/prose.mdx` runs the pre-work
   (read last non-`Planned` session's Summary; surface Deferred /
   Discovered; check the ADR index; list pending `Planned`
   sessions).
2. **Goal drafting and gating.** Write Goal(s) into the log's
   `## Goals` section. Each Goal declares `Topic`, `Upstream`,
   optional `Scope`, `Out of scope`, `Acceptance`, `Notes`. Present
   to the Person for Accept / Correct / Clarify / Reject. On Accept,
   the Goal's `Status` and `Category` fields are added.
3. **Work.** Author prose (ADRs, Concept-level material revisions,
   specs, chapter plans) as needed for the Goal; gate each; on
   Accept, proceed to the code the prose motivates.
4. **(Optional) Planning.** If this session's work warrants a
   multi-session arc, author a `## Plan` block. Each Plan entry is
   gated (`Slug`, `Topic`, optional `Depends on`, `Goals` with
   `Topic` / `Upstream` / `Acceptance`). On Accept of a Plan
   entry, create the successor `Planned` log and link it from the
   entry. The successor remains revisable (gated) until it
   transitions to `Open`.
5. **End.** Write the `## Summary`. Populate `## Work Done` with
   files touched and rationale. Capture carry-over in
   `## Deferred / Discovered`. Execute the `session-end` Trope:
   validate completeness (including that every Plan entry is
   `Realised by`, carried-forward `Planned`, or `Abandoned`),
   stamp `Status: Closed (YYYY-MM-DDTHH:MM)`.

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
| Session log | Append-once body; `## Goals` and `## Plan` entries gated; `Summary` written once at end; `## Plan` entries freeze when their successor transitions to `Open` |
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

See **IMP-6** above for the canonical NEVER list. The previously
duplicated bullets here have been consolidated into the
imperatives.

## Working with `packages/` and `legacy/`

`corpus/` is the **global living corpus**: every new session log
and every new ADR land here regardless of whether the work
touches the active tree or references the legacy tree. The
rewrite's ADRs (ADR-011 onwards) continue the same numbering as
the legacy's.

The repository has one active code area and one frozen reference
area (see [ADR-020](./decisions/ADR-020-unify-monorepo-layout.md)):

- `packages/*` — **active**. New code ships as `@literate/*` per
  [ADR-019](./decisions/ADR-019-reinstate-literate-namespace.md)
  and lives at repo-root `packages/` per
  [ADR-020](./decisions/ADR-020-unify-monorepo-layout.md). When a
  corpus decision affects what LF ships, implement it here as a
  code-after-prose step. New Concept and Trope packages use the
  Step substrate from ADR-011 through ADR-014 and compose via
  TypeScript + sibling `.md` per ADR-015.
- `legacy/*` — **frozen** (ADR-018, scope relocated by ADR-020).
  Contains the former `packages/*` (legacy `@literate/*`
  Concepts, Tropes, CLI, template, core), the legacy `site/`
  scaffold, `LITERATE.md`, and pre-rewrite root tooling. No
  edits, additions, or deletions. Never publishes. Reading
  `legacy/*` for historical context is encouraged.

Do not edit `legacy/packages/concept-*/src/concept.mdx` or
`legacy/packages/trope-*/src/prose.mdx` prose bodies. Those
files are the frozen legacy ship surface and are governed by the
legacy framework Protocol at `legacy/LITERATE.md`, not by this
file. Any edit to a file under `legacy/` requires an explicit
Person-authorised freeze lift recorded in the active session's
`## Decisions Made`.

## Tag vocabulary

See `corpus/categories/tags.md` for the current tag set. Every ADR
must carry at least one tag drawn from the closed set.
