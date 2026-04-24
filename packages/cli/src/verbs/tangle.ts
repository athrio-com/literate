/**
 * `literate tangle <kind> <id> [--registry <name>]` (ADR-025 §2).
 *
 * Fetch one seed from the configured registry, place its files at
 * `.literate/<kind>/<id>/...`, update `.literate/manifest.json`.
 * Mechanical and idempotent — re-running with the same args
 * re-fetches and overwrites (use `update` for the same effect with
 * intent-bearing semantics; `tangle` is the new-vendor verb).
 */
import * as fs from 'node:fs/promises'
import * as path from 'node:path'

import { findRegistry, readConfig } from '../registry/config.ts'
import { selectFetcher, seedFiles } from '../registry/fetcher.ts'
import {
  addEntry,
  readManifest,
  writeManifest,
  type ManifestEntry,
  type SeedKind,
} from '../registry/manifest.ts'
import { usageError, type Verb, type VerbContext } from './verb.ts'

export interface RunTangleOptions {
  readonly repoRoot: string
  readonly kind: SeedKind
  readonly id: string
  readonly registryName?: string
}

export interface RunTangleResult {
  readonly entry: ManifestEntry
  readonly placed: ReadonlyArray<string>
}

const validKind = (s: string): s is SeedKind =>
  s === 'tropes' || s === 'concepts'

const normaliseKind = (raw: string): SeedKind => {
  const k = raw === 'trope' ? 'tropes' : raw === 'concept' ? 'concepts' : raw
  if (!validKind(k)) {
    throw new Error(
      `tangle: unknown kind '${raw}'; expected 'tropes' or 'concepts'`,
    )
  }
  return k
}

export const runTangle = async (
  opts: RunTangleOptions,
): Promise<RunTangleResult> => {
  const config = await readConfig(opts.repoRoot)
  const registry = findRegistry(config, opts.registryName)
  const fetcher = selectFetcher(registry)
  const files = seedFiles(opts.kind)
  const fetched = await fetcher.fetch({
    registry,
    kind: opts.kind,
    id: opts.id,
    files,
  })

  const placed: string[] = []
  for (const { file, content } of fetched.contents) {
    const rel = path.join('.literate', opts.kind, opts.id, file)
    const abs = path.join(opts.repoRoot, rel)
    await fs.mkdir(path.dirname(abs), { recursive: true })
    await fs.writeFile(abs, content, 'utf8')
    placed.push(rel)
  }

  const manifest = await readManifest(opts.repoRoot)
  const entry: ManifestEntry = {
    kind: opts.kind,
    id: opts.id,
    registry: registry.name,
    ref: fetched.resolvedRef,
    fetchedAt: new Date().toISOString(),
    files: placed,
  }
  await writeManifest(opts.repoRoot, addEntry(manifest, entry))

  return { entry, placed }
}

const tangleVerb: Verb = {
  name: 'tangle',
  summary: 'Fetch a Trope or Concept seed from a registry and vendor it.',
  usage:
    'Usage: literate tangle <tropes|concepts> <id> [--registry <name>]\n' +
    '\n' +
    'Examples:\n' +
    '  literate tangle tropes session-start\n' +
    '  literate tangle concepts disposition --registry literate\n',

  async run(argv, ctx: VerbContext): Promise<number> {
    let registryName: string | undefined
    const positional: string[] = []
    for (let i = 0; i < argv.length; i++) {
      const a = argv[i]!
      if (a === '--registry' || a === '-r') {
        registryName = argv[++i]
        if (!registryName) throw usageError(tangleVerb, '--registry needs a value')
      } else {
        positional.push(a)
      }
    }
    if (positional.length !== 2) {
      throw usageError(
        tangleVerb,
        `expected <kind> <id>, got ${positional.length} positional argument(s)`,
      )
    }
    const kind = normaliseKind(positional[0]!)
    const id = positional[1]!

    const result = await runTangle({
      repoRoot: ctx.cwd,
      kind,
      id,
      ...(registryName !== undefined ? { registryName } : {}),
    })
    ctx.stdout.write(
      `tangled ${kind}/${id} from ${result.entry.registry}@${result.entry.ref}\n`,
    )
    for (const f of result.placed) ctx.stdout.write(`  ${f}\n`)
    return 0
  },
}

export default tangleVerb
