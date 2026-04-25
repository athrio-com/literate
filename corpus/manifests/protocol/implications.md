---
id: b00e3745
disposition: { base: 'Protocol', scope: 'implications' }
layer: { kind: 'protocol', path: 'protocol', holds: 'domains' }
domain: implications
status: Reconciled
---

# Implications

An **Implication** is a typed soft Goal — something a session
surfaced as worth doing but did not crystallise into an
immediate, gated Goal. Implications are the LF's mechanism for
honouring the Decisive context: nothing surfaced about future
work is allowed to drop out of sight, but not everything
needs to gate immediately.

## Status vocabulary

An Implication is one of:

- **`Surfaced`** — observed but not yet acted on. The default
  state when a session notes the implication.
- **`Promoted`** — chosen for execution; becomes a Goal in a
  successor session.
- **`Filed`** — accepted as a long-term observation that
  should land somewhere durable. Filed implications produce a
  memo under `corpus/memos/<slug>.md`.
- **`Dismissed`** — rejected as out of scope or no longer
  applicable. Requires a one-line rationale (Schema-enforced).

`Surfaced` is the only non-terminal status. `Promoted`,
`Filed`, `Dismissed` are terminal.

## The session-end invariant

The `session-end` Trope **refuses to close** a session whose
`## Implications` block contains an entry in `Surfaced`
status. The Person addresses each by promoting, filing, or
dismissing before the session can close.

The motivation: work surfaced during a session must reach a
terminal state before the session is sealed. Otherwise the
journal forgets — exactly the pathology LF was built to
avoid.

## Why typed

Untyped "future work" notes drift into rotten TODO lists:
nobody owns them, no one re-reads them, and over time they
accumulate without resolution. Typing the four-status
vocabulary forces explicit terminal handling. Pairing typing
with the `session-end` invariant makes the mechanism
load-bearing — the framework will refuse to proceed if it
isn't honoured.

## Promotion mechanics

When an Implication is promoted, the session's `## Plan`
block (or a successor session's `## Goals` block, depending on
when the promotion happens) carries a corresponding entry. The
Implication's status flips to `Promoted` and the entry
records the successor's path.

The successor session re-gates the Goal at its open per
IMP-1.6 (re-gate every Goal before any work). Promotion is
not a bypass of the gate; it is just the path by which the
Goal arrived.

## Filing mechanics

A `Filed` Implication produces a memo at
`corpus/memos/<slug>.md`. Memos are ephemeral inputs (creation
gated; material reduction gated; otherwise unstructured). The
memo's content is whatever observation the Implication
captured; the memo's existence is the durable trace.

## Rationale-on-Dismissal

The `Dismissed` status carries a Schema-required `rationale`
field. The rationale lands in the session log alongside the
status. This is not ceremony — it is what prevents `Dismissed`
from becoming a junk-bucket. A reader six months later can
audit the dismissal trail and either accept the rationale or
re-promote the Implication.

```path
registry/concepts/implication/index.ts
```

```path
registry/concepts/implication/concept.mdx
```

```path
registry/tropes/session-end/index.ts
```
