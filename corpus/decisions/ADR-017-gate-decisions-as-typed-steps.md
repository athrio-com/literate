# ADR-017 — Accept / Correct / Clarify / Reject as typed Steps

**Date:** 2026-04-23
**Status:** Accepted
**Tags:** `#algebra` `#execution` `#protocol`

**Extends:** ADR-011, ADR-012

**Context:**

The review gate at the heart of the Literate Programming Protocol
admits exactly four decisions: **Accept**, **Correct**, **Clarify**,
**Reject**. Under the pre-ADR-011 model these are prose conventions:
the agent presents a draft and waits for one of the four in natural
language. The mechanics of collecting, interpreting, and recording
the decision are informal.

Three friction points follow:

1. **Responses are untyped.** "Accept with a small edit" is
   semantically Correct but may arrive in prose that looks like
   an ambiguous Accept. "Please add one sentence about X" may be
   Correct or Clarify depending on the Person's intent. Informal
   handling creates room for misclassification.
2. **Post-decision logic is ad-hoc.** A Trope that wants to run
   custom code when its Goal is Accepted (e.g. stamping
   `Category:` from a small menu) has to embed that logic in the
   prose the agent interprets — the "procedure as English"
   failure ADR-011 resolved for everything else.
3. **The decision is not traceable.** A gate decision disappears
   into prose ("Accept") or session-log bullet ("Accepted Goal 2").
   Replaying a session to understand what was decided, when, and
   with what rationale requires re-reading the whole log manually.

The execution substrate introduced by ADR-011 through ADR-014
resolves all three once the gate itself is modelled as a Step.

**Decision:**

The four gate decisions are first-class typed Steps. A shipped
Trope, `@athrio/trope-gate-flow`, provides:

### 1. `presentGate` — the suspension primitive

```typescript
export const presentGate = <D>(draftSchema: Schema.Schema<D, any>) =>
  gateStep({
    id: 'gate-flow.present' as StepId,
    draftSchema,
  })
```

Used inside a workflow Step:

```typescript
const decision = yield* presentGate(GoalDraftSchema)({ draft: goal })
switch (decision._tag) {
  case 'Accept':  return yield* onAccept(decision.value)
  case 'Correct': return yield* onCorrect(decision.value, decision.note)
  case 'Clarify': return yield* onClarify(decision.question)
  case 'Reject':  return yield* onReject(decision.reason)
}
```

On first encounter, `presentGate` writes a `gate-pending` record
to the Execution Log with the draft (validated against
`draftSchema`) and throws `Suspend`. The harness surfaces the
draft and the four options. On the next turn, the Person's
response resolves into a typed `GateDecision<D>`:

```typescript
export type GateDecision<D> =
  | { readonly _tag: 'Accept';  readonly value: D }
  | { readonly _tag: 'Correct'; readonly value: D; readonly note: string }
  | { readonly _tag: 'Clarify'; readonly question: string }
  | { readonly _tag: 'Reject';  readonly reason: string }
```

### 2. The four decision resolvers

```typescript
export const acceptGate:  Step<{ resolves: StepId; value: D },                 GateAccepted<D>>
export const correctGate: Step<{ resolves: StepId; value: D; note: string },   GateCorrected<D>>
export const clarifyGate: Step<{ resolves: StepId; question: string },         GateClarified>
export const rejectGate:  Step<{ resolves: StepId; reason: string },           GateRejected>
```

These Steps validate the Person's response against the draft
schema (for Accept and Correct, `value` must parse as `D`), write
a `completed` record with `resolves:` pointing at the
`gate-pending` record's `invocationKey`, and return the typed
`GateDecision<D>` for the presenting workflow Step to consume.

Because the four resolvers are themselves Steps, a Trope can
*extend* them: a Trope that wants custom accept-time logic —
stamping `Category:` from a menu, running a typecheck, writing a
sibling file — composes its own workflow Step that invokes
`acceptGate` and then runs the extension logic, keeping the core
gate mechanism untouched.

### 3. The `Correct` shape

`Correct` is the decision that most benefits from being typed.
The Person says "Accept with this change"; the typed form
captures both the accepted `value` (possibly the original draft
modified in place) and the `note` explaining the correction. The
returning workflow can apply the note's edit, re-gate the
corrected draft, or proceed with the corrected value and log the
note as rationale — explicit in a `switch` on `_tag`, not
implicit in prose interpretation.

### 4. `Clarify` is a protocol turn, not a terminal state

A `Clarify` response is *not* a rejection and not an acceptance.
It is a question back to the Person. The `clarifyGate` Step
writes a `completed` record with the question as output; the
enclosing workflow has not advanced past the gate. On the next
turn, the Person's answer triggers a **re-presentation** of the
same gate (same draft, same `draftSchema`, possibly revised
prose framing derived from the answer). The new `presentGate`
invocation has a distinct `InvocationKey` (iteration index
differs), so it suspends again, the Person sees the updated
draft, and the cycle continues until Accept / Correct / Reject.

### 5. Composition across gate decisions

```typescript
// @athrio/trope-goal-flow
export const onGoalAccept = step({
  id: 'goal-flow.on-accept' as StepId,
  kind: 'workflow',
  run: (goal: GoalDraft) => Effect.gen(function* () {
    const category = yield* chooseCategory(goal)        // another gateStep
    const status   = 'Active' as const
    yield* writeGoalToLog({ ...goal, category, status })
  }),
})
```

Consumers extend `goal-flow`'s accept behaviour by importing
`onGoalAccept` and composing over it. No prose interpretation;
every extension point is a Step.

**Consequences:**

- Accept / Correct / Clarify / Reject are typed values;
  distinguishable by tag, not by prose parsing.
- Gate decisions are traceable: every presentation, every
  resolution, every clarify-reclarify cycle appears in the
  Execution Log with structured input, output, and timestamp.
- Custom accept-time, correct-time, clarify-time, reject-time
  logic is a Step the Trope exports. Tropes compose each other's
  gate extensions as ordinary Step imports.
- `Clarify` is a protocol turn; the Execution Log records each
  clarify cycle as its own record but the gating workflow retains
  the draft across them.
- `draftSchema` is mandatory. Every gate validates the decided
  value; malformed decisions fail at the boundary.
- `@athrio/trope-gate-flow` is on the critical path: without it,
  no gated workflow Trope (`session-start`, `goal-flow`,
  `adr-flow`) can ship. It is the first Trope authored after the
  core algebra lands in `@athrio/core`.
- A `Reject` decision terminates the presenting workflow; its
  error channel carries a `GateRejected` tagged error with the
  `reason`. Upstream workflows decide whether to halt or
  compensate.
