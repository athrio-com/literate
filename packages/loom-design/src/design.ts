import { Effect, Layer, Match, Option } from 'effect'
import {
  HttpRouter,
  HttpServerRequest,
  HttpServerResponse,
} from 'effect/unstable/http'
import { NodeHttpServer } from '@effect/platform-node'
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mcpAt, noteHandlers } from './api'
import { NoteStore } from './store'

const MOUNT = '/__loom'
const BARE = `${MOUNT}/bare`

const here = dirname(fileURLToPath(import.meta.url))
const noCache = { 'cache-control': 'no-store' }

type Destination =
  | { readonly kind: 'shell' }
  | { readonly kind: 'bare'; readonly path: string }
  | { readonly kind: 'application' }

const destinationOf = (headers: Record<string, string>, path: string): Destination =>
  path === BARE || path.startsWith(`${BARE}/`)
    ? { kind: 'bare', path: path.slice(BARE.length) || '/' }
    : Option.match(Option.fromNullishOr(headers['sec-fetch-dest']), {
        onNone: () => ({ kind: 'bare' as const, path }),
        onSome: (asked) =>
          Match.value(asked).pipe(
            Match.withReturnType<Destination>(),
            Match.when('document', () => ({ kind: 'shell' as const })),
            Match.orElse(() => ({ kind: 'application' as const })),
          ),
      })

const varies = { vary: 'sec-fetch-dest' }

const CLOSING_BODY = /<\/body>/i

const tagFor = (project: string): string =>
  `<script type="module" src="${MOUNT}/notes.js" data-loom-project="${project}"></script>`

const injected = (html: string, project: string): string =>
  CLOSING_BODY.test(html)
    ? html.replace(CLOSING_BODY, () => `${tagFor(project)}</body>`)
    : `${html}${tagFor(project)}`

const HOP = new Set([
  'accept-encoding',
  'connection',
  'content-length',
  'host',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
])

const carried = (headers: Record<string, string>): Record<string, string> =>
  Object.fromEntries(
    Object.entries(headers).filter(([name]) => !HOP.has(name.toLowerCase())),
  )

const asking = (headers: Record<string, string>, inject: boolean): Record<string, string> =>
  inject ? { ...carried(headers), 'accept-encoding': 'identity' } : carried(headers)

const sent = (
  request: HttpServerRequest.HttpServerRequest,
): Effect.Effect<Uint8Array | undefined> =>
  request.method === 'GET' || request.method === 'HEAD'
    ? Effect.succeed(undefined)
    : Effect.map(request.arrayBuffer, (raw) => new Uint8Array(raw)).pipe(
        Effect.catchCause(() => Effect.succeed(undefined)),
      )

const relocated = (held: Response, origin: string): Record<string, string> =>
  Option.match(Option.fromNullishOr(held.headers.get('location')), {
    onNone: () => ({ ...varies }),
    onSome: (where) => ({
      ...varies,
      location: where.startsWith(origin) ? where.slice(origin.length) : where,
    }),
  })

const answering = (
  held: Response,
  origin: string,
  project: string,
  type: string,
  inject: boolean,
) =>
  type.includes('text/html') && inject
    ? Effect.map(Effect.promise(() => held.text()), (html) =>
        HttpServerResponse.text(injected(html, project), {
          status: held.status,
          contentType: type,
          headers: relocated(held, origin),
        }),
      )
    : Effect.map(Effect.promise(() => held.arrayBuffer()), (raw) =>
        HttpServerResponse.uint8Array(new Uint8Array(raw), {
          status: held.status,
          contentType: type,
          headers: relocated(held, origin),
        }),
      )

const silent = Effect.succeed(
  HttpServerResponse.text('The application is not answering', { status: 502 }),
)

