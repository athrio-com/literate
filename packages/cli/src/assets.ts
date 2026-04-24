/**
 * Runtime asset-root resolver.
 *
 * The CLI ships template files and registry seeds inside its own
 * package so that `literate init` / `literate tangle` work offline
 * against a freshly-installed CLI. When running from the LF source
 * tree (development), the same code paths must resolve to the
 * original `packages/template-minimal/files/` and repo-root
 * `registry/` trees.
 *
 * Resolution rule:
 *   - If a sibling `assets/` directory exists next to this module's
 *     URL, we are running from the bundled `dist/` output → assets
 *     live under `./assets/`.
 *   - Otherwise we are running from source → compute repo-root from
 *     this module's location (`packages/cli/src/assets.ts`) and
 *     resolve to the authored trees.
 */
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))

const bundledAssets = path.join(here, 'assets')
const isBundled = fs.existsSync(bundledAssets)

/** Absolute path to the template-minimal `files/` tree. */
export const templateMinimalRoot = (): string =>
  isBundled
    ? path.join(bundledAssets, 'template-minimal')
    : path.resolve(here, '..', '..', 'template-minimal', 'files')

/**
 * Absolute path to the **parent** of `registry/` — the directory
 * the `LocalFetcher` treats as its root (seed paths are computed
 * as `registry/<kind>/<id>/<file>` relative to this). In the
 * source tree this is the repo root; in a bundled install it is
 * `dist/assets/`, which has a sibling `registry/` tree copied in
 * at build time.
 */
export const bundledRegistryRoot = (): string =>
  isBundled
    ? bundledAssets
    : path.resolve(here, '..', '..', '..')

/** True when this module is running from the shipped bundle. */
export const runningFromBundle = (): boolean => isBundled
