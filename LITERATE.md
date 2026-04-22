# LITERATE — the Literate Programming Protocol

*This is the authoritative Protocol for the Literate Framework. It is
the product surface consumers read and pin to. Everything downstream —
Concepts, Tropes, schemas, CLI behaviour — derives from this document.*

---

## 1. What LF is

The Literate Framework (LF) is a methodology for authoring software
where **prose is the source**. A person authors decisions, specifications,
chapter plans, persona stories, and session logs. An AI collaborator
drafts prose under the person's direction and derives code from prose
that has been accepted. Every new or revised piece of authored prose
passes a review gate before it lands and before any downstream artefact
(code, index row, supersession edit) follows.

LF differs from Knuth's classical Literate Programming in two
pragmatic ways: prose and code live in separate files (no interleaving),
and the AI replaces the mechanical `tangle` step. The weave output is
the prose corpus itself.

## 2. The three-level algebra

Everything in LF fits one of three levels:

```
Concept      (interface — declares what something IS)
    ↓ realized by
Trope        (class — describes HOW the Concept is done in LF;
                     prose-first, with Effect Schema backing)
    ↓ instantiated by consumers as
Authored     (file in consumer's corpus, matching the Trope's shape)
```

**Concepts** are LF's metalanguage. They declare the kinds of things
LF recognises: what a session is, what a decision is, what a category
is. They are pure declaration — schema, invariants, relationships —
without operational content.

**Tropes** realize Concepts. Each Trope is prose (how the Concept is
done in LF) plus an Effect Schema that types and validates the shape.
Tropes are the composable units consumers import. The algebra permits
multiple Tropes per Concept; v0.1 ships exactly one canonical Trope
per Concept, preserving the structural possibility of alternates
without building the multi-realization machinery.

**Authored instances** are consumer files. A specific ADR authored by
a consumer is an instance of the ADR Trope, which realizes the
`decisions` Concept. Instances live in the consumer's `corpus/`.
They are not leaves and are not shipped by LF.

## 3. Concepts at two scopes

Concepts come in two scopes; the shape and machinery are identical
(ADR-010). LF ships **LF-level Concepts** as TypeScript workspace
packages (`@literate/concept-<id>`) carrying Effect Schemas, MDX
prose, and typed dependency references — this is LF's metalanguage.
Consumers author **corpus-level Concepts** as markdown files at
`corpus/concepts/<slug>.md` — this is how they declare the
reserved vocabulary of their product (e.g. *Tenant*, *Workflow*,
*Approval Chain*).

```
LF level:      Concept (TS module)   ──► Trope
Corpus level:  Concept (markdown)    ──► (authored references)
```

The machinery — validation, cross-reference resolution, composition
— is shared. The location implies the scope: framework or product.
Earlier drafts named the corpus-level form *Term*; ADR-010
collapses to a single primitive.

## 4. The invariant relation

In every repo that uses LF:

```
corpus/   → src/
   ↑
.literate/  (the vendored LF snapshot; governs authoring)
```

- `corpus/` — prose defining what the product is and becomes.
- `src/` — derivative content (code, compiled docs, etc.); derived
  from corpus.
- `.literate/` — vendored LF: Concepts, Tropes, primitives; guides
  agents and humans.

In a consumer repo all three folders exist. The consumer authors in
`corpus/`, derives `src/` from it, and reads `.literate/` as
governance. The `literate` CLI manages `.literate/` (init, upgrade,
add).

In LF's own repo the invariant collapses: the `src/` role is
realised as `packages/*` workspace packages — each Concept and
each Trope ships as a typed, npm-publishable unit
(`@literate/concept-*`, `@literate/trope-*`). Cross-references are
real TypeScript imports. No vendored `.literate/` exists in LF's
repo.

## 5. Roles

- **Person** — collaborator directing work. Authors decisions, gates
  reviewed prose, owns all output (prose + code).
- **AI** — language-model collaborator. Drafts prose under the
  Person's direction; derives code from accepted prose.
- **Protocol** — this document plus the operational `CLAUDE.md` that
  makes it execute. Shorthand for "the rules."

## 6. The review gate

Every new or revised piece of **authored prose** passes through a
review gate before it lands. Authored prose covered by the gate:

- Concept and Trope declarations (LF level)
- Concept files in `corpus/concepts/` (corpus level — new files
  and material revisions)
- Decisions (ADRs and their subkinds)
- Specs
- Chapters
- Stories
- Session `## Goals` entries
- Category member additions and removals

Flow:

1. AI drafts artefact at canonical path.
2. AI presents draft to Person (quoting or naming path with summary).
3. Person responds **Accept**, **Correct**, **Clarify**, or **Reject**.
4. On **Accept**, AI applies dependent updates (index rows,
   supersession edits, Goal status transitions) and proceeds to code.
5. On **Reject**, new files are deleted, numbers return to the pool,
   Goal entries are removed.
6. On **Correct**, rewrite in place and re-present.
7. On **Clarify**, explore variants without rewriting, then resolve
   to Accept / Correct / Reject.

The gate does **not** apply to:

