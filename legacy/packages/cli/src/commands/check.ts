/**
 * @adr ADR-004
 *
 * `literate check` — validate consumer corpus layout. v0.1 scope:
 * verify required folders and index files exist; flag a missing
 * .literate/ unless this is LF's own repo.
 */

import { Command, Options } from '@effect/cli'
import { FileSystem, Path } from '@effect/platform'
import { Console, Effect } from 'effect'

const target = Options.text('target').pipe(
  Options.withAlias('t'),
  Options.withDefault('.'),
)

const REQUIRED_FOLDERS = [
  'corpus',
  'corpus/decisions',
  'corpus/categories',
  'corpus/sessions',
] as const

const REQUIRED_INDEXES = [
  'corpus/decisions/decisions.md',
  'corpus/categories/categories.md',
  'corpus/sessions/sessions.md',
] as const

export const checkCommand = Command.make('check', { target }, ({ target }) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const path = yield* Path.Path
    const problems: string[] = []

    for (const rel of REQUIRED_FOLDERS) {
      const abs = path.join(target, rel)
      const exists = yield* fs.exists(abs)
      if (!exists) problems.push(`Missing folder: ${rel}`)
    }
    for (const rel of REQUIRED_INDEXES) {
      const abs = path.join(target, rel)
      const exists = yield* fs.exists(abs)
      if (!exists) problems.push(`Missing index: ${rel}`)
    }

    const hasLfRoot = yield* fs.exists(path.join(target, 'LITERATE.md'))
    const hasLiterateDir = yield* fs.exists(path.join(target, '.literate'))
    if (!hasLiterateDir && !hasLfRoot) {
      problems.push(
        "Missing .literate/ — run `literate compile` (or `literate init` first). LF's own repo is exempt.",
      )
    }

    if (problems.length === 0) {
      yield* Console.log('OK. Corpus layout passes v0.1 checks.')
      return
    }
    for (const p of problems) yield* Console.error(`✗ ${p}`)
    yield* Effect.fail(new Error(`${problems.length} check failure(s).`))
  }),
).pipe(Command.withDescription('Validate corpus layout and .literate/ presence.'))
