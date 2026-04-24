/**
 * `literate update <kind> <id>` (ADR-025 §7, narrowed by S5
 * Goal 2 Correct: no merge UX; consumer's git surfaces the diff;
 * argv surface from ADR-030).
 *
 * Re-fetch the seed at its recorded registry/ref and overwrite
 * the vendored files. The manifest entry's `fetchedAt` is bumped;
 * `registry` and `ref` stay (use `tangle` with `--registry` to
 * change source).
 */
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { Args, Command } from '@effect/cli'
import { Console, Effect } from 'effect'

import {
  NoManifestEntry,
  WeaveIOError,
  type VerbError,
} from '../errors.ts'
import { ConfigService, findRegistry } from '../registry/config.ts'
import { FetcherService, seedFiles } from '../registry/fetcher.ts'
import {
  addEntry,
  findEntry,
  ManifestService,
  type ManifestEntry,
  type SeedKind,
} from '../registry/manifest.ts'

export interface RunUpdateOptions {
  readonly repoRoot: string
  readonly kind: SeedKind
  readonly id: string
}

export interface RunUpdateResult {
  readonly entry: ManifestEntry
  readonly overwritten: ReadonlyArray<string>
}

export const runUpdate = (
  opts: RunUpdateOptions,
): Effect.Effect<
  RunUpdateResult,
  VerbError,
  ConfigService | FetcherService | ManifestService
> =>
  Effect.gen(function* () {
    const configSvc = yield* ConfigService
    const fetcherSvc = yield* FetcherService
    const manifestSvc = yield* ManifestService

    const manifest = yield* manifestSvc.read(opts.repoRoot)
    const existing = findEntry(manifest, opts.kind, opts.id)
    if (!existing) {
      return yield* Effect.fail(
        new NoManifestEntry({ kind: opts.kind, id: opts.id }),
      )
    }
    const config = yield* configSvc.read(opts.repoRoot)
    const registry = yield* findRegistry(config, existing.registry)
    const files = seedFiles(opts.kind)
    const fetched = yield* fetcherSvc.fetch({
      registry,
      kind: opts.kind,
      id: opts.id,
      files,
    })

    const overwritten = yield* Effect.tryPromise({
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

    const next: ManifestEntry = {
      kind: opts.kind,
      id: opts.id,
      registry: registry.name,
      ref: fetched.resolvedRef,
      fetchedAt: new Date().toISOString(),
      files: overwritten,
    }
    yield* manifestSvc.write(opts.repoRoot, addEntry(manifest, next))
    return { entry: next, overwritten }
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
  Args.withDescription('Seed id to re-fetch.'),
)

const updateCommand = Command.make(
  'update',
  { kind: kindArg, id: idArg },
  ({ kind, id }) =>
    Effect.gen(function* () {
      const result = yield* runUpdate({
        repoRoot: process.cwd(),
        kind,
        id,
      })
      yield* Console.log(
        `updated ${kind}/${id} from ${result.entry.registry}@${result.entry.ref}`,
      )
      for (const f of result.overwritten) yield* Console.log(`  ${f}`)
      yield* Console.log(
        `Diff against your prior copy via git: \`git diff -- .literate/${kind}/${id}/\``,
      )
    }),
).pipe(
  Command.withDescription(
    'Re-fetch a vendored Trope or Concept at its current registry ref and overwrite the local copy.',
  ),
)

export default updateCommand
