# ADR-033 — Implication as a typed soft Goal

**Date:** 2026-04-24
**Status:** Accepted
**Tags:** `#algebra` `#protocol`

**Extends:** ADR-001 (algebra), ADR-005 (prose-before-code),
ADR-017 (gate decisions). **Companion:** ADR-031 (Disposition),
ADR-032 (Mode + IMP-N).

**Context:**

LF's existing journaling vocabulary catches three classes of
in-session adjudication: **Goals** (committed work for the
current session, gated, lifecycle-tracked), **Decisions**
(authoritative outputs, lifecycle-tracked through the gate),
and the catch-all **Deferred / Discovered** journal at
session-end. The `Deferred / Discovered` block is freeform —
useful as a journal but not addressable by the gate or by
downstream Tropes. In practice it accumulates two distinct
kinds of content:

- **Surfaced authorial weight** — something the work
  surfaced that *might* become a Goal in this session, in a
  future session, or never. The Person needs to triage it
  but it has no Status of its own.
- **Filed work** — a memo / handoff that points at
  follow-up scope.

These two flow through different lifecycles. A surfaced
Implication may be **promoted** to a Goal (this session),
**filed** for later (with a memo), or **dismissed**
(retired with rationale). Goals and surfaced authorial
weight are parallel machinery; both deserve typed Status,
gated transitions, and session-end validation.

`Implication` names the soft-Goal entity. The typed surface
makes it addressable: the gate can act on Implications,
downstream Tropes can list them, the session-end Trope can
refuse to close on a non-terminal one.

**Decision:**

`Implication` is a typed Concept with a four-status closed
vocabulary and a Schema-enforced invariant
(rationale-required-on-Dismissed). The session-end Trope's
`validateStep` refuses to close a session with any
non-terminal Implication.

### Shape

```typescript
interface Implication {
  readonly _tag: 'Implication'
  readonly id: string
  readonly status: 'Surfaced' | 'Promoted' | 'Filed' | 'Dismissed'
  readonly rationale?: string  // required when status = 'Dismissed'
}
```

Effect Schema with the rationale invariant baked into the
type (refinement on the struct):

```typescript
const ImplicationStruct = Schema.Struct({
  _tag: Schema.Literal('Implication'),
  id: Schema.String,
  status: Schema.Union(
    Schema.Literal('Surfaced'),
    Schema.Literal('Promoted'),
    Schema.Literal('Filed'),
    Schema.Literal('Dismissed'),
  ),
  rationale: Schema.optional(Schema.String),
})

const ImplicationSchema = ImplicationStruct.pipe(
  Schema.filter(
    (v) => v.status !== 'Dismissed' || (v.rationale ?? '').trim() !== '',
    {
      message: () =>
        'Implication: rationale required when status is Dismissed',
    },
  ),
)
```

### The four statuses

- **`Surfaced`** — non-terminal. The Implication has been
  raised but not adjudicated. Default state.
- **`Promoted`** — terminal. The Implication has been
  promoted to a Goal. Transition is gated.
- **`Filed`** — terminal. The Implication has been filed for
  later (memo created under `corpus/memos/<slug>.md`).
  Transition is gated.
- **`Dismissed`** — terminal. The Implication has been
  retired without action. Rationale required (Schema-
  enforced). Transition is gated.

### Session-end validation

The `session-end` Trope's `validateStep` extends to:

- If the session log carries no `## Implications` section ⇒
  **valid** (zero Implications; backward-compatible with
  every log predating this Concept).
- If the section is present ⇒ parse each `### Implication
  <id> — <title>` block, read its `**Status:**` and
  `**Rationale:**` lines, and **fail** the close if any
  status is non-terminal or any Dismissed entry lacks
  rationale. The failure surfaces in the existing
  `SessionEndIncomplete` aggregate (with
  `Implication[<id>].terminal-status` or
  `Implication[<id>].rationale-required-on-Dismissed`
  entries in the `missing` array).

The validator extends `validateStep` additively — no
`prose.mdx` change is required because the validator works
over the parsed log without authoring a new atomic Step.
A future refactor may promote the Implication validation to
its own Step (with its own prose section); v0.1 keeps the
extension internal.

### Distribution

`Implication` ships as a registry seed at
`registry/concepts/implication/`. `concept.mdx` carries the
prose; `index.ts` carries the typed Schema (with the
rationale refinement), the `ImplicationStatus` ergonomic
constructor, and the `isTerminalImplication` predicate the
session-end validator uses.

### Implication-flow Trope (deferred)

A typed `trope-implication-flow` providing
Surface → Promote / File / Dismiss transitions through gated
Steps would be the natural realisation Trope. v0.1 ships
the Concept + the session-end validator only; the flow
Trope is deferred (named in the authoring session's
`## Deferred / Discovered`). The Concept's typed surface is
the contract any future flow Trope realises.

**Boundary:**

- This ADR scopes the **Implication Concept** + the
  **session-end validator** + **the schema-level rationale
  invariant**. It does *not* scope the Implication-flow
  Trope (deferred).
- Existing session logs that predate this Concept remain
  valid — the `## Implications` section is optional.

**Consequences:**

- `registry/concepts/implication/{concept.mdx, index.ts, README.md}`
  is the new typed surface.
- `concept-session` carries `implications?:
  ReadonlyArray<Implication>` in its instance Schema.
- `registry/tropes/session-end/index.ts` extends
  `validateStep` with the Implication-block parser and the
  terminal-status / rationale checks. Backward-compatible:
  absent section ⇒ no-op.
- The session-end error channel surfaces non-terminal /
  no-rationale failures through the existing
  `SessionEndIncomplete` aggregate. A dedicated
  `ImplicationNotTerminal` TaggedError is a forward-question
  that v0.1 does not introduce (the aggregate is sufficient
  for the current call sites).

**Superseded by:** —
