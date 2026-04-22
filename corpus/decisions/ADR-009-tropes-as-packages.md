# ADR-009 — Tropes ship as workspace packages with typed cross-imports

**Date:** 2026-04-22
**Status:** Accepted
**Tags:** `#algebra` `#tooling` `#release`

**Context:**

The three-level algebra (ADR-001) treats Concepts as interfaces and
Tropes as their realisations. For the algebra to do real work — for
the compiler to reject bad references at compile time, for consumers
to pin to specific versions, for the dependency graph to compose
mechanically — Concepts and Tropes need module identity beyond
"folder under `src/tropes/`."

A first attempt placed each Concept in `src/concepts/<id>.mdx` and
each Trope in `src/tropes/<id>/TROPE.mdx` as bare prose with YAML
frontmatter. Cross-Trope dependencies were strings in frontmatter
(`dependencies: [corpus, category]`). The compiler resolved by
walking files and matching names. Two consequences surfaced
immediately:

- A Trope referencing a non-existent dependency was caught at
  compile-runtime, not type-check time.
- The CLI workspace duplicated the dependency map (a `registry.ts`
  mirroring the source tree) because the published unit could not
  reach into the repo's `src/`.

Both symptoms point at the same gap: there is no module identity.
The fix is to give every Concept and every Trope a real npm
package, with TypeScript imports for cross-references, Effect
Schema for typed instance shapes, and an MDX prose sibling for the
human/AI-readable description.

**Decision:**

Each Concept ships as a workspace package
`@literate/concept-<id>` with:

- `src/index.ts` — exports a typed `Concept<I>` value (id, version,
  description, instance Schema, prose loader, dependency Concept
  references).
- `src/concept.mdx` — the MDX prose body.
- `package.json` declaring its workspace dependencies on
  `@literate/core` and any other Concepts it depends on.

Each Trope ships as a workspace package `@literate/trope-<id>`
with:

- `src/index.ts` — exports a typed `Trope<C>` value referencing its
  Concept package and its dependency Trope packages by real TS
  import.
- `src/prose.mdx` — the MDX prose body.
- Optional `src/subkinds/*.ts` + `src/subkinds/*.mdx` for refined
  Schemas under the same Concept.
- Optional `src/members/*.ts` + `src/members/*.mdx` for typed
  primitives.
- Optional Effect `Layer` exposing runtime services the Trope
  contributes.
- `package.json` declaring its workspace dependencies on
  `@literate/core`, the realising `@literate/concept-*` package,
  and any peer `@literate/trope-*` packages it composes with.

Cross-references between Tropes and between Tropes and Concepts
are real TypeScript module imports. A missing or wrong-typed
reference is a compile-time error.

The compiler (`@literate/cli`) imports Trope packages directly from
its own dependencies and resolves the graph via the typed
`composeTropes` function in `@literate/core`. There is no string
lookup, no duplicated registry, no parallel manifest.

**Consequences:**

- 8 + 10 + 1 = 19 new workspace packages land in `packages/`
  (8 `concept-*`, 10 `trope-*`, 1 `template-minimal`).
- The CLI declares all bundled Trope packages as workspace
  dependencies; the bundled catalog (`packages/cli/src/catalog.ts`)
  is built from the imported objects themselves.
- The `src/concepts/`, `src/tropes/`, `src/schemas/`, and
  `src/templates/` folders at the repo root are deleted; their
  contents are absorbed into the per-package shape.
- Per-Trope versioning becomes possible (semver per package).
  v0.1 ships every Trope at version `0.1.0`; future releases may
  bump per-Trope.
- Subkinds are exported from their parent Trope's package as named
  `Subkind<C>` exports; future subkinds (SDR, PDR for the
  `decisions` Trope) plug in by adding another file under
  `src/subkinds/` and re-exporting.
- Members are exported from the parent Trope's package as named
  `Member` exports; the `category` Trope ships its four base
  members this way.
- The convention from ADR-002 — `corpus/ → src/ ← .literate/` —
  remains the consumer-facing invariant. In LF's own repo the
  `src/` role is realised as `packages/*` (see updated ADR-002).
