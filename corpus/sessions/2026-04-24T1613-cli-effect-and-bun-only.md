# Session: 2026-04-24 — CLI Effect-composed end-to-end + Bun-only runtime

**Date:** 2026-04-24
**Status:** Closed (2026-04-24T16:37)
**Chapter:** — (no chapter yet)
**Agent:** Claude Opus 4.7 (1M context) — fast mode
**Started:** 2026-04-24T16:13

## Pre-work

Spontaneous start per IMP-1.2.a; opened immediately after
`p3-cleanup` closed at 16:13 per Person directive (fast mode, no
inter-session turn). No `Status: Open` orphan; planned sessions
P5–P8 remain `Planned` but none is implied by the Person's
prompt — this session discharges an Effect-idiom conformance
arc and a Bun-only runtime narrowing that surfaced during the
P3 cleanup inspection.

- **Last `Status: Closed` session.** `p3-cleanup`
  (`2026-04-24T1548-p3-cleanup`, Closed 2026-04-24T16:13).
  Summary: landed the single-drift P3 fix
  (`ProseSchemaViolations` → `Data.TaggedError`), swept the
  pre-existing `npx` line in `README.md` to Bun-native forms,
  surfaced two false-positive drift categories with the
  enumeration before any silent correction. All checks green.
  The deeper two-idiom split the inspection exposed
  (Effect-in-some-verbs vs. plain-async-elsewhere in
  `@literate/cli`) is the entry point for this session.

- **Carry-forward from `p3-cleanup` Deferred / Discovered.**
  - The Person queued two successor sessions at p3-cleanup
    close: this session, plus a Planned `effect-cli-argv-surface`
    that this session pre-scopes at close per IMP-4.
  - Recorded: **Effect-idiom refactor covers the CLI package
    only** (`@literate/core` already idiomatic; Trope seeds
    already idiomatic; `@literate/template-minimal` has no
    composition surface).
  - Recorded: **`smoke-install.sh` is a hermetic test harness,
    not a documented install path** — its `npm install <tarball>`
    can switch to `bun add <tarball>` under Goal 2 but is not
    subject to the "no-`npm`-in-human-facing-install-docs"
    directive that applies to `README.md`.

- **ADR index.** 27 ADRs indexed. This session authors two
  new ADRs (**028**, **029**) and amends ADR-004's `Status:`
  line (the body stays untouched per IMP-6). No supersessions;
  ADR-004 stays Accepted with an annotation.

- **Person directive at open.** Two Goals `Active` from open,
  no re-gating, no other ADRs beyond 028/029, no scope
  expansion. Discovered-but-not-shipped items go to
  `## Deferred / Discovered`. No intermediate red states.

## Goals

### Goal 1 — CLI is Effect-composed end-to-end

**Status:** Completed
**Category:** refactor
**Topic:** Eliminate the two-idiom split in `@literate/cli`.
Every verb's `run` returns `Effect<number, VerbError, R>` — no
promise-based `async` at the verb boundary, no plain `try/catch`
error handling. Services under `src/registry/*` and
`src/weaver/*` become `Context.Tag`s with Layers; every error
type is `Data.TaggedError`; I/O wraps in `Effect.tryPromise` with
mapped error channels. The bin dispatcher runs the Effect with a
live Layer composition. This brings every file in the package to
the idiom established by `verbs/continue.ts`, `verbs/close.ts`,
and every Trope in `registry/tropes/*`.

**Upstream:** ADR-004 — CLI in Effect (this Goal settles the
*depth* clause ADR-004 left unspecified); `packages/core/src/services.ts`
(the `Context.Tag` + Layer pattern this refactor extends across
the CLI); existing `verbs/continue.ts` + `verbs/close.ts` as the
reference for verb-boundary Effect composition.

**Scope:**
1. `src/verbs/verb.ts` — redefine `Verb.run` to return
   `Effect<number, VerbError, Requirements>`. Introduce
   `VerbError` as a union of `Data.TaggedError` classes.
2. `src/bin/literate.ts` — dispatcher builds the live Layer,
   runs the verb's Effect, maps outcome to exit code. **Keep
   hand-rolled `switch(verb)` + ad-hoc `--flag` parsing here**
   — `@effect/cli` deferred to the Planned successor.
3. `src/registry/config.ts`, `manifest.ts`, `fetcher.ts` —
   each becomes a `Context.Tag` service with a `Layer.effect`
   factory.
4. `src/weaver/weaver.ts` — `weave` becomes `Effect<WeaveResult,
   WeaveError, Manifest | …>`.
