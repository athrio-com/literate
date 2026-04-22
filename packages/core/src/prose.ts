/**
 * @adr ADR-005
 *
 * Prose loader. Each Concept and Trope module ships an MDX sibling file
 * (concept.mdx or prose.mdx). At runtime, the loader reads it from disk
 * relative to the calling module's URL.
 *
 * Usage:
 *   prose: proseFrom(import.meta.url, './prose.mdx')
 */

import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import type { Prose } from './kinds.ts'

export const proseFrom =
  (importMetaUrl: string, relativePath: string): Prose =>
  () => {
    const here = dirname(fileURLToPath(importMetaUrl))
    const path = resolve(here, relativePath)
    return readFile(path, 'utf8')
  }

export const proseUrl = (importMetaUrl: string, relativePath: string): string => {
  const here = dirname(fileURLToPath(importMetaUrl))
  return resolve(here, relativePath)
}
