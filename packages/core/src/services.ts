/**
 * StepContext services — ProseInvoke, AIInvoke, GateService.
 *
 * See ADR-002 (six Step kinds, services injected per kind) and ADR-014
 * (harness substrate).
 */
import { Context, Data, Effect, Layer, Schema } from 'effect'
import type { ProseRef } from './step.ts'
import { ProseLoadError } from './step.ts'
import type { GateDecision } from './gate.ts'

// ---------------------------------------------------------------------------
// ProseInput / ProseOutput (ADR-015 templating grammar)

export const ProseInput = Schema.Struct({
  range: Schema.optional(Schema.Tuple(Schema.Number, Schema.Number)),
  section: Schema.optional(Schema.String),
  vars: Schema.optional(
    Schema.Record({ key: Schema.String, value: Schema.String }),
  ),
})
export type ProseInput = Schema.Schema.Type<typeof ProseInput>

export const ProseOutput = Schema.Struct({
  text: Schema.String,
  source: Schema.String,
  range: Schema.Tuple(Schema.Number, Schema.Number),
})
export type ProseOutput = Schema.Schema.Type<typeof ProseOutput>

// ---------------------------------------------------------------------------
// Errors

export class AIInvokeError extends Data.TaggedError('AIInvokeError')<{
  readonly reason: string
}> {}

export class GateUnresolved extends Data.TaggedError('GateUnresolved')<{
  readonly reason: string
}> {}

// ---------------------------------------------------------------------------
// ProseInvoke — loads and templates prose

export interface ProseInvokeService {
  readonly render: (
    ref: ProseRef,
    input: ProseInput,
  ) => Effect.Effect<ProseOutput, ProseLoadError>
}

export class ProseInvoke extends Context.Tag('@literate/ProseInvoke')<
  ProseInvoke,
  ProseInvokeService
>() {}

const sliceBySection = (text: string, slug: string): string | null => {
  const lines = text.split('\n')
  let inSection = false
  const out: string[] = []
  let sectionLevel = 0
  for (const line of lines) {
    const headingMatch = line.match(/^(#+)\s+(.*)$/)
    if (headingMatch) {
      const level = headingMatch[1]!.length
      const title = headingMatch[2]!.trim()
      const asSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      if (!inSection && asSlug === slug) {
        inSection = true
        sectionLevel = level
        continue
      }
      if (inSection && level <= sectionLevel) {
        break
      }
    }
    if (inSection) out.push(line)
  }
  return inSection ? out.join('\n') : null
}

const applyVars = (
  text: string,
  vars: Record<string, string> | undefined,
): string => {
  if (!vars) return text
  let out = text
  for (const [k, v] of Object.entries(vars)) {
    out = out.split(`{vars.${k}}`).join(v)
  }
  return out
}

export const makeProseInvoke: Effect.Effect<ProseInvokeService> =
  Effect.succeed({
    render: (ref, input) =>
      Effect.gen(function* () {
        const raw = yield* ref.load()
        let text = raw
        if (input.section) {
          text = sliceBySection(text, input.section) ?? text
        }
        const varsApplied = applyVars(text, input.vars)
        const rangeStart = input.range?.[0] ?? 0
        const rangeEnd = input.range?.[1] ?? varsApplied.length
        const sliced = varsApplied.slice(rangeStart, rangeEnd)
        return {
          text: sliced,
          source: ref.sourcePath,
          range: [rangeStart, Math.min(rangeEnd, varsApplied.length)] as [
            number,
            number,
          ],
        }
      }),
  })

export const LiveProseInvokeLayer = Layer.effect(ProseInvoke, makeProseInvoke)

// ---------------------------------------------------------------------------
// AIInvoke — stub that always fails in v0.1; live bindings in harness

export interface AIInvokeService {
  readonly run: <O>(
    prompt: string,
    outputSchema: Schema.Schema<O, any, never>,
  ) => Effect.Effect<O, AIInvokeError>
}

export class AIInvoke extends Context.Tag('@literate/AIInvoke')<
  AIInvoke,
  AIInvokeService
>() {}

export const StubAIInvokeLayer = Layer.succeed(AIInvoke, {
  run: <O>(
    _prompt: string,
    _outputSchema: Schema.Schema<O, any, never>,
  ): Effect.Effect<O, AIInvokeError> =>
    Effect.fail(
      new AIInvokeError({
        reason:
          'No AIInvoke binding; the harness must provide a live implementation',
      }),
    ),
})

// ---------------------------------------------------------------------------
// GateService — stub that always suspends (live CLI / chat binding in harness)

export interface GateServiceImpl {
  readonly present: <D>(
    draft: D,
    draftSchema: Schema.Schema<D, any, never>,
  ) => Effect.Effect<GateDecision<D>, GateUnresolved>
}

export class GateService extends Context.Tag('@literate/GateService')<
  GateService,
  GateServiceImpl
>() {}

export const StubGateServiceLayer = Layer.succeed(GateService, {
  present: <D>(
    _draft: D,
    _schema: Schema.Schema<D, any, never>,
  ): Effect.Effect<GateDecision<D>, GateUnresolved> =>
    Effect.fail(
      new GateUnresolved({
        reason:
          'No GateService binding; the harness must provide a live implementation',
      }),
    ),
})

// ---------------------------------------------------------------------------
// Default stub layers merged

export const DefaultStubLayers = Layer.mergeAll(
  LiveProseInvokeLayer,
  StubAIInvokeLayer,
  StubGateServiceLayer,
)
