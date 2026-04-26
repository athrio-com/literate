/**
 * `tropes/reconcile` — walk every LFM in the corpus, derive each
 * one's status, write status back, maintain soft-link hashes via
 * the `lfm` Trope's hash-maintenance contract.
 *
 * See `prose.mdx` for the imperative decomposition and
 * `concept.mdx` for the typed contract.
 *
 * Distribution shape: registry seed at
 * `registry/tropes/reconcile/index.ts`. The CLI bundles it from
 * source for the `literate reconcile` verb; tangled into a
 * consumer repo via `literate tangle tropes reconcile`.
 */
import { Effect, Schema } from 'effect'
import {
  concept,
  effectStep,
  ioStep,
  memo,
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

import {
  LFMStatus,
  LFMStatusSchema,
} from '../../concepts/lfm-status/index.ts'
import {
  computeLfmId,
  migrateLegacyLfmReferences,
  populateColonLfmHash,
  rewriteAnnotations,
  updateReferencesStep,
} from '../lfm/index.ts'

// ---------------------------------------------------------------------------
// Prose refs

const ConceptProse = prose(import.meta.url, './concept.mdx')
const TropeProse = prose(import.meta.url, './trope.mdx')

// ---------------------------------------------------------------------------
// Schemas

export const ReconcileInput = Schema.Struct({
  repoRoot: Schema.String,
})
export type ReconcileInput = Schema.Schema.Type<typeof ReconcileInput>

const StatusEntry = Schema.Struct({
  path: Schema.String,
  status: LFMStatusSchema,
  cause: Schema.optional(Schema.String),
})
type StatusEntry = Schema.Schema.Type<typeof StatusEntry>

const HashUpdate = Schema.Struct({
  path: Schema.String,
  oldId: Schema.String,
  newId: Schema.String,
})
type HashUpdate = Schema.Schema.Type<typeof HashUpdate>

const NonReconciledEntry = Schema.Struct({
  path: Schema.String,
  status: Schema.Union(
    Schema.Literal('Drifted'),
    Schema.Literal('Pending'),
    Schema.Literal('Unverified'),
  ),
  cause: Schema.String,
})
type NonReconciledEntry = Schema.Schema.Type<typeof NonReconciledEntry>

export const ReconcileReport = Schema.Struct({
  counts: Schema.Struct({
    Reconciled: Schema.Number,
    Drifted: Schema.Number,
    Pending: Schema.Number,
    Unverified: Schema.Number,
  }),
  nonReconciled: Schema.Array(NonReconciledEntry),
  hashUpdates: Schema.Array(HashUpdate),
  referencesUpdated: Schema.Array(Schema.String),
  /**
   * Files where the migration step rewrote `@lfm(<hash>)` to
   * `:lfm[<name>]{hash=<hash>}` or populated a missing `{hash=…}`
   * attribute on a `:lfm[<name>]` reference.
   */
  migrated: Schema.Array(Schema.String),
})
export type ReconcileReport = Schema.Schema.Type<typeof ReconcileReport>

const PathList = Schema.Struct({ paths: Schema.Array(Schema.String) })
type PathList = Schema.Schema.Type<typeof PathList>

const ReconcileBatch = Schema.Struct({
  statuses: Schema.Array(StatusEntry),
  hashUpdates: Schema.Array(HashUpdate),
})
type ReconcileBatch = Schema.Schema.Type<typeof ReconcileBatch>

const HashUpdateBatch = Schema.Struct({
  hashUpdates: Schema.Array(HashUpdate),
})
type HashUpdateBatch = Schema.Schema.Type<typeof HashUpdateBatch>

const RefUpdateBatch = Schema.Struct({
  referencesUpdated: Schema.Array(Schema.String),
})
type RefUpdateBatch = Schema.Schema.Type<typeof RefUpdateBatch>

const MigrationResult = Schema.Struct({
  migrated: Schema.Array(Schema.String),
})
type MigrationResult = Schema.Schema.Type<typeof MigrationResult>

const ReportInput = Schema.Struct({
  statuses: Schema.Array(StatusEntry),
  hashUpdates: Schema.Array(HashUpdate),
  referencesUpdated: Schema.Array(Schema.String),
  migrated: Schema.Array(Schema.String),
})
type ReportInput = Schema.Schema.Type<typeof ReportInput>

// ---------------------------------------------------------------------------
// Helpers

const MANIFESTS_DIR = 'corpus/manifests'

const LAYER_ORDER: ReadonlyArray<string> = [
  'workspace',
  'apps',
  'infrastructure',
  'protocol',
]

const layerRank = (path: string): number => {
  for (let i = 0; i < LAYER_ORDER.length; i++) {
    const layer = LAYER_ORDER[i]!
    if (path === `${MANIFESTS_DIR}/${layer}`) return i
    if (path.startsWith(`${MANIFESTS_DIR}/${layer}/`)) return i
  }
  return LAYER_ORDER.length
}

const sortByCanonicalOrder = (
  paths: ReadonlyArray<string>,
): ReadonlyArray<string> =>
  [...paths].sort((a, b) => {
    const ra = layerRank(a)
    const rb = layerRank(b)
    if (ra !== rb) return ra - rb
    return a.localeCompare(b)
  })

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
      const nested = yield* collectManifestPaths(store, `${base}/${entry}`)
      out.push(...nested)
    }
    return out
  })

