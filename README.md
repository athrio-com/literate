# Literate Framework

> **Status:** Genesis stage. `@literate/core` ships the Step substrate
> (ADR-011…ADR-014) and typechecks; workflow Tropes
> (`@literate/trope-session-start`, `@literate/trope-session-end`,
> `@literate/trope-gate-flow`, …), live services, CLI, and a minimal
> template follow in the MVP arc Planned sessions.
> **Predecessor:** the legacy `@literate/*` scaffold is preserved
> frozen at [`legacy/`](./legacy) per
> [ADR-018](./corpus/decisions/ADR-018-legacy-code-frozen-corpus-global.md)
> (scope relocated to `legacy/` by
> [ADR-020](./corpus/decisions/ADR-020-unify-monorepo-layout.md)).
> The rewrite shares the `@literate/` scope with the legacy per
> [ADR-019](./corpus/decisions/ADR-019-reinstate-literate-namespace.md)
> (supersedes ADR-016's `@athrio/*` choice); only active
> `packages/*` publishes.

## What this is

The Literate Framework (LF) is software that wraps prose as
executable, composable, memoised [Effect][effect] programs. Prose
is the base case; AI invocation is prose bound to an inference
service; gates are prose bound to Person decisions; everything
else is prose bound to typed computation. The corpus stays pure
markdown.

This repository is fully dedicated to LF. The active workspace is
the root `packages/*` (ADR-020, unifying the prior `framework/`
vs. root split). The coordination record — ADRs, sessions,
categories, concepts, specs — lives in the **global living corpus**
at [`./corpus/`](./corpus/).

## Where to look

- [`./CLAUDE.md`](./CLAUDE.md) — maintainer entry point.
- [`./corpus/CLAUDE.md`](./corpus/CLAUDE.md) — operational
  Protocol (session lifecycle, gating, NEVER list).
- [`./corpus/decisions/`](./corpus/decisions/) — all ADRs. Read
  ADR-011 through ADR-020 in numerical order for the rewrite-stage
  foundation.
- [`./packages/`](./packages/) — the active `@literate/*`
  workspace packages. V0.1 ships `@literate/core`.
- [`./legacy/`](./legacy/) — the frozen legacy scaffold,
  preserved verbatim as historical reference (ADR-018 + ADR-020).

## Install and build

```sh
bun install
bun x tsc --noEmit
bun test   # runs packages/core/src/__tests__/smoke.test.ts
```

## License

Dual MIT / Apache-2.0. See [`./LICENSE-MIT`](./LICENSE-MIT),
[`./LICENSE-APACHE`](./LICENSE-APACHE).

[effect]: https://effect.website
