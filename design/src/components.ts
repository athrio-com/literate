import { Array } from 'effect'
import type { Html } from 'foldkit/html'
import { h } from './model'
import logos from './logos.json'

const strokeIcon = (size: string, paths: ReadonlyArray<Html>): Html =>
  h.svg(
    [
      h.Width(size),
      h.Height(size),
      h.ViewBox('0 0 24 24'),
      h.Fill('none'),
      h.Stroke('currentColor'),
      h.StrokeWidth('2'),
      h.StrokeLinecap('round'),
      h.StrokeLinejoin('round'),
    ],
    paths,
  )

const strokePath = (d: string): Html => h.path([h.D(d)], [])

export const copyIcon = (): Html =>
  strokeIcon('13', [
    h.rect([h.X('9'), h.Y('9'), h.Width('11'), h.Height('11'), h.Rx('2')], []),
    strokePath('M5 15V5a2 2 0 0 1 2-2h10'),
  ])

export const bookIcon = (): Html =>
  h.svg(
    [
      h.Class('arrow'),
      h.Width('14'),
      h.Height('14'),
      h.ViewBox('0 0 24 24'),
      h.Fill('none'),
      h.Stroke('currentColor'),
      h.StrokeWidth('2'),
      h.StrokeLinecap('round'),
      h.StrokeLinejoin('round'),
      h.AriaHidden(true),
    ],
    [
      strokePath('M12 7v14'),
      strokePath(
        'M3 18a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z',
      ),
    ],
  )

export const externalIcon = (): Html =>
  h.svg(
    [
      h.Width('13'),
      h.Height('13'),
      h.ViewBox('0 0 24 24'),
      h.Fill('none'),
      h.Stroke('currentColor'),
      h.StrokeWidth('2'),
      h.StrokeLinecap('round'),
      h.StrokeLinejoin('round'),
      h.AriaHidden(true),
    ],
    [
      strokePath('M15 3h6v6'),
      strokePath('M10 14 21 3'),
      strokePath('M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6'),
    ],
  )

export const arrowIcon = (): Html =>
  h.svg(
    [
      h.Class('arrow'),
      h.Width('14'),
      h.Height('14'),
      h.ViewBox('0 0 14 14'),
      h.Fill('none'),
      h.AriaHidden(true),
    ],
    [
      h.path(
        [
          h.D('M3 7h8M7 3l4 4-4 4'),
          h.Stroke('currentColor'),
          h.StrokeWidth('1.6'),
          h.StrokeLinecap('round'),
          h.StrokeLinejoin('round'),
        ],
        [],
      ),
    ],
  )

export const downIcon = (): Html =>
  strokeIcon('16', [strokePath('M6 9l6 6 6-6')])

export const checkIcon = (): Html =>
  strokeIcon('13', [strokePath('M20 6 9 17l-5-5')])

export const sunIcon = (): Html =>
  strokeIcon('15', [
    strokePath('M12 8a4 4 0 1 0 0 8 4 4 0 1 0 0-8Z'),
    strokePath(
      'M12 2v2 M12 20v2 M2 12h2 M20 12h2 M4.9 4.9l1.4 1.4 M17.7 17.7l1.4 1.4 M19.1 4.9l-1.4 1.4 M6.3 17.7l-1.4 1.4',
    ),
  ])

export const moonIcon = (): Html =>
  strokeIcon('15', [strokePath('M21 12.8A8.5 8.5 0 1 1 11.2 3 6.6 6.6 0 0 0 21 12.8Z')])

export const playIcon = (): Html =>
  h.svg(
    [h.Width('12'), h.Height('12'), h.ViewBox('0 0 24 24'), h.Fill('currentColor'), h.AriaHidden(true)],
    [h.path([h.D('M8 5v14l11-7z')], [])],
  )

export const loomIcon = (): Html =>
  h.svg(
    [h.Width('15'), h.Height('15'), h.ViewBox('0 0 100 100'), h.Fill('none'), h.AriaHidden(true)],
    [
      h.g(
        [
          h.Transform('rotate(-13 50 50)'),
          h.Stroke('currentColor'),
          h.StrokeWidth('13'),
          h.StrokeLinecap('round'),
        ],
        [
          strokePath('M18 38C34 36 66 36 82 38'),
          strokePath('M18 62C34 60 66 64 82 62'),
          strokePath('M38 18V54'), strokePath('M38 70V82'),
          strokePath('M62 18V30'), strokePath('M62 46V82'),
        ],
      ),
    ],
  )

const svgMark = (svg: string): Html =>
  h.span([h.Class('rt-logo'), h.InnerHTML(svg)], [])

export const bunIcon = (): Html => svgMark(logos.bun)
export const denoIcon = (): Html => svgMark(logos.deno)
export const npmIcon = (): Html => svgMark(logos.npm)
export const pnpmIcon = (): Html => svgMark(logos.pnpm)

import { ToggledTheme, type Model } from './model'

const themeSwitch = (theme: Model['theme']): Html =>
  h.button(
    [
      h.Class('theme-switch'),
      h.AriaLabel(theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'),
      h.OnClick(ToggledTheme()),
    ],
    [theme === 'dark' ? sunIcon() : moonIcon()],
  )

export const titlebar = (theme: Model['theme']): Html =>
  h.div(
    [h.Class('titlebar'), h.Role('banner')],
    [
      h.span([h.Class('title-mark')], [loomIcon()]),
      h.div(
        [h.Class('crumbs')],
        [
          h.span([], ['loom']),
          h.span([h.Class('sep')], ['/']),
          h.span([], ['greeter']),
          h.span([h.Class('sep')], ['/']),
          h.span([h.Class('file')], ['a-first-loom.loom']),
        ],
      ),
      h.div(
        [h.Class('right')],
        [
          h.span([h.Class('live-dot'), h.Title('tangled')], []),
          themeSwitch(theme),
        ],
      ),
    ],
  )

const NAV = [
  { label: 'landing', href: '#', here: true },
  { label: 'docs', href: '#' },
  { label: 'annotations', href: '#' },
  { label: 'devtools', href: '#' },
]

const barEnd = (version: string): Html =>
  h.div(
    [h.Class('right')],
    [
      h.span([], [`v${version}`]),
      h.span([], [h.kbd([], ['⌘']), ' ', h.kbd([], ['K'])]),
    ],
  )

export const tabbar = (version: string): Html =>
  h.nav(
    [h.Class('tabbar'), h.AriaLabel('Site')],
    [
      ...Array.map(NAV, (link) =>
        h.a(
          [h.Class(link.here ? 'tab active' : 'tab'), h.Href(link.href)],
          [h.span([h.Class('dot')], []), link.label],
        ),
      ),
      barEnd(version),
    ],
  )
