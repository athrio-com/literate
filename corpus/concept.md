---
name: Concept
kind: Concept
status: draft
---

# Concept: Concept

The schema every Concept manifest satisfies.

## Schema

```typescript tangle="src/concept.ts"
import { Schema } from "effect"

export const Concept = Schema.Struct({
  name: Schema.String,
  kind: Schema.Literal("Concept"),
  status: Schema.String
})

export type Concept = Schema.Schema.Type<typeof Concept>
```
