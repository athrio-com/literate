---
id: f514bb05
disposition: { base: 'Protocol', scope: 'disposition-and-mode' }
layer: { kind: 'protocol', path: 'protocol', holds: 'domains' }
domain: disposition-and-mode
status: Reconciled
---

# Disposition and Mode

LF distinguishes two orthogonal axes that classify every piece
of authored work: **Disposition** (referential frame — what the
work is *about*) and **Mode** (operational stance — how the
work is being *done*). The two axes are independent; their
2-D product is exhaustively pattern-matched at every
authoritative branching site.

## Disposition

Disposition names the *referential domain* a Trope, an
authored instance, or a session belongs to. The shape is a
parametrised struct:

- **`base`** — closed, three values: `Product | Protocol |
  Infrastructure`.
- **`scope`** — open, freeform sub-domain (e.g.
  `'session-lifecycle'`, `'install-flow'`).
- **`prompt`** — open, agent-facing first-line framing.
- **`prose`** — open, long-form authored declaration when one
  line is insufficient.

The three bases:

- `Product` — what the repo *builds* (a consumer's
  application; for LF, the customer-facing CLI surface).
- `Protocol` — how the framework *operates* (algebra, Trope
  substrate, session lifecycle, gates).
- `Infrastructure` — the substrate beneath both (build
  tooling, package management, runtime, monorepo layout).

## Mode

Mode names the *operational stance* of a session, Trope, or
Step. Closed three-value vocabulary:

- **`Exploring`** — deliberation. The agent resists tool calls
  beyond grounding; offers competing framings; asks clarifying
  questions; surfaces unexamined assumptions. Output lands in
  an `## Exploration` block or in a memo, never in
  decisive-content surfaces.
- **`Weaving`** — drafting prose for the gate. The agent
  authors LFM bodies, Goals, Plan entries — anything covered
  by the review gate. Code is not derived in the same gate
  cycle; that is a Mode shift.
- **`Tangling`** — deriving code from already-Accepted prose.
  Every code change traces back to upstream prose by reference.
  If no upstream prose exists, Mode shifts to Weaving and the
  prose is gated first (prose-before-code).

## Two enactors

The same Mode Concept covers two enactors with different
discipline:

- **Agent** — the in-IDE agent (Claude Code, Cursor, Zed).
  IMP-N (the Mode-discipline imperative) binds the agent's
  behaviour to the active Mode.
- **CLI** — the mechanical CLI (`literate weave`,
  `literate tangle`, `literate update`, `literate reconcile`).
  Mode-discipline does not apply: the CLI has no deliberative
  surface.

## IMP-N

IMP-N is the Mandatory Agent Instruction (in
`corpus/CLAUDE.md`) that overrides agent IDE training defaults.
Without IMP-N, an agent's default behaviour is to act —
running tools, drafting code, proposing changes. With IMP-N,
the agent reads the active Mode at session-start and binds
behaviour accordingly.

Mode is itself gated. In-session Mode shifts are explicit and
gated: a session opened in Weaving cannot silently slip into
Tangling. The shift is a Goal-shape decision the Person
accepts.

## The 2-D product

Every authoritative branching site pattern-matches on
`{ disposition, mode }` together. A `{Protocol, Exploring}`
session deliberates about the framework. A `{Protocol,
Weaving}` session drafts Protocol prose under the gate. A
`{Infrastructure, Tangling}` session mechanically updates the
build. The product space is the unit of classification, not
either axis alone.

```path
registry/concepts/disposition/index.ts
```

```path
registry/concepts/mode/index.ts
```
