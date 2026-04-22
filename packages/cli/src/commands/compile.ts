/**
 * @adr ADR-004
 *
 * `literate compile` — recompile .literate/ from the consumer's
 * package.json manifest.
 */

import { Command, Options } from '@effect/cli'
import { Console, Effect } from 'effect'
import { compileLiterate } from '../compile.ts'

const target = Options.text('target').pipe(
  Options.withAlias('t'),
  Options.withDefault('.'),
  Options.withDescription('Target project directory (default: cwd).'),
)

export const compileCommand = Command.make('compile', { target }, ({ target }) =>
  Effect.gen(function* () {
    yield* Console.log(`Compiling .literate/ in ${target}`)
    yield* compileLiterate(target)
  }),
).pipe(Command.withDescription('Recompile .literate/ from the manifest.'))
