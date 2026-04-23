/**
 * @adr ADR-002
 *
 * Locator for the template tree. The actual scaffold files live in
 * `tree/` (sibling of `src/`). The CLI copies the tree into the
 * consumer's target directory at `literate init`.
 */

import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))

/** Absolute path to the template tree. */
export const templateRoot: string = resolve(here, '..', 'tree')

export const templateId = 'minimal' as const
export const templateVersion = '0.1.0' as const
