/**
 * @adr ADR-001
 *
 * ADR Status closed vocabulary. Member of the `category` Trope.
 */

import { Schema } from 'effect'
import { proseFrom, type Member } from '@literate/core'

export const ADRStatus = Schema.Union(
  Schema.Literal('Open'),
  Schema.Literal('Accepted'),
  Schema.Literal('Deferred'),
  Schema.TemplateLiteral(Schema.Literal('Superseded by ADR-'), Schema.String),
)
export type ADRStatus = Schema.Schema.Type<typeof ADRStatus>

export const adrStatusMember: Member<{ readonly schema: typeof ADRStatus }> = {
  _tag: 'Member',
  id: 'adr-status',
  description: 'Closed set of Status values an ADR can carry.',
  value: { schema: ADRStatus },
  prose: proseFrom(import.meta.url, './adr-status.mdx'),
}

export default adrStatusMember