5. `src/verbs/*` — each verb rewrites its `run` body to
   `Effect.gen`. Programmatic `runX` helpers return Effects.
6. `src/__tests__/e2e.test.ts` + `prose-schema.test.ts` — drive
   verbs via `Effect.runPromise(… .pipe(Effect.provide(layer)))`.

**Out of scope:**
- `@effect/cli` adoption — deferred to the Planned successor.
- No changes to `@literate/core`, `registry/tropes/*`, or
  `@literate/template-minimal`.

**Acceptance:**
- `grep -r 'async.*run' packages/cli/src/verbs/` returns zero.
- No `throw new Error(…)` in `packages/cli/src/` post-refactor.
- Every service under `src/registry/*` + `src/weaver/*` is a
  `Context.Tag` with at least one `Layer` factory.
- `bun run typecheck` + `bun test` + `bun run build` all clean;
  `smoke-install.sh` passes.

### Goal 2 — Bun-only runtime; drop Node compatibility

**Status:** Completed
**Category:** migration
**Topic:** Narrow the CLI's runtime matrix to Bun. The
any-Node-shaped-runtime compatibility inherited through ADR-004
and ADR-025 §8 was never a user request; it fell out of the
bundled-JS shape. Removing it cleans documentation, removes a
future drift vector ("but does this work on Node?"), and aligns
with the Bun-first posture already present in `engines.bun`,
`Bun.build()`, `prose(import.meta.url, …)`, and TS-sources-are-
the-runnable-artefact.

**Upstream:** ADR-004 (runtime clause amended via `Status:` line
here); ADR-025 §8 (reframe "Node-shaped runtime" →
"Bun runtime"); `packages/cli/package.json` `engines.bun`.

**Scope:**
1. `packages/cli/scripts/build.ts` — shebang
   `#!/usr/bin/env bun`; `Bun.build({ target: 'bun' })`.
2. `packages/cli/scripts/smoke-install.sh` — switch to pure-Bun
   install path (`bun add <tarball>` or Bun-native equivalent).
3. `packages/cli/package.json` — add `engines: { "bun": ">=1.1.0" }`;
   remove `engines.node` if present.
4. `README.md` — remove any remaining Node references in
   install docs. Keep only `bun add -g …` and `bunx …` forms.
5. `CLAUDE.md` and `corpus/CLAUDE.md` — sweep runtime-compat
   prose mentioning Node.
6. Verify no conditional-on-runtime branches in
   `packages/*/src/*.ts`. `node:fs`, `node:path` imports stay
   (Bun implements them).

**Out of scope:**
- No changes to `@literate/core`'s deps or shape.
- Consumer code runtimes.

**Acceptance:**
- `bun run build` produces a bundle whose shebang is
  `#!/usr/bin/env bun` and whose target is `bun`.
- `smoke-install.sh` exercises a pure-Bun install path.
- `grep -ri 'node' README.md CLAUDE.md corpus/CLAUDE.md` shows
  only non-runtime mentions.
- `package.json` declares `engines.bun`, not `engines.node`.

## Decisions Made

Two ADRs authored and accepted this session; one prior ADR
amended by Status-line annotation (body untouched per IMP-6):

- **ADR-028 — CLI is Effect-composed end-to-end.** Accepted.
  Records the invariant that every `@literate/cli` file is
  Effect-composed: verbs return `Effect<number, unknown,
  VerbRequirements>`; services under `src/registry/*` +
  `src/weaver/*` are `Context.Tag` classes with Layer factories;
  all errors are `Data.TaggedError` subclasses in `src/errors.ts`
  (and `ProseSchemaViolations` in the weaver module). Settles
  ADR-004's Effect-depth clause. File:
  `corpus/decisions/ADR-028-cli-effect-composed-end-to-end.md`.
- **ADR-029 — Bun is the CLI's required runtime.** Accepted.
  Narrows ADR-004's runtime-matrix clause from
  Bun/Deno/Node-compatible to Bun-only. Concrete surface:
  `target: 'bun'` in `Bun.build()`, shebang
  `#!/usr/bin/env bun`, `engines.bun` declared (no
  `engines.node`), install docs list `bun add -g` + `bunx
  --package=<tarball>` only, `smoke-install.sh` uses
  `bun init` + `bun add`. Consumer code runtimes remain
  out of scope. File:
  `corpus/decisions/ADR-029-bun-is-cli-required-runtime.md`.
