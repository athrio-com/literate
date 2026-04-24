/**
 * `literate.json` reader (ADR-025 §5, ADR-026 §5). Exposed as a
 * `Context.Tag` service per ADR-028 — tests inject an in-memory
 * variant; `ConfigServiceLive` reads from the filesystem.
 *
 * `literate.json` lives at the consumer's repo root and lists the
 * registries this repo trusts, plus optional defaults. Missing or
 * unreadable file → a defaulted config (registry pointing at the
 * bundled seed tree, `ref: 'main'`).
 */
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { Context, Effect, Layer } from 'effect'

import {
  ConfigParseError,
  NoRegistriesConfigured,
  RegistryNotFound,
} from '../errors.ts'

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
  raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

export interface ConfigServiceShape {
  readonly read: (
    repoRoot: string,
  ) => Effect.Effect<LiterateConfig, ConfigParseError>
}

export class ConfigService extends Context.Tag('@literate/cli/ConfigService')<
  ConfigService,
  ConfigServiceShape
>() {}

export const ConfigServiceLive = Layer.succeed(ConfigService, {
  read: (repoRoot: string) =>
    Effect.gen(function* () {
      const configPath = path.join(repoRoot, 'literate.json')
      const raw: string | null = yield* Effect.tryPromise({
        try: () => fs.readFile(configPath, 'utf8'),
        catch: () => null,
      }).pipe(Effect.catchAll(() => Effect.succeed(null)))
      if (raw === null) return DEFAULT_CONFIG
      const parsed = yield* Effect.try({
        try: () => JSON.parse(stripComments(raw)) as Partial<LiterateConfig>,
        catch: (e) =>
          new ConfigParseError({
            path: configPath,
            reason: e instanceof Error ? e.message : String(e),
          }),
      })
      return {
        registries: parsed.registries ?? DEFAULT_CONFIG.registries,
        ...(parsed.agent !== undefined ? { agent: parsed.agent } : {}),
        ...(parsed.template !== undefined ? { template: parsed.template } : {}),
      }
    }),
})

export const findRegistry = (
  config: LiterateConfig,
  name: string | undefined,
): Effect.Effect<Registry, RegistryNotFound | NoRegistriesConfigured> =>
  Effect.gen(function* () {
    if (name !== undefined) {
      const found = config.registries.find((r) => r.name === name)
      if (!found) {
        return yield* new RegistryNotFound({
          name,
          available: config.registries.map((r) => r.name),
        })
      }
      return found
    }
    const first = config.registries[0]
    if (!first) return yield* new NoRegistriesConfigured()
    return first
  })

export { DEFAULT_CONFIG }
