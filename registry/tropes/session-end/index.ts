/**
 * `tropes/session-end` — the Protocol-mode workflow Trope that
 * realises the session-end procedure (IMP-5). See `prose.mdx` for the
 * decomposition and `concept.mdx` for the typed contract.
 *
 * Distribution shape (ADR-025/026): this file is a registry seed at
 * `registry/tropes/session-end/index.ts`. The CLI bundles it from
 * source for its `close` verb and tangles it into consumer repos
 * at `.literate/tropes/session-end/index.ts`.
 *
 * The Trope exposes:
 *   - `SessionEndConcept` — the Concept this Trope realises.
 *   - The five atomic Steps.
 *   - `sessionEndStep` — the composing `workflowStep`.
 *   - `sessionEndTrope` — the `Trope<typeof SessionEndConcept>`.
 *   - `SessionEndIncomplete` — the tagged error returned on validation fail.
 *
 * Upstream LFMs: see corpus/manifests/protocol/algebra.md and
 *   sibling LFMs for the current-state declarations this seed
 *   realises.
 */
import { Data, Effect, Schema } from 'effect'
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
  type Trope,
} from '@literate/core'

import { isTerminalGoalStatus } from '../../concepts/goal-status/index.ts'

// ---------------------------------------------------------------------------
// Prose refs

const ConceptProse = prose(import.meta.url, './concept.mdx')
const TropeProse = prose(import.meta.url, './prose.mdx')

// ---------------------------------------------------------------------------
// Schemas

export const SessionEndInput = Schema.Struct({
  sessionPath: Schema.String,
})
export type SessionEndInput = Schema.Schema.Type<typeof SessionEndInput>

export const SessionClosure = Schema.Struct({
  sessionPath: Schema.String,
  closedAt: Schema.String, // 'YYYY-MM-DDTHH:MM'
})
export type SessionClosure = Schema.Schema.Type<typeof SessionClosure>

const ParsedLog = Schema.Struct({
  sessionPath: Schema.String,
  header: Schema.Struct({
    status: Schema.NullOr(Schema.String),
    plannedBy: Schema.NullOr(Schema.String),
  }),
  sections: Schema.Record({
    key: Schema.String,
    value: Schema.String,
  }),
  rawText: Schema.String,
})
type ParsedLog = Schema.Schema.Type<typeof ParsedLog>

const ValidationReport = Schema.Struct({
  missing: Schema.Array(Schema.String),
  discoveredDivergences: Schema.Array(Schema.String),
})
type ValidationReport = Schema.Schema.Type<typeof ValidationReport>

// ---------------------------------------------------------------------------
// Errors

export class SessionEndIncomplete extends Data.TaggedError(
  'SessionEndIncomplete',
)<{
  readonly sessionPath: string
  readonly missing: ReadonlyArray<string>
}> {}

export class SessionEndMalformed extends Data.TaggedError(
  'SessionEndMalformed',
)<{
  readonly sessionPath: string
  readonly reason: string
}> {}

// ---------------------------------------------------------------------------
// Helpers — header parsing and section extraction

const HEADER_FIELD = /^\*\*([^:]+):\*\*\s*(.*)$/

const normaliseKey = (raw: string): string =>
  raw.toLowerCase().replace(/\s+/g, '')

interface ParsedHeader {
  readonly status: string | null
  readonly plannedBy: string | null
}

const parseHeader = (content: string): ParsedHeader => {
  const lines = content.split('\n')
  const fields: Record<string, string> = {}
  let seen = false
  for (const line of lines) {
    const m = line.match(HEADER_FIELD)
    if (m) {
      fields[normaliseKey(m[1]!)] = m[2]!.trim()
      seen = true
      continue
    }
    if (seen && line.trim() === '') break
  }
  return {
    status: fields['status'] ?? null,
    plannedBy: fields['plannedby'] ?? null,
  }
}

