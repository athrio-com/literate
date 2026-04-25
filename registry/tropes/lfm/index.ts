/**
 * `tropes/lfm` — the Trope that authors and validates a Literate
 * Framework Manifest. See `prose.mdx` for the imperative
 * decomposition and `concept.mdx` for the typed contract.
 *
 * Distribution shape: registry seed at
 * `registry/tropes/lfm/index.ts`. The CLI bundles it from source
 * for the `reconcile` verb's hash-maintenance pass; tangled into
 * a consumer repo via `literate tangle tropes lfm`.
 *
 * The Trope exposes:
 *   - `LFMAuthoringConcept` — the Concept this Trope realises.
 *   - The four primary atomic Steps + the separately-exported
 *     `updateReferencesStep` (invoked by `reconcile`).
 *   - `lfmStep` — the composing `workflowStep`.
 *   - `lfmTrope` — the `Trope<typeof LFMAuthoringConcept>`.
 *   - `computeLfmId` — the pure hash function (exported for
 *     `reconcile` to call without invoking the full Step).
 *   - `rewriteAnnotations` — the pure annotation-rewrite helper.
 */
import { Effect, Schema } from 'effect'
import {
  concept,
  effectStep,
  ioStep,
  memo,
  Modality,
  prose,
  requireMdxStructure,
  SessionStore,
  StepId,
  trope,
  workflowStep,
  type Concept,
  type SessionStoreService,
  type Trope,
} from '@literate/core'

import { DispositionSchema } from '../../concepts/disposition/index.ts'
import { LayerSchema } from '../../concepts/layer/index.ts'

// ---------------------------------------------------------------------------
// Prose refs

const ConceptProse = prose(import.meta.url, './concept.mdx')
const TropeProse = prose(import.meta.url, './prose.mdx')

// ---------------------------------------------------------------------------
// Schemas

export const LFMAuthoring = Schema.Struct({
  layer: LayerSchema,
  domain: Schema.String,
  disposition: DispositionSchema,
  body: Schema.String,
  dependencies: Schema.optional(Schema.Array(Schema.String)),
  oldId: Schema.optional(Schema.String),
})
export type LFMAuthoring = Schema.Schema.Type<typeof LFMAuthoring>

export const LFMRef = Schema.Struct({
  _tag: Schema.Literal('LFMRef'),
  path: Schema.String,
  id: Schema.String,
  oldId: Schema.NullOr(Schema.String),
})
export type LFMRef = Schema.Schema.Type<typeof LFMRef>

const RawBody = Schema.Struct({
  layer: LayerSchema,
  domain: Schema.String,
  disposition: DispositionSchema,
  body: Schema.String,
  dependencies: Schema.optional(Schema.Array(Schema.String)),
  oldId: Schema.optional(Schema.String),
})
type RawBody = Schema.Schema.Type<typeof RawBody>

const HashedBody = Schema.extend(
  RawBody,
  Schema.Struct({ id: Schema.String }),
)
type HashedBody = Schema.Schema.Type<typeof HashedBody>

const Violation = Schema.Struct({
  kind: Schema.Literal('subject-of-clause', 'markdown-link'),
  excerpt: Schema.String,
})
export type Violation = Schema.Schema.Type<typeof Violation>

const ValidatedBody = Schema.extend(
  HashedBody,
  Schema.Struct({ violations: Schema.Array(Violation) }),
)
type ValidatedBody = Schema.Schema.Type<typeof ValidatedBody>

export const UpdateReferencesInput = Schema.Struct({
  oldId: Schema.String,
  newId: Schema.NullOr(Schema.String),
})
export type UpdateReferencesInput = Schema.Schema.Type<
  typeof UpdateReferencesInput
>

export const UpdateReferencesResult = Schema.Struct({
  updated: Schema.Array(Schema.String),
})
export type UpdateReferencesResult = Schema.Schema.Type<
  typeof UpdateReferencesResult
>

// ---------------------------------------------------------------------------
// Pure helpers

/**
 * Compute the short content hash of an LFM body.
 *
 * SHA-256 of the body bytes (UTF-8), first 8 hex characters. The
 * metadata header is excluded — pass the *body only* (the markdown
 * content below the `---` fence).
 */
