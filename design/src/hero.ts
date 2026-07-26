import { Array, Match } from 'effect'
import type { Html } from 'foldkit/html'
import {
  copyIcon,
  checkIcon,
  bookIcon,
  loomIcon,
  bunIcon,
  denoIcon,
  npmIcon,
  pnpmIcon,
} from './components'
import { Copied, h, type Model } from './model'

export const ROTATOR_WORDS = ['a book', 'an article', 'a spec']

const rotatorClass = (phase: Model['rotatorPhase']): string =>
  Match.value(phase).pipe(
    Match.when('out', () => 'rotator-word out'),
    Match.when('in-start', () => 'rotator-word in-start'),
    Match.orElse(() => 'rotator-word'),
  )

const headline = (model: Model): Html =>
  h.h1(
    [h.Class('loom-h')],
    [
      h.span([h.Class('hl-1')], ['Write your program']),
      h.br([]),
      h.span([h.Class('hl-2')], [`the way you write`]),
      h.br([]),
      h.span(
        [h.Class('rotator-host hl-3'), h.AriaLive('polite')],
        [
          h.span(
            [h.Class(rotatorClass(model.rotatorPhase))],
            [ROTATOR_WORDS[model.rotatorIndex] ?? ROTATOR_WORDS[0]],
          ),
        ],
      ),
      h.span([h.Class('caret'), h.AriaHidden(true)], []),
    ],
  )

type Runtime = {
  readonly id: string
  readonly command: string
  readonly icon: Html
}

const RUNTIMES: ReadonlyArray<Runtime> = [
  { id: 'bun', command: 'bun add -g @athrio/loom', icon: bunIcon() },
  { id: 'deno', command: 'deno install -g -n loom npm:@athrio/loom', icon: denoIcon() },
  { id: 'npm', command: 'npm install -g @athrio/loom', icon: npmIcon() },
  { id: 'pnpm', command: 'pnpm add -g @athrio/loom', icon: pnpmIcon() },
]

const rowCopy = (id: string, copied: string): Html => {
  const done = copied === id
  return h.span(
    [h.Class(done ? 'rt-copy copied' : 'rt-copy')],
    [done ? checkIcon() : copyIcon()],
  )
}

const installRow = (copied: string) => (runtime: Runtime): Html =>
  h.button(
    [
      h.Class('install-row'),
      h.AriaLabel(`Copy: ${runtime.command}`),
      h.OnClick(Copied({ id: `install-${runtime.id}`, text: runtime.command })),
    ],
    [
      h.span([h.Class('rt-mark')], [runtime.icon]),
      h.code([h.Class('rt-cmd')], [runtime.command]),
      rowCopy(`install-${runtime.id}`, copied),
    ],
  )

const installRows = (model: Model): Html =>
  h.div([h.Class('install-rows')], Array.map(RUNTIMES, installRow(model.copied)))

const prim = (token: string): Html =>
  h.code([h.Class('hero-prim')], [token])

const point = (content: ReadonlyArray<Html | string>): Html =>
  h.li([], [h.span([h.Class('hero-bullet')], [loomIcon()]), h.span([], content)])

const whatLoom = (): Html =>
  h.div(
    [h.Class('hero-note')],
    [
      h.p(
        [h.Class('hero-lead')],
        ['Loom is a compositional language designed for AI-assisted literate programming.'],
      ),
      h.ul(
        [h.Class('hero-points')],
        [
          point(['Provides the tools to write programs in the order demanded by natural language, logic, and the flow of thought.']),
          point(['Keeps specification alongside code, while structurally separating the two.']),
          point([
            'Introduces a minimal syntax surface over standard Markdown, with intuitive primitives like ',
            prim('=>'),
            ', ',
            prim('~'),
            ', ',
            prim('::' + '[]'),
            ', and ',
            prim('{}'),
            '.',
          ]),
          point(['Installs as a CLI with integrated LSP and MCP devtools.']),
        ],
      ),
      h.p(
        [],
        ['Everything else is just prose and code in your favourite programming language.'],
      ),
    ],
  )

const heroLogo = (version: string): Html =>
  h.div(
    [h.Class('hero-logo')],
    [
      h.span([h.Class('hero-logo-mark')], [loomIcon()]),
      h.span([h.Class('hero-logo-word')], ['loom']),
      h.span([h.Class('hero-logo-ver')], [`v${version}`]),
    ],
  )

const cta = (): Html =>
  h.div(
    [h.Class('actions hero-cta')],
    [
      h.a([h.Class('btn primary'), h.Href('#')], ['Read the docs', bookIcon()]),
      h.a([h.Class('btn'), h.Href('#')], ['Browse the source']),
    ],
  )

const pitch = (model: Model): Html =>
  h.div([h.Class('hero-col')], [headline(model), installRows(model), cta()])

export const hero = (model: Model): Html =>
  h.section(
    [h.Class('hero')],
    [
      h.div(
        [h.Class('wrap')],
        [
          heroLogo(model.version),
          h.div([h.Class('hero-grid')], [pitch(model), whatLoom()]),
        ],
      ),
    ],
  )
