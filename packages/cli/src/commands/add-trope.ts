/**
 * @adr ADR-004
 *
 * `literate add trope <package-name>` — append a Trope package to the
 * manifest, then recompile.
 */

import { Args, Command, Options } from '@effect/cli'
import { FileSystem, Path } from '@effect/platform'
import { Console, Effect } from 'effect'
import { compileLiterate } from '../compile.ts'
import { resolveTrope, tropePackageNames } from '../catalog.ts'

const tropeKey = Args.text({ name: 'package' }).pipe(
  Args.withDescription(
    `Trope package name. Bundled: ${tropePackageNames().join(', ')}.`,
  ),
)

const target = Options.text('target').pipe(
  Options.withAlias('t'),
  Options.withDefault('.'),
)

export const addTropeCommand = Command.make(
  'trope',
  { tropeKey, target },
  ({ tropeKey, target }) =>
    Effect.gen(function* () {
      const trope = resolveTrope(tropeKey)
      if (!trope) {
        yield* Console.error(`Unknown Trope package: ${tropeKey}`)
        yield* Console.error(`Bundled: ${tropePackageNames().join(', ')}`)
        return yield* Effect.fail(new Error(`Unknown Trope package: ${tropeKey}`))
      }

      const fs = yield* FileSystem.FileSystem
      const path = yield* Path.Path
      const pkgPath = path.join(target, 'package.json')
      const raw = yield* fs.readFileString(pkgPath)
      const parsed = JSON.parse(raw) as { literate?: { version?: string; tropes?: string[] } }
      const tropes = new Set(parsed.literate?.tropes ?? [])

      if (tropes.has(tropeKey)) {
        yield* Console.log(`Trope '${tropeKey}' already present.`)
        return
      }

      tropes.add(tropeKey)
      const next = {
        ...parsed,
        literate: {
          version: parsed.literate?.version ?? '0.1.0',
          tropes: [...tropes].sort(),
        },
      }
      yield* fs.writeFileString(pkgPath, JSON.stringify(next, null, 2) + '\n')
      yield* Console.log(`Added '${tropeKey}'. Recompiling …`)
      yield* compileLiterate(target)
    }),
).pipe(Command.withDescription('Install a Trope into the manifest and recompile.'))
