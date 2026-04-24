/**
 * Registry fetchers (ADR-026 §1).
 *
 * Three backends behind one interface. Selection is by URL scheme:
 *   - 'github:owner/repo' → HTTPS GET against
 *     `https://raw.githubusercontent.com/owner/repo/<ref>/<path>`
 *   - 'file:///abs/path' or bare paths → read from disk
 *   - 'bundled://' → read from the CLI's embedded asset tree
 *     (`packages/cli/dist/assets/registry/` when installed; the
 *     repo-root `registry/` tree when running from source)
 *
 * Adding a backend is a new module, one entry in `selectFetcher`,
 * and a new URL-scheme test. No changes to verbs.
 */
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

import { bundledRegistryRoot } from '../assets.ts'
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

export interface RegistryFetcher {
  fetch(req: SeedRequest): Promise<FetchedSeed>
}

const seedRelativePath = (req: SeedRequest, file: string): string =>
  `registry/${req.kind}/${req.id}/${file}`

// ---------------------------------------------------------------------------
// file:// + bare-path backend

const BUNDLED_PREFIX = 'bundled:'

const resolveLocalRoot = (url: string): string => {
  if (url.startsWith('file://')) {
    return fileURLToPath(url)
  }
  if (url.startsWith(BUNDLED_PREFIX)) {
    // `bundled://` or `bundled:` — both resolve to the CLI's own
    // embedded registry root. The path component (if any) is
    // ignored at v0.1; all bundled seeds live under one root.
    return bundledRegistryRoot()
  }
  return path.resolve(url)
}

class LocalFetcher implements RegistryFetcher {
  async fetch(req: SeedRequest): Promise<FetchedSeed> {
    const root = resolveLocalRoot(req.registry.url)
    const contents = await Promise.all(
      req.files.map(async (file) => {
        const rel = seedRelativePath(req, file)
        const abs = path.join(root, rel)
        const content = await fs.readFile(abs, 'utf8')
        return { file, content, sourceUrl: abs }
      }),
    )
    // For local registries, ref is ignored (ADR-026 §2).
    return { contents, resolvedRef: req.registry.ref ?? '(local)' }
  }
}

// ---------------------------------------------------------------------------
// github: backend

const GH_PREFIX = 'github:'

const parseGithubUrl = (url: string): { owner: string; repo: string } => {
  const slug = url.slice(GH_PREFIX.length)
  const slash = slug.indexOf('/')
  if (slash === -1) {
    throw new Error(
      `Registry url '${url}' is malformed; expected 'github:owner/repo'`,
    )
  }
  return { owner: slug.slice(0, slash), repo: slug.slice(slash + 1) }
}

class GithubRawFetcher implements RegistryFetcher {
  async fetch(req: SeedRequest): Promise<FetchedSeed> {
    const { owner, repo } = parseGithubUrl(req.registry.url)
    const ref = req.registry.ref ?? 'main'
    const contents = await Promise.all(
      req.files.map(async (file) => {
        const rel = seedRelativePath(req, file)
        const sourceUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${rel}`
        const res = await fetch(sourceUrl)
        if (!res.ok) {
          throw new Error(
            `Registry fetch failed: GET ${sourceUrl} → HTTP ${res.status} ${res.statusText}`,
          )
        }
        const content = await res.text()
        return { file, content, sourceUrl }
      }),
    )
    return { contents, resolvedRef: ref }
  }
}

// ---------------------------------------------------------------------------
// Selection

export const selectFetcher = (registry: Registry): RegistryFetcher => {
  const url = registry.url
  if (url.startsWith(GH_PREFIX)) return new GithubRawFetcher()
  if (url.startsWith('file://')) return new LocalFetcher()
  if (url.startsWith(BUNDLED_PREFIX)) return new LocalFetcher()
  // Bare paths default to local (relative or absolute).
  return new LocalFetcher()
}

export const seedFiles = (kind: SeedKind): ReadonlyArray<string> => {
  if (kind === 'tropes') return ['index.ts', 'prose.mdx', 'README.md']
  return ['index.ts', 'concept.mdx', 'README.md']
}
