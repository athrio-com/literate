/**
 * `tropes/index` — produce a permanent corpus index at
 * `corpus/manifests/index.md` summarising every LFM in the corpus.
 *
 * Optional but default-shipped in the `minimal` template seed
 * list. Pure navigation surface; carries no decisive content;
 * regenerated on every invocation.
 *
 * See `prose.mdx` for the imperative decomposition and
 * `concept.mdx` for the typed contract.
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

// ---------------------------------------------------------------------------
// Prose refs

const ConceptProse = prose(import.meta.url, './concept.mdx')
const TropeProse = prose(import.meta.url, './prose.mdx')

// ---------------------------------------------------------------------------
// Schemas

export const IndexInput = Schema.Struct({
  repoRoot: Schema.String,
})
export type IndexInput = Schema.Schema.Type<typeof IndexInput>

export const IndexResult = Schema.Struct({
  indexPath: Schema.String,
  entriesIncluded: Schema.Number,
})
export type IndexResult = Schema.Schema.Type<typeof IndexResult>

const IndexEntry = Schema.Struct({
  path: Schema.String,
  layer: Schema.String,
  domain: Schema.String,
  id: Schema.String,
  status: Schema.String,
  summary: Schema.String,
})
type IndexEntry = Schema.Schema.Type<typeof IndexEntry>

const PathList = Schema.Struct({ paths: Schema.Array(Schema.String) })
type PathList = Schema.Schema.Type<typeof PathList>

const EntryList = Schema.Struct({ entries: Schema.Array(IndexEntry) })
type EntryList = Schema.Schema.Type<typeof EntryList>

const RenderedDoc = Schema.Struct({ markdown: Schema.String })
type RenderedDoc = Schema.Schema.Type<typeof RenderedDoc>

const WriteInput = Schema.Struct({
  markdown: Schema.String,
  entryCount: Schema.Number,
})
type WriteInput = Schema.Schema.Type<typeof WriteInput>

// ---------------------------------------------------------------------------
// Helpers

const MANIFESTS_DIR = 'corpus/manifests'
const INDEX_PATH = `${MANIFESTS_DIR}/index.md`

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

const parseEntry = (path: string, content: string): IndexEntry => {
  const lines = content.split('\n')
  if (lines[0] !== '---') {
    return {
      path,
      layer: 'unknown',
      domain: path.split('/').slice(-1)[0]!.replace(/\.md$/, ''),
      id: '(unparseable)',
      status: 'Unverified',
      summary: '(metadata header missing)',
    }
  }
  let endIdx = -1
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === '---') {
      endIdx = i
      break
    }
  }
  if (endIdx < 0) {
    return {
      path,
      layer: 'unknown',
      domain: path.split('/').slice(-1)[0]!.replace(/\.md$/, ''),
      id: '(unparseable)',
      status: 'Unverified',
      summary: '(metadata header unterminated)',
    }
  }

  const meta: Record<string, string> = {}
  for (const line of lines.slice(1, endIdx)) {
    const m = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/)
    if (m) meta[m[1]!] = m[2]!.trim()
  }
  const layerPathFromPath = path
    .replace(`${MANIFESTS_DIR}/`, '')
    .replace(/\/[^/]+\.md$/, '')
  let layerLabel = layerPathFromPath
  // Best-effort extract from `layer: { ..., path: 'apps/app1', ... }`.
  const declared = meta['layer'] ?? ''
  const pathMatch = declared.match(/path:\s*['"]([^'"]+)['"]/)
  if (pathMatch) layerLabel = pathMatch[1]!

  const domain = meta['domain'] ?? path.split('/').slice(-1)[0]!.replace(/\.md$/, '')
  const id = meta['id'] ?? '(no-id)'
  const status = meta['status'] ?? 'Unverified'

  // Body summary — first sentence after the first `# heading`.
  const body = lines.slice(endIdx + 1).join('\n').trim()
  const bodyAfterH1 = body.replace(/^#\s+[^\n]+\n+/, '')
  const firstPara = bodyAfterH1.split(/\n\n/)[0] ?? ''
  const firstSentence =
    firstPara
      .split(/(?<=[.!?])\s+/)[0]
      ?.replace(/\s+/g, ' ')
      .trim() ?? ''
  const summary =
    firstSentence === ''
      ? '(empty body)'
      : firstSentence.slice(0, 200)

  return {
    path,
    layer: layerLabel,
    domain,
    id,
    status,
    summary,
  }
}

const SIGIL =
  '<!-- GENERATED by `literate reconcile` (or the `index` Trope).\n' +
  '     Regenerated on every invocation. Hand-edits do not survive. -->'

const renderTable = (entries: ReadonlyArray<IndexEntry>): string => {
  if (entries.length === 0) {
    return [
      SIGIL,
      '',
      '# Manifest Index',
      '',
      '*(No LFMs in this corpus yet — author one at',
      '`corpus/manifests/<layer>/<domain>.md`.)*',
      '',
    ].join('\n')
  }
  const rows: string[] = []
  rows.push(SIGIL)
  rows.push('')
  rows.push('# Manifest Index')
  rows.push('')
  rows.push('| Layer / Domain | id | status | summary |')
  rows.push('|---|---|---|---|')
  for (const e of entries) {
    const cell = (s: string) => s.replace(/\|/g, '\\|')
    rows.push(
      `| \`${cell(e.layer)}/${cell(e.domain)}\` | \`${cell(e.id)}\` | ${cell(e.status)} | ${cell(e.summary)} |`,
    )
  }
  rows.push('')
  return rows.join('\n')
}

// ---------------------------------------------------------------------------
// Concept

export const IndexConcept: Concept<IndexResult> = concept({
  id: 'index',
  version: '0.1.0',
  description:
    'Produce a permanent navigation index at corpus/manifests/index.md summarising every LFM in the corpus. Pure navigation; carries no decisive content. Regenerated on every invocation.',
  instanceSchema: IndexResult,
  prose: ConceptProse,
  modality: Modality.Protocol,
})

// ---------------------------------------------------------------------------
// Step 1 — walkManifests

export const walkManifestsIndexStep = effectStep({
  id: StepId('index.walk-manifests'),
  inputSchema: IndexInput,
  outputSchema: PathList,
  prose: TropeProse,
  run: (_input) =>
    Effect.gen(function* () {
      const store = yield* SessionStore
      const all = yield* collectManifestPaths(store, MANIFESTS_DIR)
      const lfms = all.filter((p) => p !== INDEX_PATH)
      return { paths: sortByCanonicalOrder(lfms) }
    }),
})

// ---------------------------------------------------------------------------
// Step 2 — readEntries

export const readEntriesStep = ioStep({
  id: StepId('index.read-entries'),
  inputSchema: PathList,
  outputSchema: EntryList,
  prose: TropeProse,
  run: ({ paths }) =>
    Effect.gen(function* () {
      const store = yield* SessionStore
      const entries: IndexEntry[] = []
      for (const path of paths) {
        const content = yield* store
          .read(path)
          .pipe(Effect.catchAll(() => Effect.succeed('')))
        if (content === '') {
          entries.push({
            path,
            layer: 'unknown',
            domain: path.split('/').slice(-1)[0]!.replace(/\.md$/, ''),
            id: '(unreadable)',
            status: 'Unverified',
            summary: '(file could not be read)',
          })
          continue
        }
        entries.push(parseEntry(path, content))
      }
      return { entries }
    }),
})

// ---------------------------------------------------------------------------
// Step 3 — renderDocument

export const renderDocumentStep = effectStep({
  id: StepId('index.render-document'),
  inputSchema: EntryList,
  outputSchema: RenderedDoc,
  prose: TropeProse,
  run: ({ entries }) =>
    Effect.succeed({ markdown: renderTable(entries) }),
})

// ---------------------------------------------------------------------------
// Step 4 — writeIndex

export const writeIndexStep = ioStep({
  id: StepId('index.write-index'),
  inputSchema: WriteInput,
  outputSchema: IndexResult,
  prose: TropeProse,
  run: ({ markdown, entryCount }) =>
    Effect.gen(function* () {
      const store = yield* SessionStore
      yield* store.write(INDEX_PATH, markdown)
      return { indexPath: INDEX_PATH, entriesIncluded: entryCount }
    }),
})

// ---------------------------------------------------------------------------
// Composing workflowStep

export const indexStep = workflowStep({
  id: StepId('index'),
  inputSchema: IndexInput,
  outputSchema: IndexResult,
  prose: TropeProse,
  dependencies: [
    walkManifestsIndexStep,
    readEntriesStep,
    renderDocumentStep,
    writeIndexStep,
  ],
  run: (input) =>
    Effect.gen(function* () {
      const { paths } = yield* memo(walkManifestsIndexStep)(input)
      const { entries } = yield* memo(readEntriesStep)({ paths })
      const { markdown } = yield* memo(renderDocumentStep)({ entries })
      return yield* memo(writeIndexStep)({
        markdown,
        entryCount: entries.length,
      })
    }),
})

// ---------------------------------------------------------------------------
// Trope

export const indexProseSchema = requireMdxStructure({
  h1: 'Index Trope',
  h2Slugs: [
    'walk-manifests',
    'read-entries',
    'render-document',
    'write-index',
    'composition',
  ],
})

export const indexTrope: Trope<typeof IndexConcept> = trope({
  id: 'index',
  version: '0.1.0',
  realises: IndexConcept,
  prose: TropeProse,
  proseSchema: indexProseSchema,
  realise: indexStep,
  modality: Modality.Protocol,
})

export default indexTrope
