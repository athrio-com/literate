# ADR-015 — TypeScript as composition surface; `.md` siblings via `prose()`

**Date:** 2026-04-23
**Status:** Accepted
**Tags:** `#protocol` `#tooling`

**Refines:** ADR-005

**Context:**

ADR-005 declared Tropes prose-first with MDX as the authoring
surface and Effect Schema as typed backing. That decision served
the pre-Step world well: Tropes were prose documents with
occasional metadata. With Steps in play (ADR-011, ADR-012), every
Step requires a `ProseRef`, and a design question opens: *how do
authors bind prose to a Step?*

Two candidate shapes were considered during the drafting of ADR-013
in session `2026-04-23T0919`:

**Option A — Directive-annotated MDX.** Prose blocks declare
their Step metadata inline via `:::step{id=… kind=…}` directives.
A build-time compiler walks MDAST nodes, emits sibling `.ts` files
exporting typed `Step<>` objects. One file contains both prose and
metadata; authoring is "literate" in the narrowest sense.

Costs: a compiler to maintain, generated `.ts` files cluttering
the monorepo, directive-parser edge cases, IDE goto-definition
broken across the generated boundary, refactoring tools unable to
follow the prose↔code link.

**Option B — TypeScript owns composition; `.md` siblings.**
Steps are authored directly in `.ts`. Prose lives in plain `.md`
files adjacent to the `.ts`, referenced by a typed helper
`prose(import.meta.url, './file.md')`. No directives, no codegen,
no MDX compiler, no generated files.

Costs: single-file authoring is lost. A Step definition is ~5–10
lines of TypeScript wrapping a `.md` reference.

**Decision:**

The framework adopts **Option B** for `@athrio/*` Steps. Every
Step is declared in a `.ts` file; the Step's prose lives in a
sibling `.md`; the link is `prose(import.meta.url, './file.md')`.

```typescript
// framework/packages/trope-session-start/src/steps/recap.ts
import { proseStep, prose } from '@athrio/core'

export const sessionRecap = proseStep({
  id: 'session-start.recap' as StepId,
  source: prose(import.meta.url, './recap.md'),
  defaults: { range: [0, 200] },
})
```

```markdown
<!-- framework/packages/trope-session-start/src/steps/recap.md -->
The prior session closed at {vars.closedAt}. Summary follows.

{vars.summary}

Deferred / Discovered items carried forward: {vars.deferredCount}.
```

### The `prose()` helper

```typescript
export const prose: (importMetaUrl: string, relativePath: string) => ProseRef

export interface ProseRef {
  readonly _tag: 'ProseRef'
  readonly sourcePath: string                 // absolute; resolved from import.meta.url
  readonly load: () => Effect.Effect<string, ProseLoadError>
}
```

`prose()` resolves the relative path against the caller's
`import.meta.url` and returns a `ProseRef` the runtime's
`ProseInvokeService` loads on demand. Resolution happens at Step
construction time; file reads are deferred and memoised via the
Execution Log.

### Templating grammar

The v0.1 prose templating surface is intentionally small:

```typescript
export const ProseInput = Schema.Struct({
  range:    Schema.optional(Schema.Tuple(Schema.Number, Schema.Number)),
  section:  Schema.optional(Schema.String),  // heading slug
  vars:     Schema.optional(Schema.Record(Schema.String, Schema.String)),
})
```

- `range: [start, end]` — character slice of the loaded prose.
- `section: "slug"` — markdown-heading slice (the section whose
  heading matches the slug).
- `vars: { name: value }` — interpolates `{vars.name}` tokens.

No conditionals, no loops, no macros. Control flow means
composing multiple prose Steps inside a `workflow` Step.

### Corpus-is-markdown holds

Consumer-authored files — ADRs, Concept definitions, session
logs, Categories, specs — remain pure markdown. Option B does
not affect them. The distinction:

- **Framework-shipped Tropes** author Steps (TypeScript) and
  prose (markdown) together in `framework/packages/*`.
- **Consumer corpus** remains pure markdown everywhere.

The ADR-002 invariant (`corpus/` → `src/` ← `.literate/`) is
unaffected.

### Relationship to ADR-005

ADR-005 declared Tropes prose-first with MDX + Schema. That ADR
stays Accepted and its principle stays intact: prose motivates
code. What changes is *how* Step prose is bound to Step code: no
longer MDX with directives, now plain `.md` imported by
`.ts` via `prose()`. Consumer-facing Concept and Trope prose
under `corpus/concepts/` and `corpus/specs/` remains pure markdown
per ADR-002 / ADR-010.

### No prose compiler; no directives

The framework ships:

- No `@athrio/prose-compiler` package.
- No MDX directive parser for Steps.
- No generated `.ts` files under `framework/packages/*`.
- No AST walking to discover Steps.

Every Step is discoverable by TypeScript module graph alone.

**Consequences:**

- IDE goto-definition works across the Step surface. Renaming a
  Step renames it. Refactoring tools see the imports as ordinary
  imports.
- Build is `tsc`; no extra step. `.md` files are read at runtime
  by `ProseInvokeService`.
- `.md` files are plain markdown — readable in any viewer,
  diff-able, commentable.
- The templating grammar is deliberately minimal. Future
  extensions (conditionals, richer section selectors) require a
  gated ADR amendment.
- The rejected Option A is documented here so future proposals
  to reintroduce a prose compiler reference the cost analysis
  rather than relitigating it.
- Legacy ADR-005's MDX choice is preserved for pre-Step Tropes
  in `packages/trope-*/src/prose.mdx`; those files are frozen per
  ADR-018.
