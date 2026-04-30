---
name: Trope
kind: Concept
status: draft
---

# Concept: Trope

The schema every Trope manifest satisfies.

## Schema

```typescript tangle="src/trope.ts"
import { Schema } from "effect"

export const Trope = Schema.Struct({
  name: Schema.String,
  kind: Schema.Literal("Trope"),
  status: Schema.String
})

export type Trope = Schema.Schema.Type<typeof Trope>
```
