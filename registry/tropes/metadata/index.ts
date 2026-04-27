/**
 * `tropes/metadata` — parse and serialise typed head-of-file
 * metadata blocks. Bound to `concepts/metadata`. See `trope.mdx`
 * for the imperative decomposition and the bound Concept's
 * `concept.mdx` for the typed contract.
 *
 * Distribution shape: registry seed at
 * `registry/tropes/metadata/index.ts`. Bundled by the CLI for the
 * `reconcile` verb (which calls the parse/serialise helpers
 * during its YAML → directive migration step). Tangled into a
 * consumer repo via `literate tangle tropes metadata`.
 *
 * The Trope exposes:
 *   - `MetadataConcept` — the Concept this Trope realises (re-export).
 *   - `parseMetadataBlock` — parse either wire form from the head
 *     of a file; returns `{ form, meta, headerRaw, body }` or `null`.
 *   - `serialiseMetadataBlock` — emit the canonical
 *     `::metadata{...}` directive form.
 *   - `parseMetadataDirective` — narrow parser for the directive
 *     form alone (regex-driven; matches the head-of-file leaf).
 *   - `parseYamlFrontmatter` — narrow parser for the legacy
 *     `---` form alone.
 *   - `metadataStep` — the composing `workflowStep`.
 *   - `metadataTrope` — the `Trope<typeof MetadataConcept>`.
 */
import { Effect, Schema } from 'effect'
import {
  effectStep,
  memo,
  prose,
  requireMdxStructure,
  StepId,
  trope,
  workflowStep,
  type Trope,
} from '@literate/core'

import {
  MetadataConcept,
  MetadataSchema,
  type Metadata,
} from '../../concepts/metadata/index.ts'

// ---------------------------------------------------------------------------
// Prose refs

const TropeProse = prose(import.meta.url, './trope.mdx')

// ---------------------------------------------------------------------------
// Re-exports

export { MetadataConcept, MetadataSchema, type Metadata }

// ---------------------------------------------------------------------------
// Wire-form types

export type MetadataForm = 'directive' | 'yaml'

export interface ParsedMetadataBlock {
  /** Which wire form the head-of-file block used. */
  readonly form: MetadataForm
  /** The typed key→string record extracted from the block. */
  readonly meta: Metadata
  /** The raw header text, including its delimiters. */
  readonly headerRaw: string
  /**
   * The body text below the header. A single leading blank line
   * is stripped so the body is stable across `header\n\n# body`
   * and `header\n# body`.
   */
  readonly body: string
}

// ---------------------------------------------------------------------------
// Pure helpers — directive-form parse / serialise
//
// The directive form is a single line of the shape:
//   `::metadata{key=val, key=val, ...}`
// optionally followed by a blank line and a body. Values may be
// bare tokens, single-quoted strings, or compact JSON-ish object
// literals (`{base:'Protocol', scope:'algebra'}`) which we keep
// verbatim — interpretation is the consumer's job.

const DIRECTIVE_PREFIX = '::metadata{'

/**
 * Locate the closing `}` of a head-of-file `::metadata{...}`
 * directive by walking brace / bracket / quote depth from the
 * opening `{`. Returns the index of the matching `}` (one past
 * the payload), or `-1` when the input does not start with the
 * directive prefix or the directive is unterminated.
 */
const findDirectiveClose = (content: string): number => {
  if (!content.startsWith(DIRECTIVE_PREFIX)) return -1
  const start = DIRECTIVE_PREFIX.length
  let depthBrace = 1
  let depthBracket = 0
  let inSingle = false
  let inDouble = false
  for (let i = start; i < content.length; i++) {
    const ch = content[i]!
    if (inSingle) {
      if (ch === "'" && content[i - 1] !== '\\') inSingle = false
      continue
    }
    if (inDouble) {
      if (ch === '"' && content[i - 1] !== '\\') inDouble = false
      continue
    }
    if (ch === "'") {
      inSingle = true
      continue
    }
    if (ch === '"') {
      inDouble = true
      continue
    }
    if (ch === '[') depthBracket += 1
    else if (ch === ']') depthBracket -= 1
    else if (ch === '{') depthBrace += 1
    else if (ch === '}') {
      depthBrace -= 1
      if (depthBrace === 0 && depthBracket === 0) return i
    }
    else if (ch === '\n' && depthBrace === 1 && depthBracket === 0) {
      // Directive must close on the same line at the top level —
      // a newline at depth 1 means the directive is malformed.
      return -1
    }
  }
  return -1
}

