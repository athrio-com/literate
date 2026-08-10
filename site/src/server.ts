import './browser-globals'
import { Context, Effect, FileSystem, Layer, Option, Schema as S } from 'effect'
import {
  HttpServer,
  HttpServerRequest,
  HttpServerResponse,
} from 'effect/unstable/http'
import { BunHttpServer, BunRuntime, BunServices } from '@effect/platform-bun'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { renderStatic } from 'foldkit/html'
import { PREHYDRATION_CAPTURE_SCRIPT } from '@athrio/foldkit-hydration/prehydration'
import { FoldkitRender } from '@athrio/foldkit-ssr'
import { view } from './view'
import { Route, type Model } from './model'
import { pathOf, routeOf, seedNotes } from './devtools'

const distDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist')

const seed: Model = {
  route: 'home',
  chapter: '',
  navHidden: false,
  drawerOpen: false,
  runtime: 'bun',
  searchOpen: false,
  caret: 0,
  searching: false,
  activeSection: '',
  player: { struck: 0, beat: 0, playing: false, output: Option.none(), full: false },
  version: '0.0.9',
  query: '',
  focus: 0,
  copied: '',
  notes: seedNotes,
  seq: 3,
  notesOpen: false,
  barCollapsed: false,
  picking: false,
  noteTab: 'open',
  aimed: Option.none(),
  draft: '',
  highlight: Option.none(),
}

const inlineJson = (value: unknown): string =>
  JSON.stringify(value).replace(/</g, '\\u003c')

const withBody = (shell: string, body: string): string =>
  shell.replace('<div id="root"></div>', () => `<div id="root">${body}</div>`)

const withSeed = (shell: string, model: Model): string =>
  shell.replace(
    '</head>',
    () =>
      `<script>${PREHYDRATION_CAPTURE_SCRIPT}</script>` +
      `<script id="foldkit-model" type="application/json">${inlineJson(model)}</script></head>`,
  )

const escapeText = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;')

const withTitle = (shell: string, title: string): string =>
  shell.replace(/<title>[\s\S]*?<\/title>/, () => `<title>${escapeText(title)}</title>`)

const NPM_LATEST = 'https://registry.npmjs.org/@athrio/loom/latest'

const Release = S.Struct({ version: S.String })

const latestVersion = (fallback: string): Effect.Effect<string> =>
  Effect.tryPromise(() =>
    fetch(NPM_LATEST)
      .then((response) => response.json())
      .then((body) => S.decodeUnknownSync(Release)(body).version),
  ).pipe(Effect.catchCause(() => Effect.succeed(fallback)))

const pageOf = (
  render: FoldkitRender['Service'],
  shell: string,
  model: Model,
): Effect.Effect<string> =>
  Effect.gen(function* () {
    const document = view(model)
    const body = yield* render.renderToString(renderStatic(() => document.body))
    return withSeed(withTitle(withBody(shell, body), document.title), model)
  })

const notFound = Effect.succeed(
  HttpServerResponse.text('Not found', { status: 404 }),
)

const renderedSite = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  const render = yield* FoldkitRender
  const shell = yield* fs.readFileString(join(distDir, 'index.html'))
  const version = yield* latestVersion(seed.version)
  const rendered = yield* Effect.forEach(Route.literals, (route) =>
    Effect.map(
      pageOf(render, shell, { ...seed, route, version }),
      (page) => [pathOf(route), page] as const,
    ),
  )
  const pages = new Map(rendered)
  return {
    pageAt: (url: URL): Effect.Effect<Option.Option<string>> =>
      Effect.succeed(Option.fromNullishOr(pages.get(url.pathname))),
    assetAt: (url: URL) =>
      HttpServerResponse.file(join(distDir, url.pathname)).pipe(
        Effect.catchCause(() => notFound),
      ),
  } as const
})

const VITE = `http://localhost:${Number(process.env.VITE_PORT ?? 5200)}`

const fromVite = (target: string): Effect.Effect<HttpServerResponse.HttpServerResponse> =>
  Effect.tryPromise(async () => {
    const held = await fetch(`${VITE}${target}`)
    return HttpServerResponse.uint8Array(new Uint8Array(await held.arrayBuffer()), {
      status: held.status,
      contentType: held.headers.get('content-type') ?? 'application/octet-stream',
    })
  }).pipe(Effect.catchCause(() => notFound))

const WITHOUT_VITE =
  '<!doctype html><html lang="en"><head><title>Loom</title></head>' +
  '<body><p>Vite is not answering, so this page has no client. Run <code>bun run dev</code>.</p>' +
  '<div id="root"></div></body></html>'

const viteShell: Effect.Effect<string> = Effect.tryPromise(() =>
  fetch(`${VITE}/index.html`).then((held) => held.text()),
).pipe(Effect.catchCause(() => Effect.succeed(WITHOUT_VITE)))

const liveSite = Effect.gen(function* () {
  const render = yield* FoldkitRender
  const version = yield* latestVersion(seed.version)
  return {
    pageAt: (url: URL): Effect.Effect<Option.Option<string>> =>
      Option.match(routeOf(url.pathname), {
        onNone: () => Effect.succeed(Option.none()),
        onSome: (route) =>
          Effect.map(
            Effect.flatMap(viteShell, (shell) =>
              pageOf(render, shell, { ...seed, route, version }),
            ),
            Option.some,
          ),
      }),
    assetAt: (url: URL) => fromVite(`${url.pathname}${url.search}`),
  } as const
})

export class Site extends Context.Service<Site>()('Site', {
  make: renderedSite,
}) {
  static readonly layer = Layer.effect(this, this.make).pipe(
    Layer.provide(FoldkitRender.layer),
    Layer.provide(BunServices.layer),
  )

  static readonly liveLayer = Layer.effect(this, liveSite).pipe(
    Layer.provide(FoldkitRender.layer),
  )
}

const handle = (site: Site['Service'], url: URL) =>
  Effect.flatMap(
    site.pageAt(url),
    Option.match({
      onSome: (page) =>
        Effect.succeed(HttpServerResponse.text(page, { contentType: 'text/html' })),
      onNone: () => site.assetAt(url),
    }),
  )

const app = Effect.gen(function* () {
  const request = yield* HttpServerRequest.HttpServerRequest
  const site = yield* Site
  return yield* handle(site, new URL(request.url, 'http://localhost'))
})

const port = Number(process.env.PORT ?? 5199)

const site = process.env.LOOM_DEV === '1' ? Site.liveLayer : Site.layer

const server = HttpServer.serve(app).pipe(
  HttpServer.withLogAddress,
  Layer.provide(site),
  Layer.provide(BunHttpServer.layer({ port })),
)

BunRuntime.runMain(Layer.launch(server))
