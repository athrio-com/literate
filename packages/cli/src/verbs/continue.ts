/**
 * `literate continue [repoRoot] [--slug <slug>]` (ADR-014; argv
 * surface from ADR-030).
 *
 * Dispatches the bundled `session-start` Trope (per ADR-026 §4 the
 * Trope is bundled-from-source from `registry/tropes/session-start/`,
 * not loaded dynamically from the consumer's vendored copy).
 * Persists execution records into the opened session log's
 * `## Execution Log` fence.
 */
import { Args, Command, Options } from '@effect/cli'
import { Console, Effect, Layer, Option } from 'effect'

import {
  ExecutionLog,
  fileSystemSessionStoreLayer,
  InMemoryExecutionLogLayer,
  LiveProseInvokeLayer,
  makeNodeTerminalIO,
  persistExecutionRecords,
  StubAIInvokeLayer,
  terminalGateServiceLayer,
  type SessionRef,
  type TerminalIO,
} from '@literate/core'
import { sessionStartStep } from '../trope-bindings.ts'

export interface RunContinueOptions {
  readonly repoRoot: string
  readonly agent: string
  readonly slug?: string
  readonly io: TerminalIO
}

export const runContinue = (
  opts: RunContinueOptions,
): Effect.Effect<SessionRef, unknown> => {
  const { repoRoot, agent, slug, io } = opts
  const layer = Layer.mergeAll(
    fileSystemSessionStoreLayer(repoRoot),
    InMemoryExecutionLogLayer,
    terminalGateServiceLayer(io),
    LiveProseInvokeLayer,
    StubAIInvokeLayer,
  )
  const program = Effect.gen(function* () {
    const ref: SessionRef = yield* sessionStartStep.realise(
      slug === undefined ? { repoRoot, agent } : { repoRoot, agent, slug },
    )
    yield* persistExecutionRecords(ref.path).pipe(
      Effect.catchAll(() => Effect.void),
    )
    yield* Effect.flatMap(ExecutionLog, (_log) => Effect.void)
    return ref
  })
  return program.pipe(Effect.provide(layer)) as Effect.Effect<
    SessionRef,
    unknown
  >
}

const repoRootArg = Args.text({ name: 'repoRoot' }).pipe(
  Args.withDescription(
    'Path to the LF-consuming repo (defaults to the current working directory).',
  ),
  Args.optional,
)

const slugOpt = Options.text('slug').pipe(
  Options.withDescription(
    'Optional slug to disambiguate when multiple Planned sessions are ready.',
  ),
  Options.optional,
)

const continueCommand = Command.make(
  'continue',
  { repoRoot: repoRootArg, slug: slugOpt },
  ({ repoRoot, slug }) =>
    Effect.gen(function* () {
      const env = process.env
      const resolvedRoot = Option.getOrElse(repoRoot, () => process.cwd())
      const agent = env['LITERATE_AGENT_ID'] ?? 'unknown-agent'
      const terminal = makeNodeTerminalIO()
      const ref = yield* runContinue({
        repoRoot: resolvedRoot,
        agent,
        io: terminal.io,
        ...(Option.isSome(slug) ? { slug: slug.value } : {}),
      }).pipe(Effect.ensuring(Effect.sync(() => terminal.close())))
      yield* Console.log(`\nSession open: ${ref.path}\n  slug: ${ref.slug}`)
    }),
).pipe(
  Command.withDescription(
    'Open or resume an LF session (Protocol-mode session-start). Agent identifier comes from $LITERATE_AGENT_ID (default: unknown-agent).',
  ),
)

export default continueCommand