- **ADR-004 Status line amended.** Appended annotations
  recording the Effect-depth settlement (ADR-028) and
  runtime-matrix narrowing (ADR-029). Body untouched per
  IMP-6. `corpus/decisions/decisions.md` updated with the
  new Status on ADR-004's row plus new rows for ADR-028 +
  ADR-029.

No other decisions were required. Scope constraints held —
the two Goals tracked precisely what ADR-028 + ADR-029
commit to; nothing else needed a decision artefact.

## Work Done

### Goal 2 — Bun-only runtime

- **`packages/cli/scripts/build.ts`** — bundle `target: 'node'`
  → `target: 'bun'`; shebang `#!/usr/bin/env node` →
  `#!/usr/bin/env bun`; docstring updated to reflect ADR-029.
- **`packages/cli/scripts/smoke-install.sh`** — fresh-project
  bootstrap switched from `npm init -y` + `npm install
  --silent <tarball>` to `bun init -y` + `bun add <tarball>`;
  docstring updated.
- **`packages/cli/package.json`** — `engines.node >=18` →
  `engines.bun >=1.1.0`; dropped `@types/node` from
  devDependencies (Bun types cover `node:*` imports).
- **`packages/core/package.json`, `packages/template-minimal/package.json`**
  — no `@types/node` change to core (already absent); dropped
  `@types/node` from template-minimal.
- **`package.json`** (repo root) — the `literate` script
  changed from `node packages/cli/dist/literate.js` →
  `bun packages/cli/dist/literate.js`.
- **`README.md`** — "Node-runnable artefact" →
  "Bun-runnable artefact (ADR-029)".
- **`CLAUDE.md`, `corpus/CLAUDE.md`** — verified clean
  (no Node install prose present).

### Goal 1 — CLI Effect-composed end-to-end

- **`packages/cli/src/errors.ts`** (new, 165 lines) — central
  tagged-error module. Fourteen `Data.TaggedError` classes
  covering usage (`UsageError`, `UnknownVerb`, `UnknownKind`,
  `UnknownTemplate`), config/manifest/fetcher
  (`ConfigParseError`, `RegistryNotFound`,
  `NoRegistriesConfigured`, `ManifestReadError`,
  `ManifestWriteError`, `NoManifestEntry`, `RegistryUrlMalformed`,
  `RegistryFetchFailed`), and scaffold/weave I/O
  (`ScaffoldError`, `WeaveIOError`). `VerbError` union at the
  bottom (includes `ProseSchemaViolations` via type-only
  import to keep `src/errors.ts` free of the weaver's runtime
  import graph).
- **`packages/cli/src/registry/config.ts`** — promoted to
  `ConfigService` (`Context.Tag`) + `ConfigServiceLive`
  (`Layer.succeed`); `read` method returns
  `Effect<LiterateConfig, ConfigParseError>`. `findRegistry`
  is now an Effect that fails with `RegistryNotFound` /
  `NoRegistriesConfigured`.
- **`packages/cli/src/registry/manifest.ts`** — promoted to
  `ManifestService` (`Context.Tag`) with `read` / `write`
  returning typed Effects; pure helpers (`addEntry`,
  `findEntry`, `removeEntry`, `manifestPath`) preserved as
  regular exports.
- **`packages/cli/src/registry/fetcher.ts`** — promoted to
  `FetcherService` (`Context.Tag`) with `fetch` returning
  `Effect<FetchedSeed, RegistryFetchFailed | RegistryUrlMalformed>`.
  Github backend refactored: each file is now a separate
  `Effect.tryPromise` composed via `Effect.all` — no
  `throw new Error` inside the fetcher's `try` block.
- **`packages/cli/src/weaver/weaver.ts`** — core `weaveProgram`
  returns `Effect<WeaveResult, WeaveIOError |
  ProseSchemaViolations | ManifestReadError, ManifestService>`.
  `WeaverService` (`Context.Tag`) + `WeaverServiceLive`
  (`Layer.effect`) exposes a ManifestService-resolved variant.
  `ProseSchemaViolations` already `Data.TaggedError` from p3-cleanup.
- **`packages/cli/src/verbs/verb.ts`** — `Verb.run` now
  returns `Effect<number, unknown, VerbRequirements>`.
  `VerbRequirements` type alias for the four CLI service tags.
  `usageError` returns `UsageError` (tagged) instead of
  an `Error` with a side-channel `exitCode` property.
