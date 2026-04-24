/**
 * `.literate/manifest.json` read/write (ADR-025 §5, ADR-026 §5).
 * Exposed as a `Context.Tag` service per ADR-028 — tests inject an
 * in-memory variant; `ManifestServiceLive` reads/writes the file.
 *
 * Schema:
 *
 *   {
 *     "$schema": "literate-manifest/v0",
 *     "vendored": [{ kind, id, registry, ref, fetchedAt, files }]
 *   }
 *
 * Insertion-ordered; `addEntry` replaces an existing entry by
 * (kind, id) so re-tangle / update preserves position.
 */
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { Context, Effect, Layer } from 'effect'

import { ManifestReadError, ManifestWriteError } from '../errors.ts'

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

export interface ManifestServiceShape {
  readonly read: (
    repoRoot: string,
  ) => Effect.Effect<Manifest, ManifestReadError>
  readonly write: (
    repoRoot: string,
    manifest: Manifest,
  ) => Effect.Effect<void, ManifestWriteError>
}

export class ManifestService extends Context.Tag(
  '@literate/cli/ManifestService',
)<ManifestService, ManifestServiceShape>() {}

export const ManifestServiceLive = Layer.succeed(ManifestService, {
  read: (repoRoot: string) =>
    Effect.gen(function* () {
      const p = manifestPath(repoRoot)
      const raw: string | null = yield* Effect.tryPromise({
        try: () => fs.readFile(p, 'utf8'),
        catch: () => null,
      }).pipe(Effect.catchAll(() => Effect.succeed(null)))
      if (raw === null) return EMPTY
      const parsed = yield* Effect.try({
        try: () => JSON.parse(raw) as Partial<Manifest>,
        catch: (e) =>
          new ManifestReadError({
            path: p,
            reason: e instanceof Error ? e.message : String(e),
          }),
      })
      if (parsed.$schema !== 'literate-manifest/v0') {
        return yield* new ManifestReadError({
          path: p,
          reason: `unknown $schema '${parsed.$schema ?? '(missing)'}'; expected 'literate-manifest/v0'`,
        })
      }
      return {
        $schema: 'literate-manifest/v0' as const,
        vendored: Array.isArray(parsed.vendored) ? parsed.vendored : [],
      }
    }),
  write: (repoRoot, manifest) =>
    Effect.tryPromise({
      try: async () => {
        const p = manifestPath(repoRoot)
        await fs.mkdir(path.dirname(p), { recursive: true })
        await fs.writeFile(p, JSON.stringify(manifest, null, 2) + '\n', 'utf8')
      },
      catch: (e) =>
        new ManifestWriteError({
          path: manifestPath(repoRoot),
          reason: e instanceof Error ? e.message : String(e),
        }),
    }),
})