const forward = (origin: string, project: string, path: string, inject: boolean) =>
  Effect.gen(function* () {
    const request = yield* HttpServerRequest.HttpServerRequest
    const url = new URL(request.url, 'http://localhost')
    const body = yield* sent(request)
    const held = yield* Effect.tryPromise(() =>
      fetch(`${origin}${path}${url.search}`, {
        method: request.method,
        headers: asking(request.headers, inject),
        body,
        redirect: 'manual',
      }),
    )
    return yield* answering(
      held,
      origin,
      project,
      held.headers.get('content-type') ?? 'application/octet-stream',
      inject,
    )
  }).pipe(Effect.catchCause(() => silent))

const asset = (path: string) =>
  HttpServerResponse.file(path, { headers: noCache }).pipe(
    Effect.catchCause((cause) =>
      Effect.logWarning(`could not read ${path}`, cause).pipe(
        Effect.andThen(
          Effect.succeed(HttpServerResponse.text('Not found', { status: 404 })),
        ),
      ),
    ),
  )

const shellScript = asset(join(here, '..', 'dist', 'shell.js'))
const shellStyles = asset(join(here, 'shell.css'))

const shellPage = (project: string) =>
  Effect.tryPromise(() => readFile(join(here, 'shell.html'), 'utf8')).pipe(
    Effect.map((page) =>
      HttpServerResponse.text(page.replaceAll('__LOOM_PROJECT__', project), {
        contentType: 'text/html',
        headers: { ...noCache, ...varies },
      }),
    ),
    Effect.catchCause((cause) =>
      Effect.logWarning('could not read the shell page', cause).pipe(
        Effect.andThen(
          Effect.succeed(HttpServerResponse.text('Not found', { status: 404 })),
        ),
      ),
    ),
  )

const served = (origin: string, project: string) =>
  Effect.gen(function* () {
    const request = yield* HttpServerRequest.HttpServerRequest
    const url = new URL(request.url, 'http://localhost')
    return yield* Match.value(destinationOf(request.headers, url.pathname)).pipe(
      Match.withReturnType<
        Effect.Effect<
          HttpServerResponse.HttpServerResponse,
          never,
          HttpServerRequest.HttpServerRequest
        >
      >(),
      Match.when({ kind: 'shell' }, () => shellPage(project)),
      Match.when({ kind: 'bare' }, ({ path }) => forward(origin, project, path, true)),
      Match.when({ kind: 'application' }, () =>
        forward(origin, project, url.pathname, false),
      ),
      Match.exhaustive,
    )
  })

const PORT_ONLY = /^[0-9]+$/
const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:\/\//i

export const addressOf = (given: string): string =>
  Match.value(given).pipe(
    Match.when(
      (written) => HAS_SCHEME.test(written),
      (written) => written,
    ),
    Match.when(
      (written) => PORT_ONLY.test(written),
      (written) => `http://localhost:${written}`,
    ),
    Match.orElse((written) => `http://${written}`),
  )

const routes = (origin: string, project: string) =>
  Layer.mergeAll(
    HttpRouter.add('POST', `${MOUNT}/notes/capture`, noteHandlers.capture),
    HttpRouter.add('GET', `${MOUNT}/notes/feed`, noteHandlers.feed),
    HttpRouter.add('GET', `${MOUNT}/notes/live`, noteHandlers.live),
    HttpRouter.add('POST', `${MOUNT}/notes/resolve`, noteHandlers.resolve),
    HttpRouter.add('POST', `${MOUNT}/notes/discard`, noteHandlers.discard),
    HttpRouter.add('POST', `${MOUNT}/notes/edit`, noteHandlers.edit),
    HttpRouter.add('GET', `${MOUNT}/notes.js`, noteHandlers.overlay),
    HttpRouter.add('GET', `${MOUNT}/shell.js`, shellScript),
    HttpRouter.add('GET', `${MOUNT}/shell.css`, shellStyles),
    mcpAt(`${MOUNT}/mcp`),
    HttpRouter.add('*', '*', served(origin, project)),
  )

export const designServer = (options: {
  readonly port: number
  readonly application: string
  readonly project: string
  readonly store: Layer.Layer<NoteStore>
}) =>
  HttpRouter.serve(routes(options.application, options.project)).pipe(
    Layer.provide(options.store),
    Layer.provide(NodeHttpServer.layer(() => createServer(), { port: options.port })),
  )
