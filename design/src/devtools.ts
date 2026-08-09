import { Array, Match, Option, pipe } from 'effect'
import type { Html } from 'foldkit/html'
import {
  ClearedTarget,
  ClosedNotes,
  CollapsedBar,
  DiscardedNote,
  DraftedNote,
  ExpandedBar,
  type Highlight,
  type Message,
  type Model,
  type Note,
  type NoteTab,
  ResolvedNote,
  type Route,
  SentNote,
  ShowedNotes,
  type Target,
  ToggledNotes,
  ToggledPicker,
  WentTo,
  h,
} from './model'
import {
  broadSeam,
  carpetMark,
  devtoolsCarpet,
  docsCarpet,
  downIcon,
  noteIcon,
  pickerIcon,
  upIcon,
} from './components'

const WOVEN = '[data-loom-chapter][data-loom-section]'

const wovenTarget = (element: Element): Option.Option<Target> =>
  pipe(
    Option.fromNullishOr(element.closest(WOVEN)),
    Option.flatMap((woven) =>
      Option.all([
        Option.fromNullishOr(woven.getAttribute('data-loom-chapter')),
        Option.fromNullishOr(woven.getAttribute('data-loom-section')),
      ]),
    ),
    Option.map(([chapter, section]) => ({
      kind: 'loom' as const,
      label: section,
      pointer: `${chapter} / ${section}`,
    })),
  )

const namedTarget = (element: Element): Option.Option<Target> =>
  pipe(
    Option.fromNullishOr(element.closest('[data-pick]')),
    Option.flatMap((named) => Option.fromNullishOr(named.getAttribute('data-pick'))),
    Option.map((name) => ({ kind: 'dom' as const, label: name, pointer: name })),
  )

const SECTIONS = '[id^="loom-"], [id^="why-"]'

const kinOf = (element: Element): ReadonlyArray<Element> =>
  pipe(
    Option.fromNullishOr(element.parentElement),
    Option.map((parent) =>
      Array.filter(
        Array.fromIterable(parent.children),
        (child) => child.tagName === element.tagName,
      ),
    ),
    Option.getOrElse((): ReadonlyArray<Element> => [element]),
  )

const seatOf = (element: Element): string => {
  const kin = kinOf(element)
  return kin.length < 2
    ? ''
    : pipe(
        Array.findFirstIndex(kin, (child) => child === element),
        Option.map((index) => `:nth-of-type(${index + 1})`),
        Option.getOrElse(() => ''),
      )
}

const scopeOf = (element: Element): string =>
  pipe(
    Option.fromNullishOr(element.closest(SECTIONS)),
    Option.map((section) => `${section.id} `),
    Option.getOrElse(() => ''),
  )

const selectorTarget = (element: Element): Target => {
  const name = element.tagName.toLowerCase()
  const identifier = element.id === '' ? '' : `#${element.id}`
  const label = `${name}${identifier}${seatOf(element)}`
  return {
    kind: 'dom',
    label,
    pointer: identifier === '' ? `${scopeOf(element)}${label}` : label,
  }
}

export const targetOf = (element: Element): Target =>
  pipe(
    wovenTarget(element),
    Option.orElse(() => namedTarget(element)),
    Option.getOrElse(() => selectorTarget(element)),
  )

export const pathOf = (route: Route): string =>
  Match.value(route).pipe(
    Match.when('home', () => '/'),
    Match.when('docs', () => '/docs'),
    Match.when('why-loom', () => '/why-loom'),
    Match.when('community', () => '/community'),
    Match.when('source', () => '/source'),
    Match.exhaustive,
  )

const CHROME = '[data-dt-chrome]'

export const aimableAt = (node: EventTarget | null): Option.Option<Element> =>
  pipe(
    Option.fromNullishOr(node),
    Option.filter((found): found is Element => found instanceof Element),
    Option.filter((element) => element.closest(CHROME) === null),
    Option.filter(
      (element) => element !== document.body && element !== document.documentElement,
    ),
  )

export const highlightOf = (element: Element): Highlight => {
  const box = element.getBoundingClientRect()
  return {
    label: targetOf(element).label,
    left: box.left - 3,
    top: box.top - 3,
    width: box.width + 6,
    height: box.height + 6,
  }
}

export const seedNotes: ReadonlyArray<Note> = [
  {
    seq: 1,
    kind: 'chat',
    pointer: '',
    route: '/',
    text: 'Say plainly that the bar never ships to production.',
    addressed: false,
  },
  {
    seq: 2,
    kind: 'dom',
    pointer: 'p.what',
    route: '/',
    text: 'Call it an anchor here, not an identifier.',
    addressed: false,
  },
  {
    seq: 3,
    kind: 'loom',
    pointer: '10-the-devtools / The two columns',
    route: '/',
    text: 'Cut this paragraph to two sentences.',
    addressed: true,
  },
]

