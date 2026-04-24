/**
 * `literate tangle <kind> <id> [--registry <name>]` (ADR-025 §2,
 * argv surface from ADR-030).
 *
 * Fetch one seed from the configured registry, place its files at
 * `.literate/<kind>/<id>/...`, update `.literate/manifest.json`.
 * Mechanical and idempotent — re-running with the same args
 * re-fetches and overwrites (use `update` for the same effect with
 * intent-bearing semantics; `tangle` is the new-vendor verb).
 */
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { Args, Command, Options } from '@effect/cli'
import { Console, Effect, Option } from 'effect'

import { WeaveIOError, type VerbError } from '../errors.ts'
import { ConfigService, findRegistry } from '../registry/config.ts'
import { FetcherService, seedFiles } from '../registry/fetcher.ts'
import {
  addEntry,
  ManifestService,
  type ManifestEntry,
  type SeedKind,
} from '../registry/manifest.ts'

export interface RunTangleOptions {
  readonly repoRoot: string
  readonly kind: SeedKind
  readonly id: string
  readonly registryName?: string
}

export interface RunTangleResult {
  readonly entry: ManifestEntry
  readonly placed: ReadonlyArray<string>
}

export const runTangle = (
  opts: RunTangleOptions,
): Effect.Effect<
  RunTangleResult,
  VerbError,
  ConfigService | FetcherService | ManifestService
> =>
  Effect.gen(function* () {
    const configSvc = yield* ConfigService
    const fetcherSvc = yield* FetcherService
    const manifestSvc = yield* ManifestService

    const config = yield* configSvc.read(opts.repoRoot)
    const registry = yield* findRegistry(config, opts.registryName)
    const files = seedFiles(opts.kind)
    const fetched = yield* fetcherSvc.fetch({
      registry,
      kind: opts.kind,
      id: opts.id,
      files,
    })

    const placed = yield* Effect.tryPromise({
      try: async () => {
        const out: string[] = []
        for (const { file, content } of fetched.contents) {
          const rel = path.join('.literate', opts.kind, opts.id, file)
          const abs = path.join(opts.repoRoot, rel)
          await fs.mkdir(path.dirname(abs), { recursive: true })
          await fs.writeFile(abs, content, 'utf8')
          out.push(rel)
        }
        return out
      },
      catch: (e) =>
        new WeaveIOError({
          path: `.literate/${opts.kind}/${opts.id}/`,
          reason: e instanceof Error ? e.message : String(e),
        }),
    })

    const manifest = yield* manifestSvc.read(opts.repoRoot)
    const entry: ManifestEntry = {
      kind: opts.kind,
      id: opts.id,
      registry: registry.name,
      ref: fetched.resolvedRef,
      fetchedAt: new Date().toISOString(),
      files: placed,
    }
    yield* manifestSvc.write(opts.repoRoot, addEntry(manifest, entry))

    return { entry, placed }
  })

const kindArg = Args.choice<SeedKind>([
  ['tropes', 'tropes'],
  ['concepts', 'concepts'],
  ['trope', 'tropes'],
  ['concept', 'concepts'],
], { name: 'kind' }).pipe(
  Args.withDescription("Seed kind: 'tropes' or 'concepts' (singular forms accepted)."),
)

const idArg = Args.text({ name: 'id' }).pipe(
  Args.withDescription('Seed id (e.g. session-start, disposition).'),
)

const registryOpt = Options.text('registry').pipe(
  Options.withAlias('r'),
  Options.withDescription('Registry name from literate.json (defaults to the sole entry).'),
  Options.optional,
)

const tangleCommand = Command.make(
  'tangle',
  { kind: kindArg, id: idArg, registry: registryOpt },
  ({ kind, id, registry }) =>
    Effect.gen(function* () {
      const result = yield* runTangle({
        repoRoot: process.cwd(),
        kind,
        id,
        ...(Option.isSome(registry) ? { registryName: registry.value } : {}),
      })
      yield* Console.log(
        `tangled ${kind}/${id} from ${result.entry.registry}@${result.entry.ref}`,
      )
      for (const f of result.placed) yield* Console.log(`  ${f}`)
    }),
).pipe(
  Command.withDescription(
    'Fetch a Trope or Concept seed from a registry and vendor it.',
  ),
)

export default tangleCommand
