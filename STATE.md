# Loom — Implementation State

Tracks current implementation tasks against the spec in CLAUDE.md.
Updated as work progresses.

## Open Issues

The frame plane is now spec-conformant per CLAUDE.md Appendix. Two
non-blocking concerns remain — neither affects the de dicto / de re
plane separation:

- **Spurious tokens on prose lines (Volar mapping bleed).** Probe runs
  against `corpus/Loom.loom` show stray semantic tokens on lines 5–9
  (prose between section headings). Cause is Volar's source mapper
  yielding negative-length token cells when tsc tokens straddle two
  non-contiguous mapped regions in the concatenated `tangled-1` doc.
  The `\n;\n` section separator emitted by `projectLspImpl` was meant
  to prevent this but doesn't fully isolate token boundaries. Needs
  Volar internals investigation; the tokens themselves are
  semantically harmless (no false diagnostics), only visually noisy.

- **Untangled section product code has no tsc hover.** Per spec
  ("Untangled sections: Tree-sitter syntax tokens only") this is
  expected. The new (untracked) `src/multiplexer-integration.test.ts`
  test "TS hover still works alongside Python" asserts the opposite —
  it expects hover on `const msg: string = "hello"` inside an
  untangled section. The test contradicts the spec and was failing
  before the current frame rewrite too. Either remove the test or
  amend it to wrap the section in a Tangle so it gains tsc analysis.

## Tasks (current pass)

### #1 — Investigate why syntax highlighting fails on Embedded Code

**Status:** done (Opus 4.6 session)

End-to-end probe (`src/probe-lsp.ts`) against `corpus/Loom.loom`:

- **Tangled product code DOES get tsc semantic tokens.** App / Greet /
  Health / Boot lines (18–37 in source) produce `variable`, `property`,
  `type`, `keyword`, `operator` tokens via `volar-service-typescript`,
  mapped back to .loom positions correctly.
- **No untangled sections in the corpus** (every tagged section is
  composed by some Tangle), so the embedded-N path was never exercised
  — the only embedded block is the trailing bash fence. Untangled
  highlighting is therefore *un-tested*, not *broken* — but the
  one-mapping-per-block shape will still need #4 to make Tree-sitter
  positions reliable for whichever sections do go untangled.
- **Spurious tokens appear on prose lines (lines 5–9 of source).** Cause
  is the Volar source mapping yielding negative-length token cells when
  tsc tokens straddle two non-contiguous mapped regions in the
  concatenated tangled-1 doc — sections are joined without a guard
  that prevents tokens from spanning section boundaries.
- **Hover on `App` inside `compose(App, Greet, Health, Boot)` returns
  `null`.** This is the *real* mapping bug: the frame is in the virtual
  code tree but `getServiceScript` returned tangled-1 (TS) as the
  service script, so the frame is *not in the TS program*. The Tangle
  body's `compose(App, …)` has nowhere to resolve `App` because tsc
  never sees the frame.

**Conclusions for follow-up:**

1. Frame must be in the TS program. Either return frame as the
   `getServiceScript` primary and add tangleds via
   `getExtraServiceScripts`, or vice-versa — but both must end up in
   the program if both planes are to be analysed.
2. The frame must be a real `Effect.Service` class (not `declare`s) so
   the Service membership of `App`/`Greet`/etc. is what tsc sees.
3. Tangled-N needs section-boundary guards to keep tsc tokens from
   bleeding across non-contiguous source regions.
4. Embedded mappings should switch to line-precise emit so untangled
   blocks don't trip the same multi-line bleed problem.

### #2 — Rebuild Frame as real Effect.Service class per spec Appendix

**Status:** done
**File:** `src/loom.ts` — `projectFrameImpl`

Replaced the `declare`-only / locals-in-effect-gen frame with the
spec-conformant layout from CLAUDE.md Appendix:

- Real `import { Code, Tangle, Template, compose, needs } from "@literate/core"`
  + `import { Effect } from "effect"`. tsc resolves all signatures.
- Real `import { ServiceName } from "./<dep>"` per Dependencies block.
- **Top-level section consts** carrying real content:
  `const Tag: Effect.Effect<Code> = compose(\`literal line 1\`, Imports, …)`
  with each code block line as a backtick template-literal compose
  argument and each `{{Ref}}` transclusion as a bare identifier
  reference to the target's top-level const.
- Templated sections become
  `const Tag: Template<{ p: string; … }> = Template.make<{ … }>(({ p, … }) => compose(…))`
  with `{{name: type}}` placeholders rewritten to `${name}` interpolation
  inside the backtick literals.
- **Top-level Tangle consts** carrying the author's verbatim body, with
  the trailing `compose(...)` line rewritten as
  `const code = yield* compose(...)` and a machinery
  `return new Tangle({ tag, path, code })` appended. No explicit
  `Effect.Effect<Tangle>` annotation — tsc infers the R-channel from
  whatever services the tangle body actually depends on (e.g.
  `Effect.Effect<Tangle, never, ConfigLoom>` for PackageJson).
- `class ServiceName extends Effect.Service<ServiceName>()("ServiceName", { effect: Effect.succeed({ … }), dependencies: needs(…) }) {`
  `readonly stack = "<lang>"; readonly Tag = Tag; … }`
  — class body re-exposes every section / tangle as a `readonly` member
  whose identifier carries the source mapping for the [Tag] heading
  bracket.
- `export { ServiceName }` at module end.