- **`packages/cli/src/verbs/tangle.ts`, `update.ts`, `weave.ts`,
  `init.ts`, `continue.ts`, `close.ts`** — every `run` now
  returns an Effect; every programmatic `runX` helper returns
  a typed Effect requiring the right service set. `continue` +
  `close` continue providing their own `@literate/core` Step
  layers internally (the Step-substrate layer graph was
  already correct).
- **`packages/cli/src/bin/literate.ts`** — dispatcher builds
  `CliServicesLive` once (`Layer.merge(RegistryLayers,
  WeaverServiceLive.pipe(Layer.provide(ManifestServiceLive)))`),
  provides it to the verb's Effect via `Effect.provide`, and
  uses `Effect.match` to map success to exit code /
  `Data.TaggedError` failure to formatted stderr + typed exit
  code (2 for usage-class errors, 1 otherwise).
- **`packages/cli/src/index.ts`** — public surface re-exports
  every service tag + `Live` layer, plus `weaveProgram` and
  `ProseSchemaViolations`. Consumers (including the e2e
  test) compose their own Layer stacks from these primitives.
- **`packages/cli/src/__tests__/e2e.test.ts`** — composes a
  local `CliServicesLive` matching the dispatcher's, then
  drives every verb via `Effect.runPromise(verb.pipe(Effect.provide(layer)))`.
  The `makeScriptedTerminalIO`-based gate for `runContinue`
  already worked via the same pattern.
- **`packages/cli/src/__tests__/prose-schema.test.ts`** —
  rewritten `weave` helper runs `weaveProgram` under
  `ManifestServiceLive`; the failure-path test uses
  `Effect.runPromiseExit` + `Cause.failureOption` to
  access the `ProseSchemaViolations` tagged-error instance
  (rather than `try`/`catch` on a `FiberFailure`).

### Corpus

- **Created** `corpus/decisions/ADR-028-cli-effect-composed-end-to-end.md`.
- **Created** `corpus/decisions/ADR-029-bun-is-cli-required-runtime.md`.
- **Modified** `corpus/decisions/ADR-004-cli-effect-manifest.md` —
  `Status:` line appended with the ADR-028/029 annotations.
  Body untouched.
- **Modified** `corpus/decisions/decisions.md` — ADR-004 row
  Status updated; ADR-028 and ADR-029 rows added.
- **Created** `corpus/sessions/2026-04-24T1613-cli-effect-and-bun-only.md`
  (this log).
- **Created** `corpus/sessions/2026-04-24T1700-effect-cli-argv-surface.md`
  with `Status: Planned` per IMP-4.
- **Modified** `corpus/sessions/sessions.md` — added this
  session's row (Open → Closed at close) and the successor's
  row (Planned).

### Tests & typecheck

- **`grep -r 'async.*run' packages/cli/src/verbs/`** → zero
  hits. ADR-028 acceptance criterion met.
- **`grep -r 'throw new Error' packages/cli/src/`** → zero
  hits. ADR-028 acceptance criterion met.
- **`bun run --filter '*' typecheck`** → all three packages
  clean.
- **`bun test`** → **34 pass / 0 fail / 177 expect() calls /
  8 files** (unchanged count from p3-cleanup; the
  prose-schema test now runs under the refactored surface).
- **`bun run --filter @literate/cli build`** → bundle
  rebuilds at **1692.6 kB** (vs 1684.1 kB pre-Goal-1, vs
  1670.8 kB with Node target — the ~22 kB delta is Bun
  runtime shims + the added Context/Layer composition; well
  within bundle-budget).
- **`packages/cli/scripts/smoke-install.sh`** → PASSED under
  the new pure-Bun install path. ADR-029 acceptance
  criterion met.

## Plan

### P-effect-cli — Adopt `@effect/cli` for argv parsing

**Slug:** `effect-cli-argv-surface`
**Topic:** Replace the hand-rolled `switch(verb)` dispatcher
+ ad-hoc `--flag` parsing with `@effect/cli`'s `Command.make` +
`Options` + `Args` + `Command.withSubcommands`. Returns LF to
ADR-004's original commitment ("CLI written with `@effect/cli`
on top of `effect` and `@effect/platform`").
**Depends on:** this session (Goal 1 ships verbs-return-Effect —
the structural precondition for `Command.make`).
**Realised by:** corpus/sessions/2026-04-24T1700-effect-cli-argv-surface.md (Open 2026-04-24T16:55)
**Successor log:** [corpus/sessions/2026-04-24T1700-effect-cli-argv-surface.md](./2026-04-24T1700-effect-cli-argv-surface.md)

