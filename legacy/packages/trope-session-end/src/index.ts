/**
 * @adr ADR-001
 *
 * The session-end workflow Trope. Validates the log, stamps Closed,
 * and (when configured) commits.
 */

import { Context, Effect, Layer, Data } from 'effect'
import { proseFrom, type Trope } from '@literate/core'
import { TropeConcept } from '@literate/concept-trope'
import sessionTrope from '@literate/trope-session'

export class SessionEndIncomplete extends Data.TaggedError('SessionEndIncomplete')<{
  readonly missing: ReadonlyArray<string>
}> {}

export class SessionEnd extends Context.Tag('@literate/SessionEnd')<
  SessionEnd,
  {
    readonly close: (
      logPath: string,
    ) => Effect.Effect<{ readonly closedAt: string }, SessionEndIncomplete | Error>
  }
>() {}

const defaultLayer = Layer.succeed(SessionEnd, {
  close: (logPath: string) =>
    Effect.gen(function* () {
      yield* Effect.logInfo(`session-end: would validate and close ${logPath}`)
      return { closedAt: new Date().toISOString() }
    }),
})

export const sessionEndTrope: Trope<typeof TropeConcept> = {
  _tag: 'Trope',
  id: 'session-end',
  version: '0.1.0',
  realises: TropeConcept,
  prose: proseFrom(import.meta.url, './prose.mdx'),
  dependencies: [sessionTrope],
  subkinds: [],
  members: [],
  layer: defaultLayer,
}

export default sessionEndTrope
