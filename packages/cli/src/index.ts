/**
 * `@literate/cli` — public surface.
 *
 * Under ADR-025/026 the CLI is the sole npm artefact LF publishes
 * (Tropes and Concepts ship as registry seeds vendored into the
 * consumer's `.literate/` tree). This module re-exports the
 * programmatic-call entry points for each verb and the verb
 * registry the binary dispatches against.
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
export { weave, type WeaveResult } from './weaver/weaver.ts'
export { VERBS, usageBanner, type Verb } from './verbs/registry.ts'
