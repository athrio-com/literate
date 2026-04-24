/**
 * `tropes/session-start` — the Protocol-mode workflow Trope that
 * realises the session-start procedure (IMP-1). See `prose.mdx` for the
 * decomposition and `concept.mdx` for the typed contract.
 *
 * Distribution shape (ADR-025/026): this file is a registry seed at
 * `registry/tropes/session-start/index.ts`. The CLI bundles it from
 * source for its `continue` verb and tangles it into consumer repos
 * at `.literate/tropes/session-start/index.ts` for vendored reading
 * and consumer-side scripting.
 *
 * The Trope exposes:
 *   - `SessionStartConcept` — the Concept this Trope realises.
 *   - The ten atomic Steps (exported for introspection and composition).
 *   - `sessionStartStep` — the composing `workflowStep`.
 *   - `sessionStartTrope` — the `Trope<typeof SessionStartConcept>`.
 *
 * Upstream ADRs: ADR-011 (Step substrate), ADR-013 (event store),
 * ADR-014 (Protocol.continue), ADR-015 (TS + .md siblings),
 * ADR-017 (gate decisions), ADR-021 (Modality ADT), ADR-025/026
 * (registry seed shape, CLI bundling).
 */
import { Effect, Schema } from 'effect'
import {
  concept,
  effectStep,
  gateStep,
  GateService,
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
  type Trope,
} from '@literate/core'

// ---------------------------------------------------------------------------
// Prose refs — sibling `.md` files per ADR-015.

const ConceptProse = prose(import.meta.url, './concept.mdx')
const TropeProse = prose(import.meta.url, './prose.mdx')

// ---------------------------------------------------------------------------
// Schemas

export const StartInput = Schema.Struct({
  repoRoot: Schema.String,
  agent: Schema.String,
  slug: Schema.optional(Schema.String),
})
export type StartInput = Schema.Schema.Type<typeof StartInput>

export const SessionRefSchema = Schema.Struct({
  _tag: Schema.Literal('SessionRef'),
  path: Schema.String,
  slug: Schema.String,
})
export type SessionRef = Schema.Schema.Type<typeof SessionRefSchema>

const PlannedCandidate = Schema.Struct({
  path: Schema.String,
  slug: Schema.String,
})
export type PlannedCandidate = Schema.Schema.Type<typeof PlannedCandidate>

export const StartPathDecision = Schema.Union(
  Schema.Struct({
    _tag: Schema.Literal('Spontaneous'),
    slug: Schema.String,
  }),
  Schema.Struct({
    _tag: Schema.Literal('Planned'),
    candidates: Schema.Array(PlannedCandidate),
    chosen: PlannedCandidate,
  }),
  Schema.Struct({
    _tag: Schema.Literal('OpenOrphan'),
    path: Schema.String,
  }),
)
export type StartPathDecision = Schema.Schema.Type<typeof StartPathDecision>

const PriorContext = Schema.Struct({
  summary: Schema.String,
  deferred: Schema.String,
  sourcePath: Schema.optional(Schema.String),
})
type PriorContext = Schema.Schema.Type<typeof PriorContext>

const AdrIndex = Schema.Struct({
  content: Schema.String,
})
type AdrIndex = Schema.Schema.Type<typeof AdrIndex>

const OrphanChoice = Schema.Struct({
  action: Schema.Literal('resume', 'close', 'revert'),
})
export type OrphanChoice = Schema.Schema.Type<typeof OrphanChoice>

const AcceptedGoal = Schema.Struct({
  number: Schema.Number,
  title: Schema.String,
  status: Schema.Literal('Active', 'Abandoned'),
  category: Schema.String,
})
type AcceptedGoal = Schema.Schema.Type<typeof AcceptedGoal>

const AcceptedGoals = Schema.Struct({
  goals: Schema.Array(AcceptedGoal),
})
type AcceptedGoals = Schema.Schema.Type<typeof AcceptedGoals>

// ---------------------------------------------------------------------------
// Helpers — header parsing and rewriting

const HEADER_FIELD = /^\*\*([^:]+):\*\*\s*(.*)$/

const normaliseKey = (raw: string): string =>
  raw.toLowerCase().replace(/\s+/g, '')

