/**
 * Combinators: step, proseStep, aiStep, gateStep, effectStep, ioStep,
 * workflowStep, and memo.
 *
 * See ADR-012 (§Combinators) and ADR-013 (§2 Memoisation).
 */
import { Effect, Option, Schema } from 'effect'
import {
  deriveInvocationKey,
  ExecutionLog,
  type ExecutionRecord,
  type LogWriteError,
} from './execution.ts'
import { GateDecisionSchema, type GateDecision } from './gate.ts'
import {
  AIInvoke,
  type AIInvokeError,
  GateService,
  type GateUnresolved,
  ProseInput,
  ProseInvoke,
  ProseOutput,
} from './services.ts'
import {
  type ProseLoadError,
  StepError,
  type StepId,
  type ProseRef,
  type Step,
  type StepKind,
} from './step.ts'

// ---------------------------------------------------------------------------
// step() — the underlying primitive

export interface StepDefinition<I, O, E, R> {
  readonly id: StepId
  readonly kind: StepKind
  readonly version?: string | undefined
  readonly inputSchema: Schema.Schema<I, any, never>
  readonly outputSchema: Schema.Schema<O, any, never>
  readonly prose: ProseRef
  readonly run: (input: I) => Effect.Effect<O, E | StepError, R>
  readonly dependencies?: ReadonlyArray<Step<any, any, any, any>> | undefined
}

export const step = <I, O, E, R>(
  def: StepDefinition<I, O, E, R>,
): Step<I, O, E, R> => ({
  _tag: 'Step',
  id: def.id,
  kind: def.kind,
  version: def.version ?? '0.0.1',
  inputSchema: def.inputSchema,
  outputSchema: def.outputSchema,
  prose: def.prose,
  realise: def.run,
  dependencies: def.dependencies ?? [],
})

// ---------------------------------------------------------------------------
// proseStep — load, template, return ProseOutput

export interface ProseStepDefinition {
  readonly id: StepId
  readonly source: ProseRef
  readonly version?: string | undefined
  readonly defaults?: ProseInput | undefined
}

export const proseStep = (
  def: ProseStepDefinition,
): Step<ProseInput, ProseOutput, ProseLoadError, ProseInvoke> =>
  step<ProseInput, ProseOutput, ProseLoadError, ProseInvoke>({
    id: def.id,
    kind: 'prose',
    version: def.version,
    inputSchema: ProseInput,
    outputSchema: ProseOutput,
    prose: def.source,
    run: (input) =>
      Effect.flatMap(ProseInvoke, (invoke) =>
        invoke.render(def.source, {
          ...(def.defaults ?? {}),
          ...input,
        }),
      ),
  })

// ---------------------------------------------------------------------------
// effectStep — pure computation with schema-validated I/O

export interface EffectStepDefinition<I, O, E, R> {
  readonly id: StepId
  readonly inputSchema: Schema.Schema<I, any, never>
  readonly outputSchema: Schema.Schema<O, any, never>
  readonly prose: ProseRef
  readonly version?: string | undefined
  readonly run: (input: I) => Effect.Effect<O, E, R>
  readonly dependencies?: ReadonlyArray<Step<any, any, any, any>> | undefined
}

export const effectStep = <I, O, E, R>(
  def: EffectStepDefinition<I, O, E, R>,
): Step<I, O, E, R> =>
  step({
    id: def.id,
    kind: 'effect',
    version: def.version,
    inputSchema: def.inputSchema,
    outputSchema: def.outputSchema,
    prose: def.prose,
    run: def.run,
    dependencies: def.dependencies,
  })

// ---------------------------------------------------------------------------
// ioStep — side-effect with snapshot memoisation

export interface IoStepDefinition<I, O, E, R>
  extends EffectStepDefinition<I, O, E, R> {}

export const ioStep = <I, O, E, R>(
  def: IoStepDefinition<I, O, E, R>,
): Step<I, O, E, R> =>
  step({
    id: def.id,
    kind: 'io',
    version: def.version,
    inputSchema: def.inputSchema,
    outputSchema: def.outputSchema,
    prose: def.prose,
    run: def.run,
    dependencies: def.dependencies,
  })

// ---------------------------------------------------------------------------
// aiStep — prose-as-prompt; response parsed through outputSchema

