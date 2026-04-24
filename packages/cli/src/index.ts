/**
 * `@literate/cli` — public surface.
 *
 * Under ADR-025/026 the CLI is the sole npm artefact LF publishes
 * (Tropes and Concepts ship as registry seeds vendored into the
 * consumer's `.literate/` tree). This module re-exports the
 * programmatic-call entry points for each verb plus the service
 * tags + Live Layers consumers compose to drive the verbs from
 * code (the bin dispatcher itself uses `@effect/cli` per ADR-030).
 */
export { runContinue, type RunContinueOptions } from './verbs/continue.ts'
export { runClose, type RunCloseOptions } from './verbs/close.ts'
export {
  runTangle,
  type RunTangleOptions,
  type RunTangleResult,
} from './verbs/tangle.ts'
export {
  runUpdate,
  type RunUpdateOptions,
  type RunUpdateResult,
} from './verbs/update.ts'
export {
  runInit,
  type RunInitOptions,
  type RunInitResult,
} from './verbs/init.ts'
export { runWeave } from './verbs/weave.ts'
export {
  weaveProgram,
  WeaverService,
  WeaverServiceLive,
  ProseSchemaViolations,
  type WeaveResult,
  type ProseSchemaViolation,
} from './weaver/weaver.ts'
export {
  ConfigService,
  ConfigServiceLive,
  findRegistry,
  type LiterateConfig,
  type Registry,
} from './registry/config.ts'
export {
  ManifestService,
  ManifestServiceLive,
  addEntry,
  findEntry,
  removeEntry,
  manifestPath,
  type Manifest,
  type ManifestEntry,
  type SeedKind,
} from './registry/manifest.ts'
export {
  FetcherService,
  FetcherServiceLive,
  seedFiles,
  type FetchedSeed,
  type SeedRequest,
} from './registry/fetcher.ts'
