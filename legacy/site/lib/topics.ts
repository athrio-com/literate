/**
 * @adr ADR-005
 * @adr ADR-010
 *
 * Topic configuration: each topic page composes an intro plus a
 * sequence of MDX bodies pulled from packages/* and site/content/.
 * One page per topic — Concept, Trope, subkinds, members, and
 * workflow Tropes flow into a single readable narrative.
 */

export type SectionSource =
  | { readonly kind: 'content'; readonly slug: readonly string[] }
  | { readonly kind: 'concept'; readonly id: string }
  | { readonly kind: 'trope'; readonly id: string }
  | { readonly kind: 'subkind'; readonly tropeId: string; readonly subkindId: string }
  | { readonly kind: 'member'; readonly tropeId: string; readonly memberId: string }

export interface TopicSection {
  readonly heading: string
  readonly source: SectionSource
}

export interface Topic {
  readonly slug: string
  readonly title: string
  readonly description: string
  readonly intro?: SectionSource
  readonly sections: readonly TopicSection[]
}

export const TOPICS: ReadonlyArray<Topic> = [
  {
    slug: 'corpus',
    title: 'Corpus',
    description: 'The prose half of every LF-using repo: directory shape, indexes, conventions.',
    intro: { kind: 'content', slug: ['topics', 'corpus-intro'] },
    sections: [
      { heading: 'The corpus Concept', source: { kind: 'concept', id: 'corpus' } },
      { heading: 'The corpus Trope', source: { kind: 'trope', id: 'corpus' } },
    ],
  },
  {
    slug: 'sessions',
    title: 'Sessions',
    description: 'Bounded, logged, gated work units. Concept, Trope, and the start/end/goal-flow workflow Tropes.',
    intro: { kind: 'content', slug: ['topics', 'sessions-intro'] },
    sections: [
      { heading: 'The session Concept', source: { kind: 'concept', id: 'session' } },
      { heading: 'The session Trope', source: { kind: 'trope', id: 'session' } },
      {
        heading: 'session-start workflow',
        source: { kind: 'trope', id: 'session-start' },
      },
      {
        heading: 'session-end workflow',
        source: { kind: 'trope', id: 'session-end' },
      },
      {
        heading: 'goal-flow workflow',
        source: { kind: 'trope', id: 'goal-flow' },
      },
    ],
  },
  {
    slug: 'decisions',
    title: 'Decisions',
    description: 'Append-only records with mutable Status. The decisions Concept, the Trope, the ADR subkind, and the adr-flow workflow.',
    intro: { kind: 'content', slug: ['topics', 'decisions-intro'] },
    sections: [
      { heading: 'The decisions Concept', source: { kind: 'concept', id: 'decisions' } },
      { heading: 'The decisions Trope', source: { kind: 'trope', id: 'decisions' } },
      {
        heading: 'ADR subkind',
        source: { kind: 'subkind', tropeId: 'decisions', subkindId: 'ADR' },
      },
      {
        heading: 'adr-flow workflow',
        source: { kind: 'trope', id: 'adr-flow' },
      },
    ],
  },
  {
    slug: 'categories',
    title: 'Categories',
    description: 'Closed vocabularies. The category Concept, the Trope, and the four base members.',
    intro: { kind: 'content', slug: ['topics', 'categories-intro'] },
    sections: [
      { heading: 'The category Concept', source: { kind: 'concept', id: 'category' } },
      { heading: 'The category Trope', source: { kind: 'trope', id: 'category' } },
      {
        heading: 'Member: tags',
        source: { kind: 'member', tropeId: 'category', memberId: 'tags' },
      },
      {
        heading: 'Member: adr-status',
        source: { kind: 'member', tropeId: 'category', memberId: 'adr-status' },
      },
      {
        heading: 'Member: goal-status',
        source: { kind: 'member', tropeId: 'category', memberId: 'goal-status' },
      },
      {
        heading: 'Member: goal-category',
        source: { kind: 'member', tropeId: 'category', memberId: 'goal-category' },
      },
    ],
  },
  {
    slug: 'concepts',
    title: 'Concepts',
    description: 'The metalanguage primitive of LF. Concepts at the LF level (TS packages) and at the corpus level (markdown files); single primitive, two scopes.',
    intro: { kind: 'content', slug: ['topics', 'concepts-intro'] },
    sections: [
      {
        heading: 'The concept Concept (the meta)',
        source: { kind: 'concept', id: 'concept' },
      },
    ],
  },
  {
    slug: 'tropes',
    title: 'Tropes',
    description: 'The realisation primitive. The trope Concept and the role of workflow Tropes in LF.',
    intro: { kind: 'content', slug: ['topics', 'tropes-intro'] },
    sections: [
      {
        heading: 'The trope Concept (the meta)',
        source: { kind: 'concept', id: 'trope' },
      },
    ],
  },
  {
    slug: 'chapters',
    title: 'Chapters',
    description: 'Multi-session development plans. Living documents with a mutability profile distinct from decisions.',
    intro: { kind: 'content', slug: ['topics', 'chapters-intro'] },
    sections: [
      { heading: 'The chapters Concept', source: { kind: 'concept', id: 'chapters' } },
      { heading: 'The chapters Trope', source: { kind: 'trope', id: 'chapters' } },
    ],
  },
]

export const findTopic = (slug: string): Topic | undefined =>
  TOPICS.find((t) => t.slug === slug)
