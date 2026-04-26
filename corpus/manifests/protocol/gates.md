---
id: 1eb10731
disposition: { base: 'Protocol', scope: 'gates' }
layer: { kind: 'protocol', path: 'protocol', holds: 'domains' }
domain: gates
status: Reconciled
---

# Gates

A **gate** is a typed Step that presents a draft to the Person
and reads back one of four decisions: `Accept | Correct |
Clarify | Reject`. Gates are first-class in LF: every
authoritative branching site that depends on Person judgement
is a gate, and the four-decision vocabulary is the only
vocabulary.

## The four decisions

- **`Accept`** — terminal. The draft becomes the authoritative
  artefact; downstream Steps proceed.
- **`Correct`** — non-terminal. The Person provides edits; the
  draft is rewritten and re-gated. v0.1 simplifies this to
  Accept-with-note: the correction is recorded but the draft
  stands as drafted.
- **`Clarify`** — non-terminal. The Person asks a question; the
  agent answers and re-gates. Clarify is a protocol turn, not
  a deferral. The draft is unchanged across the turn.
- **`Reject`** — terminal. The draft is discarded; no
  authoritative artefact is produced from this gate.

## Where gates fire

Gates fire at every authoritative branching site:

- New session **Goals** before any work proceeds against them.
- Concept-level material revisions (changes to a typed
  primitive's shape).
- Plan entries before successor sessions are created.
- Tag additions (`corpus/tags.md`) before they're used.

Editorial revisions (clearer phrasing, examples, *Used in*
references), index updates, status transitions, and code
derived from accepted prose are **not** gated.

## Gate decisions as typed Steps

A gate decision is a typed value matching the
`GateDecisionSchema` — a four-arm `Schema.Union` with the
decision payload typed per arm. The decision lands in the
session log's execution record alongside the Step's output;
replay reads the persisted decision instead of re-presenting.

This is what makes Person interaction sound under replay: the
gate's persisted decision is the durable artefact. A
re-run does not re-prompt.

## Implications and gates

An **Implication** is a typed soft Goal (see
`:lfm[implications]{hash=b00e3745}` `protocol/implications.md`) that surfaces from
work without crystallising into an immediate Gate. Implications
have their own four-status vocabulary
(`Surfaced | Promoted | Filed | Dismissed`); the `session-end`
Trope refuses to close a session that carries a non-terminal
Implication.

Implications and gates compose: a `Promoted` Implication
becomes a Goal in a successor session and gates as a Goal at
that session's open.

## Why four arms

Three arms (Accept / Reject / Correct) miss the most common
agent-side need: "I need more information to draft this
correctly." Adding `Clarify` keeps that need typed and durable
instead of pushing it to ad-hoc back-and-forth that doesn't
land in the log. Five arms (adding "Defer") collapsed into the
Implication vocabulary instead — Implications are the
decoupled deferral mechanism.

```path
packages/core/src/gate.ts
```

```path
packages/core/src/services.ts
```
