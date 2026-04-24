# `disposition` — Concept seed

The referential-domain Concept. Names *what subject matter*
a Trope, an authored instance, or a session is about.
Supersedes ADR-021's `Modality` (the operational-stance
component of the old ADT moved to the `Mode` Concept; the
referential-frame component became this).

## Shape

```typescript
interface Disposition {
  readonly base: 'Product' | 'Protocol' | 'Infrastructure'
  readonly scope?: string
  readonly prompt?: string
  readonly prose?: string
}
```

`base` is closed at v0.1; the three optional fields are open
freeform. See [`concept.mdx`](./concept.mdx) for the full prose
and the rationale behind the rename.

## Files in this seed

- **`concept.mdx`** — the prose body. Reader-oriented; defines
  the three bases with examples; explains Disposition vs Mode;
  records the Modality-supersession rationale.
- **`index.ts`** — TypeScript binding: typed Effect `Schema`
  (`DispositionSchema`), ergonomic constructors (`Disposition.Product`,
  `Disposition.Protocol`, `Disposition.Infrastructure`), and the
  `Concept<Disposition>` value bound to the prose via
  `prose(import.meta.url, './concept.mdx')` per ADR-015.

## Tangled into a consumer's repo

`literate tangle concepts disposition` places these files at
`.literate/concepts/disposition/{concept.mdx, index.ts, README.md}`
and updates `.literate/manifest.json`. The vendored copy is
the consumer's; per ADR-026 §4 LF's CLI bundles its own copy
for any framework-side composition.

## Used by

- Forward: `concept-session`'s instance schema includes an
  optional `disposition: Disposition` field. Sessions
  authoring LF itself default to `Disposition.Protocol`.
- Forward: `concept-trope` (when authored) will require
  `disposition` on every Trope — replacing ADR-021's
  `modality: Modality` clause.
- Cross-axis: `concept-mode` is the orthogonal operational-
  stance axis. Disposition × Mode is the 2D product space
  exhaustively pattern-matched at every authoritative branching
  site.