interface ParsedHeader {
  readonly date: string | null
  readonly started: string | null
  readonly status: string | null
  readonly chapter: string | null
  readonly agent: string | null
  readonly plannedBy: string | null
  readonly dependsOn: string | null
  readonly raw: Record<string, string>
}

const parseHeader = (content: string): ParsedHeader => {
  const lines = content.split('\n')
  const fields: Record<string, string> = {}
  let seen = false
  for (const line of lines) {
    const m = line.match(HEADER_FIELD)
    if (m) {
      const key = normaliseKey(m[1]!)
      fields[key] = m[2]!.trim()
      seen = true
      continue
    }
    if (seen && line.trim() === '') break
  }
  return {
    date: fields['date'] ?? null,
    started: fields['started'] ?? null,
    status: fields['status'] ?? null,
    chapter: fields['chapter'] ?? null,
    agent: fields['agent'] ?? null,
    plannedBy: fields['plannedby'] ?? null,
    dependsOn: fields['dependson'] ?? null,
    raw: fields,
  }
}

const rewriteHeaderField = (
  content: string,
  field: string,
  newValue: string,
): string => {
  const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(`^\\*\\*${escaped}:\\*\\*\\s*.*$`)
  const lines = content.split('\n')
  let replaced = false
  const out = lines.map((line) => {
    if (!replaced && re.test(line)) {
      replaced = true
      return `**${field}:** ${newValue}`
    }
    return line
  })
  return out.join('\n')
}

const FILENAME_RE = /^(\d{4}-\d{2}-\d{2}T\d{4})-(.+)\.md$/

const parseSlugFromFilename = (filename: string): string | null => {
  const m = filename.match(FILENAME_RE)
  return m ? m[2]! : null
}

const isSessionFilename = (filename: string): boolean =>
  FILENAME_RE.test(filename) && filename !== 'sessions.md'

const SESSIONS_DIR = 'corpus/sessions'
const SESSIONS_INDEX = 'corpus/sessions/sessions.md'
const DECISIONS_INDEX = 'corpus/decisions/decisions.md'

const sessionPath = (filename: string): string => `${SESSIONS_DIR}/${filename}`

