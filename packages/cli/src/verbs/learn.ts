/**
 * `literate learn <ref>`.
 *
 * The universal lookup verb. Resolves any annotation, any Trope,
 * any Concept, any LFM reference to its prose body and a compact
 * typed-spec summary. Read-only; never mutates the substrate.
 *
 * Per `corpus/manifests/protocol/learn-and-coherence.md`.
 *
 * Reference forms accepted:
 *   - bare names: `metadata`, `session-start`, `mode`.
 *   - inline directives: `:trope[session-start]`, `:lfm[algebra]`,
 *     `:concept[mode]`.
 *   - leaf/container directive names with density prefix:
 *     `::metadata`, `:::declaration`.
 *   - the annotation surface itself: `@`.
 */
import { Args, Command } from '@effect/cli'
import { Console, Effect, Option } from 'effect'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'

export interface LearnResult {
  readonly kind: 'trope' | 'concept' | 'lfm' | 'annotation' | 'unknown'
  readonly id: string
  readonly path?: string
  readonly prose?: string
  readonly summary: string
}

interface ParsedRef {
  readonly kind: 'trope' | 'concept' | 'lfm' | 'annotation' | 'bare'
  readonly id: string
}

const DIRECTIVE_RE = /^:{1,3}([a-z][a-z0-9-]*)(?:\[([^\]]+)\])?(?:\{[^}]*\})?$/

const parseRef = (raw: string): ParsedRef => {
  const trimmed = raw.trim()
  if (trimmed === '@') return { kind: 'annotation', id: 'annotation' }
  const m = trimmed.match(DIRECTIVE_RE)
  if (m) {
    const directiveName = m[1]!
    const label = m[2]
    const id = label ?? directiveName
    if (directiveName === 'trope') return { kind: 'trope', id }
    if (directiveName === 'concept') return { kind: 'concept', id }
    if (directiveName === 'lfm') return { kind: 'lfm', id }
    // `:metadata` etc. — directive name resolves to a Trope of that id.
    return { kind: 'trope', id: directiveName }
  }
  return { kind: 'bare', id: trimmed }
}

const readMaybe = async (p: string): Promise<string | undefined> => {
  try {
    return await fs.readFile(p, 'utf8')
  } catch {
    return undefined
  }
}

const resolveTrope = async (
  repoRoot: string,
  id: string,
): Promise<LearnResult | undefined> => {
  const dir = path.join(repoRoot, 'registry', 'tropes', id)
  const proseBody = await readMaybe(path.join(dir, 'trope.mdx'))
  if (proseBody === undefined) return undefined
  const indexSrc = await readMaybe(path.join(dir, 'index.ts'))
  const indexHead = indexSrc?.split('\n').slice(0, 30).join('\n')
  return {
    kind: 'trope',
    id,
    path: path.relative(repoRoot, dir),
    prose: proseBody,
    summary:
      `Trope \`${id}\` at \`${path.relative(repoRoot, dir)}/\`.\n` +
      (indexHead
        ? `\n--- index.ts (head) ---\n${indexHead}\n`
        : ''),
  }
}

const resolveConcept = async (
  repoRoot: string,
  id: string,
): Promise<LearnResult | undefined> => {
  const dir = path.join(repoRoot, 'registry', 'concepts', id)
  const proseBody = await readMaybe(path.join(dir, 'concept.mdx'))
  if (proseBody === undefined) return undefined
  const indexSrc = await readMaybe(path.join(dir, 'index.ts'))
  const indexHead = indexSrc?.split('\n').slice(0, 30).join('\n')
  return {
    kind: 'concept',
    id,
    path: path.relative(repoRoot, dir),
    prose: proseBody,
    summary:
      `Concept \`${id}\` at \`${path.relative(repoRoot, dir)}/\`.\n` +
      (indexHead
        ? `\n--- index.ts (head) ---\n${indexHead}\n`
        : ''),
  }
}

