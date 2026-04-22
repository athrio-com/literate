# ADR-005 — Tropes are prose-first (MDX); Effect Schema provides typed backing

**Date:** 2026-04-22
**Status:** Accepted
**Tags:** `#protocol` `#tooling`

**Context:**

LF ships Tropes as readable prose with structural metadata. The
format must satisfy three pressures simultaneously: humans and
agents read the prose as the canonical artefact; the compiler
validates and composes Tropes mechanically; and cross-Trope
references must be resolvable at compile time, not grepped at
runtime. Raw Markdown is enough for prose but loses structure. Pure
TypeScript is structured but pushes prose into string literals or
JSDoc, where authors cannot comfortably write several paragraphs.

MDX threads the needle. It accepts Markdown prose as its body and
YAML-style frontmatter (plus TypeScript imports) for metadata.
Authors edit prose naturally; the build pipeline reads frontmatter
for the structural part.

Tropes come in two shapes. Prose-dominant Tropes (most workflow
Tropes, the session Trope) benefit from being a single MDX file
where the prose is the whole story and metadata is a few
frontmatter fields. Schema-heavy Tropes (the `decisions` Trope, the
`category` Trope) have non-trivial shape and composition rules that
want to live in TypeScript code — Effect Schema, types derived from
it — alongside a sibling MDX for prose.

**Decision:**

Every Trope is prose-first. Concrete authoring pattern:

- **Prose-dominant Tropes** — single `TROPE.mdx` file in the Trope's
  folder. Frontmatter declares `id`, `version`, `kind` (always
  `trope`), `realises` (the Concept it realises), `dependencies`.
  Body is the prose describing how the Concept is done in LF.
- **Schema-heavy Tropes** — `TROPE.mdx` holds the prose, sibling
  `index.ts` owns the Effect Schema and typed exports. The two
  files are co-located in the Trope's folder; the schema validates
  authored instances of that Trope.

Workflow order (binding):

1. Author the MDX body first. Prose must be coherent on its own.
2. Derive the Effect Schema from the prose. Schema changes that
   diverge from the prose trigger a prose revision; divergence is
   a bug.
3. Commit prose changes and schema changes separately where
   reasonable, to model the prose-first principle in history.

Every Concept file in `src/concepts/` follows the same two-shape
pattern: pure MDX for prose-dominant Concepts (most of them); MDX
plus sibling `index.ts` when the Concept carries significant schema.

**Consequences:**

- `src/tropes/<trope>/TROPE.mdx` is always present. Sibling
  `index.ts` is present when schema justifies it.
- `src/concepts/<concept>.mdx` is the Concept declaration. Sibling
  `<concept>.ts` under `src/schemas/` carries the Effect Schema
  when the Concept is schema-heavy (e.g., `decisions`, `category`).
- MDX frontmatter for Concepts:
  `id`, `version`, `kind: concept`, `description`, `dependencies`.
- MDX frontmatter for Tropes:
  `id`, `version`, `kind: trope`, `realises`, `dependencies`.
- The compiler (in `packages/core`) reads frontmatter and Effect
  Schemas to resolve dependencies and validate instances.
- Next.js on the LF site renders MDX for public docs; the compiler
  emits the same MDX into consumer `.literate/` directories without
  Next.js.