const bar = (model: Model): Html =>
  h.div(
    [h.Class('dt-bar')],
    [
      h.span([h.Class('dt-project')], ['loom-website']),
      h.span(
        [h.Class('dt-tools')],
        [
          h.button(
            [
              h.Class(model.picking ? 'dt-tool picking' : 'dt-tool'),
              h.Type('button'),
              h.Title('Pick an element'),
              h.OnClick(ToggledPicker()),
            ],
            [pickerIcon()],
          ),
          h.button(
            [
              h.Class(panelOpen(model) ? 'dt-tool showing' : 'dt-tool'),
              h.Type('button'),
              h.Title(model.notesOpen ? 'Hide notes' : `Notes (${openNotes(model).length})`),
              h.OnClick(ToggledNotes()),
            ],
            [noteIcon(), h.span([h.Class('dt-count')], [String(openNotes(model).length)])],
          ),
          h.button(
            [
              h.Class('dt-tool'),
              h.Type('button'),
              h.Title('Hide the bar'),
              h.OnClick(CollapsedBar()),
            ],
            [downIcon()],
          ),
        ],
      ),
    ],
  )

const handle = (model: Model): Html =>
  h.div(
    [h.Class('dt-handle-row')],
    [
      h.button(
        [
          h.Class('dt-handle'),
          h.Type('button'),
          h.Title('Show the bar'),
          h.OnClick(ExpandedBar()),
        ],
        [upIcon(), h.span([h.Class('dt-count')], [String(openNotes(model).length)])],
      ),
    ],
  )

const openNotes = (model: Model): ReadonlyArray<Note> =>
  Array.filter(model.notes, (note) => !note.addressed)

const panelOpen = (model: Model): boolean =>
  model.notesOpen && !model.barCollapsed && !model.picking

const kinds = (): Html =>
  h.p(
    [h.Class('dt-what'), h.DataAttribute('pick', 'p.what')],
    [
      'Devtools unite complementary tools for a literate programming experience. Point at anything and leave a note on it. A ',
      h.span([h.Class('dt-kind dom')], ['dom']),
      " note carries the element's selector and the label you clicked; a ",
      h.span([h.Class('dt-kind chat')], ['chat']),
      ' note carries the route you were on; a ',
      h.span([h.Class('dt-kind loom')], ['loom']),
      ' note on rendered Loom source resolves back to the exact place in the ',
      h.span([h.Class('dt-kind file')], ['.loom']),
      ' file that produced it.',
    ],
  )

const wovenSample = (): Html =>
  h.div(
    [
      h.Class('dt-woven'),
      h.DataAttribute('loom-chapter', '02-pricing'),
      h.DataAttribute('loom-section', 'Rounding money'),
    ],
    [
      h.p([h.Class('dt-woven-says'), h.DataAttribute('pick', 'p')], [
        'Pick any element here to see notes get the loom tier.',
      ]),
      h.div([h.Class('dt-woven-code'), h.DataAttribute('pick', 'div')], [
        h.span([h.Class('tok-keyword')], ['const']),
        ' foo = (n: number): string => "bar"',
      ]),
    ],
  )

const docsCard = (): Html =>
  h.a(
    [h.Class('dt-docs'), h.Href('/docs'), h.OnClick(WentTo({ route: 'docs' }))],
    [
      carpetMark(docsCarpet, '38px'),
      h.span(
        [h.Class('lines')],
        [
          h.span([h.Class('eyebrow')], ['Docs']),
          h.span([h.Class('dt-docs-title')], ['Read the docs']),
        ],
      ),
    ],
  )

const noteRow = (note: Note): Html =>
  h.div(
    [h.Class('dt-note')],
    [
      h.div(
        [h.Class('dt-note-head')],
        [
          h.span([h.Class('dt-note-seq')], [`#${note.seq}`]),
          h.span([h.Class(`dt-kind ${note.kind}`)], [note.kind]),
          h.span([h.Class('dt-note-pointer')], [note.pointer]),
          h.span([h.Class('dt-note-route')], [note.route]),
        ],
      ),
      h.span([h.Class('dt-note-text')], [note.text]),
      h.div(
        [h.Class('dt-note-acts')],
        [
          h.button(
            [h.Class('dt-act resolve'), h.Type('button'), h.OnClick(ResolvedNote({ seq: note.seq }))],
            [note.addressed ? 'reopen' : 'resolve'],
          ),
          h.button(
            [h.Class('dt-act'), h.Type('button'), h.OnClick(DiscardedNote({ seq: note.seq }))],
            ['discard'],
          ),
        ],
      ),
    ],
  )

const shownNotes = (model: Model): ReadonlyArray<Note> =>
  Match.value(model.noteTab).pipe(
    Match.when('open', () => openNotes(model)),
    Match.when('resolved', () => Array.filter(model.notes, (note) => note.addressed)),
    Match.exhaustive,
  )

const emptyLine = (tab: NoteTab): string =>
  Match.value(tab).pipe(
    Match.when('open', () => 'No open notes. Pick something and leave one.'),
    Match.when('resolved', () => 'Nothing resolved yet.'),
    Match.exhaustive,
  )