export const computeLfmId = async (body: string): Promise<string> => {
  const data = new TextEncoder().encode(body)
  const digest = await crypto.subtle.digest('SHA-256', data)
  const bytes = new Uint8Array(digest)
  let hex = ''
  for (let i = 0; i < 4; i++) {
    hex += bytes[i]!.toString(16).padStart(2, '0')
  }
  return hex
}

const ANNOTATION_RE = /@lfm\(([0-9a-f]{8,})\)/g

/**
 * Rewrite every `@lfm(<oldId>)` annotation in `source` to
 * `@lfm(<newId>)` (or remove the annotation when `newId` is
 * `null`, indicating the target LFM was deleted).
 *
 * Returns `null` when no rewrite was needed (caller can skip the
 * write).
 */
export const rewriteAnnotations = (
  source: string,
  oldId: string,
  newId: string | null,
): string | null => {
  let changed = false
  const out = source.replace(ANNOTATION_RE, (full, captured: string) => {
    if (captured !== oldId) return full
    changed = true
    return newId === null ? '' : `@lfm(${newId})`
  })
  return changed ? out : null
}

const SUBJECT_PATTERNS = [
  /\bas declared in\s+@lfm\([0-9a-f]{8,}\)/gi,
  /\bper\s+@lfm\([0-9a-f]{8,}\)/gi,
  /\bsee\s+@lfm\([0-9a-f]{8,}\)\s+for/gi,
  /\bdefined in\s+@lfm\([0-9a-f]{8,}\)/gi,
]

const MD_LINK_RE =
  /\]\(\.{1,2}\/[^\s)]*?\.md\)|\]\(corpus\/manifests\/[^\s)]*?\.md\)/g

const detectViolations = (body: string): Array<Violation> => {
  const out: Array<Violation> = []
  for (const re of SUBJECT_PATTERNS) {
    re.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = re.exec(body)) !== null) {
      out.push({ kind: 'subject-of-clause', excerpt: m[0] })
    }
  }
  let m: RegExpExecArray | null
  MD_LINK_RE.lastIndex = 0
  while ((m = MD_LINK_RE.exec(body)) !== null) {
    out.push({ kind: 'markdown-link', excerpt: m[0] })
  }
  return out
}

const serialiseHeader = (input: ValidatedBody): string => {
  const parts: string[] = ['---']
  parts.push(`id: ${input.id}`)
  parts.push(`disposition: ${JSON.stringify(input.disposition)}`)
  parts.push(`layer: ${JSON.stringify(input.layer)}`)
  parts.push(`domain: ${input.domain}`)
  parts.push(`status: Unverified`)
  if (input.dependencies && input.dependencies.length > 0) {
    parts.push(`dependencies: ${JSON.stringify(input.dependencies)}`)
  }
  parts.push('---')
  return parts.join('\n')
}

const lfmRelPath = (input: { layer: { path: string }; domain: string }): string =>
  `corpus/manifests/${input.layer.path}/${input.domain}.md`

// ---------------------------------------------------------------------------
// Concept

export const LFMAuthoringConcept: Concept<LFMRef> = concept({
  id: 'lfm-authoring',
  version: '0.1.0',
  description:
    'Author and validate one Literate Framework Manifest. Compute the content hash, validate self-sufficiency, write to corpus/manifests/<layer>/<domain>.md. Reference-hash maintenance is invoked separately by reconcile.',
  instanceSchema: LFMRef,
  prose: ConceptProse,
  modality: Modality.Protocol,
})

// ---------------------------------------------------------------------------
// Step 1 — authorBody

export const authorBodyStep = effectStep({
  id: StepId('lfm.author-body'),
  inputSchema: LFMAuthoring,
  outputSchema: RawBody,
  prose: TropeProse,
  run: (input) => Effect.succeed(input as RawBody),
})

// ---------------------------------------------------------------------------
// Step 2 — computeId

export const computeIdStep = effectStep({
  id: StepId('lfm.compute-id'),
  inputSchema: RawBody,
  outputSchema: HashedBody,
  prose: TropeProse,
  run: (input) =>
    Effect.tryPromise({
      try: async () => ({ ...input, id: await computeLfmId(input.body) }),
      catch: (e) =>
        new Error(
          `lfm.compute-id failed: ${e instanceof Error ? e.message : String(e)}`,
        ) as never,
    }),
})

