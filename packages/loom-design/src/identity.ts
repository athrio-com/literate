import { Array, Data, Effect, Match, Option, Schema } from 'effect'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

export const Identity = Schema.Struct({
  identity: Schema.String,
  name: Schema.String,
  created: Schema.String,
})
export type Identity = typeof Identity.Type

export const identityFile = (directory: string): string =>
  join(directory, '.loom', 'design', 'project.json')

export const readIdentity = (
  directory: string,
): Effect.Effect<Option.Option<Identity>> =>
  Effect.sync(() => identityFile(directory)).pipe(
    Effect.flatMap((path) =>
      existsSync(path)
        ? Effect.try(() =>
            Schema.decodeUnknownSync(Identity)(JSON.parse(readFileSync(path, 'utf8'))),
          ).pipe(Effect.map(Option.some), Effect.catchCause(() => Effect.succeed(Option.none<Identity>())))
        : Effect.succeed(Option.none<Identity>()),
    ),
  )

export const writeIdentity = (
  directory: string,
  identity: Identity,
): Effect.Effect<void, IdentityError> =>
  Effect.try({
    try: () => {
      const path = identityFile(directory)
      mkdirSync(dirname(path), { recursive: true })
      writeFileSync(path, `${JSON.stringify(identity, null, 2)}\n`)
    },
    catch: (cause) => new IdentityError({ directory, cause }),
  })

export class IdentityError extends Data.TaggedError('IdentityError')<{
  readonly directory: string
  readonly cause: unknown
}> {}

export type Standing = Data.TaggedEnum<{
  New: { readonly identity: Identity }
  Adopted: { readonly identity: Identity }
  Proceeding: { readonly identity: Identity }
  Taken: { readonly here: Identity; readonly registered: string }
  Misplaced: { readonly registered: string }
}>
export const Standing = Data.taggedEnum<Standing>()

export const standingOf = (
  onDisk: Option.Option<Identity>,
  recorded: Option.Option<string>,
  fresh: () => Identity,
): Standing =>
  Match.value({ onDisk, recorded }).pipe(
    Match.when({ onDisk: Option.isNone, recorded: Option.isNone }, () =>
      Standing.New({ identity: fresh() }),
    ),
    Match.when({ onDisk: Option.isSome, recorded: Option.isNone }, ({ onDisk }) =>
      Standing.Adopted({ identity: onDisk.value }),
    ),
    Match.when({ onDisk: Option.isNone, recorded: Option.isSome }, ({ recorded }) =>
      Standing.Misplaced({ registered: recorded.value }),
    ),
    Match.orElse(({ onDisk, recorded }) => {
      const here = Option.getOrThrow(onDisk)
      const there = Option.getOrThrow(recorded)
      return here.identity === there
        ? Standing.Proceeding({ identity: here })
        : Standing.Taken({ here, registered: there })
    }),
  )

import { execFileSync } from 'node:child_process'

const LOOPBACK = /^https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\]|0\.0\.0\.0):(\d+)/i

const loopbackPort = (address: string): Option.Option<string> =>
  Option.map(Option.fromNullishOr(LOOPBACK.exec(address)), (found) => found[1])

const asked = (
  args: ReadonlyArray<string>,
  keep: (line: string) => Option.Option<string>,
): Effect.Effect<Option.Option<string>> =>
  Effect.try(() =>
    execFileSync('lsof', [...args], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }),
  ).pipe(
    Effect.map((output) =>
      Array.head(Array.getSomes(Array.map(output.split('\n'), keep))),
    ),
    Effect.catchCause(() => Effect.succeed(Option.none<string>())),
  )

const listenerOn = (port: string): Effect.Effect<Option.Option<string>> =>
  asked(['-nP', `-iTCP:${port}`, '-sTCP:LISTEN', '-t'], (line) =>
    line.trim() === '' ? Option.none() : Option.some(line.trim()),
  )

const workingDirectoryOf = (pid: string): Effect.Effect<Option.Option<string>> =>
  asked(['-a', '-p', pid, '-d', 'cwd', '-Fn'], (line) =>
    line.startsWith('n') ? Option.some(line.slice(1)) : Option.none(),
  )

export const servedFrom = (
  address: string,
): Effect.Effect<Option.Option<string>> =>
  Option.match(loopbackPort(address), {
    onNone: () => Effect.succeed(Option.none<string>()),
    onSome: (port) =>
      Effect.flatMap(
        listenerOn(port),
        Option.match({
          onNone: () => Effect.succeed(Option.none<string>()),
          onSome: workingDirectoryOf,
        }),
      ),
  })

import { Layer } from 'effect'
import { NoteStore } from './store'

const fresh = (name: string): Identity => ({
  identity: crypto.randomUUID(),
  name,
  created: new Date().toISOString(),
})

export const settle = (options: {
  readonly project: string
  readonly directory: string
  readonly address: string
  readonly store: Layer.Layer<NoteStore>
}): Effect.Effect<Standing, IdentityError> =>
  Effect.gen(function* () {
    const store = yield* NoteStore
    const onDisk = yield* readIdentity(options.directory)
    const row = yield* Effect.orDie(store.project(options.project))
    const recorded = Option.flatMap(row, (found) =>
      Option.fromNullishOr(found.identity),
    )
    const standing = standingOf(onDisk, recorded, () => fresh(options.project))
    const record = (identity: Identity) =>
      Effect.orDie(
        store.register(
          options.project,
          identity.identity,
          options.directory,
          options.address,
        ),
      )
    yield* Match.value(standing).pipe(
      Match.tag('New', ({ identity }) =>
        writeIdentity(options.directory, identity).pipe(
          Effect.andThen(record(identity)),
        ),
      ),
      Match.tag('Adopted', ({ identity }) => record(identity)),
      Match.tag('Proceeding', ({ identity }) => record(identity)),
      Match.tag('Taken', () => Effect.void),
      Match.tag('Misplaced', () => Effect.void),
      Match.exhaustive,
    )
    return standing
  }).pipe(Effect.provide(options.store))
