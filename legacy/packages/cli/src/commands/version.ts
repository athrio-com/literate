/**
 * @adr ADR-004
 *
 * `literate version` — print LF version and the bundled Trope catalog.
 */

import { Command } from '@effect/cli'
import { Console, Effect } from 'effect'
import { BUNDLED_TROPES } from '../catalog.ts'

export const versionCommand = Command.make('version', {}, () =>
  Effect.gen(function* () {
    yield* Console.log('literate v0.1.0')
    yield* Console.log('')
    yield* Console.log('Bundled Tropes:')
    for (const t of BUNDLED_TROPES) {
      yield* Console.log(`  ${t.id}@${t.version}  realises ${t.realises.id}`)
    }
  }),
).pipe(Command.withDescription('Print LF version and bundled Trope catalog.'))
