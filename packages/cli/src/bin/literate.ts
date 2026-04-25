#!/usr/bin/env bun
/**
 * `literate` CLI entry point (ADR-028, ADR-029, ADR-030).
 *
 * Composes the verb subcommands as an `@effect/cli` `Command` tree
 * and runs it against `process.argv`. Each verb file under
 * `src/verbs/` exports a `Command.make`-built command alongside its
 * programmatic `runX` helper; this dispatcher wires them together,
 * provides the live service Layer (`ConfigService`, `ManifestService`,
 * `FetcherService`, `WeaverService`), and lets `BunRuntime.runMain`
 * map success/failure into exit codes and pretty-printed errors.
 *
 * Seven verbs at v0.1:
 *
 *   continue   open or resume an LF session (Protocol-mode)
 *   close      close an Open LF session (Protocol-mode)
 *   init       scaffold a new consumer repo + tangle defaults
 *   tangle     fetch a registry seed and vendor it
 *   weave      materialise `.literate/LITERATE.md`
 *   update     re-fetch a vendored seed at its registry ref
 *   reconcile  walk LFMs, derive status, maintain soft-link hashes
 *
 * Adding a verb is a one-file change in `src/verbs/` plus one entry
 * in the `subcommands` array below.
 */
import { Command } from '@effect/cli'
import { BunContext, BunRuntime } from '@effect/platform-bun'
import { Effect, Layer } from 'effect'

import pkg from '../../package.json' with { type: 'json' }
import { ConfigServiceLive } from '../registry/config.ts'
import { FetcherServiceLive } from '../registry/fetcher.ts'
import { ManifestServiceLive } from '../registry/manifest.ts'
import { WeaverServiceLive } from '../weaver/weaver.ts'
import closeCommand from '../verbs/close.ts'
import continueCommand from '../verbs/continue.ts'
import initCommand from '../verbs/init.ts'
import reconcileCommand from '../verbs/reconcile.ts'
import tangleCommand from '../verbs/tangle.ts'
import updateCommand from '../verbs/update.ts'
import weaveCommand from '../verbs/weave.ts'

const root = Command.make('literate').pipe(
  Command.withDescription('Literate Framework CLI'),
  Command.withSubcommands([
    continueCommand,
    closeCommand,
    initCommand,
    tangleCommand,
    weaveCommand,
    updateCommand,
    reconcileCommand,
  ]),
)

const RegistryLayers = Layer.mergeAll(
  ConfigServiceLive,
  ManifestServiceLive,
  FetcherServiceLive,
)
const CliServicesLive = Layer.merge(
  RegistryLayers,
  WeaverServiceLive.pipe(Layer.provide(ManifestServiceLive)),
)

const cli = Command.run(root, {
  name: 'Literate Framework CLI',
  version: pkg.version,
})

cli(process.argv).pipe(
  Effect.provide(CliServicesLive),
  Effect.provide(BunContext.layer),
  BunRuntime.runMain,
)
