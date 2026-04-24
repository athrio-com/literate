# `step` — Concept seed

The typed shape of a Step *declaration*. Composes
[`step-kind`](../step-kind/) as a typed property. The runtime
implementation surface lives in `@literate/core`'s `step.ts`.

## Shape

```typescript
interface StepDeclaration {
  readonly _tag: 'StepDeclaration'
  readonly id: string
  readonly kind: StepKind
  readonly description: string
  readonly version?: string
}
```

See [`concept.mdx`](./concept.mdx) for the runtime-vs-
declaration split.

## Files in this seed

- **`concept.mdx`** — the prose body.
- **`index.ts`** — `StepDeclarationSchema` (importing
  `StepKindSchema`) and the `Concept<StepDeclaration>` value.

## Tangled into a consumer's repo

`literate tangle concepts step`.

## Used by

- The runtime `Step<I, O, E, R>` interface in
  `@literate/core` realises the contract this Concept
  declares.
- Forward Tropes (`adr-flow`, `goal-flow`, etc.) compose
  Steps; their declarations conform to `StepDeclarationSchema`.
