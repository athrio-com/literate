/**
 * @adr ADR-004
 *
 * Command tree. Five v0.1 verbs: init, add trope, compile, check, version.
 */

import { Command } from '@effect/cli'
import { addTropeCommand } from './commands/add-trope.ts'
import { checkCommand } from './commands/check.ts'
import { compileCommand } from './commands/compile.ts'
import { initCommand } from './commands/init.ts'
import { versionCommand } from './commands/version.ts'

const add = Command.make('add').pipe(
  Command.withDescription('Add artefacts to the consumer manifest.'),
  Command.withSubcommands([addTropeCommand]),
)

const root = Command.make('literate').pipe(
  Command.withDescription(
    'The Literate Framework CLI — scaffold, compile, check, and manage .literate/ in consumer repos.',
  ),
  Command.withSubcommands([initCommand, add, compileCommand, checkCommand, versionCommand]),
)

export const run = Command.run(root, { name: 'literate', version: '0.1.0' })