const resolveLfm = async (
  repoRoot: string,
  id: string,
): Promise<LearnResult | undefined> => {
  const root = path.join(repoRoot, 'corpus', 'manifests')
  const walk = async (dir: string): Promise<string | undefined> => {
    let entries: import('node:fs').Dirent[]
    try {
      entries = await fs.readdir(dir, { withFileTypes: true })
    } catch {
      return undefined
    }
    for (const e of entries) {
      const full = path.join(dir, e.name)
      if (e.isDirectory()) {
        const found = await walk(full)
        if (found) return found
        continue
      }
      if (!e.name.endsWith('.md')) continue
      if (e.name === `${id}.md`) return full
    }
    return undefined
  }
  const found = await walk(root)
  if (!found) return undefined
  const body = (await readMaybe(found))!
  return {
    kind: 'lfm',
    id,
    path: path.relative(repoRoot, found),
    prose: body,
    summary: `LFM \`${id}\` at \`${path.relative(repoRoot, found)}\`.`,
  }
}

const resolveAnnotation = async (
  repoRoot: string,
): Promise<LearnResult | undefined> => {
  const lfmPath = path.join(
    repoRoot,
    'corpus',
    'manifests',
    'protocol',
    'annotation-substrate.md',
  )
  const body = await readMaybe(lfmPath)
  if (body === undefined) return undefined
  return {
    kind: 'annotation',
    id: '@',
    path: path.relative(repoRoot, lfmPath),
    prose: body,
    summary:
      `Annotation substrate at \`${path.relative(repoRoot, lfmPath)}\`. ` +
      `The \`:\`-prefixed directive surface across three densities ` +
      `(inline, leaf, container). See body for the spec.`,
  }
}

export const runLearn = (opts: {
  readonly repoRoot: string
  readonly ref: string
}): Effect.Effect<LearnResult, never> =>
  Effect.promise(async () => {
    const parsed = parseRef(opts.ref)
    let result: LearnResult | undefined
    if (parsed.kind === 'annotation') {
      result = await resolveAnnotation(opts.repoRoot)
    } else if (parsed.kind === 'trope') {
      result = await resolveTrope(opts.repoRoot, parsed.id)
    } else if (parsed.kind === 'concept') {
      result = await resolveConcept(opts.repoRoot, parsed.id)
    } else if (parsed.kind === 'lfm') {
      result = await resolveLfm(opts.repoRoot, parsed.id)
    } else {
      // `bare` — try Trope first, then Concept, then LFM.
      result =
        (await resolveTrope(opts.repoRoot, parsed.id)) ??
        (await resolveConcept(opts.repoRoot, parsed.id)) ??
        (await resolveLfm(opts.repoRoot, parsed.id))
    }
    return (
      result ?? {
        kind: 'unknown',
        id: parsed.id,
        summary: `no resolution for \`${opts.ref}\``,
      }
    )
  })

const refArg = Args.text({ name: 'ref' }).pipe(
  Args.withDescription(
    'Reference to resolve. Bare id, `:trope[id]`, `:concept[id]`, `:lfm[name]`, `::name`, `:::name`, or `@` for the annotation substrate.',
  ),
)

const repoRootArg = Args.text({ name: 'repoRoot' }).pipe(
  Args.withDescription(
    'Repo root (defaults to the current working directory).',
  ),
  Args.optional,
)

const learnCommand = Command.make(
  'learn',
  { ref: refArg, repoRoot: repoRootArg },
  ({ ref, repoRoot }) =>
    Effect.gen(function* () {
      const resolvedRoot = Option.getOrElse(repoRoot, () => process.cwd())
      const result = yield* runLearn({ repoRoot: resolvedRoot, ref })
      yield* Console.log(`# ${result.kind}: ${result.id}\n`)
      yield* Console.log(result.summary)
      if (result.prose !== undefined) {
        yield* Console.log(`\n--- prose ---\n`)
        yield* Console.log(result.prose)
      }
    }),
).pipe(
  Command.withDescription(
    'Resolve any annotation, Trope, Concept, or LFM reference to its prose body and typed spec summary. Read-only; never mutates the substrate.',
  ),
)

export default learnCommand