// Extract a section by its level-2 heading slug. Case-insensitive match on
// the slugified heading (lowercased, non-alnum → '-').
const extractSection = (content: string, slug: string): string => {
  const target = slug.toLowerCase()
  const lines = content.split('\n')
  const out: string[] = []
  let inSection = false
  for (const line of lines) {
    const m = line.match(/^(##+)\s+(.*)$/)
    if (m) {
      const level = m[1]!.length
      const heading = m[2]!
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      if (!inSection && level === 2 && heading === target) {
        inSection = true
        continue
      }
      if (inSection && level <= 2) break
    }
    if (inSection) out.push(line)
  }
  return out.join('\n').trim()
}

// ---------------------------------------------------------------------------
// Concept

export const SessionStartConcept: Concept<SessionRef> = concept({
  id: 'session-start-procedure',
  version: '0.0.1',
  description:
    'The typed contract for beginning an LF session: detect the start path, handle orphans, open the log with a stamped header, surface prior context, and (on the planned path) re-gate provisional Goals.',
  instanceSchema: SessionRefSchema,
  prose: ConceptProse,
  modality: Modality.Protocol,
})

// ---------------------------------------------------------------------------
// Step 1 — detectStartPath
//
// Read corpus/sessions/; classify into Spontaneous | Planned | OpenOrphan.

export const detectStartPathStep = effectStep({
  id: StepId('session-start.detect-start-path'),
  inputSchema: StartInput,
  outputSchema: StartPathDecision,
  prose: TropeProse,
  run: (input) =>
    Effect.gen(function* () {
      const store = yield* SessionStore
      const entries = yield* store.listDir(SESSIONS_DIR)
      const sessionFiles = entries.filter(isSessionFilename)

      // Parse each session's header.
      const parsed = yield* Effect.all(
        sessionFiles.map((f) =>
          Effect.map(store.read(sessionPath(f)), (content) => ({
            filename: f,
            header: parseHeader(content),
          })),
        ),
      )

      // Orphan = non-Planned log with Status exactly 'Open'.
      const orphan = parsed.find(
        (p) => p.header.status === 'Open',
      )
      if (orphan) {
        return {
          _tag: 'OpenOrphan' as const,
          path: sessionPath(orphan.filename),
        }
      }

      // Planned candidates with satisfied dependencies.
      const plannedEntries = parsed.filter(
        (p) => p.header.status === 'Planned',
      )
      const closedPaths = new Set(
        parsed
          .filter((p) => (p.header.status ?? '').startsWith('Closed'))
          .map((p) => sessionPath(p.filename)),
      )
      const readyPlanned = plannedEntries.filter((p) => {
        const dep = p.header.dependsOn
        if (!dep) return true
        return closedPaths.has(dep)
      })

      if (readyPlanned.length > 0) {
        const candidates = readyPlanned.map((p) => ({
          path: sessionPath(p.filename),
          slug: parseSlugFromFilename(p.filename) ?? '',
        }))
        // Default to the first candidate; callers that need gating must
        // wrap detectStartPath with their own Person-interactive layer.
        const chosen = candidates[0]!
        return {
          _tag: 'Planned' as const,
          candidates,
          chosen,
        }
      }

      return {
        _tag: 'Spontaneous' as const,
        slug: input.slug ?? 'session',
      }
    }),
})

// ---------------------------------------------------------------------------
// Step 2 — handleOrphan
//
// Gate on the orphan action.

const OrphanGateDraft = Schema.Struct({
  orphanPath: Schema.String,
  action: Schema.Literal('resume', 'close', 'revert'),
}) as unknown as Schema.Schema<
  { readonly orphanPath: string; readonly action: 'resume' | 'close' | 'revert' },
  any,
  never
>

export const handleOrphanStep = gateStep({
  id: StepId('session-start.handle-open-orphan'),
  draftSchema: OrphanGateDraft,
  prose: TropeProse,
})

// ---------------------------------------------------------------------------
// Step 3 — openLog

const OpenLogInput = Schema.Struct({
  decision: StartPathDecision,
  input: StartInput,
})
type OpenLogInput = Schema.Schema.Type<typeof OpenLogInput>

export const openLogStep = ioStep({
  id: StepId('session-start.open-log'),
  inputSchema: OpenLogInput,
  outputSchema: SessionRefSchema,
  prose: TropeProse,
  run: ({ decision, input }) =>
    Effect.gen(function* () {
      const store = yield* SessionStore
      const now = yield* store.now()

      if (decision._tag === 'Spontaneous') {
        const slug = decision.slug
        const filename = `${now.filenameStamp}-${slug}.md`
        const path = sessionPath(filename)
        const date = now.logStamp.slice(0, 10)
        const header =
          `# Session: ${date} — ${slug}\n\n` +
          `**Date:** ${date}\n` +
          `**Started:** ${now.logStamp}\n` +
          `**Status:** Open\n` +
          `**Chapter:** —\n` +
          `**Agent:** ${input.agent}\n\n`
        yield* store.write(path, header)
        return { _tag: 'SessionRef' as const, path, slug }
      }

      if (decision._tag === 'Planned') {
        const { path, slug } = decision.chosen
        const current = yield* store.read(path)
        const withStatus = rewriteHeaderField(current, 'Status', 'Open')
        const withStarted = rewriteHeaderField(
          withStatus,
          'Started',
          now.logStamp,
        )
        const withAgent = rewriteHeaderField(
          withStarted,
          'Agent',
          input.agent,
        )
        yield* store.write(path, withAgent)
        return { _tag: 'SessionRef' as const, path, slug }
      }

      // OpenOrphan — the caller's handleOrphan Step decides; openLog
      // treats it as a no-op (returns a ref pointing at the orphan).
      const parts = decision.path.split('/')
      const filename = parts[parts.length - 1] ?? ''
      const slug = parseSlugFromFilename(filename) ?? ''
      return { _tag: 'SessionRef' as const, path: decision.path, slug }
    }),
})

// ---------------------------------------------------------------------------
// Step 4 — surfacePriorContext

export const surfacePriorContextStep = effectStep({
  id: StepId('session-start.surface-prior-context'),
  inputSchema: SessionRefSchema,
  outputSchema: PriorContext,
  prose: TropeProse,
  run: (ref) =>
    Effect.gen(function* () {
      const store = yield* SessionStore
      const entries = yield* store.listDir(SESSIONS_DIR)
      const sessionFiles = entries.filter(isSessionFilename)

      const parsed = yield* Effect.all(
        sessionFiles.map((f) =>
          Effect.map(store.read(sessionPath(f)), (content) => ({
            path: sessionPath(f),
            content,
            header: parseHeader(content),
          })),
        ),
      )

      const closed = parsed
        .filter(
          (p) =>
            p.path !== ref.path &&
            (p.header.status ?? '').startsWith('Closed'),
        )
        .sort((a, b) => b.path.localeCompare(a.path))

      const latest = closed[0]
      if (!latest) {
        return { summary: '', deferred: '' } as PriorContext
      }

      return {
        summary: extractSection(latest.content, 'summary'),
        deferred: extractSection(latest.content, 'deferred-discovered'),
        sourcePath: latest.path,
      }
    }),
})

// ---------------------------------------------------------------------------
// Step 5 — readAdrIndex

export const readAdrIndexStep = effectStep({
  id: StepId('session-start.read-adr-index'),
  inputSchema: SessionRefSchema,
  outputSchema: AdrIndex,
  prose: TropeProse,
  run: (_ref) =>
    Effect.gen(function* () {
      const store = yield* SessionStore
      // Fresh consumers may not have authored any ADRs yet — the
      // `corpus/decisions/decisions.md` index materialises only on
      // first ADR authorship. Treat absence as "0 ADRs indexed" and
      // proceed; the Pre-work block records the empty state.
      const content = yield* Effect.catchAll(
        store.read(DECISIONS_INDEX),
        () => Effect.succeed(''),
      )
      return { content }
    }),
})

// ---------------------------------------------------------------------------
// Step 6 — writePreWorkBlock

const WritePreWorkInput = Schema.Struct({
  sessionRef: SessionRefSchema,
  prior: PriorContext,
  adrIndex: AdrIndex,
})
type WritePreWorkInput = Schema.Schema.Type<typeof WritePreWorkInput>

export const writePreWorkBlockStep = ioStep({
  id: StepId('session-start.write-pre-work-block'),
  inputSchema: WritePreWorkInput,
  outputSchema: SessionRefSchema,
  prose: TropeProse,
  run: ({ sessionRef, prior, adrIndex }) =>
    Effect.gen(function* () {
      const store = yield* SessionStore
      const current = yield* store.read(sessionRef.path)

      const priorLine = prior.sourcePath
        ? `- **Last \`Status: Closed\` session.** \`${prior.sourcePath}\`. Summary: ${prior.summary.slice(0, 200) || '(empty)'}${prior.summary.length > 200 ? '…' : ''}`
        : `- **Last \`Status: Closed\` session.** (none found)`

      const adrLine = `- **ADR index.** ${adrIndex.content.split('\n').filter((l) => l.startsWith('| [')).length} ADR rows indexed at \`${DECISIONS_INDEX}\`.`

      const block =
        `\n## Pre-work\n\nPer \`session-start\` (IMP-1):\n\n` +
        `${priorLine}\n${adrLine}\n`

      yield* store.write(sessionRef.path, current + block)
      return sessionRef
    }),
})

// ---------------------------------------------------------------------------
// Step 7 — freezeParentPlanEntry

export const freezeParentPlanEntryStep = ioStep({
  id: StepId('session-start.freeze-parent-plan-entry'),
  inputSchema: SessionRefSchema,
  outputSchema: SessionRefSchema,
  prose: TropeProse,
  run: (ref) =>
    Effect.gen(function* () {
      const store = yield* SessionStore
      const self = yield* store.read(ref.path)
      const header = parseHeader(self)
      if (!header.plannedBy) return ref

      const parent = yield* store.read(header.plannedBy)
      // Match the Plan entry whose current Realised by pre-stamp refers
      // to this log's filename OR slug; set it to the authoritative path.
      const updated = parent.replace(
        /(\*\*Realised by:\*\*\s*)(corpus\/sessions\/[^\n]+)/g,
        (_match, prefix, current) => {
          const cur = String(current).trim()
          const selfSlugMatch = cur.endsWith(`-${ref.slug}.md`)
          if (cur === ref.path || selfSlugMatch) {
            return `${prefix}${ref.path}`
          }
          return _match
        },
      )
      if (updated !== parent) {
        yield* store.write(header.plannedBy, updated)
      }
      return ref
    }),
})

// ---------------------------------------------------------------------------
// Step 8 — reGateGoals
//
// Parse provisional `### Goal N — title` entries; gate each; collect
// decisions into `AcceptedGoals`.

const GOAL_HEADING = /^###\s+Goal\s+(\d+)\s*—\s*(.+)$/

interface ProvisionalGoal {
  readonly number: number
  readonly title: string
}

const parseProvisionalGoals = (content: string): ReadonlyArray<ProvisionalGoal> => {
  const goalsSection = extractSection(content, 'goals')
  const lines = goalsSection.split('\n')
  const out: ProvisionalGoal[] = []
  for (const line of lines) {
    const m = line.match(GOAL_HEADING)
    if (m) {
      out.push({ number: Number(m[1]!), title: m[2]!.trim() })
    }
  }
  return out
}

const GoalGateDraft = Schema.Struct({
  number: Schema.Number,
  title: Schema.String,
}) as unknown as Schema.Schema<
  { readonly number: number; readonly title: string },
  any,
  never
>

export const reGateGoalsStep = effectStep({
  id: StepId('session-start.re-gate-goals'),
  inputSchema: SessionRefSchema,
  outputSchema: AcceptedGoals,
  prose: TropeProse,
  run: (ref) =>
    Effect.gen(function* () {
      const store = yield* SessionStore
      const gate = yield* GateService
      const content = yield* store.read(ref.path)
      const provisionals = parseProvisionalGoals(content)
      const accepted: AcceptedGoal[] = []

      for (const g of provisionals) {
        const decision = yield* gate.present({ number: g.number, title: g.title }, GoalGateDraft)
        if (decision._tag === 'Accept') {
          accepted.push({
            number: g.number,
            title: g.title,
            status: 'Active',
            category: 'feature',
          })
        } else if (decision._tag === 'Reject') {
          accepted.push({
            number: g.number,
            title: g.title,
            status: 'Abandoned',
            category: 'feature',
          })
        }
        // Correct / Clarify: for v0.1, treat as Accept-with-note (no edits applied).
        else if (decision._tag === 'Correct') {
          accepted.push({
            number: g.number,
            title: g.title,
            status: 'Active',
            category: 'feature',
          })
        }
      }

      return { goals: accepted }
    }),
})

// ---------------------------------------------------------------------------
// Step 9 — stampAcceptedGoals
//
// Replace each `**Status:** (provisional)` / `**Category:** (provisional)`
// pair under `### Goal N` with the accepted values.

const StampGoalsInput = Schema.Struct({
  ref: SessionRefSchema,
  goals: AcceptedGoals,
})
type StampGoalsInput = Schema.Schema.Type<typeof StampGoalsInput>

export const stampAcceptedGoalsStep = ioStep({
  id: StepId('session-start.stamp-accepted-goals'),
  inputSchema: StampGoalsInput,
  outputSchema: SessionRefSchema,
  prose: TropeProse,
  run: ({ ref, goals }) =>
    Effect.gen(function* () {
      const store = yield* SessionStore
      let content = yield* store.read(ref.path)

      for (const g of goals.goals) {
        const heading = `### Goal ${g.number} — ${g.title}`
        const idx = content.indexOf(heading)
        if (idx === -1) continue

        // Find the substring from heading to the next '###' or end.
        const after = content.slice(idx + heading.length)
        const nextIdx = after.indexOf('\n### ')
        const segment =
          nextIdx === -1 ? after : after.slice(0, nextIdx)

        const updatedSegment = segment
          .replace(
            /(\*\*Status:\*\*\s*)\(provisional\)/,
            `$1${g.status}`,
          )
          .replace(
            /(\*\*Category:\*\*\s*)\(provisional\)/,
            `$1${g.category}`,
          )

        content =
          content.slice(0, idx + heading.length) +
          updatedSegment +
          (nextIdx === -1 ? '' : after.slice(nextIdx))
      }

      yield* store.write(ref.path, content)
      return ref
    }),
})

// ---------------------------------------------------------------------------
// Step 10 — returnSessionRef (identity terminal node)

export const returnSessionRefStep = effectStep({
  id: StepId('session-start.return-session-ref'),
  inputSchema: SessionRefSchema,
  outputSchema: SessionRefSchema,
  prose: TropeProse,
  run: (ref) => Effect.succeed(ref),
})

// ---------------------------------------------------------------------------
// Composing workflowStep
//
// The run body sequences the ten atomic Steps via Effect.gen under
// `memo()`. Orphan handling diverges here: on Accept({action: 'resume'})
// the Trope returns a SessionRef for the orphan and short-circuits the
// rest of the pipeline.

export const sessionStartStep = workflowStep({
  id: StepId('session-start'),
  inputSchema: StartInput,
  outputSchema: SessionRefSchema,
  prose: TropeProse,
  dependencies: [
    detectStartPathStep,
    handleOrphanStep,
    openLogStep,
    surfacePriorContextStep,
    readAdrIndexStep,
    writePreWorkBlockStep,
    freezeParentPlanEntryStep,
    reGateGoalsStep,
    stampAcceptedGoalsStep,
    returnSessionRefStep,
  ],
  run: (input) =>
    Effect.gen(function* () {
      const decision = yield* memo(detectStartPathStep)(input)

      if (decision._tag === 'OpenOrphan') {
        const orphanDecision = yield* memo(handleOrphanStep)({
          draft: {
            orphanPath: decision.path,
            action: 'resume',
          },
        })
        if (orphanDecision._tag !== 'Accept') {
          return yield* Effect.fail(
            new Error(
              `Orphan gate did not Accept: ${orphanDecision._tag}. Path: ${decision.path}`,
            ) as never,
          )
        }
        if (orphanDecision.value.action === 'resume') {
          const parts = decision.path.split('/')
          const filename = parts[parts.length - 1] ?? ''
          const slug = parseSlugFromFilename(filename) ?? ''
          return yield* memo(returnSessionRefStep)({
            _tag: 'SessionRef',
            path: decision.path,
            slug,
          })
        }
        // 'close' and 'revert' are recorded in the gate decision but not
        // actioned inside this Trope at v0.1 (see concept.md).
        return yield* Effect.fail(
          new Error(
            `Orphan action '${orphanDecision.value.action}' is not implemented in v0.1; caller must dispatch explicitly`,
          ) as never,
        )
      }

      const ref = yield* memo(openLogStep)({ decision, input })
      const prior = yield* memo(surfacePriorContextStep)(ref)
      const adrIndex = yield* memo(readAdrIndexStep)(ref)
      yield* memo(writePreWorkBlockStep)({
        sessionRef: ref,
        prior,
        adrIndex,
      })

      if (decision._tag === 'Planned') {
        yield* memo(freezeParentPlanEntryStep)(ref)
        const accepted = yield* memo(reGateGoalsStep)(ref)
        yield* memo(stampAcceptedGoalsStep)({ ref, goals: accepted })
      }

      return yield* memo(returnSessionRefStep)(ref)
    }),
})

// ---------------------------------------------------------------------------
// Trope

// The structural contract the authored prose must satisfy. The weaver
// parses `prose.mdx` via remark + remark-mdx and validates the resulting
// mdast tree against this Schema — failures surface as typed
// `ProseSchemaViolation`s (see the weaver's error channel).
export const sessionStartProseSchema = requireMdxStructure({
  h1: 'Session-Start Trope',
  h2Slugs: [
    'detect-start-path',
    'handle-open-orphan',
    'open-the-log',
    'surface-prior-context',
    'read-adr-index',
    'write-pre-work-block',
    'freeze-parent-plan-entry',
    're-gate-goals',
    'stamp-accepted-goals',
    'return-session-reference',
    'composition',
  ],
})

export const sessionStartTrope: Trope<typeof SessionStartConcept> = trope({
  id: 'session-start',
  version: '0.0.1',
  realises: SessionStartConcept,
  prose: TropeProse,
  proseSchema: sessionStartProseSchema,
  realise: sessionStartStep,
  modality: Modality.Protocol,
})

export default sessionStartTrope
