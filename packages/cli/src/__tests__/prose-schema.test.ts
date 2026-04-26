/**
 * P3 Goal 1 smoke test — `proseSchema` validation during weave.
 *
 * Exercises the weaver's validation path against the two bundled
 * Tropes (session-start, session-end):
 *
 *   1. Structurally-correct fixture — canonical `trope.mdx` copied
 *      from `registry/`. Weave succeeds; `LITERATE.md` is written.
 *   2. Structurally-broken fixture — same seeds, but one required
 *      H2 section deleted from `session-start/trope.mdx`. Weave
 *      throws `ProseSchemaViolations` naming the missing slug;
 *      `LITERATE.md` is NOT written (aggregate-before-write per
 *      session-end validator pattern).
 */
import { afterAll, beforeAll, describe, expect, test } from 'bun:test'
import * as fs from 'node:fs/promises'
import * as os from 'node:os'
import * as path from 'node:path'
import { Cause, Effect, Exit } from 'effect'

import { ManifestServiceLive } from '../registry/manifest.ts'
import {
  weaveProgram,
  ProseSchemaViolations,
  type WeaveResult,
} from '../weaver/weaver.ts'

const weave = (repoRoot: string): Promise<WeaveResult> =>
  Effect.runPromise(
    weaveProgram(repoRoot).pipe(Effect.provide(ManifestServiceLive)),
  )

const weaveExit = (repoRoot: string) =>
  Effect.runPromiseExit(
    weaveProgram(repoRoot).pipe(Effect.provide(ManifestServiceLive)),
  )

const LF_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..')

const now = () => new Date().toISOString()

const seedManifest = async (repo: string): Promise<void> => {
  const manifest = {
    $schema: 'literate-manifest/v0',
    vendored: [
      {
        kind: 'tropes',
        id: 'session-start',
        registry: 'literate',
        ref: 'main',
        fetchedAt: now(),
        files: ['index.ts', 'trope.mdx', 'README.md'],
      },
      {
        kind: 'tropes',
        id: 'session-end',
        registry: 'literate',
        ref: 'main',
        fetchedAt: now(),
        files: ['index.ts', 'trope.mdx', 'README.md'],
      },
    ],
  }
  await fs.mkdir(path.join(repo, '.literate'), { recursive: true })
  await fs.writeFile(
    path.join(repo, '.literate', 'manifest.json'),
    JSON.stringify(manifest, null, 2) + '\n',
    'utf8',
  )
}

const copyVendored = async (repo: string, id: string): Promise<void> => {
  const src = path.join(LF_REPO_ROOT, 'registry', 'tropes', id)
  const dst = path.join(repo, '.literate', 'tropes', id)
  await fs.mkdir(dst, { recursive: true })
  for (const f of ['index.ts', 'trope.mdx', 'README.md']) {
    await fs.copyFile(path.join(src, f), path.join(dst, f))
  }
}

describe('weave — proseSchema validation (P3)', () => {
  let tmp = ''

  beforeAll(async () => {
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'lf-prose-schema-'))
  })

  afterAll(async () => {
    if (tmp) await fs.rm(tmp, { recursive: true, force: true })
  })

  test('structurally-correct vendored Tropes → weave succeeds', async () => {
    const repo = path.join(tmp, 'good')
    await fs.mkdir(repo, { recursive: true })
    await seedManifest(repo)
    await copyVendored(repo, 'session-start')
    await copyVendored(repo, 'session-end')

    const result = await weave(repo)
    expect(result.tropesIncluded).toEqual([
      'vendored:session-start',
      'vendored:session-end',
    ])
    const literateMd = await fs.readFile(result.literateMdPath, 'utf8')
    expect(literateMd).toContain('### `session-start`')
    expect(literateMd).toContain('### `session-end`')
  })

  test('missing required H2 → ProseSchemaViolations, no file write', async () => {
    const repo = path.join(tmp, 'broken')
    await fs.mkdir(repo, { recursive: true })
    await seedManifest(repo)
    await copyVendored(repo, 'session-start')
    await copyVendored(repo, 'session-end')

    // Delete the `## Detect start path` section from session-start,
    // which is a required H2 per its proseSchema.
    const prosePath = path.join(
      repo,
      '.literate',
      'tropes',
      'session-start',
      'trope.mdx',
    )
    const original = await fs.readFile(prosePath, 'utf8')
    const mutated = original.replace(
      /## Detect start path[\s\S]*?(?=\n## )/,
      '',
    )
    expect(mutated).not.toBe(original)
    await fs.writeFile(prosePath, mutated, 'utf8')

    // LITERATE.md from any prior test run in this dir should not exist.
    const literateMdPath = path.join(repo, '.literate', 'LITERATE.md')
    await fs.rm(literateMdPath, { force: true })

    const exit = await weaveExit(repo)
    expect(Exit.isFailure(exit)).toBe(true)
    const failure = Exit.isFailure(exit)
      ? Cause.failureOption(exit.cause)
      : null
    const err = failure && failure._tag === 'Some' ? failure.value : null
    expect(err).toBeInstanceOf(ProseSchemaViolations)
    const violations = (err as ProseSchemaViolations).violations
    expect(violations).toHaveLength(1)
    const v = violations[0]!
    expect(v.tropeId).toBe('session-start')
    expect(v.path).toBe('.literate/tropes/session-start/trope.mdx')
    expect(v.got).toContain('detect-start-path')

    // Weave did not write LITERATE.md — validation happens before write.
    const exists = await fs
      .access(literateMdPath)
      .then(() => true)
      .catch(() => false)
    expect(exists).toBe(false)
  })
})
