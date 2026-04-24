/**
 * `literate init [target] [--template <id>] [--registry-url <url>]
 * [--registry-ref <ref>]` (ADR-025 §2 — composes scaffold + tangle).
 *
 * Scaffolds a consumer repo from a named template, writes
 * `literate.json` with the configured registry, tangles the
 * template's default Trope/Concept set, and runs an initial weave.
 * For v0.1 the only template is `minimal` (P8 finalises the
 * template surface).
 */
import * as fs from 'node:fs/promises'
import * as path from 'node:path'

import { scaffold } from '@literate/template-minimal'

import { templateMinimalRoot } from '../assets.ts'
import { runTangle } from './tangle.ts'
import { weave } from '../weaver/weaver.ts'
import { usageError, type Verb, type VerbContext } from './verb.ts'
import type { SeedKind } from '../registry/manifest.ts'

export interface RunInitOptions {
  readonly target: string
  readonly template: string
  readonly registryUrl: string
  readonly registryRef: string
  /**
   * Default seed set for the template. Each entry is `<kind>:<id>`.
   * Hard-coded for v0.1 minimal template; templates publishing
   * their own seed manifests is P8 work.
   */
  readonly seeds: ReadonlyArray<{ kind: SeedKind; id: string }>
}

export interface RunInitResult {
  readonly target: string
  readonly scaffoldedFiles: ReadonlyArray<string>
  readonly tangled: ReadonlyArray<{ kind: SeedKind; id: string }>
  readonly literateMdPath: string
}

const TEMPLATE_DEFAULT_SEEDS: Record<
  string,
  ReadonlyArray<{ kind: SeedKind; id: string }>
> = {
  minimal: [
    { kind: 'tropes', id: 'session-start' },
    { kind: 'tropes', id: 'session-end' },
  ],
}

const writeLiterateConfig = async (
  target: string,
  registryUrl: string,
  registryRef: string,
  template: string,
): Promise<void> => {
  const config = {
    $schema: 'literate-config/v0',
    registries: [{ name: 'literate', url: registryUrl, ref: registryRef }],
    template,
  }
  await fs.writeFile(
    path.join(target, 'literate.json'),
    JSON.stringify(config, null, 2) + '\n',
    'utf8',
  )
}

export const runInit = async (
  opts: RunInitOptions,
): Promise<RunInitResult> => {
  const targetAbs = path.resolve(opts.target)
  await fs.mkdir(targetAbs, { recursive: true })

  // 1. Scaffold the template.
  if (opts.template !== 'minimal') {
    throw new Error(
      `init: template '${opts.template}' is not available at v0.1 (only 'minimal'); see P8`,
    )
  }
  const scaffoldResult = await scaffold({
    target: targetAbs,
    overwrite: false,
    root: templateMinimalRoot(),
  })

  // 2. Write `literate.json` (only if not already present).
  try {
    await fs.access(path.join(targetAbs, 'literate.json'))
  } catch {
    await writeLiterateConfig(
      targetAbs,
      opts.registryUrl,
      opts.registryRef,
      opts.template,
    )
  }

  // 3. Ensure `.literate/extensions/.keep` exists.
  const extDir = path.join(targetAbs, '.literate', 'extensions')
  await fs.mkdir(extDir, { recursive: true })
  const keepPath = path.join(extDir, '.keep')
  try {
    await fs.access(keepPath)
  } catch {
    await fs.writeFile(keepPath, '', 'utf8')
  }

  // 4. Tangle each default seed.
  const tangled: Array<{ kind: SeedKind; id: string }> = []
  for (const seed of opts.seeds) {
    await runTangle({
      repoRoot: targetAbs,
      kind: seed.kind,
      id: seed.id,
    })
    tangled.push(seed)
  }

  // 5. Initial weave.
  const woven = await weave(targetAbs)

  return {
    target: targetAbs,
    scaffoldedFiles: scaffoldResult.copiedFiles,
    tangled,
    literateMdPath: woven.literateMdPath,
  }
}

const initVerb: Verb = {
  name: 'init',
  summary: 'Scaffold a new LF consumer repo and vendor the template seeds.',
  usage:
    'Usage: literate init [target] [--template <id>] [--registry-url <url>] [--registry-ref <ref>]\n' +
    '\n' +
    'Defaults:\n' +
    '  target            current working directory\n' +
    '  --template        minimal\n' +
    '  --registry-url    bundled:// (or LITERATE_REGISTRY_URL; use\n' +
    '                    github:owner/repo for a remote registry)\n' +
    '  --registry-ref    main (or LITERATE_REGISTRY_REF)\n',

  async run(argv, ctx: VerbContext): Promise<number> {
    let template = 'minimal'
    let registryUrl =
      ctx.env['LITERATE_REGISTRY_URL'] ?? 'bundled://'
    let registryRef = ctx.env['LITERATE_REGISTRY_REF'] ?? 'main'
    const positional: string[] = []
    for (let i = 0; i < argv.length; i++) {
      const a = argv[i]!
      if (a === '--template' || a === '-t') {
        template = argv[++i] ?? template
      } else if (a === '--registry-url') {
        registryUrl = argv[++i] ?? registryUrl
      } else if (a === '--registry-ref') {
        registryRef = argv[++i] ?? registryRef
      } else {
        positional.push(a)
      }
    }
    const target = positional[0] ?? ctx.cwd
    const seeds = TEMPLATE_DEFAULT_SEEDS[template]
    if (!seeds) {
      throw usageError(
        initVerb,
        `unknown template '${template}'; available: ${Object.keys(TEMPLATE_DEFAULT_SEEDS).join(', ')}`,
      )
    }

    const result = await runInit({
      target,
      template,
      registryUrl,
      registryRef,
      seeds,
    })
    ctx.stdout.write(`initialised LF consumer repo at ${result.target}\n`)
    ctx.stdout.write(
      `  scaffolded: ${result.scaffoldedFiles.length} file(s)\n`,
    )
    for (const t of result.tangled) {
      ctx.stdout.write(`  tangled ${t.kind}/${t.id}\n`)
    }
    ctx.stdout.write(`  wove ${result.literateMdPath}\n`)
    return 0
  },
}

export default initVerb
