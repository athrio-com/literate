/**
 * Build script for `@literate/cli`. Produces a Node-runnable bundle
 * at `packages/cli/dist/literate.js` plus an embedded asset tree at
 * `packages/cli/dist/assets/{template-minimal,registry}/` (per
 * ADR-026 §4 extended — seed files the `tangle`/`init` verbs read
 * ship inside the CLI package for offline use).
 *
 * Invoked via `bun run build` from the CLI package or
 * `bun run -F @literate/cli build` from repo root.
 */
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const cliRoot = path.resolve(here, '..')
const repoRoot = path.resolve(cliRoot, '..', '..')
const dist = path.join(cliRoot, 'dist')

const entry = path.join(cliRoot, 'src', 'bin', 'literate.ts')
const outfile = path.join(dist, 'literate.js')

const NODE_SHEBANG = '#!/usr/bin/env node\n'

const clean = async (): Promise<void> => {
  await fs.rm(dist, { recursive: true, force: true })
  await fs.mkdir(dist, { recursive: true })
}

const bundle = async (): Promise<void> => {
  const result = await Bun.build({
    entrypoints: [entry],
    outdir: dist,
    naming: 'literate.js',
    target: 'node',
    format: 'esm',
    splitting: false,
    sourcemap: 'none',
    // `packages: 'bundle'` is the default — inline workspace and npm
    // deps; only `node:*` stays external.
    packages: 'bundle',
  })
  if (!result.success) {
    for (const msg of result.logs) console.error(msg)
    throw new Error('bun build failed')
  }
}

const ensureShebang = async (): Promise<void> => {
  const raw = await fs.readFile(outfile, 'utf8')
  const body = raw.startsWith('#!')
    ? raw.slice(raw.indexOf('\n') + 1)
    : raw
  await fs.writeFile(outfile, NODE_SHEBANG + body, 'utf8')
  await fs.chmod(outfile, 0o755)
}

const copyDir = async (
  src: string,
  dst: string,
  filter?: (rel: string) => boolean,
): Promise<number> => {
  let count = 0
  const walk = async (cur: string, rel: string): Promise<void> => {
    const entries = await fs.readdir(cur, { withFileTypes: true })
    for (const e of entries) {
      const srcPath = path.join(cur, e.name)
      const nextRel = rel ? path.join(rel, e.name) : e.name
      if (e.isDirectory()) {
        // Skip test directories — they're not needed in the shipped seed.
        if (e.name === '__tests__' || e.name === 'node_modules') continue
        await walk(srcPath, nextRel)
      } else if (e.isFile()) {
        if (filter && !filter(nextRel)) continue
        const dstPath = path.join(dst, nextRel)
        await fs.mkdir(path.dirname(dstPath), { recursive: true })
        await fs.copyFile(srcPath, dstPath)
        count++
      }
    }
  }
  await walk(src, '')
  return count
}

const copyAssets = async (): Promise<void> => {
  const assets = path.join(dist, 'assets')
  await fs.mkdir(assets, { recursive: true })

  const templateSrc = path.join(
    repoRoot,
    'packages',
    'template-minimal',
    'files',
  )
  const templateDst = path.join(assets, 'template-minimal')
  const templateCount = await copyDir(templateSrc, templateDst)
  console.log(`  assets: template-minimal → ${templateCount} file(s)`)

  const registrySrc = path.join(repoRoot, 'registry')
  const registryDst = path.join(assets, 'registry')
  const registryCount = await copyDir(registrySrc, registryDst)
  console.log(`  assets: registry → ${registryCount} file(s)`)
}

const copyLicenses = async (): Promise<void> => {
  const files = ['LICENSE-MIT', 'LICENSE-APACHE', 'NOTICE']
  for (const f of files) {
    const src = path.join(repoRoot, f)
    const dst = path.join(dist, f)
    try {
      await fs.copyFile(src, dst)
    } catch {
      // File may not exist at repo root; skip silently.
    }
  }
}

const main = async (): Promise<void> => {
  console.log('building @literate/cli')
  console.log(`  repo-root: ${repoRoot}`)
  console.log(`  out:       ${outfile}`)
  await clean()
  await bundle()
  await ensureShebang()
  await copyAssets()
  await copyLicenses()
  const stat = await fs.stat(outfile)
  console.log(`  bundle:    ${(stat.size / 1024).toFixed(1)} kB`)
  console.log('done.')
}

await main()
