/**
 * Read the real ADR list from corpus/decisions/. Used by the landing
 * page "Recent decisions" section. One filesystem scan per render; at
 * ~10 files this is negligible and means the section is never stale.
 */

import fs from 'node:fs/promises'
import path from 'node:path'

const REPO_ROOT = path.resolve(process.cwd(), '..')
const DECISIONS_DIR = path.join(REPO_ROOT, 'corpus', 'decisions')

export type AdrStatus = 'Accepted' | 'Proposed' | 'Superseded'

export interface Adr {
  readonly id: string
  readonly title: string
  readonly date: string
  readonly status: AdrStatus
  readonly tags: readonly string[]
  readonly sourcePath: string
}

const STATUS_RE = /\*\*Status:\*\*\s*(Proposed|Accepted|Superseded[^\n]*)/i
const DATE_RE   = /\*\*Date:\*\*\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/
const TAGS_RE   = /\*\*Tags:\*\*\s*([^\n]+)/

function extractTags(line: string): readonly string[] {
  return Array.from(line.matchAll(/#([a-z0-9][\w-]*)/gi)).map((m) => m[1]!)
}

function parseStatus(raw: string): AdrStatus {
  const v = raw.trim().toLowerCase()
  if (v.startsWith('superseded')) return 'Superseded'
  if (v.startsWith('proposed'))   return 'Proposed'
  return 'Accepted'
}

export async function listAdrs(): Promise<readonly Adr[]> {
  const entries = await fs.readdir(DECISIONS_DIR)
  const files = entries
    .filter((f) => /^ADR-\d{3}-.*\.md$/.test(f))
    .sort()
  const out: Adr[] = []
  for (const file of files) {
    const abs = path.join(DECISIONS_DIR, file)
    const raw = await fs.readFile(abs, 'utf8')
    const first = raw.split('\n', 1)[0] ?? ''
    const titleMatch = first.match(/^#\s+(ADR-\d{3})\s+—\s+(.+?)\s*$/)
    if (!titleMatch) continue
    const id = titleMatch[1]!
    const title = titleMatch[2]!
    const date = raw.match(DATE_RE)?.[1] ?? ''
    const statusRaw = raw.match(STATUS_RE)?.[1] ?? 'Accepted'
    const tagsLine = raw.match(TAGS_RE)?.[1] ?? ''
    out.push({
      id,
      title,
      date,
      status: parseStatus(statusRaw),
      tags: extractTags(tagsLine),
      sourcePath: abs,
    })
  }
  return out.sort((a, b) => (a.id < b.id ? 1 : -1))
}
