/**
 * `literate weave` (ADR-025 §2, argv surface from ADR-030).
 *
 * Materialise `.literate/LITERATE.md` from the vendored
 * `.literate/{tropes,concepts}/` tree plus consumer extensions.
 * Mechanical, deterministic, idempotent. Owns its own output;
 * does not touch vendored files.
 */
import { Command } from '@effect/cli'
import { Console, Effect } from 'effect'

import type { VerbError } from '../errors.ts'
import { WeaverService, type WeaveResult } from '../weaver/weaver.ts'

export const runWeave = (
  repoRoot: string,
): Effect.Effect<WeaveResult, VerbError, WeaverService> =>
  Effect.gen(function* () {
    const weaverSvc = yield* WeaverService
    return yield* weaverSvc.weave(repoRoot)
  })

const weaveCommand = Command.make('weave', {}, () =>
  Effect.gen(function* () {
    const result = yield* runWeave(process.cwd())
    yield* Console.log(`wove ${result.literateMdPath}`)
    if (result.tropesIncluded.length > 0) {
      yield* Console.log(`  tropes: ${result.tropesIncluded.join(', ')}`)
    }
    if (result.conceptsIncluded.length > 0) {
      yield* Console.log(`  concepts: ${result.conceptsIncluded.join(', ')}`)
    }
    if (result.extensionsIncluded.length > 0) {
      yield* Console.log(
        `  extensions: ${result.extensionsIncluded.join(', ')}`,
      )
    }
  }),
).pipe(
  Command.withDescription(
    'Materialise `.literate/LITERATE.md` from vendored Tropes/Concepts and consumer extensions.',
  ),
)

export default weaveCommand