/**
 * Split a `::metadata{...}` attribute payload into ordered
 * `(key, value)` pairs. Values that contain commas inside braces,
 * brackets, or quoted strings are preserved verbatim — the
 * splitter walks brace / bracket / quote depth so an outer
 * top-level `,` is the only separator that triggers a break.
 */
export const splitDirectiveAttrs = (
  payload: string,
): ReadonlyArray<readonly [string, string]> => {
  const out: Array<readonly [string, string]> = []
  let depthBrace = 0
  let depthBracket = 0
  let inSingle = false
  let inDouble = false
  let buf = ''
  const flush = (): void => {
    const trimmed = buf.trim()
    buf = ''
    if (trimmed === '') return
    const eq = trimmed.indexOf('=')
    if (eq < 0) return
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    // Strip a single layer of single or double quotes when they
    // wrap the entire value.
    if (
      (value.startsWith("'") && value.endsWith("'") && value.length >= 2) ||
      (value.startsWith('"') && value.endsWith('"') && value.length >= 2)
    ) {
      value = value.slice(1, -1)
    }
    if (key !== '') out.push([key, value])
  }
  for (let i = 0; i < payload.length; i++) {
    const ch = payload[i]!
    if (inSingle) {
      buf += ch
      if (ch === "'" && payload[i - 1] !== '\\') inSingle = false
      continue
    }
    if (inDouble) {
      buf += ch
      if (ch === '"' && payload[i - 1] !== '\\') inDouble = false
      continue
    }
    if (ch === "'") {
      inSingle = true
      buf += ch
      continue
    }
    if (ch === '"') {
      inDouble = true
      buf += ch
      continue
    }
    if (ch === '{') {
      depthBrace += 1
      buf += ch
      continue
    }
    if (ch === '}') {
      depthBrace -= 1
      buf += ch
      continue
    }
    if (ch === '[') {
      depthBracket += 1
      buf += ch
      continue
    }
    if (ch === ']') {
      depthBracket -= 1
      buf += ch
      continue
    }
    if (ch === ',' && depthBrace === 0 && depthBracket === 0) {
      flush()
      continue
    }
    buf += ch
  }
  flush()
  return out
}

/**
 * Parse the head-of-file directive form `::metadata{...}` if
 * present. Returns the typed metadata record plus the body, or
 * `null` when the input does not start with the directive.
 */
export const parseMetadataDirective = (
  content: string,
): ParsedMetadataBlock | null => {
  const close = findDirectiveClose(content)
  if (close < 0) return null
  const payload = content.slice(DIRECTIVE_PREFIX.length, close)
  // Skip past the closing `}` and an optional trailing newline.
  let bodyStart = close + 1
  if (content[bodyStart] === '\n') bodyStart += 1
  // Drop a single leading blank line so the body is stable
  // across `directive\n\n# body` and `directive\n# body`.
  let body = content.slice(bodyStart)
  if (body.startsWith('\n')) body = body.slice(1)
  const meta: Record<string, string> = {}
  for (const [k, v] of splitDirectiveAttrs(payload)) {
    meta[k] = v
  }
  const headerRaw = `${DIRECTIVE_PREFIX}${payload}}`
  return { form: 'directive', meta, headerRaw, body }
}

// ---------------------------------------------------------------------------
// Pure helpers — YAML form parse (legacy)
//
// The legacy YAML frontmatter is a `---`-fenced block of
// `key: value` lines. We keep values raw (including JSON-ish
// object literals) for substrate-level honesty.

/**
 * Parse the legacy YAML `---`-fenced frontmatter form if
 * present. Returns the typed metadata record plus the body, or
 * `null` when the input does not start with the YAML form.
 */
export const parseYamlFrontmatter = (
  content: string,
): ParsedMetadataBlock | null => {
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
  const body = (bodyLines[0] === '' ? bodyLines.slice(1) : bodyLines).join(
    '\n',
  )
  const meta: Record<string, string> = {}
  for (const line of headerLines) {
    const m = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/)
    if (m) meta[m[1]!] = m[2]!.trim()
  }
  const headerRaw = lines.slice(0, endIdx + 1).join('\n')
  return { form: 'yaml', meta, headerRaw, body }
}

