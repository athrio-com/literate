/**
 * Registry fetchers (ADR-026 §1). Exposed as a `Context.Tag` service
 * per ADR-028 — tests inject a scripted fetcher; `FetcherServiceLive`
 * dispatches by URL scheme.
 *
 * Three backends behind one interface. Selection is by URL scheme:
 *   - 'github:owner/repo' → HTTPS GET against
 *     `https://raw.githubusercontent.com/owner/repo/<ref>/<path>`
 *   - 'file:///abs/path' or bare paths → read from disk
 *   - 'bundled://' → read from the CLI's embedded asset tree
 *     (`packages/cli/dist/assets/registry/` when installed; the
 *     repo-root `registry/` tree when running from source)
 *
 * Adding a backend is a branch in the service implementation plus a
 * new URL-scheme test. No changes to verbs.
 */
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Context, Effect, Layer } from 'effect'

import { bundledRegistryRoot } from '../assets.ts'
import { RegistryFetchFailed, RegistryUrlMalformed } from '../errors.ts'
import type { Registry } from './config.ts'
import type { SeedKind } from './manifest.ts'

export interface SeedRequest {
  readonly registry: Registry
  readonly kind: SeedKind
  readonly id: string
  /**
   * Files comprising one seed (per ADR-025 §4):
   * for tropes: 'index.ts', 'prose.mdx', 'README.md'
   * for concepts: 'index.ts', 'concept.mdx', 'README.md'
   */
  readonly files: ReadonlyArray<string>
}

export interface FetchedSeed {
  readonly contents: ReadonlyArray<{
    readonly file: string
    readonly content: string
    readonly sourceUrl: string
  }>
  readonly resolvedRef: string
}

const seedRelativePath = (req: SeedRequest, file: string): string =>
  `registry/${req.kind}/${req.id}/${file}`

// ---------------------------------------------------------------------------
// Local backend (file:// + bare path + bundled://)

const BUNDLED_PREFIX = 'bundled:'
const GH_PREFIX = 'github:'

const resolveLocalRoot = (url: string): string => {
  if (url.startsWith('file://')) return fileURLToPath(url)
  if (url.startsWith(BUNDLED_PREFIX)) return bundledRegistryRoot()
  return path.resolve(url)
}

const fetchLocal = (
  req: SeedRequest,
): Effect.Effect<FetchedSeed, RegistryFetchFailed> =>
  Effect.tryPromise({
    try: async () => {
      const root = resolveLocalRoot(req.registry.url)
      const contents = await Promise.all(
        req.files.map(async (file) => {
          const rel = seedRelativePath(req, file)
          const abs = path.join(root, rel)
          const content = await fs.readFile(abs, 'utf8')
          return { file, content, sourceUrl: abs }
        }),
      )
      return {
        contents,
        resolvedRef: req.registry.ref ?? '(local)',
      }
    },
    catch: (e) =>
      new RegistryFetchFailed({
        url: req.registry.url,
        reason: e instanceof Error ? e.message : String(e),
      }),
  })

// ---------------------------------------------------------------------------
// github: backend

const parseGithubUrl = (
  url: string,
): Effect.Effect<{ owner: string; repo: string }, RegistryUrlMalformed> =>
  Effect.gen(function* () {
    const slug = url.slice(GH_PREFIX.length)
    const slash = slug.indexOf('/')
    if (slash === -1) {
      return yield* new RegistryUrlMalformed({
        url,
        reason: `expected 'github:owner/repo'`,
      })
    }
    return { owner: slug.slice(0, slash), repo: slug.slice(slash + 1) }
  })

const fetchOneGithubFile = (
  owner: string,
  repo: string,
  ref: string,
  req: SeedRequest,
  file: string,
): Effect.Effect<
  { file: string; content: string; sourceUrl: string },
  RegistryFetchFailed
> =>
  Effect.gen(function* () {
    const rel = seedRelativePath(req, file)
    const sourceUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${rel}`
    const res = yield* Effect.tryPromise({
      try: () => fetch(sourceUrl),
      catch: (e) =>
        new RegistryFetchFailed({
          url: sourceUrl,
          reason: e instanceof Error ? e.message : String(e),
        }),
    })
    if (!res.ok) {
      return yield* new RegistryFetchFailed({
        url: sourceUrl,
        reason: `HTTP ${res.status} ${res.statusText}`,
      })
    }
    const content = yield* Effect.tryPromise({
      try: () => res.text(),
      catch: (e) =>
        new RegistryFetchFailed({
          url: sourceUrl,
          reason: e instanceof Error ? e.message : String(e),
        }),
    })
    return { file, content, sourceUrl }
  })

const fetchGithub = (
  req: SeedRequest,
): Effect.Effect<FetchedSeed, RegistryFetchFailed | RegistryUrlMalformed> =>
  Effect.gen(function* () {
    const { owner, repo } = yield* parseGithubUrl(req.registry.url)
    const ref = req.registry.ref ?? 'main'
    const contents = yield* Effect.all(
      req.files.map((file) =>
        fetchOneGithubFile(owner, repo, ref, req, file),
      ),
      { concurrency: 'unbounded' },
    )
    return { contents, resolvedRef: ref }
  })

// ---------------------------------------------------------------------------
// Service

export interface FetcherServiceShape {
  readonly fetch: (
    req: SeedRequest,
  ) => Effect.Effect<FetchedSeed, RegistryFetchFailed | RegistryUrlMalformed>
}

export class FetcherService extends Context.Tag(
  '@literate/cli/FetcherService',
)<FetcherService, FetcherServiceShape>() {}

export const FetcherServiceLive = Layer.succeed(FetcherService, {
  fetch: (req) => {
    const url = req.registry.url
    if (url.startsWith(GH_PREFIX)) return fetchGithub(req)
    return fetchLocal(req)
  },
})

export const seedFiles = (kind: SeedKind): ReadonlyArray<string> => {
  if (kind === 'tropes') return ['index.ts', 'prose.mdx', 'README.md']
  return ['index.ts', 'concept.mdx', 'README.md']
}
