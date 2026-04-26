---
id: 19c7230b
disposition: { base: 'Protocol', scope: 'step-substrate' }
layer: { kind: 'protocol', path: 'protocol', holds: 'domains' }
domain: step-substrate
status: Reconciled
---

# Step Substrate

A **Step is an atomic Trope**. Where a composite Trope (a
session, an LFM, a multi-Step procedure) composes other Tropes
inside its body, an atomic Trope is a Trope without sub-Tropes —
a Trope whose body is small enough to be self-contained, and
whose Mode and Disposition are single-valued. Steps are the
executable layer between a composite Trope and an authored
instance. They compose via Effect, persist through a session-log
event store, and replay deterministically.

Each Step carries the standard Trope fields (`realises:
Concept`, `disposition: Disposition`, `mode: Mode`, `prose:
ProseRef`) plus the runtime fields specific to its atomic role:
`inputSchema`, `outputSchema`, an `InvocationKey` for
memoisation, and a `run` function returning an Effect.

## Step kinds as Variants

The Step kind is closed at six. Each kind is a **Variant** of
the Step Trope (in the existing `Variant<C, D>` sense): same
parent Trope, different runtime shape and prose responsibility.
Adding a kind is an algebraic gated change.

- **`prose`** — the base case. A Step whose execution is the
  reading of its prose body. Output is the prose itself; no
  side effects.
- **`workflow`** — sequences other Steps via `Effect.gen`. The
  composing Variant for multi-Step procedures; the parent's
  `realise` field typically holds a `workflow` Step that
  arranges atomic Steps in sequence.
- **`effect`** — pure Effect. Input → output transformation,
  no side effects, no services required.
- **`ai`** — invokes an AI through the `AIInvoke` service.
  Replay reads the persisted output.
- **`gate`** — presents a draft to the Person and reads back
  one of `Accept | Correct | Clarify | Reject`.
- **`io`** — performs side-effecting I/O (file read/write,
  external API). Persisted output enables idempotent replay.

## Single Mode, single Disposition

Every Step's `mode` and `disposition` are mandatory and
single-valued; that is the atomicity constraint that
distinguishes a Step from a composite Trope. A `gate` Step in
Weaving Mode under `Protocol` Disposition is one specific
atomic Trope; the same `gate` Step kind under `Tangling` Mode
is a different Trope instance. The constraint makes it possible
to pattern-match exhaustively on `(mode, disposition)` at every
Step's enactment without falling back to "the parent's mode" or
"the session's mode."

A composite Trope's *effective* Mode at any moment is the
active Step's Mode; *effective* Disposition aggregates over
its composing Steps' Dispositions.

## Typed I/O on every Step

Every Step declaration carries an `inputSchema` and an
`outputSchema` (Effect Schema). Inputs are validated on
invocation; outputs are validated on completion. Schema
violations produce typed `StepError`s.

The schemas serve three functions: at compile time, they
type-check Step compositions; at runtime, they validate inputs
and outputs; at replay time, they decode the persisted output
bytes back into a typed value.

## TypeScript composition surface

Steps are declared in TypeScript. There is no directive syntax,
no parser, no codegen for the Step layer itself — the directive
substrate (see :lfm[annotation-substrate]{hash=9a6b8081}) operates on
*authored prose*, not on the typed runtime declarations of
Steps. Step prose lives in sibling `.md` (or `.mdx`) files
referenced via `prose(import.meta.url, './file.md')` or
`prose(import.meta.url, './file.md', { section: 'compute-id' })`
for sub-section targeting.

The TypeScript declaration is the composition surface; the
sibling prose file is the prose authority. They evolve
together. The pattern keeps tooling simple (no AST work for the
runtime substrate) and editor support good.

## InvocationKey and memoisation

A Step's **InvocationKey** is a deterministic hash of
`(stepId, inputJson, codeVersion)`. The `memo` combinator
wraps a Step so that a duplicate InvocationKey looks up the
prior output from the execution log instead of re-running.
This is what makes replay sound: a partially-executed workflow
continues from where it left off without re-executing committed
Steps.

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
