# ADR-011 — Executable monadic prose: algebra extended with `Step`

**Date:** 2026-04-23
**Status:** Accepted
**Tags:** `#algebra` `#protocol` `#execution`

**Extends:** ADR-001

**Context:**

ADR-001 established LF as a three-level algebra (Concept → Trope →
Authored instance). Tropes were prose-first with optional Effect
`Layer`s for runtime services. This model let consumers import
Tropes as typed packages and let LF ship the Protocol as human-
readable prose. It did not, however, answer three questions that
became pressing once real work started landing:

1. **Execution state does not survive process exit.** A chat turn
   terminates after each reply. Any mid-procedure cursor — which
   gate is pending, which step completed — is lost unless the
   agent re-derives it from prose every turn. Different agent
   instances may re-derive it differently; the `continue with
   goals` failure recorded in session
   `2026-04-23T0919-imperatives-for-lf-protocol` is precisely
   this.
2. **AI invocations inside procedures are untyped and unmemoised.**
   "Classify severity", "propose a name", "summarise" live in
   prose as English instructions the agent interprets. There is
   no shape to them, no memoised result, no typed input / output,
   no traceable invocation.
3. **Gate responses and prose emissions are not first-class.**
   Accept / Correct / Clarify / Reject are prose conventions;
   printing a recap from a prior session is an imperative
   instruction. Neither composes with the rest of the algebra;
   neither is traceable.

The resolution is to extend the algebra by one level: **`Step` as
the executable realisation of a Trope's verbs**. A Step is a
typed, importable `Step<I, O, E>` whose canonical realisation is
an [Effect][effect], whose execution is event-sourced against the
session log (ADR-013), and whose replay is pure. The session log
becomes the program counter; process exits between turns are no
longer state-losing because there is no in-memory state to lose.

The design follows durable-execution conventions (event-sourced
replay, memoised steps, suspension as a first-class value) adapted
to LF's substrate: prose is the source, the session log is
human-readable, Tropes are npm packages.

**Core insight.** LP becomes software that wraps prose as
executable, composable, memoised Effects — where prose itself is
the base case (ADR-012), AI invocation is prose bound to an
inference service, gates are prose bound to Person decisions, and
everything else is prose bound to typed computation. The corpus
stays pure markdown because prose lives in `.md` files and Steps
are declared in TypeScript (ADR-015); nothing generates code from
prose.

**Decision:**

The algebra is extended to four levels:

```
Concept          interface — what something IS
    ↓ realised by
Trope            class — how the Concept is done in LF;
                 prose-first, with Effect Schema and Step exports
    ↓ executed via
Step<I, O, E>    typed, importable, memoised unit of procedure;
                 the executable realisation of a Trope's verbs
    ↓ instantiated by consumers as
Authored         file in consumer's corpus matching the Trope's shape,
                 or Execution Log entry recording a Step invocation
```

Concept and Trope semantics from ADR-001 are preserved. The
addition is `Step` as the executable realisation of the *verbs*
inside a Trope. Workflow Tropes (`session-start`, `session-end`,
`adr-flow`, `goal-flow`, `gate-flow`) each ship one or more `Step`
exports. Concept-level Tropes without executable behaviour ship
zero Steps and remain prose-only.

### The `Step` interface

```typescript
export interface Step<I, O, E = never> {
  readonly _tag: 'Step'
  readonly id: StepId                    // hierarchical: <trope>.<slug>
  readonly kind: StepKind                // six-member closed union, ADR-012
  readonly version: string
  readonly inputSchema:  Schema.Schema<I, any>
  readonly outputSchema: Schema.Schema<O, any>
  readonly prose: ProseRef               // typed reference to .md sibling
  readonly realise: (input: I) =>
    Effect.Effect<O, E | StepError, StepContext>
  readonly dependencies: ReadonlyArray<AnyStep>
}
```

Every Step declares typed input / output schemas, a prose
reference (ADR-015), and a `realise` function returning
`Effect<O, E | StepError, StepContext>`. The `StepContext` is the
row of services the runtime injects: `ExecutionLog`, `ProseInvoke`,
`AIInvoke`, `GateService`, and I/O services. Every Step's
execution is memoised against the `ExecutionLog` (ADR-013).

Suspension — awaiting a Person decision, awaiting an LLM response,
awaiting an external system — is a typed value (`Suspend`) the
runtime converts into an appended pending record and a turn exit.
The next turn's `Protocol.continue` (ADR-014) replays from the
log and resumes without ceremony.

### Dependent ADRs

This ADR states the shape; the follow-ups detail each piece:

- **ADR-012** — Prose as the base `StepKind`; the six kinds.
- **ADR-013** — Session log as event store; replay semantics.
- **ADR-014** — `Protocol.continue` as the single entry point.
- **ADR-015** — TypeScript composition; `.md` siblings via
  `prose(import.meta.url, './file.md')`.
- **ADR-016** — `@athrio/*` namespace; `framework/` project folder.
- **ADR-017** — Accept / Correct / Clarify / Reject as typed Steps.
- **ADR-018** — Legacy code frozen; root corpus is the global
  living corpus.

**Consequences:**

- Every executable behaviour in LF — session lifecycle, ADR flow,
  gate handling, AI classifications, prose emissions, filesystem
  and git interactions — becomes a typed, importable, memoised,
  replayable `Step`.
- The session log is the execution event store. Process exits
  between turns are no longer state-losing.
- The "continue with goals" failure mode becomes structurally
  impossible: `Protocol.continue` is a function, not an
  instruction. The imperatives in `corpus/CLAUDE.md` become the
  human-readable explanation of what that function does.
- AI invocations are first-class: prose is the prompt, Step is
  the execution, the Execution Log is the memo table.
- Prose emissions are first-class: a recap, a greeting, a context
  dump is a prose Step with typed input.
- Accept / Correct / Clarify / Reject are typed Steps composable
  by Tropes that want custom accept-time or reject-time logic
  (ADR-017).
- A determinism discipline applies to workflow `run` bodies. A
  lint rule (deferred) enforces it; violations surface as
  `ReplayDivergence` at runtime (ADR-013).
- LF is pre-1.0. The legacy `@literate/*` scaffold is preserved
  frozen as reference (ADR-018); new executable code ships under
  `@athrio/*`.
- The architecture matches durable-workflow systems (Temporal,
  Restate, Inngest) in substance, but the durability substrate is
  the session log — human-readable, reviewable, diffable — rather
  than an opaque event store. This is the LP payoff: the
  execution trace is prose the Person already maintains.

[effect]: https://effect.website
