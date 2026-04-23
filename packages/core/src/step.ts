/**
 * Step — the executable unit of a Trope's verbs.
 *
 * See ADR-011 (executable monadic prose) and ADR-012 (six StepKinds)
 * in `../../../corpus/decisions/`.
 */
import { Brand, Data, Effect, Schema } from 'effect'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

// ---------------------------------------------------------------------------
// StepId, InvocationKey — nominal brands

export type StepId = string & Brand.Brand<'StepId'>
export const StepId = Brand.nominal<StepId>()

export type InvocationKey = string & Brand.Brand<'InvocationKey'>
export const InvocationKey = Brand.nominal<InvocationKey>()

// ---------------------------------------------------------------------------
// StepKind — closed union (ADR-012)

export const StepKind = Schema.Literal(
  'prose',
  'workflow',
  'effect',
  'ai',
  'gate',
  'io',
)
export type StepKind = Schema.Schema.Type<typeof StepKind>

// ---------------------------------------------------------------------------
// Errors

export class StepError extends Data.TaggedError('StepError')<{
  readonly stepId: StepId
  readonly reason: string
}> {}

export class ProseLoadError extends Data.TaggedError('ProseLoadError')<{
  readonly path: string
  readonly cause: string
}> {}

// ---------------------------------------------------------------------------
// ProseRef — typed reference to a sibling .md

export interface ProseRef {
  readonly _tag: 'ProseRef'
  readonly sourcePath: string
  readonly load: () => Effect.Effect<string, ProseLoadError>
}

/**
 * Resolve a `.md` sibling relative to the caller's `import.meta.url` and
 * return a typed `ProseRef`. See ADR-015 for the authoring convention.
 */
export const prose = (
  importMetaUrl: string,
  relativePath: string,
): ProseRef => {
  const absUrl = new URL(relativePath, importMetaUrl)
  const sourcePath = fileURLToPath(absUrl)
  return {
    _tag: 'ProseRef',
    sourcePath,
    load: () =>
      Effect.tryPromise({
        try: () => readFile(sourcePath, 'utf-8'),
        catch: (cause) =>
          new ProseLoadError({
            path: sourcePath,
            cause: String(cause),
          }),
      }),
  }
}

// ---------------------------------------------------------------------------
// Step<I, O, E, R>

export interface Step<I, O, E = never, R = never> {
  readonly _tag: 'Step'
  readonly id: StepId
  readonly kind: StepKind
  readonly version: string
  readonly inputSchema: Schema.Schema<I, any, never>
  readonly outputSchema: Schema.Schema<O, any, never>
  readonly prose: ProseRef
  readonly realise: (input: I) => Effect.Effect<O, E | StepError, R>
  readonly dependencies: ReadonlyArray<AnyStep>
}

// `any` in the error and requirements positions is deliberate for the
// generic AnyStep — it's a type-erasure escape hatch for heterogeneous
// collections (dependency graphs). Concrete Steps always carry precise
// types in their own definitions.
export type AnyStep = Step<any, any, any, any>

// Helper type extractors
export type InputOf<S> = S extends Step<infer I, any, any, any> ? I : never
export type OutputOf<S> = S extends Step<any, infer O, any, any> ? O : never
export type ErrorOf<S> = S extends Step<any, any, infer E, any> ? E : never
export type RequirementsOf<S> = S extends Step<any, any, any, infer R> ? R : never
