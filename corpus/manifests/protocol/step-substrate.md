---
id: bf82d07a
disposition: { base: 'Protocol', scope: 'step-substrate' }
layer: { kind: 'protocol', path: 'protocol', holds: 'domains' }
domain: step-substrate
status: Reconciled
---

# Step Substrate

LF's **Step substrate** is the executable layer between a Trope
and an authored instance. Steps compose via Effect, persist
through a session-log event store, and replay deterministically.
Every Step has typed input/output schemas, an InvocationKey for
memoisation, and a ProseRef binding it to the section of prose
that authorises its existence.

## Six Step kinds

The Step kind is closed at six. Adding a kind is an algebraic
gated change.

- **`prose`** — the base case. A Step whose execution is the
  reading of its prose. Output is the prose itself; no side
  effects.
- **`workflow`** — sequences other Steps via `Effect.gen`. The
  composing constructor for multi-step Tropes.
- **`effect`** — pure Effect. Input → output transformation,
  no side effects, no services required.
- **`ai`** — invokes an AI through the `AIInvoke` service.
  Replay reads the persisted output.
- **`gate`** — presents a draft to the Person and reads back
  one of `Accept | Correct | Clarify | Reject`.
- **`io`** — performs side-effecting I/O (file read/write,
  external API). Persisted output enables idempotent replay.

## Typed I/O on every Step

Every Step declaration carries an `inputSchema` and an
`outputSchema` (Effect Schema). Inputs are validated on
invocation; outputs are validated on completion. Schema
violations produce typed `StepError`s.

The schemas serve three functions: (1) at compile time, they
type-check Step compositions; (2) at runtime, they validate
inputs and outputs; (3) at replay time, they decode the
persisted output bytes back into a typed value.

## TypeScript composition surface

Steps are declared in TypeScript. There is no directive syntax,
no parser, no codegen. Step prose lives in **sibling `.md`
files** referenced via `prose(import.meta.url, './file.md')`
or `prose(import.meta.url, './file.md', { section: 'compute-id' })`
for sub-section targeting.

The TypeScript declaration is the composition surface; the
`.md` sibling is the prose authority. They evolve together.
The pattern keeps tooling simple (no AST work) and editor
support good (every editor handles `.ts` + `.md`).

## InvocationKey and memoisation

A Step's **InvocationKey** is a deterministic hash of
`(stepId, inputJson, codeVersion)`. The `memo` combinator
wraps a Step so that a duplicate InvocationKey looks up the
prior output from the execution log instead of re-running.
This is what makes replay sound: a partially-executed
workflow continues from where it left off without
re-executing committed Steps.

## Prose-before-code

A Step does not exist until its prose has been authored and
gated. The gate establishes intent; the code that mechanically
realises the prose follows. Reverse direction (code first, prose
post-hoc) is not part of the algebra.

```path
packages/core/src/step.ts
```

```path
packages/core/src/combinators.ts
```

```path
packages/core/src/execution.ts
```
