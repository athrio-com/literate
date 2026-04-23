/**
 * @adr ADR-001
 *
 * The session-start workflow Trope. Realises the `trope` Concept
 * (workflow Trope subkind: a way of doing something — beginning a
 * session correctly). Carries an optional Effect Layer that the CLI
 * uses to provide the `SessionStart` service.
 */

import { Context, Effect, Layer } from 'effect'
import { proseFrom, type Trope } from '@literate/core'
import { TropeConcept } from '@literate/concept-trope'
import sessionTrope from '@literate/trope-session'

export class SessionStart extends Context.Tag('@literate/SessionStart')<
  SessionStart,
  {
    readonly start: (slug: string) => Effect.Effect<{ readonly path: string }, Error>
  }
>() {}

const defaultLayer = Layer.succeed(SessionStart, {
  start: (slug: string) =>
    Effect.gen(function* () {
      const now = new Date()
      const date = now.toISOString().slice(0, 10)
      const time = now.toISOString().slice(11, 16).replace(':', '')
      const path = `corpus/sessions/${date}T${time}-${slug}.md`
      yield* Effect.logInfo(`session-start: would create ${path}`)
      return { path }
    }),
})

export const sessionStartTrope: Trope<typeof TropeConcept> = {
  _tag: 'Trope',
  id: 'session-start',
  version: '0.1.0',
  realises: TropeConcept,
  prose: proseFrom(import.meta.url, './prose.mdx'),
  dependencies: [sessionTrope],
  subkinds: [],
  members: [],
  layer: defaultLayer,
}

export default sessionStartTrope
