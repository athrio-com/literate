/**
 * `literate continue [repoRoot]` (ADR-014).
 *
 * Dispatches the bundled `session-start` Trope (per ADR-026 §4 the
 * Trope is bundled-from-source from `registry/tropes/session-start/`,
 * not loaded dynamically from the consumer's vendored copy).
 * Persists execution records into the opened session log's
 * `## Execution Log` fence.
 */
import { Effect, Layer } from 'effect'

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
import { usageError, type Verb, type VerbContext } from './verb.ts'

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

const continueVerb: Verb = {
  name: 'continue',
  summary: 'Open or resume an LF session (Protocol-mode session-start).',
  usage:
    'Usage: literate continue [repoRoot] [--slug <slug>]\n' +
    '\n' +
    '  repoRoot defaults to the current working directory.\n' +
    '  Agent identifier comes from $LITERATE_AGENT_ID (default: unknown-agent).\n',

  async run(argv, ctx: VerbContext): Promise<number> {
    let slug: string | undefined
    const positional: string[] = []
    for (let i = 0; i < argv.length; i++) {
      const a = argv[i]!
      if (a === '--slug') {
        slug = argv[++i]
        if (!slug) throw usageError(continueVerb, '--slug needs a value')
      } else {
        positional.push(a)
      }
    }
    const repoRoot = positional[0] ?? ctx.cwd
    const agent = ctx.env['LITERATE_AGENT_ID'] ?? 'unknown-agent'
    const terminal = makeNodeTerminalIO()
    try {
      const ref = await Effect.runPromise(
        runContinue({
          repoRoot,
          agent,
          io: terminal.io,
          ...(slug !== undefined ? { slug } : {}),
        }),
      )
      ctx.stdout.write(
        `\nSession open: ${ref.path}\n  slug: ${ref.slug}\n`,
      )
      return 0
    } finally {
      terminal.close()
    }
  },
}

export default continueVerb