/**
 * Walk a directory tree collecting every `.md` and `.mdx` file.
 * Used to scope migration over `corpus/manifests/`, `corpus/sessions/`,
 * and `registry/`.
 */
const collectAuthoredPaths = (
  store: SessionStoreService,
  base: string,
): Effect.Effect<ReadonlyArray<string>, never> =>
  Effect.gen(function* () {
    const out: string[] = []
    const entries = yield* store
      .listDir(base)
      .pipe(Effect.catchAll(() => Effect.succeed([] as ReadonlyArray<string>)))
    for (const entry of entries) {
      if (entry.endsWith('.md') || entry.endsWith('.mdx')) {
        out.push(`${base}/${entry}`)
        continue
      }
      // Heuristic: descend into anything without a file extension.
      if (!entry.includes('.')) {
        const nested = yield* collectAuthoredPaths(store, `${base}/${entry}`)
        out.push(...nested)
      }
    }
    return out
  })

interface ParsedLFM {
  readonly path: string
  readonly headerRaw: string
  readonly body: string
  readonly meta: Record<string, string>
}

const parseLFM = (path: string, content: string): ParsedLFM | null => {
  // Expect the file to begin with `---\n…\n---\n`.
  const lines = content.split('\n')
  if (lines[0] !== '---') return null
  let endIdx = -1
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === '---') {
      endIdx = i
      break
    }
  }
  if (endIdx < 0) return null
  const headerLines = lines.slice(1, endIdx)
  const bodyLines = lines.slice(endIdx + 1)
  // Drop a single leading blank line from the body so that the
  // hash is stable across `---\n\n# body` and `---\n# body`.
  const body = (bodyLines[0] === '' ? bodyLines.slice(1) : bodyLines).join('\n')
  const meta: Record<string, string> = {}
  for (const line of headerLines) {
    const m = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/)
    if (m) meta[m[1]!] = m[2]!.trim()
  }
  return { path, headerRaw: lines.slice(0, endIdx + 1).join('\n'), body, meta }
}

const serialiseHeader = (meta: Record<string, string>): string => {
  const order = ['id', 'disposition', 'layer', 'domain', 'status', 'dependencies']
  const parts: string[] = ['---']
  for (const key of order) {
    if (meta[key] !== undefined && meta[key] !== '') {
      parts.push(`${key}: ${meta[key]}`)
    }
  }
  for (const key of Object.keys(meta)) {
    if (!order.includes(key) && meta[key] !== undefined && meta[key] !== '') {
      parts.push(`${key}: ${meta[key]}`)
    }
  }
  parts.push('---')
  return parts.join('\n')
}

interface PathDeclaration {
  readonly path: string
}

const PATH_BLOCK_RE = /```path\s+([^\n]+)\n[\s\S]*?```/g

const declaredPaths = (body: string): ReadonlyArray<PathDeclaration> => {
  const out: PathDeclaration[] = []
  PATH_BLOCK_RE.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = PATH_BLOCK_RE.exec(body)) !== null) {
    out.push({ path: m[1]!.trim() })
  }
  return out
}

// ---------------------------------------------------------------------------
// Concept

export const ReconcileConcept: Concept<ReconcileReport> = concept({
  id: 'reconcile',
  version: '0.1.0',
  description:
    'Walk every LFM in the corpus, derive each one\'s status, write status back, maintain soft-link hashes when bodies change. Mechanical; no AI in the loop.',
  instanceSchema: ReconcileReport,
  prose: ConceptProse,
})

// ---------------------------------------------------------------------------
// Step 1 — walkManifests

export const walkManifestsStep = effectStep({
  id: StepId('reconcile.walk-manifests'),
  inputSchema: ReconcileInput,
  outputSchema: PathList,
  prose: TropeProse,
  run: (_input) =>
    Effect.gen(function* () {
      const store = yield* SessionStore
      const all = yield* collectManifestPaths(store, MANIFESTS_DIR)
      // Exclude `index.md` produced by the optional `index` Trope.
      const lfms = all.filter((p) => !p.endsWith('/manifests/index.md'))
      return { paths: sortByCanonicalOrder(lfms) }
    }),
})