The `effect:` factory uses `Effect.succeed({ ... })` rather than
`Effect.gen(function* () { yield* this.X })` — the runtime composes
tangles at the end of the world; the Service value is just the record.

### #3 — Source-map Service member names to heading bracket spans

**Status:** done

Probe (`src/probe-lsp.ts`) confirms, against `corpus/Loom.loom`:

- Hover on `[Greet]` → `(property) HonoHello.Greet: Effect.Effect<Code, never, never>`
- Hover on `[Imports]` → `(property) HonoHello.Imports: Effect.Effect<Code, never, never>`
- Hover on `[PackageJson, …]` → `(property) HonoHello.PackageJson: Effect.Effect<Tangle, never, ConfigLoom>`
- Hover on `[IndexTs, …]` → `(property) HonoHello.IndexTs: Effect.Effect<Tangle, never, never>`
- Hover on title `HonoHello` → `class HonoHello`

The R-channel of `PackageJson` correctly reflects its `yield* ConfigLoom`
dependency — inferred typing keeps the truthful shape rather than
forcing R to `never`.

### #4 — Make Embedded Code mappings line-precise

**Status:** done (closed in previous Opus 4.6 session as #11; verified
unchanged this pass)
**File:** `src/loom.ts` — `projectLspImpl`

Untangled `code` blocks pass through `emitCodeBlockMapped` (line-precise
per-line mapping). Untangled fenced blocks emit per-line mappings via a
local loop in the embedded-block branch. Both shapes match what the
frame and tangled docs use.

### #5 — Verify both planes route correctly via getServiceScript

**Status:** done

Probe against `corpus/Loom.loom` + `corpus/Configs.loom` confirms:
- Heading-bracket hovers land in the frame (see #3).
- Product-code hovers land in the tangled doc — e.g. `app` at L19 col 4
  resolves via tangled-1 (returns `const app: any` because the tangled
  doc has no Hono import context, but the lookup IS in the tangled
  plane, not the frame).
- Cross-loom resolution works: `import { ConfigLoom } from "./Configs"`
  resolves through Configs.loom's frame (selected by `getServiceScript`
  fallback because Configs.loom has no TS tangles). Hovers on
  `ConfigLoom` everywhere — `needs(ConfigLoom)`, `yield* ConfigLoom` —
  show `(alias) class ConfigLoom`.
- The destructured `PackageJson` from `const { PackageJson } = yield* ConfigLoom`
  resolves to `const PackageJson: Effect.Effect<Code, never, never>` —
  the top-level const exported via Configs.loom's frame.

The frame's standalone TS validity also checked: dumping
`projectLsp(corpus/Loom.loom).frame.content` and
`projectLsp(corpus/Configs.loom).frame.content` to disk and running tsc
against them yields zero errors with `@literate/core` resolved.

### #6 — Update STATE.md with new findings

**Status:** done

This file. Spurious-tokens-on-prose-lines and untangled-hover concerns
moved to "Open Issues" as known non-blocking items.

## History — closed in previous Opus 4.6 session

#8 — Generate frame for ALL loom files, not just files with tangles. **done**
#9 — Rebuild frame to full Effect.Service class per spec Appendix. *partially done* — the frame is generated for every Loom but is still a `declare`-only shell, so the structural change is incomplete. Reopened as #2.
#10 — Resolve @literate/core types in frame preamble. *partially done* — `import { Effect } from "effect"` works, but @literate/core types are still inlined as `declare class`. Reopened as part of #2.
#11 — Strip indent and use line-level mappings in tangled virtual docs. **done**
#12 — Implement cross-loom section resolution in LSP projection. **done**
#13 — Add embedded codes for fenced blocks in untangled sections. **done**
#14 — Verify getServiceScript routing and frame-as-fallback behavior. *needs revalidation* once #2 lands. Reopened as #5.

## Future Correction Points

### Terminology: do not equivocate "frame" with "service script fallback"

**Frame** is a reserved notion in the Loom architecture: the **de dicto Composition Program** — the `Effect.Service` class that describes HOW sections compose. It is one specific aspect of the virtual code tree (`languageId: "typescript"`, child of root, holds `compose()`/`needs()`/`yield*` machinery). It is authored by Loom itself, not by Loom consumers.

The current `getServiceScript` implementation at `src/server.ts:318` happens to **select the frame virtual code as the file's TS service script** (with Free overriding when present, and tangled-N TS docs added via `getExtraServiceScripts`). That is an implementation choice about module-resolution surface — not a redefinition of what "frame" means. Phrasing like "frame-as-service-script" silently conflates three distinct aspects:

- **Frame (de dicto):** the Composition Program. Authored by Loom. One per file.
- **Service script:** Volar's chosen TS module representative for cross-file `import` resolution. A role, not an aspect — playable by different virtual codes (a tangled TS doc, the frame, or potentially a dedicated module-surface virtual code).
- **Tangled product code (de re):** the resolved Code emitted by Loom consumers, flowing through Kleisli arrows into tangled virtual docs.

These three must not collapse into one another in language or in code.

**Action when revisited:** introduce a dedicated **module-surface virtual code** (separate from the frame) whose sole job is to expose the Service class for cross-loom import resolution. `getServiceScript` could then pick the module surface unconditionally, leaving the frame to do exactly one job: hold the Composition Program for tsc analysis. Until then, comments and docs around `getServiceScript` should say "frame is reused as the service script when no TS tangle exists" — never "the frame is the service script."