- Session log bodies outside `## Goals` (journals land without gate).
- `Status:` line edits that flow atomically from accepting a new ADR.
- Index and navigation files (mechanical reflections).
- Code or config changes implementing previously accepted prose.
- Editorial revisions of Terms and Categories (typo fixes, clearer
  wording, *Used in* entries, *See also* cross-refs).

## 7. Mutability profiles

| Kind | Profile |
|---|---|
| ADR body | Append-only; `Status:` line sole mutable part |
| Spec | Fully mutable; new files and material revisions gated |
| Chapter | Fully mutable living plan; new files and material revisions gated |
| Story | Fully mutable; new files and material revisions gated |
| Session log | Append-once body; `## Goals` entries gated; `Summary` written once at end |
| Memo | Ephemeral input; creation and material reduction gated; editorial ungated |
| Category file | Fully mutable body; member additions/removals gated; editorial ungated |
| Concept file (corpus level) | Fully mutable body; new files and material revisions gated; editorial ungated |
| Concept declaration (LF level) | Prose body append-only in `packages/concept-*`; instance Schema and metadata in `index.ts` mutable with gated material revisions |
| Trope declaration | Prose body append-only in `packages/trope-*`; schema and metadata in `index.ts` mutable with gated material revisions |

## 8. Prose-first absolute

No tier is exempt. Every work unit has upstream prose (a Concept, an
ADR, or a spec). If upstream prose does not exist or does not cover
the work, drafting that prose is sub-task one of the current Goal.

Bugs trigger spec updates. Specs are mutable; code is derived from
behaviour contracts. A "bug fix" that does not first adjust the spec
drifts silently from the authored truth.

## 9. Closed vocabularies

All enumerated types are declared as first-class files in
`corpus/categories/` (or `.literate/categories/` after compilation
for consumers). Examples: tag sets, ADR statuses, Goal statuses,
Goal categories.

Rules:

- No invented values before the category file exists and is accepted.
- Member additions and removals pass the review gate.
- Editorial revisions (clearer wording, structural notes) are ungated.
- A `categories/categories.md` index file indexes members of the
  folder; the index is mutable and mechanical.

## 10. Corpus-level Concepts

All Concepts used capitalised in prose or referenced from code at
the consumer level live as files in `corpus/concepts/<slug>.md`.
Rules:

- New Concept files are gated.
- Material revisions (redefinitions) are gated.
- Editorial revisions (wording, *Used in* entries, *See also*) are ungated.
- Corpus-level Concepts are not authoritative above the ADRs or
  specs that rely on them; ADRs/specs win on conflict.

The shape and machinery match LF-level Concepts (ADR-010); the
difference is location and scope. See §3 for the two-scope model.

## 11. Sessions

A session is a bounded work unit with a log at
`corpus/sessions/YYYY-MM-DDTHHMM-slug.md`. Sessions carry:

- Frontmatter (`Date`, `Started`, `Status`, `Chapter`, `Agent`).
- `## Goals` — session-scope specifications; each entry gated.
- `## Decisions Made` — references to ADRs accepted during the session.
- `## Work Done` — files created / modified / deleted with rationale.
- `## Summary` — 2–4 sentences written at session end.
- `## Deferred / Discovered` — optional carry-over items.

The session lifecycle is:

1. Session begins; `session-start` Trope executes (create log from
   template, print ADR overview, surface last session's Summary and
   Deferred, check Current State staleness).
2. Goal(s) drafted into `## Goals` and gated.
3. Work proceeds. ADRs and specs drafted and gated as needed; accepted
   ADRs are referenced in `## Decisions Made`.
4. Session ends; `session-end` Trope executes (validate log
   completeness, stamp `Status: Closed`, write `Summary`).

## 12. Traceability

Code at architectural seams carries `@adr ADR-NNN` or
`@spec spec-slug` comments pointing at the prose that motivates the
code. Traceability is one-directional: code points at prose; prose
never points at code. A seam is a structural joint (class, factory,
entry point) where a decision manifests — not every downstream usage.

## 13. The CLI surface

`@literate/cli` exposes, at v0.1:

- `literate init [template]` — scaffold a consumer repo with
  `corpus/`, `src/`, `.literate/`, `CLAUDE.md`, `package.json`.
- `literate add trope <id>` — add a Trope to the consumer manifest;
  recompile `.literate/`.
- `literate compile` — read manifest, resolve Trope graph, write
  `.literate/`.
- `literate check` — validate the consumer's corpus against installed
  Tropes.
- `literate version` — print LF version and installed Tropes.

The manifest lives in the consumer's `package.json` under a
`"literate"` key. Minimum shape:

```json
{
  "literate": {
    "version": "0.1.0",
    "tropes": ["session", "session-start", "session-end", "decisions"]
  }
}
```

## 14. Versioning

LF is versioned as a whole via semver. Breaking changes to Concept
schemas or the manifest shape require a major bump; additive changes
a minor bump; editorial revisions a patch. Consumers pin to the LF
version in the manifest; the CLI refuses to operate against a
mismatched installed version without an explicit `--allow-upgrade`
flag (v0.2+).
