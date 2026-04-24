/**
 * `literate.json` reader (ADR-025 §5, ADR-026 §5).
 *
 * `literate.json` lives at the consumer's repo root and lists the
 * registries this repo trusts, plus optional defaults. Missing or
 * unreadable file → a defaulted config (registry pointing at the
 * canonical LF git repo, `ref: 'main'`).
 */
import * as fs from 'node:fs/promises'
import * as path from 'node:path'

export interface Registry {
  readonly name: string
  readonly url: string
  readonly ref?: string
}

export interface LiterateConfig {
  readonly registries: ReadonlyArray<Registry>
  readonly agent?: string
  readonly template?: string
}

const DEFAULT_CONFIG: LiterateConfig = {
  registries: [
    { name: 'literate', url: 'github:literate/literate', ref: 'main' },
  ],
  template: 'minimal',
}

const stripComments = (raw: string): string =>
  raw
    // strip /* … */ block comments (non-greedy)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // strip // … line comments (only those after non-string-content; cheap heuristic)
    .replace(/^\s*\/\/.*$/gm, '')

export const readConfig = async (
  repoRoot: string,
): Promise<LiterateConfig> => {
  const configPath = path.join(repoRoot, 'literate.json')
  let raw: string
  try {
    raw = await fs.readFile(configPath, 'utf8')
  } catch {
    return DEFAULT_CONFIG
  }
  const parsed = JSON.parse(stripComments(raw)) as Partial<LiterateConfig>
  return {
    registries: parsed.registries ?? DEFAULT_CONFIG.registries,
    ...(parsed.agent !== undefined ? { agent: parsed.agent } : {}),
    ...(parsed.template !== undefined ? { template: parsed.template } : {}),
  }
}

export const findRegistry = (
  config: LiterateConfig,
  name: string | undefined,
): Registry => {
  if (name !== undefined) {
    const found = config.registries.find((r) => r.name === name)
    if (!found) {
      throw new Error(
        `literate.json: no registry named '${name}'. ` +
          `Available: ${config.registries.map((r) => r.name).join(', ')}`,
      )
    }
    return found
  }
  const first = config.registries[0]
  if (!first) {
    throw new Error('literate.json: no registries configured')
  }
  return first
}

export { DEFAULT_CONFIG }