**Provisional Goals (re-gateable at open per IMP-1.6):**

1. Replace the hand-rolled dispatcher + argv with `@effect/cli`.
   `bin/literate.ts` becomes a single `Command.run` invocation
   against a root command composing all verbs as subcommands.
   Every verb's options and flags are typed `Options` / `Args`.
   `--help` generated by `@effect/cli`. `@effect/cli` and
   `@effect/platform` land as runtime deps.
2. ADR-030 records the adoption (short; one-screen body).
   Cites ADR-004 and ADR-028 as parents; ADR-004 row gains
   a second annotation for the argv-framework completion;
   `decisions.md` gains the ADR-030 row.

**Out of scope (flagged at Planned):**
- `@effect/cli` `Prompt` surface (interactive prompts).
- Shell completion scripts.
- Any rework of verb semantics, Layer composition, or error
  types — those settle in this session's Goal 1.

## Deferred / Discovered

### Deferred

- **P-effect-cli** (above) — successor log at Planned; see
  Plan block. Forward pointer:
  `corpus/sessions/2026-04-24T1700-effect-cli-argv-surface.md`.
- **P5 / P6 / P7 / P8** (parent S5's original Plan) remain
  `Status: Planned` unchanged. This session's refactor did
  not touch them. When each opens, the CLI services'
  Context.Tag surface is already stable; any new verbs that
  session adds follow the ADR-028 template (return Effect,
  declare requirements as `VerbRequirements` subsets, raise
  `Data.TaggedError`s).

### Discovered in this session

- **Layer composition gotcha.** `Layer.provideMerge` pipe-style
  type inference interacted badly with
  `exactOptionalPropertyTypes` + service R-channels in our
  Effect version. The explicit
  `Layer.merge(base, WeaverServiceLive.pipe(Layer.provide(ManifestServiceLive)))`
  form typechecks cleanly; `base.pipe(Layer.provideMerge(Weaver))`
  did not resolve the Manifest requirement in the result type.
  Worth a quick skill-cache note for future service-layer
  composition: when the dependency graph is non-linear, prefer
  explicit `Layer.merge` + `Layer.provide` over
  `Layer.provideMerge`'s pipe-style.
- **Bundle-size footprint of Bun target.** Switching to
  `target: 'bun'` added ~22 kB to the bundle (1670.8 → 1692.6).
  Attributable to Bun runtime shims inlined for compatibility.
  Non-concern at v0.1 but worth noting against the P3 discovery
  that remark was the dominant contributor (~800 kB of the
  total). If bundle size ever becomes a concern, the order of
  attack is: remark first, then Bun shims, then Effect's own
  runtime.
- **`Data.TaggedError` constructor shape.** `Data.TaggedError('Foo')<{}>`
  in Effect 3.x generates a `void`-argument constructor, not
  an empty-object one, so `new Foo({})` fails typecheck.
  The workarounds: either drop the `<{}>` generic (`extends
  Data.TaggedError('Foo')`) and construct via `new Foo()`,
  or add a real field even if optional (`<{ readonly _?: never }>`).
  Chose the first for `NoRegistriesConfigured`.
- **Test-side pattern for tagged-error failure paths.**
  `try/catch(await Effect.runPromise(...))` gets you a
  `FiberFailure` wrapper; to inspect the actual tagged error
  you want `Effect.runPromiseExit(...)` plus
  `Cause.failureOption(exit.cause)`. Codified in the
  rewritten `prose-schema.test.ts`'s failure path.

## Summary

Converted `@literate/cli` to Effect end-to-end (ADR-028) and
narrowed its runtime matrix to Bun (ADR-029) in a single
refactor pass. Every verb's `run` now returns
`Effect<number, unknown, VerbRequirements>`; registry +
weaver services are `Context.Tag` classes with Layer
factories; every error is a `Data.TaggedError` subclass; the
bin dispatcher provides the live stack once and maps outcomes
to exit codes via `Effect.match`. The Bun-only pivot changes
build target to `bun`, the shebang to
`#!/usr/bin/env bun`, `engines.bun` to the sole declared
runtime, and sweeps Node-mentions from human-facing install
docs. All checks green: 34 tests pass; all three packages
typecheck clean; CLI bundle rebuilds at 1692.6 kB; pure-Bun
`smoke-install.sh` passes. ADR-004's `Status:` line appended
mechanically to record the narrowing. `@effect/cli` adoption
is pre-scoped as the `effect-cli-argv-surface` Planned
successor.