// ---------------------------------------------------------------------------
// Step 3 — validateSelfSufficiency

export const validateSelfSufficiencyStep = effectStep({
  id: StepId('lfm.validate-self-sufficiency'),
  inputSchema: HashedBody,
  outputSchema: ValidatedBody,
  prose: TropeProse,
  run: (input) =>
    Effect.succeed({ ...input, violations: detectViolations(input.body) }),
})

// ---------------------------------------------------------------------------
// Step 4 — writeFile

export const writeFileStep = ioStep({
  id: StepId('lfm.write-file'),
  inputSchema: ValidatedBody,
  outputSchema: LFMRef,
  prose: TropeProse,
  run: (input) =>
    Effect.gen(function* () {
      const store = yield* SessionStore
      const path = lfmRelPath(input)
      const header = serialiseHeader(input)
      const content = `${header}\n\n${input.body}`
      yield* store.write(path, content)
      return {
        _tag: 'LFMRef' as const,
        path,
        id: input.id,
        oldId: input.oldId ?? null,
      }
    }),
})

// ---------------------------------------------------------------------------
// Step 5 — updateReferences (separately exposed; not in main composition)

const MANIFESTS_DIR = 'corpus/manifests'

const collectManifestPaths = (
  store: SessionStoreService,
  base: string,
): Effect.Effect<ReadonlyArray<string>, never> =>
  Effect.gen(function* () {
    const out: string[] = []
    const entries = yield* store
      .listDir(base)
      .pipe(Effect.catchAll(() => Effect.succeed([] as ReadonlyArray<string>)))
    for (const entry of entries) {
      if (entry.endsWith('.md')) {
        out.push(`${base}/${entry}`)
        continue
      }
      // Treat any non-`.md` entry as a sub-directory; recurse.
      const nested = yield* collectManifestPaths(store, `${base}/${entry}`)
      out.push(...nested)
    }
    return out
  })

export const updateReferencesStep = ioStep({
  id: StepId('lfm.update-references'),
  inputSchema: UpdateReferencesInput,
  outputSchema: UpdateReferencesResult,
  prose: TropeProse,
  run: ({ oldId, newId }) =>
    Effect.gen(function* () {
      const store = yield* SessionStore
      const paths = yield* collectManifestPaths(store, MANIFESTS_DIR)
      const updated: string[] = []
      for (const p of paths) {
        const content = yield* store
          .read(p)
          .pipe(Effect.catchAll(() => Effect.succeed('')))
        if (content === '') continue
        const next = rewriteAnnotations(content, oldId, newId)
        if (next === null) continue
        yield* store.write(p, next)
        updated.push(p)
      }
      return { updated }
    }),
})

// ---------------------------------------------------------------------------
// Composing workflowStep

export const lfmStep = workflowStep({
  id: StepId('lfm'),
  inputSchema: LFMAuthoring,
  outputSchema: LFMRef,
  prose: TropeProse,
  dependencies: [
    authorBodyStep,
    computeIdStep,
    validateSelfSufficiencyStep,
    writeFileStep,
  ],
  run: (input) =>
    Effect.gen(function* () {
      const raw = yield* memo(authorBodyStep)(input)
      const hashed = yield* memo(computeIdStep)(raw)
      const validated = yield* memo(validateSelfSufficiencyStep)(hashed)
      const ref = yield* memo(writeFileStep)(validated)
      return ref
    }),
})

// ---------------------------------------------------------------------------
// Trope

export const lfmProseSchema = requireMdxStructure({
  h1: 'LFM Trope',
  h2Slugs: [
    'author-body',
    'compute-id',
    'validate-self-sufficiency',
    'write-file',
    'update-references',
    'composition',
  ],
})

export const lfmTrope: Trope<typeof LFMAuthoringConcept> = trope({
  id: 'lfm',
  version: '0.1.0',
  realises: LFMAuthoringConcept,
  prose: TropeProse,
  proseSchema: lfmProseSchema,
  realise: lfmStep,
  modality: Modality.Protocol,
})

export default lfmTrope
