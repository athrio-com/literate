# ADR-012 — Prose as the base Step kind; six kinds; typed I/O

**Date:** 2026-04-23
**Status:** Accepted
**Tags:** `#algebra` `#execution`

**Extends:** ADR-011

**Context:**

ADR-011 declared `Step` as the executable realisation of a Trope's
verbs. It did not formalise the discriminator: how many kinds of
Step exist, what each kind's contract is, how the boundary is drawn.

The unifying insight is that **prose is the base case**. A Step
that emits parametrised markdown — a recap, a greeting, a context
dump with `range` / `section` / `vars` applied — is as much a
Step as one that invokes an LLM or suspends for a Person decision.
The other kinds are specialisations of "prose bound to a service".

**Decision:**

The `StepKind` discriminator is a closed union of exactly six
members, authored in [`corpus/categories/step-kind.md`](../categories/step-kind.md):

```typescript
export type StepKind =
  | 'prose'      // emits parametrised prose (the base case)
  | 'workflow'   // composes other Steps in an Effect.gen
  | 'effect'     // pure Effect computation, memoised
  | 'ai'         // LLM invocation with typed I/O
  | 'gate'       // suspension point awaiting Person decision
  | 'io'         // filesystem / git / network side-effect
```

The `Step` interface from ADR-011 is uniform across kinds. The
runtime dispatches on `kind` to inject kind-specific services
(`AIInvoke` for `ai`, `GateService` for `gate`, etc.), but the
outer interface and memoisation rule are the same.

### Kind semantics

- **`prose`** — degenerate case: load the referenced `.md`, apply
  `range` / `section` / `vars`, emit `ProseOutput`. Memoised by
  input. Used anywhere the framework needs deterministic text
  emission: recap headers, context dumps, templated error
  messages.
- **`workflow`** — `Effect.gen` body composing other Steps. No
  direct service binding; its outputs are the outputs of its
  inner Steps. Memoised after every inner Step completes. Subject
  to the determinism rules in ADR-013.
- **`effect`** — pure Effect computation whose output is a
  function of its input. Memoised by input hash. Examples:
  `next-adr-number` (reads the decisions folder, returns an
  integer), `parse-frontmatter`, `hash-of-prose`.
- **`ai`** — renders its `ProseRef` into a prompt (via
  `ProseInvoke`), submits it to `AIInvoke`, parses the response
  through `outputSchema`, memoises. The prose *is* the prompt;
  there are no separate prompt files.
- **`gate`** — throws `Suspend` with a `GatePending` payload on
  first encounter; returns the typed `GateDecision<D>` on replay
  once the Person has resolved. See ADR-017.
- **`io`** — filesystem / git / network side-effect. Result is
  memoised against the Execution Log as a snapshot of the
  observed state. Authors distinguish `io` from `effect`
  deliberately: `effect` is pure; `io` observes or mutates
  external state.

### `GateDecision<D>`

```typescript
export type GateDecision<D> =
  | { readonly _tag: 'Accept';  readonly value: D }
  | { readonly _tag: 'Correct'; readonly value: D; readonly note: string }
  | { readonly _tag: 'Clarify'; readonly question: string }
  | { readonly _tag: 'Reject';  readonly reason: string }
```

Every Trope that needs Person judgement composes over this shape
(ADR-017).

### Combinators shipped by `@athrio/core`

```typescript
export const step:        <I, O, E>(def: StepDefinition<I, O, E>)    => Step<I, O, E>
export const proseStep:   (def: ProseStepDefinition)                  => Step<ProseInput, ProseOutput>
export const aiStep:      <I, O>(def: AIStepDefinition<I, O>)         => Step<I, O, AIInvokeError>
export const gateStep:    <D>(def: GateStepDefinition<D>)             => Step<{ draft: D }, GateDecision<D>>
export const effectStep:  <I, O, E>(def: EffectStepDefinition<I, O, E>) => Step<I, O, E>
export const ioStep:      <I, O, E>(def: IoStepDefinition<I, O, E>)   => Step<I, O, E>
export const workflowStep:<I, O, E>(def: WorkflowStepDefinition<I, O, E>) => Step<I, O, E>
```

`step()` is the underlying primitive; the six kind-specific
helpers bind default services and assert kind at the type level.

### Schema-driven I/O

Typed input and output schemas are mandatory, not optional. Every
Step declares them. This gives:

- **Boundary validation.** Input is parsed on invocation; output
  is parsed on receipt. Invalid I/O surfaces before it
  contaminates downstream Steps.
- **Log legibility.** Execution Log entries (ADR-013) record
  structured input / output; parsing rules recover them on
  replay.
- **Schema-driven prompts.** An `ai` Step's output schema
  participates in prompt rendering: the runtime can derive a
  "Return JSON matching this shape" appendix from the schema
  itself rather than requiring the author to write it by hand.

### No Step without prose

The `prose` field of every Step is a `ProseRef` (ADR-015). A Step
without prose is a category error: even an `effect` Step authors
a short markdown explanation of what the computation means and
why. The prose exists to be read by humans reviewing the
Execution Log and to be rendered into documentation.

**Consequences:**

- Authors pick one kind from a closed set of six; classification
  is a one-shot decision, not a design debate.
- `prose` Steps are first-class: authors stop writing imperative
  "print this" prose; they compose `proseStep`s.
- Every Step's I/O is schema-validated. Bad inputs fail loudly at
  the boundary; bad outputs fail loudly at the receive site.
- Adding a new kind is a gated ADR amendment. The closed set
  keeps the surface small and the runtime dispatch exhaustive at
  compile time.
- The `effect` vs `io` split is a discipline choice the author
  makes deliberately.
- The prose of an `effect` or `io` Step is genuinely useful: it
  appears in the Execution Log, in documentation, and in review of
  the Step's purpose. There is no "code-only" Step.
