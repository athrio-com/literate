/**
 * `literate close <sessionPath> [repoRoot]` (ADR-014; argv surface
 * from ADR-030).
 *
 * Dispatches the bundled `session-end` Trope (per ADR-026 §4).
 * Validates the log (Goals terminal, Summary present, Plan
 * entries terminal, sections present); on success stamps `Status:
 * Closed (YYYY-MM-DDTHH:MM)` in the log header and the sessions
 * index. Failures surface as `SessionEndIncomplete`.
 */
import { Args, Command } from '@effect/cli'
import { Console, Effect, Layer, Option } from 'effect'

import {
  fileSystemSessionStoreLayer,
  InMemoryExecutionLogLayer,
  LiveProseInvokeLayer,
  StubAIInvokeLayer,
  StubGateServiceLayer,
  type TerminalIO,
} from '@literate/core'
import { sessionEndStep, type SessionClosure } from '../trope-bindings.ts'

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

const sessionPathArg = Args.text({ name: 'sessionPath' }).pipe(
  Args.withDescription(
    'Path (relative to repo root) of the session log to close.',
  ),
)

const repoRootArg = Args.text({ name: 'repoRoot' }).pipe(
  Args.withDescription(
    'Repo root (defaults to the current working directory).',
  ),
  Args.optional,
)

const closeCommand = Command.make(
  'close',
  { sessionPath: sessionPathArg, repoRoot: repoRootArg },
  ({ sessionPath, repoRoot }) =>
    Effect.gen(function* () {
      const resolvedRoot = Option.getOrElse(repoRoot, () => process.cwd())
      const closure = yield* runClose({
        repoRoot: resolvedRoot,
        sessionPath,
      })
      yield* Console.log(
        `\nSession closed: ${closure.sessionPath}\n  closedAt: ${closure.closedAt}`,
      )
    }),
).pipe(
  Command.withDescription(
    'Close an Open LF session (Protocol-mode session-end).',
  ),
)

export default closeCommand
