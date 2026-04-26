#!/usr/bin/env bun
/**
 * `scripts/smoke-e2e.ts` — full init-to-close smoke against a
 * local `file://` registry pointing at this repo's own
 * `registry/` tree. Invoked by `scripts/smoke-e2e.sh`.
 *
 * Asserts (each via `console.log` + non-zero exit on failure):
 *   1. `literate init minimal <tmpdir>` returns exit 0.
 *   2. `<tmpdir>/CLAUDE.md` exists.
 *   3. `<tmpdir>/.literate/concepts/<id>/{concept.mdx, index.ts, README.md}`
 *      exists for every Concept in `TEMPLATE_DEFAULT_SEEDS['minimal']`.
 *   4. `<tmpdir>/.literate/tropes/<id>/{trope.mdx, index.ts, README.md}`
 *      exists for every Trope in `TEMPLATE_DEFAULT_SEEDS['minimal']`.
 *   5. `<tmpdir>/.literate/extensions/` is empty (or `.keep`-only).
 *   6. `<tmpdir>/corpus/sessions/` contains exactly one `.md` file
 *      (excluding `sessions.md` index).
 *   7. That file passes `session-end`'s `validateStep` (invoke
 *      validator directly via a fresh `Effect.runPromise`).
 *   8. `literate weave <tmpdir>` is byte-identical on second run.
 *
 * Per the chain prompt's Session 3 G4 acceptance.
 */
import * as fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { Effect } from 'effect'

import {
  validateStep,
  SessionEndIncomplete,
} from '../registry/tropes/session-end/index.ts'

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, '..')

interface SeedSpec {
  readonly kind: 'tropes' | 'concepts'
  readonly id: string
  readonly files: ReadonlyArray<string>
}

// Mirror of `TEMPLATE_DEFAULT_SEEDS['minimal']` from
// `packages/cli/src/verbs/init.ts`. Kept manually in sync; the
// smoke-e2e is the test that catches drift.
const EXPECTED_SEEDS: ReadonlyArray<SeedSpec> = [
  { kind: 'tropes', id: 'session-start', files: ['index.ts', 'trope.mdx', 'README.md', 'SEED.md'] },
  { kind: 'tropes', id: 'session-end',   files: ['index.ts', 'trope.mdx', 'README.md', 'SEED.md'] },
  { kind: 'tropes', id: 'lfm',           files: ['index.ts', 'trope.mdx', 'README.md', 'SEED.md'] },
  { kind: 'tropes', id: 'reconcile',     files: ['index.ts', 'trope.mdx', 'README.md', 'SEED.md'] },
  { kind: 'tropes', id: 'index',         files: ['index.ts', 'trope.mdx', 'README.md', 'SEED.md'] },
  ...(['disposition', 'mode', 'implication', 'session', 'session-status', 'goal', 'goal-status', 'goal-category', 'tag', 'step', 'step-kind', 'lfm', 'lfm-status', 'dispositional-domain', 'layer'] as const).map((id) => ({
    kind: 'concepts' as const,
    id,
    files: ['index.ts', 'concept.mdx', 'README.md', 'SEED.md'],
  })),
]

class SmokeFailure extends Error {
  override readonly name = 'SmokeFailure'
}

const fail = (msg: string): never => {
  throw new SmokeFailure(msg)
}

const log = (msg: string): void => {
  console.log(`[smoke-e2e] ${msg}`)
}

const assertFile = async (p: string, label: string): Promise<void> => {
  if (!existsSync(p)) fail(`missing: ${label} (expected at ${p})`)
}

const runCli = (
  args: ReadonlyArray<string>,
  cwd: string,
  env: NodeJS.ProcessEnv,
): { exitCode: number; stdout: string; stderr: string } => {
  const cliBundle = path.join(repoRoot, 'packages', 'cli', 'dist', 'literate.js')
  if (!existsSync(cliBundle)) {
    fail(
      `CLI bundle not found at ${cliBundle} — run \`bun run --filter '@literate/cli' build\` first`,
    )
  }
  const r = spawnSync('bun', [cliBundle, ...args], {
    cwd,
    env,
    encoding: 'utf8',
  })
  return {
    exitCode: r.status ?? -1,
    stdout: r.stdout ?? '',
    stderr: r.stderr ?? '',
  }
}

