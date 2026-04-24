/**
 * `.literate/manifest.json` read/write (ADR-025 §5, ADR-026 §5).
 *
 * The CLI is authoritative for writes; consumers may read. Schema:
 *
 *   {
 *     "$schema": "literate-manifest/v0",
 *     "vendored": [{ kind, id, registry, ref, fetchedAt, files }]
 *   }
 *
 * Insertion-ordered; addEntry replaces an existing entry by
 * (kind, id) so re-tangle / update preserves position.
 */
import * as fs from 'node:fs/promises'
import * as path from 'node:path'

export type SeedKind = 'tropes' | 'concepts'

export interface ManifestEntry {
  readonly kind: SeedKind
  readonly id: string
  readonly registry: string
  readonly ref: string
  readonly fetchedAt: string
  readonly files: ReadonlyArray<string>
}

export interface Manifest {
  readonly $schema: 'literate-manifest/v0'
  readonly vendored: ReadonlyArray<ManifestEntry>
}

const EMPTY: Manifest = { $schema: 'literate-manifest/v0', vendored: [] }

export const manifestPath = (repoRoot: string): string =>
  path.join(repoRoot, '.literate', 'manifest.json')

export const readManifest = async (repoRoot: string): Promise<Manifest> => {
  const p = manifestPath(repoRoot)
  let raw: string
  try {
    raw = await fs.readFile(p, 'utf8')
  } catch {
    return EMPTY
  }
  const parsed = JSON.parse(raw) as Partial<Manifest>
  if (parsed.$schema !== 'literate-manifest/v0') {
    throw new Error(
      `${p}: unknown $schema '${parsed.$schema ?? '(missing)'}'; expected 'literate-manifest/v0'`,
    )
  }
  return {
    $schema: 'literate-manifest/v0',
    vendored: Array.isArray(parsed.vendored) ? parsed.vendored : [],
  }
}

export const writeManifest = async (
  repoRoot: string,
  manifest: Manifest,
): Promise<void> => {
  const p = manifestPath(repoRoot)
  await fs.mkdir(path.dirname(p), { recursive: true })
  await fs.writeFile(p, JSON.stringify(manifest, null, 2) + '\n', 'utf8')
}

export const addEntry = (
  manifest: Manifest,
  entry: ManifestEntry,
): Manifest => {
  const idx = manifest.vendored.findIndex(
    (e) => e.kind === entry.kind && e.id === entry.id,
  )
  if (idx === -1) {
    return { ...manifest, vendored: [...manifest.vendored, entry] }
  }
  const next = manifest.vendored.slice()
  next[idx] = entry
  return { ...manifest, vendored: next }
}

export const findEntry = (
  manifest: Manifest,
  kind: SeedKind,
  id: string,
): ManifestEntry | undefined =>
  manifest.vendored.find((e) => e.kind === kind && e.id === id)

export const removeEntry = (
  manifest: Manifest,
  kind: SeedKind,
  id: string,
): Manifest => ({
  ...manifest,
  vendored: manifest.vendored.filter(
    (e) => !(e.kind === kind && e.id === id),
  ),
})