// ---------------------------------------------------------------------------
// Unified parse — directive form first, YAML fallback

/**
 * Parse the head-of-file metadata block in either wire form.
 * Tries the canonical directive form first; falls back to the
 * legacy YAML form. Returns `null` when neither matches.
 */
export const parseMetadataBlock = (
  content: string,
): ParsedMetadataBlock | null =>
  parseMetadataDirective(content) ?? parseYamlFrontmatter(content)

// ---------------------------------------------------------------------------
// Serialise — canonical directive form

const ORDERED_KEYS: ReadonlyArray<string> = [
  'id',
  'disposition',
  'layer',
  'domain',
  'status',
  'dependencies',
]

/**
 * Determine whether a value needs single-quoting in the
 * directive form. Bare tokens (alphanumeric + a few punct chars)
 * round-trip without quotes; values containing whitespace,
 * commas, or quote chars need wrapping.
 */
const needsQuoting = (value: string): boolean => {
  if (value === '') return true
  return /[\s,'"`]/.test(value)
}

const quoteValue = (value: string): string => {
  if (!needsQuoting(value)) return value
  // JSON-ish object / array literals are bare-token-ish for our
  // purposes — they balance their own braces/brackets and don't
  // contain unescaped single quotes at top level. Keep them
  // verbatim if they round-trip without ambiguity. The
  // attribute splitter already walks brace depth, so an unquoted
  // `{base:'Protocol'}` is a single attribute value.
  const trimmed = value.trim()
  if (
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
  ) {
    return trimmed
  }
  // Use single quotes; escape any embedded single quotes.
  return `'${value.replace(/'/g, "\\'")}'`
}

/**
 * Emit the canonical `::metadata{...}` directive form for a
 * given metadata record. Keys are ordered: the canonical six
 * (`id`, `disposition`, `layer`, `domain`, `status`,
 * `dependencies`) come first in declaration order; any extra
 * keys follow in insertion order.
 */
export const serialiseMetadataBlock = (meta: Metadata): string => {
  const parts: string[] = []
  const seen = new Set<string>()
  for (const key of ORDERED_KEYS) {
    const value = meta[key]
    if (value === undefined || value === '') continue
    parts.push(`${key}=${quoteValue(value)}`)
    seen.add(key)
  }
  for (const key of Object.keys(meta)) {
    if (seen.has(key)) continue
    const value = meta[key]
    if (value === undefined || value === '') continue
    parts.push(`${key}=${quoteValue(value)}`)
  }
  return `::metadata{${parts.join(', ')}}`
}

// ---------------------------------------------------------------------------
// Realise — round-trip identity Step
//
// The Trope's realise is a minimal effect Step: parse a metadata
// record against the schema, return it. The substrate-level
// guarantee the Step provides is "this record validates against
// `MetadataSchema`"; the heavy lifting is in the exported pure
// helpers (`parseMetadataBlock`, `serialiseMetadataBlock`).

const RealiseInput = Schema.Struct({ meta: MetadataSchema })
type RealiseInput = Schema.Schema.Type<typeof RealiseInput>

const RealiseOutput = Schema.Struct({ meta: MetadataSchema })
type RealiseOutput = Schema.Schema.Type<typeof RealiseOutput>

export const validateMetadataStep = effectStep({
  id: StepId('metadata.validate'),
  inputSchema: RealiseInput,
  outputSchema: RealiseOutput,
  prose: TropeProse,
  run: (input) => Effect.succeed(input as RealiseOutput),
})

export const metadataStep = workflowStep({
  id: StepId('metadata'),
  inputSchema: RealiseInput,
  outputSchema: RealiseOutput,
  prose: TropeProse,
  dependencies: [validateMetadataStep],
  run: (input) =>
    Effect.gen(function* () {
      return yield* memo(validateMetadataStep)(input)
    }),
})

// ---------------------------------------------------------------------------
// Trope

export const metadataProseSchema = requireMdxStructure({
  h1: 'Metadata Trope',
  h2Slugs: ['parse', 'serialise', 'validate', 'composition'],
})

export const metadataTrope: Trope<typeof MetadataConcept> = trope({
  id: 'metadata',
  version: '0.1.0',
  realises: MetadataConcept,
  disposition: { base: 'Protocol', scope: 'metadata-substrate' },
  prose: TropeProse,
  proseSchema: metadataProseSchema,
  realise: metadataStep,
})

export default metadataTrope
