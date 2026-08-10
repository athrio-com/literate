import { Effect, Layer, Option } from 'effect'
import {
  HttpRouter,
  HttpServerRequest,
  HttpServerResponse,
} from 'effect/unstable/http'
import { NodeHttpServer } from '@effect/platform-node'
import { createServer } from 'node:http'
import { mcpAt, noteHandlers } from './api'
import { NoteStore } from './store'

const MOUNT = '/__loom'

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
    onNone: () => ({}),
    onSome: (where) => ({
      location: where.startsWith(origin) ? where.slice(origin.length) : where,
    }),
  })

const answering = (held: Response, origin: string, project: string, type: string) =>
  type.includes('text/html')
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

const forward = (origin: string, project: string) =>
  Effect.gen(function* () {
    const request = yield* HttpServerRequest.HttpServerRequest
    const url = new URL(request.url, 'http://localhost')
    const body = yield* sent(request)
    const held = yield* Effect.tryPromise(() =>
      fetch(`${origin}${url.pathname}${url.search}`, {
        method: request.method,
        headers: { ...carried(request.headers), 'accept-encoding': 'identity' },
        body,
        redirect: 'manual',
      }),
    )
    return yield* answering(
      held,
      origin,
      project,
      held.headers.get('content-type') ?? 'application/octet-stream',
    )
  }).pipe(Effect.catchCause(() => silent))

const routes = (origin: string, project: string) =>
  Layer.mergeAll(
    HttpRouter.add('POST', `${MOUNT}/notes/capture`, noteHandlers.capture),
    HttpRouter.add('GET', `${MOUNT}/notes/feed`, noteHandlers.feed),
    HttpRouter.add('GET', `${MOUNT}/notes/live`, noteHandlers.live),
    HttpRouter.add('POST', `${MOUNT}/notes/resolve`, noteHandlers.resolve),
    HttpRouter.add('POST', `${MOUNT}/notes/discard`, noteHandlers.discard),
    HttpRouter.add('POST', `${MOUNT}/notes/edit`, noteHandlers.edit),
    HttpRouter.add('GET', `${MOUNT}/notes.js`, noteHandlers.overlay),
    mcpAt(`${MOUNT}/mcp`),
    HttpRouter.add('*', '*', forward(origin, project)),
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