// ---------------------------------------------------------------------------
// Step 2 — reconcileEach

export const reconcileEachStep = ioStep({
  id: StepId('reconcile.reconcile-each'),
  inputSchema: PathList,
  outputSchema: ReconcileBatch,
  prose: TropeProse,
  run: ({ paths }) =>
    Effect.gen(function* () {
      const store = yield* SessionStore
      const statuses: StatusEntry[] = []
      const hashUpdates: HashUpdate[] = []

      for (const path of paths) {
        const content = yield* store
          .read(path)
          .pipe(Effect.catchAll(() => Effect.succeed('')))
        if (content === '') {
          statuses.push({
            path,
            status: LFMStatus.Unverified,
            cause: 'unreadable',
          })
          continue
        }
        const parsed = parseLFM(path, content)
        if (parsed === null) {
          statuses.push({
            path,
            status: LFMStatus.Unverified,
            cause: 'malformed-header',
          })
          continue
        }

        const recomputed = yield* Effect.tryPromise({
          try: () => computeLfmId(parsed.body),
          catch: () => null,
        }).pipe(Effect.catchAll(() => Effect.succeed(null as string | null)))
        if (recomputed === null) {
          statuses.push({
            path,
            status: LFMStatus.Unverified,
            cause: 'hash-failed',
          })
          continue
        }

        const declaredId = parsed.meta['id'] ?? ''
        let nextStatus: typeof LFMStatus[keyof typeof LFMStatus]
        let cause: string | undefined

        if (declaredId !== recomputed) {
          nextStatus = LFMStatus.Pending
          cause = `id mismatch: declared ${declaredId || '(none)'}, body hashes to ${recomputed}`
          if (declaredId !== '') {
            hashUpdates.push({
              path,
              oldId: declaredId,
              newId: recomputed,
            })
          }
        } else {
          // Run path-existence check.
          const decls = declaredPaths(parsed.body)
          const missing: string[] = []
          for (const decl of decls) {
            const exists = yield* store
              .read(decl.path)
              .pipe(
                Effect.map(() => true),
                Effect.catchAll(() => Effect.succeed(false)),
              )
            if (!exists) missing.push(decl.path)
          }
          if (missing.length > 0) {
            nextStatus = LFMStatus.Drifted
            cause = `declared path(s) missing: ${missing.join(', ')}`
          } else if (decls.length > 0) {
            nextStatus = LFMStatus.Reconciled
          } else {
            // No mechanical check available for this LFM.
            // Per `concepts/lfm-status`, the no-check row resolves
            // to Unverified regardless of prior state.
            nextStatus = LFMStatus.Unverified
            cause = 'no path declarations in body'
          }
        }

        // Write back updated meta.
        const updatedMeta = {
          ...parsed.meta,
          id: recomputed,
          status: nextStatus,
        }
        const newContent = `${serialiseHeader(updatedMeta)}\n\n${parsed.body}`
        if (newContent !== content) {
          yield* store.write(path, newContent)
        }
        statuses.push({
          path,
          status: nextStatus,
          ...(cause !== undefined ? { cause } : {}),
        })
      }

      return { statuses, hashUpdates }
    }),
})

// ---------------------------------------------------------------------------
// Step 3 — updateReferences

export const updateReferencesAggregateStep = ioStep({
  id: StepId('reconcile.update-references'),
  inputSchema: HashUpdateBatch,
  outputSchema: RefUpdateBatch,
  prose: TropeProse,
  run: ({ hashUpdates }) =>
    Effect.gen(function* () {
      const updatedSet = new Set<string>()
      for (const upd of hashUpdates) {
        const { updated } = yield* updateReferencesStep.realise({
          oldId: upd.oldId,
          newId: upd.newId,
        })
        for (const p of updated) updatedSet.add(p)
      }
      return { referencesUpdated: Array.from(updatedSet) }
    }),
})

// ---------------------------------------------------------------------------
// Step 3.5 — migrateAtLfmReferences
//
// Build the hash → name and name → hash indices from the parsed
// manifests, then walk authored prose under `corpus/manifests/`,
// `corpus/sessions/`, and `registry/`, rewriting `@lfm(<hash>)` to
// `:lfm[<name>]{hash=<hash>}` and populating missing `{hash=…}` on
// `:lfm[<name>]` references. Idempotent.
//
// Per-location rewrite policy is implicit: cascade
// (`:lfm[name]{hash=<old>}` → `…{hash=<new>}` when target body
// changes) is performed by `updateReferencesStep` upstream and only
// touches `corpus/manifests/`. This step is the one-shot migration
// for *all* scopes; in `corpus/sessions/` it runs once per session
// log and never updates an existing `:lfm[…]{hash=…}` afterward.