// Extract every level-2 section into a map keyed by slugified title.
const extractSections = (content: string): Record<string, string> => {
  const lines = content.split('\n')
  const out: Record<string, string> = {}
  let currentSlug: string | null = null
  let buf: string[] = []
  const flush = () => {
    if (currentSlug !== null) {
      out[currentSlug] = buf.join('\n').trim()
    }
  }
  for (const line of lines) {
    const m = line.match(/^(##+)\s+(.*)$/)
    if (m && m[1]!.length === 2) {
      flush()
      currentSlug = m[2]!
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      buf = []
      continue
    }
    if (currentSlug !== null) buf.push(line)
  }
  flush()
  return out
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

const GOAL_HEADING = /^###\s+Goal\s+(\d+)\s*—\s*(.+)$/
const STATUS_LINE = /^\*\*Status:\*\*\s*(.*)$/

interface GoalBlock {
  readonly number: number
  readonly title: string
  readonly status: string | null
}

const parseGoals = (goalsSection: string): ReadonlyArray<GoalBlock> => {
  const lines = goalsSection.split('\n')
  const blocks: GoalBlock[] = []
  let current: { number: number; title: string; status: string | null } | null =
    null
  for (const line of lines) {
    const h = line.match(GOAL_HEADING)
    if (h) {
      if (current) blocks.push(current)
      current = {
        number: Number(h[1]!),
        title: h[2]!.trim(),
        status: null,
      }
      continue
    }
    if (current) {
      const s = line.match(STATUS_LINE)
      if (s && current.status === null) {
        current.status = s[1]!.trim()
      }
    }
  }
  if (current) blocks.push(current)
  return blocks
}

const parsePlanEntries = (planSection: string): ReadonlyArray<string> => {
  // Each Plan entry is a `### Planned Session N …` heading; we collect
  // them in order and return the trailing block for each.
  const lines = planSection.split('\n')
  const entries: string[] = []
  let buf: string[] = []
  let inEntry = false
  for (const line of lines) {
    if (/^###\s+Planned Session/.test(line)) {
      if (inEntry) entries.push(buf.join('\n'))
      buf = [line]
      inEntry = true
      continue
    }
    if (inEntry) buf.push(line)
  }
  if (inEntry) entries.push(buf.join('\n'))
  return entries
}

const planEntryIsTerminal = (entry: string): boolean => {
  if (/\*\*Realised by:\*\*\s*\S/.test(entry)) return true
  if (/\bAbandoned\b/.test(entry)) return true
  if (/^\*\*Status:\*\*\s*Planned\b/m.test(entry)) return true
  return false
}

// Implication parsing (ADR-033). The session-end validator refuses to
// close a session with any `Surfaced` Implication. Older session logs
// predate the `## Implications` section and remain valid (no section ⇒
// zero Implications). Each entry mirrors the Goal-block shape:
//
//   ### Implication <id> — title
//
//   **Status:** Surfaced | Promoted | Filed | Dismissed
//   **Rationale:** ... (Schema-required when Status: Dismissed)
//

const IMPLICATION_HEADING = /^###\s+Implication\s+([^\s—-]+)\s*[—-]\s*(.+)$/
const TERMINAL_IMPLICATION_STATUSES: ReadonlySet<string> = new Set([
  'Promoted',
  'Filed',
  'Dismissed',
])

interface ImplicationBlock {
  readonly id: string
  readonly title: string
  readonly status: string | null
  readonly rationale: string | null
}

const parseImplications = (
  implicationsSection: string,
): ReadonlyArray<ImplicationBlock> => {
  const lines = implicationsSection.split('\n')
  const blocks: ImplicationBlock[] = []
  let current: {
    id: string
    title: string
    status: string | null
    rationale: string | null
  } | null = null
  for (const line of lines) {
    const h = line.match(IMPLICATION_HEADING)
    if (h) {
      if (current) blocks.push(current)
      current = {
        id: h[1]!.trim(),
        title: h[2]!.trim(),
        status: null,
        rationale: null,
      }
      continue
    }
    if (current) {
      const s = line.match(STATUS_LINE)
      if (s && current.status === null) {
        current.status = s[1]!.trim()
        continue
      }
      const r = line.match(/^\*\*Rationale:\*\*\s*(.*)$/)
      if (r && current.rationale === null) {
        current.rationale = r[1]!.trim()
      }
    }
  }
  if (current) blocks.push(current)
  return blocks
}

// ---------------------------------------------------------------------------
// Concept

export const SessionEndConcept: Concept<SessionClosure> = concept({
  id: 'session-end-procedure',
  version: '0.0.1',
  description:
    'The typed contract for closing an LF session: validate the log, return SessionEndIncomplete on any failure, stamp Closed atomically on success, update the sessions index.',
  instanceSchema: SessionClosure,
  prose: ConceptProse,
  modality: Modality.Protocol,
})

// ---------------------------------------------------------------------------
// Step 1 — readCurrentLog

export const readCurrentLogStep = effectStep({
  id: StepId('session-end.read-current-log'),
  inputSchema: SessionEndInput,
  outputSchema: ParsedLog,
  prose: TropeProse,
  run: (input) =>
    Effect.gen(function* () {
      const store = yield* SessionStore
      const rawText = yield* store.read(input.sessionPath)
      const header = parseHeader(rawText)
      if (header.status !== 'Open') {
        return yield* Effect.fail(
          new SessionEndMalformed({
            sessionPath: input.sessionPath,
            reason: `expected Status: Open, found: ${header.status ?? '(missing)'}`,
          }),
        )
      }
      const sections = extractSections(rawText)
      return {
        sessionPath: input.sessionPath,
        header: {
          status: header.status,
          plannedBy: header.plannedBy,
        },
        sections,
        rawText,
      }
    }),
})

// ---------------------------------------------------------------------------
// Step 2 — validate

export const validateStep = effectStep({
  id: StepId('session-end.validate'),
  inputSchema: ParsedLog,
  outputSchema: ValidationReport,
  prose: TropeProse,
  run: (parsed) =>
    Effect.sync(() => {
      const missing: string[] = []
      const divergences: string[] = []

      const goals = parsed.sections['goals']
      if (!goals || goals.trim() === '') {
        missing.push('## Goals')
      } else {
        const blocks = parseGoals(goals)
        if (blocks.length === 0) {
          missing.push('## Goals (empty)')
        }
        for (const b of blocks) {
          if (!b.status || !isTerminalGoalStatus(b.status)) {
            missing.push(
              `Goals[${b.number}:${b.title}].Status=terminal (got: ${b.status ?? '(missing)'})`,
            )
          }
        }
      }

      if (!('decisions-made' in parsed.sections)) {
        missing.push('## Decisions Made')
      }

      const workDone = parsed.sections['work-done']
      if (!workDone || workDone.trim() === '') {
        missing.push('## Work Done')
      }

      const summary = parsed.sections['summary']
      if (!summary || summary.trim() === '') {
        missing.push('## Summary')
      }

      if (!('deferred-discovered' in parsed.sections)) {
        missing.push('## Deferred / Discovered')
      }

      const plan = parsed.sections['plan']
      if (plan && plan.trim() !== '') {
        const entries = parsePlanEntries(plan)
        entries.forEach((entry, i) => {
          if (!planEntryIsTerminal(entry)) {
            missing.push(`Plan[${i}].terminal-marker`)
          }
        })
      }

      // Implication validation (ADR-033). The `## Implications` section
      // is optional at v0.1; absent ⇒ valid (backward compat with logs
      // predating the Concept). Present ⇒ every entry must carry a
      // terminal Status (`Promoted | Filed | Dismissed`); a Dismissed
      // entry must additionally carry a non-empty Rationale (the
      // schema-level invariant from `concept-implication`).
      const implications = parsed.sections['implications']
      if (implications && implications.trim() !== '') {
        const blocks = parseImplications(implications)
        for (const b of blocks) {
          if (!b.status || !TERMINAL_IMPLICATION_STATUSES.has(b.status)) {
            missing.push(
              `Implication[${b.id}].terminal-status (got: ${b.status ?? '(missing)'})`,
            )
            continue
          }
          if (b.status === 'Dismissed' && (b.rationale ?? '').trim() === '') {
            missing.push(`Implication[${b.id}].rationale-required-on-Dismissed`)
          }
        }
      }

      return { missing, discoveredDivergences: divergences }
    }),
})

// ---------------------------------------------------------------------------
// Step 3 — stampClosed

const StampClosedInput = Schema.Struct({
  sessionPath: Schema.String,
  logStamp: Schema.String,
})
type StampClosedInput = Schema.Schema.Type<typeof StampClosedInput>

export const stampClosedStep = ioStep({
  id: StepId('session-end.stamp-closed'),
  inputSchema: StampClosedInput,
  outputSchema: SessionClosure,
  prose: TropeProse,
  run: ({ sessionPath, logStamp }) =>
    Effect.gen(function* () {
      const store = yield* SessionStore
      const current = yield* store.read(sessionPath)
      const updated = rewriteHeaderField(
        current,
        'Status',
        `Closed (${logStamp})`,
      )
      yield* store.write(sessionPath, updated)
      return { sessionPath, closedAt: logStamp }
    }),
})

// ---------------------------------------------------------------------------
// Step 4 — updateSessionsIndex

export const updateSessionsIndexStep = ioStep({
  id: StepId('session-end.update-sessions-index'),
  inputSchema: SessionClosure,
  outputSchema: SessionClosure,
  prose: TropeProse,
  run: (closure) =>
    Effect.gen(function* () {
      const store = yield* SessionStore
      const indexPath = 'corpus/sessions/sessions.md'
      const index = yield* store.read(indexPath)
      const parts = closure.sessionPath.split('/')
      const filename = parts[parts.length - 1] ?? ''
      // Match a table row containing the filename; rewrite the last
      // pipe-delimited cell (Status) atomically.
      const lines = index.split('\n')
      let rewritten = false
      const out = lines.map((line) => {
        if (!rewritten && line.includes(filename) && line.trim().startsWith('|')) {
          const cells = line.split('|').map((c) => c)
          // Status cell is the last non-empty before the trailing pipe.
          for (let i = cells.length - 2; i >= 0; i--) {
            if (cells[i]!.trim() !== '') {
              cells[i] = ` Closed (${closure.closedAt}) `
              rewritten = true
              break
            }
          }
          return cells.join('|')
        }
        return line
      })
      yield* store.write(indexPath, out.join('\n'))
      return closure
    }),
})

// ---------------------------------------------------------------------------
// Step 5 — returnClosureRecord (identity terminal node)

export const returnClosureRecordStep = effectStep({
  id: StepId('session-end.return-closure-record'),
  inputSchema: SessionClosure,
  outputSchema: SessionClosure,
  prose: TropeProse,
  run: (closure) => Effect.succeed(closure),
})

// ---------------------------------------------------------------------------
// Composing workflowStep

export const sessionEndStep = workflowStep({
  id: StepId('session-end'),
  inputSchema: SessionEndInput,
  outputSchema: SessionClosure,
  prose: TropeProse,
  dependencies: [
    readCurrentLogStep,
    validateStep,
    stampClosedStep,
    updateSessionsIndexStep,
    returnClosureRecordStep,
  ],
  run: (input) =>
    Effect.gen(function* () {
      const parsed = yield* memo(readCurrentLogStep)(input)
      const report = yield* memo(validateStep)(parsed)

      if (report.missing.length > 0) {
        return yield* Effect.fail(
          new SessionEndIncomplete({
            sessionPath: input.sessionPath,
            missing: report.missing,
          }),
        )
      }

      const store = yield* SessionStore
      const now = yield* store.now()

      const closure = yield* memo(stampClosedStep)({
        sessionPath: input.sessionPath,
        logStamp: now.logStamp,
      })
      yield* memo(updateSessionsIndexStep)(closure)

      return yield* memo(returnClosureRecordStep)(closure)
    }),
})

// ---------------------------------------------------------------------------
// Trope

// Structural contract the authored prose must satisfy (P3 — Goal 1).
export const sessionEndProseSchema = requireMdxStructure({
  h1: 'Session-End Trope',
  h2Slugs: [
    'read-current-log',
    'validate',
    'stamp-closed',
    'update-sessions-index',
    'return-closure-record',
    'composition',
  ],
})

export const sessionEndTrope: Trope<typeof SessionEndConcept> = trope({
  id: 'session-end',
  version: '0.0.1',
  realises: SessionEndConcept,
  prose: TropeProse,
  proseSchema: sessionEndProseSchema,
  realise: sessionEndStep,
  modality: Modality.Protocol,
})

export default sessionEndTrope