export interface AIStepDefinition<I, O> {
  readonly id: StepId
  readonly inputSchema: Schema.Schema<I, any, never>
  readonly outputSchema: Schema.Schema<O, any, never>
  readonly prompt: ProseRef
  readonly version?: string | undefined
  readonly renderVars?: ((input: I) => Record<string, string>) | undefined
}

export const aiStep = <I, O>(
  def: AIStepDefinition<I, O>,
): Step<I, O, AIInvokeError | ProseLoadError, AIInvoke | ProseInvoke> =>
  step<I, O, AIInvokeError | ProseLoadError, AIInvoke | ProseInvoke>({
    id: def.id,
    kind: 'ai',
    version: def.version,
    inputSchema: def.inputSchema,
    outputSchema: def.outputSchema,
    prose: def.prompt,
    run: (input) =>
      Effect.gen(function* () {
        const proseInvoke = yield* ProseInvoke
        const ai = yield* AIInvoke
        const vars = def.renderVars ? def.renderVars(input) : {}
        const rendered = yield* proseInvoke.render(def.prompt, { vars })
        return yield* ai.run(rendered.text, def.outputSchema)
      }),
  })

// ---------------------------------------------------------------------------
// gateStep — present a draft, suspend, return GateDecision on resolve

export interface GateStepDefinition<D> {
  readonly id: StepId
  readonly draftSchema: Schema.Schema<D, any, never>
  readonly prose: ProseRef
  readonly version?: string | undefined
}

export const gateStep = <D>(
  def: GateStepDefinition<D>,
): Step<{ readonly draft: D }, GateDecision<D>, GateUnresolved, GateService> => {
  const inputSchema = Schema.Struct({
    draft: def.draftSchema,
  }) as unknown as Schema.Schema<{ readonly draft: D }, any, never>
  const outputSchema = GateDecisionSchema(
    def.draftSchema,
  ) as unknown as Schema.Schema<GateDecision<D>, any, never>
  return step<
    { readonly draft: D },
    GateDecision<D>,
    GateUnresolved,
    GateService
  >({
    id: def.id,
    kind: 'gate',
    version: def.version,
    inputSchema,
    outputSchema,
    prose: def.prose,
    run: (input) =>
      Effect.flatMap(GateService, (gate) =>
        gate.present(input.draft, def.draftSchema),
      ),
  })
}

// ---------------------------------------------------------------------------
// workflowStep — composes other Steps via Effect.gen

export interface WorkflowStepDefinition<I, O, E, R>
  extends EffectStepDefinition<I, O, E, R> {}

export const workflowStep = <I, O, E, R>(
  def: WorkflowStepDefinition<I, O, E, R>,
): Step<I, O, E, R> =>
  step({
    id: def.id,
    kind: 'workflow',
    version: def.version,
    inputSchema: def.inputSchema,
    outputSchema: def.outputSchema,
    prose: def.prose,
    run: def.run,
    dependencies: def.dependencies,
  })

// ---------------------------------------------------------------------------
// memo — the replay primitive (ADR-013 §2)

export const memo =
  <I, O, E, R>(s: Step<I, O, E, R>) =>
  (
    input: I,
  ): Effect.Effect<O, E | StepError | LogWriteError, R | ExecutionLog> =>
    Effect.gen(function* () {
      const log = yield* ExecutionLog
      const invKey = deriveInvocationKey(s.id, input)
      const existing = yield* log.find(s.id, invKey)
      if (Option.isSome(existing)) {
        const record = existing.value
        if (record.status === 'completed') {
          const decoded = yield* Schema.decodeUnknown(s.outputSchema)(
            record.output,
          ).pipe(
            Effect.mapError(
              (e) =>
                new StepError({
                  stepId: s.id,
                  reason: `replay decode failed: ${String(e)}`,
                }),
            ),
          )
          return decoded
        }
        if (record.status === 'failed') {
          return yield* Effect.fail(
            new StepError({
              stepId: s.id,
              reason: record.error ?? 'prior failure',
            }),
          )
        }
      }
      const startedAt = new Date().toISOString()
      const output = yield* s.realise(input)
      const record: ExecutionRecord = {
        stepId: s.id,
        invocationKey: invKey,
        kind: s.kind,
        startedAt,
        completedAt: new Date().toISOString(),
        status: 'completed',
        input,
        output,
      }
      yield* log.append(record)
      return output
    })
