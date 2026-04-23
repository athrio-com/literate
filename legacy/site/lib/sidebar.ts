/**
 * @adr ADR-005
 *
 * Sidebar tree for /docs. Flat hierarchy: each section is a list of
 * leaves; a leaf has a slug (path segment after /docs) and a label.
 * Topic-driven — domain pages compose multiple MDX bodies into one
 * readable page (see lib/topics.ts).
 */

import { TOPICS } from './topics.ts'

export interface SidebarLeaf {
  readonly slug: string
  readonly label: string
}

export interface SidebarSection {
  readonly title: string
  readonly leaves: readonly SidebarLeaf[]
}

export const SIDEBAR: ReadonlyArray<SidebarSection> = [
  {
    title: 'Introduction',
    leaves: [
      { slug: '', label: 'Overview' },
      { slug: 'getting-started', label: 'Getting started' },
    ],
  },
  {
    title: 'Algebra',
    leaves: [
      { slug: 'algebra', label: 'Three levels' },
      { slug: 'algebra/subkinds', label: 'Subkinds' },
      { slug: 'algebra/members', label: 'Members' },
      { slug: 'algebra/authored', label: 'Authored instances' },
    ],
  },
  {
    title: 'Domains',
    leaves: TOPICS.map((t) => ({ slug: t.slug, label: t.title })),
  },
  {
    title: 'CLI',
    leaves: [
      { slug: 'cli/init', label: 'init' },
      { slug: 'cli/add-trope', label: 'add trope' },
      { slug: 'cli/compile', label: 'compile' },
      { slug: 'cli/check', label: 'check' },
      { slug: 'cli/version', label: 'version' },
      { slug: 'cli/manifest', label: 'Manifest' },
    ],
  },
]

export const buildSidebar = async (): Promise<ReadonlyArray<SidebarSection>> =>
  SIDEBAR
