---
id: 12132d70
disposition: { base: 'Protocol', scope: 'disposition-and-mode' }
layer: { kind: 'protocol', path: 'protocol', holds: 'domains' }
domain: disposition-and-mode
status: Reconciled
---

# Disposition and Mode

LF distinguishes two orthogonal axes that classify every Trope:
**Disposition** (referential frame — what the Trope is *about*)
and **Mode** (operational stance — how the Trope is being
*done*). Both fields live on Tropes. Concepts do not carry
either directly; sessions and authored instances inherit them
from the Tropes they compose. The two axes are independent;
their 2-D product is exhaustively pattern-matched at every
authoritative branching site.

## Disposition

Disposition names the *referential domain* a Trope is disposed
toward. The shape is a parametrised struct:

- **`base`** — closed, three values: `Product | Protocol |
  Infrastructure`.
- **`scope`** — open, names a Domain inside the base.
- **`prompt`** — open, agent-facing first-line framing.
- **`prose`** — open, long-form authored declaration when one
  line is insufficient.

The three bases:

- `Product` — what the repo *builds* (a consumer's
  application; for LF itself, the customer-facing CLI surface).
- `Protocol` — how the framework *operates* (algebra, Trope
  substrate, session lifecycle, gates, annotation surface).
- `Infrastructure` — the substrate beneath both (build
  tooling, package management, runtime, monorepo layout).

### Domain = Disposition.scope

The `scope` field carries a **Domain** — itself a Concept whose
instances are the valid scope values. A Domain is the typed
sub-Disposition that a Trope is disposed to within its base.
The LFM tree at `corpus/manifests/<layer>/<domain>.md`
externalises Domains as file-system addresses; each LFM's
`domain` frontmatter field is a Domain instance, and its
`disposition.scope` carries the same value at the Trope level.

Domain is not a third axis alongside Disposition and Mode; it
is the open-vocabulary refinement of `Disposition.base`. New
Domains accrete from authored use without registration; a
Domain Concept seed exists at `registry/concepts/dispositional-domain/`
to declare the typed shape, but specific Domain instances are
not gated.

## Mode

Mode names the *operational stance* of a Trope's enactment.
Closed three-value vocabulary:

- **`Exploring`** — deliberation. The agent resists tool calls
  beyond grounding; offers competing framings; asks clarifying
  questions; surfaces unexamined assumptions. Output lands in
  an `## Exploration` block, in a memo, or as Surfaced
  Implications, never in decisive-content surfaces.
- **`Weaving`** — drafting prose for the gate. The agent
  authors LFM bodies, Goals, Plan entries — anything covered by
  the review gate. Code is not derived in the same gate cycle;
  that is a Mode shift.
- **`Tangling`** — deriving code from already-Accepted prose.
  Every code change traces back to upstream prose by reference.
  If no upstream prose exists, Mode shifts to Weaving and the
  prose is gated first (prose-before-code).

## Atomic and composite Tropes

A Trope's Mode and Disposition fields behave differently
depending on whether the Trope is atomic or composite:

- **Atomic Trope** (a Step) carries a single `mode` and a
  single `disposition`. Both are mandatory; both are
  type-stable across the Trope's enactment.
- **Composite Trope** (sessions, multi-Step procedures, LFMs as
  Tropes-of-Domain-Concepts) composes sub-Tropes that may carry
  heterogeneous `mode` and `disposition` values. The composite's
  *effective* Mode at any moment is the active sub-Trope's
  Mode; the *effective* Disposition aggregates across sub-Tropes.

A session whose body declares `Mode: Exploring (G1) →
Weaving (G2-G7)` is summarising the Modes of its composing
Goals (each Goal is a sub-Trope); the session-Trope itself does
not carry a single Mode field. Read the per-sub-Trope Mode
declarations as the source of truth; treat header summaries as
derived.

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

## IMP-N and Mode shifts

IMP-N is the Mandatory Agent Instruction (in
`corpus/CLAUDE.md`) that overrides agent IDE training defaults.
Without IMP-N, an agent's default behaviour is to act — running
tools, drafting code, proposing changes. With IMP-N, the agent
reads the active sub-Trope's Mode and binds behaviour
accordingly.

Mode shifts are explicit and gated. A session opened in
Weaving cannot silently slip into Tangling: the shift is a
Goal-shape decision the Person accepts. Within a session,
moving from one Goal to the next may be a Mode shift if the
new Goal carries a different Mode; the gate is the Goal's
Accept.

## The 2-D product

Every authoritative branching site pattern-matches on
`{ disposition, mode }` together. A `{Protocol, Exploring}`
Trope deliberates about the framework. A `{Protocol, Weaving}`
Trope drafts Protocol prose under the gate. A
`{Infrastructure, Tangling}` Trope mechanically updates the
build. The product space is the unit of classification, not
either axis alone.

```path
registry/concepts/disposition/index.ts
```

```path
registry/concepts/mode/index.ts
```

```path
registry/concepts/dispositional-domain/index.ts
```