const MIGRATION_SCOPES: ReadonlyArray<string> = [
  'corpus/manifests',
  'corpus/sessions',
  'registry',
]

export const migrateAtLfmReferencesStep = ioStep({
  id: StepId('reconcile.migrate-at-lfm'),
  inputSchema: ReconcileInput,
  outputSchema: MigrationResult,
  prose: TropeProse,
  run: (_input) =>
    Effect.gen(function* () {
      const store = yield* SessionStore
      // Build hash → name + name → hash from current manifest state.
      const hashToName = new Map<string, string>()
      const nameToHash = new Map<string, string>()
      const manifestPaths = yield* collectManifestPaths(
        store,
        MANIFESTS_DIR,
      )
      for (const p of manifestPaths) {
        const content = yield* store
          .read(p)
          .pipe(Effect.catchAll(() => Effect.succeed('')))
        if (!content) continue
        const parsed = parseLFM(p, content)
        if (!parsed) continue
        const id = parsed.meta['id']
        const domain = parsed.meta['domain']
        if (id && domain) {
          hashToName.set(id, domain)
          nameToHash.set(domain, id)
        }
      }

      const migrated: string[] = []
      for (const scope of MIGRATION_SCOPES) {
        const paths = yield* collectAuthoredPaths(store, scope)
        for (const p of paths) {
          const content = yield* store
            .read(p)
            .pipe(Effect.catchAll(() => Effect.succeed('')))
          if (!content) continue
          let next = content
          const m1 = migrateLegacyLfmReferences(next, hashToName)
          if (m1 !== null) next = m1
          const m2 = populateColonLfmHash(next, nameToHash)
          if (m2 !== null) next = m2
          if (next !== content) {
            yield* store.write(p, next)
            migrated.push(p)
          }
        }
      }
      return { migrated }
    }),
})

// ---------------------------------------------------------------------------
// Step 4 — buildReport

export const buildReportStep = effectStep({
  id: StepId('reconcile.build-report'),
  inputSchema: ReportInput,
  outputSchema: ReconcileReport,
  prose: TropeProse,
  run: ({ statuses, hashUpdates, referencesUpdated, migrated }) =>
    Effect.sync(() => {
      const counts = {
        Reconciled: 0,
        Drifted: 0,
        Pending: 0,
        Unverified: 0,
      }
      const nonReconciled: NonReconciledEntry[] = []
      for (const e of statuses) {
        counts[e.status as keyof typeof counts] += 1
        if (e.status !== 'Reconciled') {
          nonReconciled.push({
            path: e.path,
            status: e.status as 'Drifted' | 'Pending' | 'Unverified',
            cause: e.cause ?? '',
          })
        }
      }
      return {
        counts,
        nonReconciled,
        hashUpdates,
        referencesUpdated,
        migrated,
      }
    }),
})

// ---------------------------------------------------------------------------
// Composing workflowStep

export const reconcileStep = workflowStep({
  id: StepId('reconcile'),
  inputSchema: ReconcileInput,
  outputSchema: ReconcileReport,
  prose: TropeProse,
  dependencies: [
    walkManifestsStep,
    reconcileEachStep,
    updateReferencesAggregateStep,
    migrateAtLfmReferencesStep,
    buildReportStep,
  ],
  run: (input) =>
    Effect.gen(function* () {
      const { paths } = yield* memo(walkManifestsStep)(input)
      if (paths.length === 0) {
        return {
          counts: { Reconciled: 0, Drifted: 0, Pending: 0, Unverified: 0 },
          nonReconciled: [],
          hashUpdates: [],
          referencesUpdated: [],
          migrated: [],
        }
      }
      const { statuses, hashUpdates } = yield* memo(reconcileEachStep)({
        paths,
      })
      const { referencesUpdated } = yield* memo(
        updateReferencesAggregateStep,
      )({ hashUpdates })
      const { migrated } = yield* memo(migrateAtLfmReferencesStep)(input)
      return yield* memo(buildReportStep)({
        statuses,
        hashUpdates,
        referencesUpdated,
        migrated,
      })
    }),
})

// ---------------------------------------------------------------------------
// Trope

export const reconcileProseSchema = requireMdxStructure({
  h1: 'Reconcile Trope',
  h2Slugs: [
    'walk-manifests',
    'reconcile-each',
    'update-references',
    'migrate-at-lfm',
    'build-report',
    'composition',
  ],
})

export const reconcileTrope: Trope<typeof ReconcileConcept> = trope({
  id: 'reconcile',
  version: '0.1.0',
  realises: ReconcileConcept,
  disposition: { base: 'Protocol', scope: 'lfm-reconcile' },
  prose: TropeProse,
  proseSchema: reconcileProseSchema,
  realise: reconcileStep,
})

export default reconcileTrope