const noteList = (model: Model): Html => {
  const shown = shownNotes(model)
  return h.div(
    [h.Class('dt-list')],
    Array.isReadonlyArrayEmpty(shown)
      ? [h.div([h.Class('dt-empty')], [emptyLine(model.noteTab)])]
      : Array.map(shown, noteRow),
  )
}

const tab = (model: Model, which: NoteTab, label: string): Html =>
  h.button(
    [
      h.Class(model.noteTab === which ? 'dt-tab here' : 'dt-tab'),
      h.Type('button'),
      h.OnClick(ShowedNotes({ tab: which })),
    ],
    [label],
  )

const draftKey = (key: string, model: Model): Message =>
  Match.value(key).pipe(
    Match.when('Enter', () => SentNote()),
    Match.orElse(() => DraftedNote({ text: model.draft })),
  )

const aimedChip = (target: Target): Html =>
  h.div(
    [h.Class('dt-chip')],
    [
      h.span([h.Class('dt-chip-eye')], ['◎']),
      h.span([h.Class('dt-chip-label')], [target.pointer]),
      h.button(
        [h.Class('dt-chip-drop'), h.Type('button'), h.OnClick(ClearedTarget())],
        ['✕'],
      ),
    ],
  )

const composer = (model: Model): Html =>
  h.div(
    [h.Class('dt-composer')],
    [
      ...Option.match(model.aimed, {
        onNone: (): ReadonlyArray<Html> => [],
        onSome: (target) => [aimedChip(target)],
      }),
      h.input([
        h.Class('dt-draft'),
        h.Value(model.draft),
        h.Placeholder('Leave a note…'),
        h.OnInput((text) => DraftedNote({ text })),
        h.OnKeyDown((key) => draftKey(key, model)),
      ]),
      h.div(
        [h.Class('dt-send-row')],
        [
          h.button(
            [
              h.Class(model.picking ? 'dt-pick-chip picking' : 'dt-pick-chip'),
              h.Type('button'),
              h.OnClick(ToggledPicker()),
            ],
            [model.picking ? 'Escape to cancel' : 'Pick element'],
          ),
          h.button(
            [
              h.Class(model.draft.trim() === '' ? 'dt-send' : 'dt-send ready'),
              h.Type('button'),
              h.OnClick(SentNote()),
            ],
            ['Send'],
          ),
        ],
      ),
    ],
  )

const panel = (model: Model): Html =>
  h.div(
    [h.Class('dt-panel'), h.DataAttribute('dt-chrome', '1')],
    [
      h.div(
        [h.Class('dt-panel-head')],
        [
          h.span([h.Class('dt-panel-title')], ['Notes']),
          h.span([h.Class('dt-tabs')], [tab(model, 'open', 'open'), tab(model, 'resolved', 'resolved')]),
          h.button(
            [h.Class('dt-close'), h.Type('button'), h.OnClick(ClosedNotes())],
            ['✕'],
          ),
        ],
      ),
      noteList(model),
      composer(model),
    ],
  )

const outline = (highlight: Highlight): ReadonlyArray<Html> => [
  h.span(
    [
      h.AriaHidden(true),
      h.Class('dt-outline'),
      h.Style({
        left: `${highlight.left}px`,
        top: `${highlight.top}px`,
        width: `${highlight.width}px`,
        height: `${highlight.height}px`,
      }),
    ],
    [],
  ),
  h.span(
    [
      h.AriaHidden(true),
      h.Class('dt-outline-label'),
      h.Style({ left: `${highlight.left}px`, top: `${highlight.top - 16}px` }),
    ],
    [highlight.label],
  ),
]

export const devtools = (model: Model): Html =>
  h.div(
    [h.Class('section'), h.Id('loom-devtools')],
    [
      h.div(
        [h.Class('section-head')],
        [
          carpetMark(devtoolsCarpet, '42px', broadSeam),
          h.div(
            [h.Class('lines')],
            [
              h.span([h.Class('eyebrow'), h.DataAttribute('pick', 'span.eyebrow')], [
                'Complementary tools',
              ]),
              h.h2([h.DataAttribute('pick', 'h2#devtools')], ['Loom Devtools']),
            ],
          ),
        ],
      ),
      h.div(
        [h.Class('dt-grid')],
        [
          h.div([h.Class('dt-col')], [kinds()]),
          h.div(
            [h.Class('dt-col dt-aim')],
            [
              h.div(
                [h.Class('dt-chrome'), h.DataAttribute('dt-chrome', '1')],
                [model.barCollapsed ? handle(model) : bar(model)],
              ),
              wovenSample(),
              docsCard(),
            ],
          ),
        ],
      ),
      ...(panelOpen(model) ? [panel(model)] : []),
      ...Option.match(model.highlight, {
        onNone: (): ReadonlyArray<Html> => [],
        onSome: outline,
      }),
    ],
  )
