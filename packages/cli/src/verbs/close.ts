/**
 * `literate close <sessionPath>` (ADR-014).
 *
 * Dispatches the bundled `session-end` Trope (per ADR-026 §4).
 * Validates the log (Goals terminal, Summary present, Plan
 * entries terminal, sections present); on success stamps `Status:
 * Closed (YYYY-MM-DDTHH:MM)` in the log header and the sessions
 * index. Failures surface as `SessionEndIncomplete`.
 */
import { Effect, Layer } from 'effect'

import {
  fileSystemSessionStoreLayer,
  InMemoryExecutionLogLayer,
  LiveProseInvokeLayer,
  StubAIInvokeLayer,
  StubGateServiceLayer,
  type TerminalIO,
} from '@literate/core'
import { sessionEndStep, type SessionClosure } from '../trope-bindings.ts'
import { usageError, type Verb, type VerbContext } from './verb.ts'

export interface RunCloseOptions {
  readonly repoRoot: string
  readonly sessionPath: string
  readonly io?: TerminalIO | undefined
}

export const runClose = (
  opts: RunCloseOptions,
): Effect.Effect<SessionClosure, unknown> => {
  const layer = Layer.mergeAll(
    fileSystemSessionStoreLayer(opts.repoRoot),
    InMemoryExecutionLogLayer,
    StubGateServiceLayer,
    LiveProseInvokeLayer,
    StubAIInvokeLayer,
  )
  return sessionEndStep
    .realise({ sessionPath: opts.sessionPath })
    .pipe(Effect.provide(layer)) as Effect.Effect<SessionClosure, unknown>
}

const closeVerb: Verb = {
  name: 'close',
  summary: 'Close an Open LF session (Protocol-mode session-end).',
  usage: 'Usage: literate close <sessionPath> [repoRoot]',

  async run(argv, ctx: VerbContext): Promise<number> {
    if (argv.length < 1) {
      throw usageError(closeVerb, '<sessionPath> required')
    }
    const sessionPath = argv[0]!
    const repoRoot = argv[1] ?? ctx.cwd
    const closure = await Effect.runPromise(
      runClose({ repoRoot, sessionPath }),
    )
    ctx.stdout.write(
      `\nSession closed: ${closure.sessionPath}\n  closedAt: ${closure.closedAt}\n`,
    )
    return 0
  },
}

export default closeVerb
