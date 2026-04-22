/**
 * @adr ADR-001
 *
 * Goal Status closed vocabulary. Member of the `category` Trope.
 */

import { Schema } from 'effect'
import { proseFrom, type Member } from '@literate/core'

export const GoalStatus = Schema.Union(
  Schema.Literal('Active'),
  Schema.Literal('Completed'),
  Schema.TemplateLiteral(Schema.Literal('Superseded by Goal '), Schema.Number),
  Schema.Literal('Abandoned'),
)
export type GoalStatus = Schema.Schema.Type<typeof GoalStatus>

export const goalStatusMember: Member<{ readonly schema: typeof GoalStatus }> = {
  _tag: 'Member',
  id: 'goal-status',
  description: 'Closed set of Status values a session-Goal can carry.',
  value: { schema: GoalStatus },
  prose: proseFrom(import.meta.url, './goal-status.mdx'),
}

export default goalStatusMember
