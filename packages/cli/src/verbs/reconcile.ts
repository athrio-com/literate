/**
 * `literate reconcile [repoRoot]`.
 *
 * Walks every LFM under `corpus/manifests/`, derives each one's
 * status by comparing the declared state against the
 * implementation, writes the status back, and updates soft-link
 * reference hashes when LFM bodies have changed.
 *
 * Mechanical and deterministic; no AI in the loop. Dispatches the
 * bundled `reconcile` Trope at
 * `registry/tropes/reconcile/index.ts`. The CLI prints a compact
 * human-readable summary; programmatic callers get the structured
 * `ReconcileReport`.
 */
import { Args, Command } from '@effect/cli'
import { Console, Effect, Layer, Option } from 'effect'

import {
  fileSystemSessionStoreLayer,
  InMemoryExecutionLogLayer,
  LiveProseInvokeLayer,
  StubAIInvokeLayer,
  StubGateServiceLayer,
} from '@literate/core'

import {
  reconcileStep,
  type ReconcileReport,
} from '../trope-bindings.ts'

export interface RunReconcileOptions {
  readonly repoRoot: string
}

export const runReconcile = (
  opts: RunReconcileOptions,
): Effect.Effect<ReconcileReport, unknown> => {
  const layer = Layer.mergeAll(
    fileSystemSessionStoreLayer(opts.repoRoot),
    InMemoryExecutionLogLayer,
    StubGateServiceLayer,
    LiveProseInvokeLayer,
    StubAIInvokeLayer,
  )
  return reconcileStep
    .realise({ repoRoot: opts.repoRoot })
    .pipe(Effect.provide(layer)) as Effect.Effect<ReconcileReport, unknown>
}

const repoRootArg = Args.text({ name: 'repoRoot' }).pipe(
  Args.withDescription(
    'Repo root (defaults to the current working directory).',
  ),
  Args.optional,
)

const reconcileCommand = Command.make(
  'reconcile',
  { repoRoot: repoRootArg },
  ({ repoRoot }) =>
    Effect.gen(function* () {
      const resolvedRoot = Option.getOrElse(repoRoot, () => process.cwd())
      const report = yield* runReconcile({ repoRoot: resolvedRoot })
      const total =
        report.counts.Reconciled +
        report.counts.Drifted +
        report.counts.Pending +
        report.counts.Unverified
      if (total === 0) {
        yield* Console.log('no LFMs to reconcile')
        return
      }
      yield* Console.log(
        `reconciled ${total} LFM(s):` +
          ` ${report.counts.Reconciled} reconciled,` +
          ` ${report.counts.Drifted} drifted,` +
          ` ${report.counts.Pending} pending,` +
          ` ${report.counts.Unverified} unverified`,
      )
      if (report.hashUpdates.length > 0) {
        yield* Console.log(
          `  hash updates: ${report.hashUpdates.length}` +
            ` (${report.referencesUpdated.length} reference(s) rewritten)`,
        )
      }
      for (const e of report.nonReconciled) {
        yield* Console.log(`  - ${e.path} → ${e.status}: ${e.cause}`)
      }
    }),
).pipe(
  Command.withDescription(
    'Walk every LFM under `corpus/manifests/`, derive its status, write status back, update soft-link reference hashes when bodies change.',
  ),
)

export default reconcileCommand
