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

export const githubIcon = (): Html =>
  h.svg(
    [h.Width('15'), h.Height('15'), h.ViewBox('0 0 24 24'), h.Fill('currentColor'), h.AriaHidden(true)],
    [
      h.path(
        [
          h.D(
            'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
          ),
        ],
        [],
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
      h.a(
        [h.Class('title-logo'), h.Href('#'), h.AriaLabel('Loom')],
        [h.span([h.Class('title-mark')], [loomIcon()]), h.span([h.Class('title-word')], ['loom'])],
      ),
      h.div([h.Class('right')], [themeSwitch(theme)]),
    ],
  )

const NAV = [
  { label: 'landing', href: '#', here: true },
  { label: 'docs', href: '#' },
  { label: 'source', href: '#' },
  { label: 'devtools', href: '#' },
]

const REPO_URL = 'https://github.com/athrio-com/loom'

const barEnd = (): Html =>
  h.div(
    [h.Class('right')],
    [
      h.a(
        [h.Class('bar-github'), h.Href(REPO_URL), h.AriaLabel('The project on GitHub')],
        [githubIcon()],
      ),
    ],
  )

export const tabbar = (): Html =>
  h.nav(
    [h.Class('tabbar'), h.AriaLabel('Site')],
    [
      ...Array.map(NAV, (link) =>
        h.a(
          [h.Class(link.here ? 'tab active' : 'tab'), h.Href(link.href)],
          [h.span([h.Class('dot')], []), link.label],
        ),
      ),
      barEnd(),
    ],
  )

import { SelectedAccent, SelectedTitleColors, type Accent, type TitleColors } from './model'

type AccentOption = {
  readonly id: Accent
  readonly label: string
  readonly swatches: ReadonlyArray<string>
}

const ACCENTS: ReadonlyArray<AccentOption> = [
  { id: 'rust', label: 'Rust', swatches: ['#913C30', '#915430', '#918430', '#913044', '#769130', '#7B6D65'] },
  { id: 'duo', label: 'Rust Duo', swatches: ['#913C30', '#699130', '#918430', '#913044', '#769130', '#7B6D65'] },
  { id: 'ochre', label: 'Ochre', swatches: ['#916630', '#917E30', '#749130', '#914730', '#4C9130', '#7B7765'] },
  { id: 'olive', label: 'Olive', swatches: ['#917C30', '#8E9130', '#5E9130', '#915E30', '#359130', '#7B7B65'] },
  { id: 'moss', label: 'Moss', swatches: ['#309139', '#309151', '#309181', '#479130', '#307991', '#657B6C'] },
  { id: 'fuchsia', label: 'Fuchsia', swatches: ['#AD1F8E', '#AD1F6B', '#AD1F23', '#9F1FAD', '#AD551F', '#825E71'] },
  { id: 'electric', label: 'Electric', swatches: ['#1F96AD', '#1F72AD', '#1F2AAD', '#1FAD98', '#4E1FAD', '#5E7382'] },
  { id: 'grape', label: 'Grape', swatches: ['#471FAD', '#6B1FAD', '#AD1FA9', '#1F23AD', '#AD1F6D', '#715E82'] },
]

const swatchRow = (colours: ReadonlyArray<string>): Html =>
  h.span(
    [h.Class('tweaks-sw')],
    Array.map(colours, (colour) => h.span([h.Class('tweaks-dot'), h.Style({ background: colour })], [])),
  )

const accentOption = (active: Accent) => (option: AccentOption): Html =>
  h.button(
    [
      h.Class(option.id === active ? 'tweaks-opt active' : 'tweaks-opt'),
      h.OnClick(SelectedAccent({ accent: option.id })),
    ],
    [h.span([h.Class('tweaks-label')], [option.label]), swatchRow(option.swatches)],
  )

type TitleOption = {
  readonly id: TitleColors
  readonly label: string
  readonly swatches: ReadonlyArray<string>
}

const TITLES: ReadonlyArray<TitleOption> = [
  { id: 'three', label: 'Three', swatches: ['var(--fg)', 'var(--acc-mint)', 'var(--acc-violet)'] },
  { id: 'two', label: 'Two', swatches: ['var(--fg)', 'var(--acc-mint)'] },
]

const titleOption = (active: TitleColors) => (option: TitleOption): Html =>
  h.button(
    [
      h.Class(option.id === active ? 'tweaks-opt active' : 'tweaks-opt'),
      h.OnClick(SelectedTitleColors({ titleColors: option.id })),
    ],
    [h.span([h.Class('tweaks-label')], [option.label]), swatchRow(option.swatches)],
  )

export const tweaksPanel = (accent: Accent, titleColors: TitleColors): Html =>
  h.div(
    [h.Class('tweaks')],
    [
      h.div([h.Class('tweaks-head')], ['Light accents']),
      h.div([h.Class('tweaks-opts')], Array.map(ACCENTS, accentOption(accent))),
      h.div([h.Class('tweaks-head')], ['Hero title']),
      h.div([h.Class('tweaks-opts')], Array.map(TITLES, titleOption(titleColors))),
    ],
  )