// Mirror of session-end's parser surface (kept inline to avoid
// re-exporting internals). The validator's input shape:
//   { sessionPath, header: { status, plannedBy }, sections, rawText }
const parseHeaderForSmoke = (content: string): {
  status: string | null
  plannedBy: string | null
} => {
  const lines = content.split('\n')
  const fields: Record<string, string> = {}
  let seen = false
  for (const line of lines) {
    const m = line.match(/^\*\*([^:]+):\*\*\s*(.*)$/)
    if (m) {
      fields[m[1]!.toLowerCase().replace(/\s+/g, '')] = m[2]!.trim()
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

const extractSectionsForSmoke = (content: string): Record<string, string> => {
  const lines = content.split('\n')
  const out: Record<string, string> = {}
  let currentSlug: string | null = null
  let buf: string[] = []
  const flush = (): void => {
    if (currentSlug !== null) out[currentSlug] = buf.join('\n').trim()
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

const main = async (): Promise<void> => {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'lf-smoke-e2e-'))
  const target = path.join(tmpRoot, 'sample')
  log(`tmp target: ${target}`)

  let cleanupOk = false
  try {
    // Step 1 — `literate init minimal <target>` against this repo
    //          as a `file://` registry.
    log('init: literate init minimal …')
    const initResult = runCli(
      [
        'init',
        target,
        '--template',
        'minimal',
        '--registry-url',
        `file://${repoRoot}`,
        '--registry-ref',
        'main',
      ],
      tmpRoot,
      process.env,
    )
    if (initResult.exitCode !== 0) {
      fail(
        `init exited ${initResult.exitCode}\nstdout:\n${initResult.stdout}\nstderr:\n${initResult.stderr}`,
      )
    }

    // Step 2 — CLAUDE.md exists at root.
    await assertFile(path.join(target, 'CLAUDE.md'), 'CLAUDE.md (repo-root pointer)')
    log('asserted: CLAUDE.md present')

    // Step 3 + 4 — every expected seed materialised.
    for (const seed of EXPECTED_SEEDS) {
      for (const f of seed.files) {
        await assertFile(
          path.join(target, '.literate', seed.kind, seed.id, f),
          `.literate/${seed.kind}/${seed.id}/${f}`,
        )
      }
    }
    log(
      `asserted: ${EXPECTED_SEEDS.length} seed(s) materialised (${EXPECTED_SEEDS.filter((s) => s.kind === 'tropes').length} tropes + ${EXPECTED_SEEDS.filter((s) => s.kind === 'concepts').length} concepts)`,
    )

    // Step 5 — extensions/ is empty or .keep-only.
    const extDir = path.join(target, '.literate', 'extensions')
    const extEntries = (await fs.readdir(extDir)).filter(
      (e) => e !== '.keep' && e !== '.gitkeep',
    )
    if (extEntries.length > 0) {
      fail(
        `.literate/extensions/ contains unexpected entries: ${extEntries.join(', ')}`,
      )
    }
    log('asserted: .literate/extensions/ is empty (.keep-only)')

    // Step 6 — exactly one session log (excluding the index).
    const sessionsDir = path.join(target, 'corpus', 'sessions')
    const sessionFiles = (await fs.readdir(sessionsDir))
      .filter((f) => f.endsWith('.md') && f !== 'sessions.md')
    if (sessionFiles.length !== 1) {
      fail(
        `expected exactly 1 session log; found ${sessionFiles.length}: ${sessionFiles.join(', ')}`,
      )
    }
    const sessionLogRel = `corpus/sessions/${sessionFiles[0]!}`
    log(`asserted: 1 session log present at ${sessionLogRel}`)

    // Step 7 — session-end's validator passes against the log.
    //          (Init already stamped Closed; we re-validate the
    //          structural contract directly via `validateStep`.)
    const sessionAbs = path.join(target, sessionLogRel)
    const rawText = await fs.readFile(sessionAbs, 'utf8')
    const header = parseHeaderForSmoke(rawText)
    const sections = extractSectionsForSmoke(rawText)
    const parsed = {
      sessionPath: sessionLogRel,
      header: { status: header.status, plannedBy: header.plannedBy },
      sections,
      rawText,
    }
    const report = await Effect.runPromise(
      validateStep.realise(parsed) as Effect.Effect<
        { missing: ReadonlyArray<string>; discoveredDivergences: ReadonlyArray<string> },
        SessionEndIncomplete | unknown
      >,
    )
    if (report.missing.length > 0) {
      fail(
        `validateStep reported missing items:\n  - ${report.missing.join('\n  - ')}`,
      )
    }
    log('asserted: validateStep reports zero missing items against the first-session log')

    // Step 8 — `literate weave` is byte-identical on second run.
    const literateMd = path.join(target, '.literate', 'LITERATE.md')
    const before = await fs.readFile(literateMd)
    const weaveResult = runCli(['weave'], target, process.env)
    if (weaveResult.exitCode !== 0) {
      fail(
        `weave exited ${weaveResult.exitCode}\nstdout:\n${weaveResult.stdout}\nstderr:\n${weaveResult.stderr}`,
      )
    }
    const after = await fs.readFile(literateMd)
    if (Buffer.compare(before, after) !== 0) {
      fail('weave is not byte-idempotent — second invocation produced a different LITERATE.md')
    }
    log('asserted: weave is byte-idempotent')

    cleanupOk = true
    log('OK — all assertions passed')
  } finally {
    if (cleanupOk) {
      await fs.rm(tmpRoot, { recursive: true, force: true })
    } else {
      console.error(
        `[smoke-e2e] left tmp tree intact for inspection: ${tmpRoot}`,
      )
    }
  }
}

try {
  await main()
} catch (e) {
  if (e instanceof SmokeFailure) {
    console.error(`\n[smoke-e2e] FAIL: ${e.message}`)
    process.exit(1)
  }
  console.error(`\n[smoke-e2e] FAIL (unexpected):`, e)
  process.exit(2)
}
