/**
 * `literate update <kind> <id>` (ADR-025 §7, narrowed by S5
 * Goal 2 Correct: no merge UX; consumer's git surfaces the diff).
 *
 * Re-fetch the seed at its recorded registry/ref and overwrite
 * the vendored files. The manifest entry's `fetchedAt` is bumped;
 * `registry` and `ref` stay (use `tangle` with `--registry` to
 * change source).
 */
import * as fs from 'node:fs/promises'
import * as path from 'node:path'

import { findRegistry, readConfig } from '../registry/config.ts'
import { selectFetcher, seedFiles } from '../registry/fetcher.ts'
import {
  addEntry,
  findEntry,
  readManifest,
  writeManifest,
  type ManifestEntry,
  type SeedKind,
} from '../registry/manifest.ts'
import { usageError, type Verb, type VerbContext } from './verb.ts'

export interface RunUpdateOptions {
  readonly repoRoot: string
  readonly kind: SeedKind
  readonly id: string
}

export interface RunUpdateResult {
  readonly entry: ManifestEntry
  readonly overwritten: ReadonlyArray<string>
}

const validKind = (s: string): s is SeedKind =>
  s === 'tropes' || s === 'concepts'

const normaliseKind = (raw: string): SeedKind => {
  const k = raw === 'trope' ? 'tropes' : raw === 'concept' ? 'concepts' : raw
  if (!validKind(k)) {
    throw new Error(
      `update: unknown kind '${raw}'; expected 'tropes' or 'concepts'`,
    )
  }
  return k
}

export const runUpdate = async (
  opts: RunUpdateOptions,
): Promise<RunUpdateResult> => {
  const manifest = await readManifest(opts.repoRoot)
  const existing = findEntry(manifest, opts.kind, opts.id)
  if (!existing) {
    throw new Error(
      `update: ${opts.kind}/${opts.id} is not in .literate/manifest.json — run \`literate tangle\` first`,
    )
  }
  const config = await readConfig(opts.repoRoot)
  const registry = findRegistry(config, existing.registry)
  // Use the registry as configured in literate.json (which may have a
  // newer ref than the manifest's snapshot). The manifest's ref is the
  // last-fetched value, the config's ref is the desired value.
  const fetcher = selectFetcher(registry)
  const files = seedFiles(opts.kind)
  const fetched = await fetcher.fetch({
    registry,
    kind: opts.kind,
    id: opts.id,
    files,
  })

  const overwritten: string[] = []
  for (const { file, content } of fetched.contents) {
    const rel = path.join('.literate', opts.kind, opts.id, file)
    const abs = path.join(opts.repoRoot, rel)
    await fs.mkdir(path.dirname(abs), { recursive: true })
    await fs.writeFile(abs, content, 'utf8')
    overwritten.push(rel)
  }

  const next: ManifestEntry = {
    kind: opts.kind,
    id: opts.id,
    registry: registry.name,
    ref: fetched.resolvedRef,
    fetchedAt: new Date().toISOString(),
    files: overwritten,
  }
  await writeManifest(opts.repoRoot, addEntry(manifest, next))
  return { entry: next, overwritten }
}

const updateVerb: Verb = {
  name: 'update',
  summary:
    'Re-fetch a vendored Trope or Concept at its current registry ref and overwrite the local copy.',
  usage:
    'Usage: literate update <tropes|concepts> <id>\n' +
    '\n' +
    'Re-fetches the seed and overwrites your `.literate/<kind>/<id>/`\n' +
    'files. Your git diff surfaces what changed.\n',

  async run(argv, ctx: VerbContext): Promise<number> {
    if (argv.length !== 2) {
      throw usageError(
        updateVerb,
        `expected <kind> <id>, got ${argv.length} positional argument(s)`,
      )
    }
    const kind = normaliseKind(argv[0]!)
    const id = argv[1]!
    const result = await runUpdate({ repoRoot: ctx.cwd, kind, id })
    ctx.stdout.write(
      `updated ${kind}/${id} from ${result.entry.registry}@${result.entry.ref}\n`,
    )
    for (const f of result.overwritten) ctx.stdout.write(`  ${f}\n`)
    ctx.stdout.write(
      `Diff against your prior copy via git: \`git diff -- .literate/${kind}/${id}/\`\n`,
    )
    return 0
  },
}

export default updateVerb
