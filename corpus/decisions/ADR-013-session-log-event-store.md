# ADR-013 — Session log as the execution event store; deterministic replay

**Date:** 2026-04-23
**Status:** Accepted
**Tags:** `#execution` `#protocol`

**Extends:** ADR-011

**Context:**

ADR-011 committed to executable monadic prose with event-sourced
replay against the session log. ADR-012 fixed the six Step kinds
and the `Step` interface. This ADR formalises the log format,
memoisation semantics, invocation keys, and determinism rules
without which replay is unsound.

The risk ruled out by this ADR is the one every durable-workflow
system has to rule out: a `gen` body that branches on wall-clock
time, randomness, or any non-deterministic source replays
differently on the next turn than it did on the first, silently
or loudly corrupting downstream outputs.

**Decision:**

### 1. The Execution Log

Every session log file carries an append-only `## Execution Log`
section containing a fenced `exec` block:

````markdown
## Execution Log

```exec
2026-04-23T14:01:12Z session-start.detect-path#01JXYZ completed
  kind:   effect
  input:  {}
  output: {"path":"planned","planned":["primitives-template"]}
2026-04-23T14:01:14Z session-start.choose-path#01JXYZ gate-pending
  kind:  gate
  draft: {"planned":[...],"suggestion":"primitives-template"}
2026-04-23T14:03:55Z gate-flow.present#01JXYZ completed
  kind:     gate
  resolves: session-start.choose-path#01JXYZ
  output:   {"_tag":"Accept","value":{"slug":"primitives-template"}}
```
````

Each entry is an `ExecutionRecord`:

```typescript
export const ExecutionRecord = Schema.Struct({
  stepId:         Schema.String,
  invocationKey:  Schema.String,
  kind:           Schema.Literal('prose','workflow','effect','ai','gate','io'),
  startedAt:      Schema.String,                       // ISO UTC
  completedAt:    Schema.optional(Schema.String),
  status: Schema.Literal(
    'completed', 'gate-pending', 'ai-pending',
    'external-pending', 'failed', 'suspended',
  ),
  input:  Schema.Unknown,
  output: Schema.optional(Schema.Unknown),
  error:  Schema.optional(Schema.String),
  agent:  Schema.optional(Schema.String),              // model id for ai
  resolves: Schema.optional(Schema.String),            // for gate resolvers
})
```

The `ExecutionLogService` parses the `exec` block on read and
appends records on write. The block is **mechanical** (not gated):
the Person does not Accept / Reject individual records. It is
**tamper-evident**: a replay whose computed output disagrees with
a recorded output raises `ReplayDivergence` and halts the session
for human review.

### 2. Memoisation

The `memo` combinator wraps every Step's `realise`:

```typescript
export const memo: <I, O, E>(s: Step<I, O, E>) =>
  (input: I) => Effect.Effect<O, E | StepError, StepContext>
```

On invocation, `memo` computes the `InvocationKey` (§3), asks
`ExecutionLogService` for an existing record. Behaviour by
`status`:

| status | action |
|---|---|
| `completed` | return the recorded `output` parsed by `outputSchema`; no execution. |
| `failed` | return the recorded error; no execution. |
| `gate-pending` / `ai-pending` / `external-pending` | throw `Suspend` if still unresolved; if a later record resolves it, return the resolution's value. |
| absent | execute `realise`, append a new record on completion, return the value. |

Memoisation is universal — it applies uniformly to every kind.
For `prose` and `effect`, it is pure memoisation. For `ai`, it
caches the LLM response against the exact rendered prompt. For
`io`, it caches the observed snapshot. For `gate`, it is the
suspend / resume mechanism. For `workflow`, it caches the
composed output once every inner Step has completed.

### 3. InvocationKey

A Step inside a loop or branch can be called multiple times. The
`InvocationKey` disambiguates:

```
invocationKey := hash(parentStepId + iterationIndex + inputHash)
```

Computed by the runtime, not the author. The runtime tracks the
enclosing `parentStepId`, the iteration index (for Steps invoked
inside `yield*` loops), and a stable hash of the input.

### 4. Suspension

When a `gate`, `ai`, or `io` Step needs a resolution absent from
the log, it throws a `Suspend` value:

```typescript
export class Suspend extends Data.TaggedError('Suspend')<{
  readonly reason: 'gate' | 'ai' | 'external'
  readonly stepId: StepId
  readonly invocationKey: InvocationKey
  readonly payload: GatePending | AIPending | ExternalPending
}> {}
```

The runtime catches `Suspend`, writes a pending record, and ends
the turn. `Protocol.continue` (ADR-014) re-invokes the root Step
on the next turn; replay skips every `completed` record via
memoisation; the suspension point re-reaches itself, sees the
pending record now resolved, and returns the resolved value.

### 5. Determinism rules

Replay is sound iff a Step's `realise` produces the same sequence
of inner Step invocations given the same log. Three rules:

1. **No wall-clock time or randomness outside a Step.** A Step
   may call `Date.now()` or `Math.random()` internally; its
   memoised output captures the value. A workflow body must not.
2. **Branching on values comes from Step outputs only.**
   `if (yield* someStep())` is fine; `if (Math.random() < 0.5)`
   at the workflow level is not.
3. **Loops iterate over Step-derived collections.**
   `for (const item of yield* listItems())` is fine; iterating
   over a `readdirSync` result at the workflow level is not.

Enforcement:

- **Static (deferred):** the `@athrio/eslint-plugin` rule
  `deterministic-workflow` forbids `Math`, `Date`, `crypto`,
  `fetch`, `performance.now`, and other non-deterministic
  surfaces at the top level of workflow Step `realise` bodies.
- **Dynamic:** `ReplayDivergence` is raised at runtime when a
  replayed computation's output disagrees with the recorded
  output.

Violations do not corrupt data — they halt loudly.

### 6. Cross-turn persistence

The log is the only persistence mechanism. Between turns:

- In-memory fibers, deferreds, and refs are gone.
- The filesystem holds: the session log (authoritative), the
  corpus prose, the package code.
- `Protocol.continue` re-hydrates from the log alone.

This rules out a class of mistakes common to workflow frameworks
with opaque event stores: the Person reads the log directly,
diffs it against its last-turn state, and understands the
resumption decision.

**Consequences:**

- Every Step invocation is traceable: `stepId`, `invocationKey`,
  `kind`, `input`, `output`, `startedAt`, `completedAt`,
  optionally `agent` and `resolves`.
- The session log becomes simultaneously the authoring record
  (Goals, Decisions, Summary) and the execution record
  (`## Execution Log`).
- Replay is pure: given a log, the outcome of re-running
  `Protocol.continue` is deterministic.
- `ReplayDivergence` halts loudly when a workflow acquired a
  non-deterministic dependency.
- Determinism rules are stated here; the `@athrio/eslint-plugin`
  is deferred.
- The exact wire format of the `exec` fenced block in §1 is
  indicative; a future spec ADR formalises it once the first
  real Step runs against a real log.
- Cross-session Step invocation is out of scope; defer until a
  concrete need arises.
- Step versioning: v0.1 policy is that a major-version bump of a
  Step's schema is a new `StepId`; minor / patch is
  forward-compatible. Formalise on the first version bump.
