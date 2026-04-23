# Category — step-kind

Closed vocabulary of the `StepKind` discriminator declared by
[ADR-012](../decisions/ADR-012-prose-as-base-step-kind.md). Every
Step authored under `@literate/*` carries exactly one kind from this
set. Adding a new kind requires a gated ADR amendment.

## Members

- `prose` — emits (possibly parametrised) prose. The *base kind*:
  every other kind is prose bound to a different service.
- `workflow` — composes other Steps in an `Effect.gen` body. No
  direct side-effects; its outputs are the outputs of its inner
  Steps.
- `effect` — pure Effect computation whose result is memoised
  against the Execution Log. Examples: `next-adr-number`,
  hash-of-prose, parse-frontmatter.
- `ai` — LLM invocation. The Step's prose is the prompt template;
  the Step's output schema types the response. Memoised.
- `gate` — suspension point awaiting a Person decision (Accept /
  Correct / Clarify / Reject). Throws `Suspend` on first encounter;
  returns the typed `GateDecision` on replay after resolution.
- `io` — filesystem / git / network side-effect. Result is memoised
  against the Execution Log as a snapshot of the observed state.

## Morphisms

- `prose` is the base kind; the other five are specialisations that
  bind prose to a specific service.
- `workflow` composes arbitrary combinations of the other five.
- `ai` and `prose` share the `ProseInvoke` templating service; they
  differ in whether the rendered prose is emitted or sent to an
  inference service.

## References

- [ADR-012](../decisions/ADR-012-prose-as-base-step-kind.md)
  declares the closed set and the `Step` interface.
- [ADR-013](../decisions/ADR-013-session-log-event-store.md)
  records each invocation's kind in the `ExecutionRecord`.
- [ADR-017](../decisions/ADR-017-gate-decisions-as-typed-steps.md)
  specialises the `gate` kind into the four-decision flow.
