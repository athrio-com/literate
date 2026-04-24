# `mode` — Concept seed

The operational-stance Concept. Names *how the work is being
done* — orthogonal to Disposition (which names *what it is
about*). Lifts the operational-stance component of ADR-021's
six-case `Modality` ADT (`Weave`, `Tangle`, plus the
implicit `Exploring` that the legacy ADT didn't model) into a
typed three-case ADT.

Bound to **IMP-N** in `corpus/CLAUDE.md` (and the template's
`CLAUDE.md`): the imperative that overrides agentic-IDE
training defaults so an agent in `Exploring` Mode does not
collapse exploration into premature implementation.

## Shape

```typescript
type Mode = 'Exploring' | 'Weaving' | 'Tangling'
```

See [`concept.mdx`](./concept.mdx) for the full prose, the
enactor axis (Agent vs CLI), and the Mode × Disposition
table.

## Files in this seed

- **`concept.mdx`** — prose body. The three modes, the
  enactor axis, the discipline expectations per (Mode,
  enactor) pair, and the Mode × Disposition product space.
- **`index.ts`** — typed Effect `Schema` (`ModeSchema`),
  ergonomic constructors (`Mode.Exploring`, `Mode.Weaving`,
  `Mode.Tangling`), the `Enactor` schema (`'Agent' | 'CLI'`),
  and the `Concept<Mode>` value.

## Tangled into a consumer's repo

`literate tangle concepts mode` places these files at
`.literate/concepts/mode/{concept.mdx, index.ts, README.md}`
and updates `.literate/manifest.json`. The next `literate weave`
materialises a `LITERATE.md` that references this Concept
alongside the active Tropes.

## Used by

- **IMP-N** in `corpus/CLAUDE.md` and in the template's
  `CLAUDE.md` cite this Concept by name. The imperative is
  the load-bearing binding to agent behaviour.
- Forward: `concept-session` carries an optional `mode: Mode`
  (added in this Concept's authoring session).
- Forward: `session-start` Trope's pending Mode-setting Step
  defaults to the heuristic in `concept.mdx` (under-shaped →
  Exploring; concrete intent → Weaving; mechanical → Tangling).
- Forward: `session-end` Trope's pending Mode-transition
  validator confirms in-session shifts were gated.
