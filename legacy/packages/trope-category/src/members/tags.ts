/**
 * @adr ADR-001
 *
 * Base tag vocabulary. Member of the `category` Trope. Consumers
 * receive these as a starting set; they extend in their own
 * `corpus/categories/tags.md` via a gated category revision.
 */

import { Schema } from 'effect'
import { proseFrom, type Member } from '@literate/core'

export const BaseTag = Schema.Literal(
  '#process',
  '#protocol',
  '#corpus',
  '#tooling',
  '#algebra',
  '#licensing',
  '#release',
)
export type BaseTag = Schema.Schema.Type<typeof BaseTag>

export const baseTags = [
  '#process',
  '#protocol',
  '#corpus',
  '#tooling',
  '#algebra',
  '#licensing',
  '#release',
] as const satisfies ReadonlyArray<BaseTag>

export const tagsMember: Member<{
  readonly schema: typeof BaseTag
  readonly values: typeof baseTags
}> = {
  _tag: 'Member',
  id: 'tags',
  description:
    'Base tag vocabulary for ADR conflict detection and cross-cut search.',
  value: { schema: BaseTag, values: baseTags },
  prose: proseFrom(import.meta.url, './tags.mdx'),
}

export default tagsMember
