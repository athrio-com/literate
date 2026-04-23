/**
 * Build-time search index. Runs at RSC render and is serialised into
 * the client search modal. One entry per sidebar destination plus the
 * algebra topics. No ranking — the modal filters by substring.
 */

import { SIDEBAR } from './sidebar.ts'
import { TOPICS } from './topics.ts'

export interface SearchEntry {
  readonly group: string
  readonly title: string
  readonly path: string
  readonly href: string
}

export function buildSearchIndex(): readonly SearchEntry[] {
  const out: SearchEntry[] = []
  for (const section of SIDEBAR) {
    for (const leaf of section.leaves) {
      const href = leaf.slug ? `/docs/${leaf.slug}` : '/docs'
      out.push({
        group: section.title,
        title: leaf.label,
        path: `Docs › ${section.title}`,
        href,
      })
    }
  }
  for (const t of TOPICS) {
    for (const s of t.sections) {
      out.push({
        group: 'Sections',
        title: s.heading,
        path: `Docs › ${t.title}`,
        href: `/docs/${t.slug}`,
      })
    }
  }
  return out
}
