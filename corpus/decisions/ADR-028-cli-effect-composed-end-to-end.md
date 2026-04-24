# ADR-028 — CLI is Effect-composed end-to-end

**Date:** 2026-04-24
**Status:** Accepted
**Tags:** `#tooling` `#protocol`

**Context:**

ADR-004 committed `@literate/cli` to Effect but left the *depth*
unspecified. Over S3–S7 the CLI grew in two idioms side-by-side:
the `continue` / `close` verbs compose Step-substrate programs
with `Effect.gen` + Layer composition (because they dispatch
`@literate/core`'s Step machinery), while every other verb
(`tangle`, `weave`, `update`, `init`) and every service under
`src/registry/*` and `src/weaver/*` used plain `async/await` with
`throw new Error(...)`. The P3 cleanup inspection surfaced the
split cleanly: a fresh file authored under the CLI's
surrounding-style convention would be plain async, contradicting
both ADR-004's commitment and the `@literate/core` +
`registry/tropes/*` idiom.

**Decision:**

Every file in `packages/cli/src/` is Effect-composed, uniformly:

- **Verbs.** `Verb.run(argv, ctx)` returns
  `Effect<number, unknown, VerbRequirements>` where
  `VerbRequirements = ConfigService | ManifestService |
  FetcherService | WeaverService`. No `async` at the verb
  boundary. Each verb's programmatic helper (`runTangle`,
  `runUpdate`, `runInit`, `runWeave`, `runContinue`, `runClose`)
  returns an `Effect` with a narrowly-typed error channel
  (`VerbError` for CLI-owned verbs; `unknown` for the Step-substrate
  verbs where the error union crosses `@literate/core` +
  `registry/tropes/*`).
- **Services.** `ConfigService`, `ManifestService`, `FetcherService`,
  and `WeaverService` are `Context.Tag` classes with `Layer.succeed`
  or `Layer.effect` factories. `WeaverServiceLive` depends on
  `ManifestService`. Tests compose their own stack by swapping
  individual Layers (e.g. `ManifestServiceLive` is reusable;
  `WeaverServiceLive.pipe(Layer.provide(ManifestServiceLive))` yields
  a live weaver with a live manifest).
- **Errors.** Every error the CLI can surface is a `Data.TaggedError`
  subclass living in `src/errors.ts` (registry / manifest / fetcher /
  weave / scaffold / usage) or in the weaver's own module
  (`ProseSchemaViolations`, kept with the weaver because its value
  type `ProseSchemaViolation` is structural to the validation loop).
  No `throw new Error(...)` remains in the package; `grep -rn 'throw new Error'
  packages/cli/src/` returns zero hits.
- **Dispatcher.** `src/bin/literate.ts` builds the live
  `CliServicesLive = Layer.merge(RegistryLayers,
  WeaverServiceLive.pipe(Layer.provide(ManifestServiceLive)))` once,
  provides it to the verb's Effect, and uses `Effect.match` to map
  the outcome to an exit code and stderr line. Argv parsing stays
  hand-rolled in this commit; adopting `@effect/cli` is tracked as
  the next Planned session (`effect-cli-argv-surface`).

**Boundary:**

- Applies to `@literate/cli` only.
- `@literate/core` is already idiomatic Effect (ADR-014's
  `Protocol.continue` entry-point plus the services in
  `packages/core/src/services.ts`); no changes here.
- `@literate/template-minimal` is a file-copy utility with no
  composition surface worth Effect-wrapping; no changes here.
- `registry/tropes/session-start/index.ts` and
  `registry/tropes/session-end/index.ts` are already Effect-composed
  on the Step substrate (they expose `sessionStartStep` /
  `sessionEndStep` via the core `workflowStep` factory).

**Rationale:**

- Prevents the two-idiom split that P3 surfaced from recurring.
  One idiom, verifiable by grep (no `async.*run` in `src/verbs/`;
  no `throw new Error` in `src/`).
- Makes the CLI testable via Layer injection, matching the shape
  the Trope packages already use (`fileSystemSessionStoreLayer`,
  `terminalGateServiceLayer`, `makeInMemorySessionStoreLayer`,
  `makeScriptedGateServiceLayer`). The e2e test suite composes
  `CliServicesLive` once and reuses it across verbs.
- Settles the depth clause ADR-004 left open — ADR-004 is amended
  via its `Status:` line to note the depth is now specified here.

**Consequences:**

- Adding a verb is still a one-file change (ADR-026
  §Consequences), now additionally requiring the verb's `run` to
  return an `Effect<number, unknown, VerbRequirements>`. The
  existing verbs serve as templates.
- Adding a service is a `Context.Tag` + `Layer.succeed`/`Layer.effect`
  pair plus an entry in `CliServicesLive`. Test doubles are a second
  Layer factory swappable at `.pipe(Effect.provide(...))` time.
- Argv parsing remains hand-rolled in this commit. The Planned
  successor (`effect-cli-argv-surface`) adopts `@effect/cli`'s
  `Command.make` + `Options` + `Args` surface, landing ADR-030.

**Amends:** ADR-004 (depth clause settled here — ADR-004's
`Status:` line updated mechanically to annotate the depth resolution;
ADR-004 body untouched per IMP-6).

**Superseded by:** —
