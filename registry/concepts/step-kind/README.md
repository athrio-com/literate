# `step-kind` — Concept seed

The closed vocabulary of the `StepKind` discriminator declared
by ADR-012. Promoted from `corpus/categories/step-kind.md`.

## Shape

```typescript
type StepKind = 'prose' | 'workflow' | 'effect' | 'ai' | 'gate' | 'io'
```

See [`concept.mdx`](./concept.mdx) for the per-member
semantics and the morphisms between kinds.

## Files in this seed

- **`concept.mdx`** — the prose body.
- **`index.ts`** — `StepKindSchema`, the `StepKind`
  ergonomic constructor namespace, and the
  `Concept<StepKind>` value.

## Tangled into a consumer's repo

`literate tangle concepts step-kind`.

## Used by

- The `step` parent Concept composes `StepKindSchema` as
  the `kind` field of `StepDeclarationSchema`.
- The runtime `StepKind` enumeration shipped by
  `@literate/core` (in `packages/core/src/step.ts`) is the
  load-bearing implementation surface; this Concept declares
  the typed surface consumers see.
