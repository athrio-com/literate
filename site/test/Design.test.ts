import '../src/browser-globals'
import { describe, expect, it } from 'bun:test'
import { Effect, Layer, ManagedRuntime, Option } from 'effect'
import { renderStatic } from 'foldkit/html'
import { FoldkitRender } from '@athrio/foldkit-ssr'
import { design, pathOf, seedNotes } from '../src/design'
import { type Model, type Route } from '../src/model'

// The Design section is the one part of the site whose state a reader drives directly, so
// these cases render it in each state the bar can be in rather than only at rest. The panel
// and the outline leave the section entirely when the model says they should, and that is
// what most of these assert: absence, not presence.
const at = (over: Partial<Model> = {}): Model =>
  ({
    route: 'home', chapter: '', navHidden: false, drawerOpen: false, runtime: 'bun',
    searchOpen: false, caret: 0, searching: false,
    activeSection: '',
    player: { struck: 0, beat: 0, playing: false, output: Option.none(), full: false }, version: '0.0.9',
    query: '', focus: 0, copied: '',
    notes: seedNotes, seq: 3, notesOpen: false, barCollapsed: false, picking: false,
    noteTab: 'open', aimed: Option.none(), draft: '', highlight: Option.none(),
    ...over,
  }) as Model

const runtime = ManagedRuntime.make(FoldkitRender.layer as Layer.Layer<FoldkitRender>)

const render = (model: Model): string =>
  runtime.runSync(
    FoldkitRender.pipe(
      Effect.flatMap((r) => r.renderToString(renderStatic(() => design(model)))),
    ),
  )

describe('the Design section', () => {
  it('leads with its own head and stands the bar over the two columns', () => {
    const html = render(at())
    expect(html).toContain('id="loom-design"')
    expect(html).toContain('Complementary tools')
    expect(html).toContain('Loom Design')
    expect(html).toContain('class="design-bar"')
    expect(html).toContain('loom-website')
  })

  it('counts the open notes on the bar, not every note it holds', () => {
    // Two of the three seeded notes are open; the third is addressed.
    expect(render(at())).toContain('class="design-count">2<')
  })

  it('trades the bar for a handle when it is collapsed, keeping the count', () => {
    const html = render(at({ barCollapsed: true }))
    expect(html).not.toContain('class="design-bar"')
    expect(html).toContain('class="design-handle"')
    expect(html).toContain('class="design-count">2<')
  })

  it('stamps the sample as woven Loom so a pick on it resolves to a chapter', () => {
    const html = render(at())
    expect(html).toContain('data-loom-chapter="02-pricing"')
    expect(html).toContain('data-loom-section="Rounding money"')
  })

  it('shows the panel only once it is opened', () => {
    expect(render(at())).not.toContain('class="design-panel"')
    expect(render(at({ notesOpen: true }))).toContain('class="design-panel"')
  })

  it('takes the panel away while the picker is armed, so the page is clear to aim at', () => {
    expect(render(at({ notesOpen: true, picking: true }))).not.toContain('class="design-panel"')
  })

  it('takes the panel away under a collapsed bar', () => {
    expect(render(at({ notesOpen: true, barCollapsed: true }))).not.toContain('class="design-panel"')
  })

  it('lists the open notes under the open tab and the addressed one under resolved', () => {
    const open = render(at({ notesOpen: true, noteTab: 'open' }))
    expect(open).toContain('Say plainly that the bar never ships to production.')
    expect(open).not.toContain('Cut this paragraph to two sentences.')

    const resolved = render(at({ notesOpen: true, noteTab: 'resolved' }))
    expect(resolved).toContain('Cut this paragraph to two sentences.')
    expect(resolved).toContain('reopen')
  })

  it('says something different for each empty half', () => {
    const noneOpen = render(at({ notes: [], notesOpen: true, noteTab: 'open' }))
    expect(noneOpen).toContain('No open notes. Pick something and leave one.')

    const noneResolved = render(at({ notes: [], notesOpen: true, noteTab: 'resolved' }))
    expect(noneResolved).toContain('Nothing resolved yet.')
  })

  it('names what was aimed at in a chip, and arms the send button only for a draft', () => {
    const empty = render(at({ notesOpen: true }))
    expect(empty).not.toContain('class="design-chip"')
    expect(empty).toContain('class="design-send"')

    const aiming = render(
      at({
        notesOpen: true,
        draft: 'Tighten this',
        aimed: Option.some({ kind: 'dom', label: 'p.what', pointer: 'loom-design p.what' }),
      }),
    )
    expect(aiming).toContain('class="design-chip"')
    expect(aiming).toContain('loom-design p.what')
    expect(aiming).toContain('class="design-send ready"')
  })

  it('paints the outline only where the model holds one', () => {
    expect(render(at())).not.toContain('class="design-outline"')

    const html = render(
      at({
        highlight: Option.some({ label: 'button.cta', left: 40, top: 120, width: 118, height: 34 }),
      }),
    )
    expect(html).toContain('class="design-outline"')
    expect(html).toContain('button.cta')
    expect(html).toContain('left: 40px')
    expect(html).toContain('top: 104px')
  })
})

describe('the path a note is stamped with', () => {
  it('names every route, so a note says which page it was left on', () => {
    const routes: ReadonlyArray<Route> = ['home', 'docs', 'why-loom', 'community', 'source']
    const paths = routes.map(pathOf)
    expect(paths).toEqual(['/', '/docs', '/why-loom', '/community', '/source'])
    expect(new Set(paths).size).toBe(routes.length)
  })
})
