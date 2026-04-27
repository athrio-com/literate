::metadata{id=0a1c969d, disposition={ base: 'Infrastructure', scope: 'cli-runtime' }, layer={ kind: 'infrastructure', path: 'infrastructure', holds: 'domains' }, domain=cli-runtime, status=Reconciled}

# CLI Runtime

The `@literate/cli` package is **Effect-composed end-to-end**,
**Bun-only**, and uses **`@effect/cli`** for argv. Every verb
returns an `Effect`; every service is a `Context.Tag` + `Layer`;
every error is a `Data.TaggedError`. The shebang is
`#!/usr/bin/env bun`; the bundle target is `'bun'`; runtime
dispatch is `BunRuntime.runMain`.

## Effect-composed end-to-end

Six verbs compose uniformly:

- `continue`, `close`, `init`, `tangle`, `weave`, `update`
  (and the new `reconcile` verb).

Each verb file under `packages/cli/src/verbs/` exports a
`Command.make`-built command alongside a programmatic `runX`
helper. The helper returns
`Effect.Effect<Result, VerbError, Services>`; the command
binds it under `BunRuntime.runMain`.

Errors are typed via `Data.TaggedError` subclasses. The error
channel is exhaustive: every failure mode the CLI can emit is
named in the tagged-error vocabulary at
`packages/cli/src/errors.ts`.

## Bun-only runtime

The runtime matrix is **Bun, only**. The CLI:

- declares `engines.bun >= 1.1.0` in its `package.json`.
- bundles with `target: 'bun'`.
- uses `#!/usr/bin/env bun` as its shebang.
- imports from Bun-specific packages (`@effect/platform-bun`).

Node compatibility is **not** maintained. Deno compatibility
is not maintained. The runtime *is* the package manager: a
consumer who has Bun installed has everything they need to run
the CLI.

## `@effect/cli` for argv

The argv surface uses `@effect/cli`:

- Each verb is a `Command.make` with typed `Options` and
  `Args`.
- Subcommands compose via `Command.withSubcommands`.
- `--help` is generated; no hand-rolled help text.
- `BunRuntime.runMain` maps the resulting `Effect` to the
  process exit code.

The dispatcher at `packages/cli/src/bin/literate.ts` wires the
six (now seven) subcommands together, provides the live
service `Layer` (`ConfigService`, `ManifestService`,
`FetcherService`, `WeaverService`), and runs the program.

## Service layers

The CLI's services are tagged in `Context.Tag` style:

- `ConfigService` — reads `literate.json` config.
- `ManifestService` — reads/writes `.literate/manifest.json`.
- `FetcherService` — `file://` and `github:` registry
  fetchers.
- `WeaverService` — orchestrates the weave program.
- `SessionStore` (from `@literate/core`) — file I/O for
  corpus and registry trees.

Each service has a `Live` Layer for production and (where
useful) a stub Layer for testing.

```path
packages/cli/package.json
```

```path
packages/cli/src/bin/literate.ts
```

```path
packages/cli/src/index.ts
```

```path
packages/cli/src/registry/config.ts
```

```path
packages/cli/src/registry/manifest.ts
```

```path
packages/cli/src/registry/fetcher.ts
```

```path
packages/cli/src/weaver/weaver.ts
```

```path
packages/cli/src/errors.ts
```
