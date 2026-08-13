import { Array, Effect, Match, Option, Queue, Schema as S, Stream } from 'effect'
import { Command, Subscription } from 'foldkit'
import { html } from 'foldkit/html'
import type { Html, KeyboardModifiers } from 'foldkit/html'
import { m } from 'foldkit/message'
import { clsx } from 'clsx'
import { NoteSchema, RectSchema, type Note } from './note'
import {
  PendingSchema,
  anchorOf,
  isEditable,
  rectOf,
  shiftedAnchor,
  shiftedBy,
  tagFor,
  type Pending,
} from './address'

const HoverSchema = S.Struct({ rect: RectSchema, tag: S.String })
type Hover = typeof HoverSchema.Type

const TabSchema = S.Literals(['open', 'resolved'])
type Tab = typeof TabSchema.Type

export const Model = S.Struct({
  base: S.String,
  project: S.String,
  entry: S.String,
  route: S.String,
  width: S.Number,
  notes: S.Array(NoteSchema),
  reachable: S.Boolean,
  tab: TabSchema,
  panel: S.Boolean,
  atBottom: S.Boolean,
  pendingScroll: S.Boolean,
  picking: S.Boolean,
  hover: S.optional(HoverSchema),
  pending: S.optional(PendingSchema),
  draft: S.String,
  editing: S.optional(S.Number),
  editText: S.String,
})
export type Model = typeof Model.Type

export const Navigated = m('Navigated', { route: S.String })
export const Mirrored = m('Mirrored')
export const Widened = m('Widened', { width: S.Number })

export const ToggledPanel = m('ToggledPanel')
export const ToggledPick = m('ToggledPick')
export const Hovered = m('Hovered', { hover: HoverSchema })
export const Picked = m('Picked', { pending: PendingSchema })
export const Escaped = m('Escaped')

export const DraftChanged = m('DraftChanged', { value: S.String })
export const Sent = m('Sent')
export const SelectedTab = m('SelectedTab', { tab: TabSchema })
export const Resolved = m('Resolved', { seq: S.Number })
export const Discarded = m('Discarded', { seq: S.Number })
export const StartedEdit = m('StartedEdit', { seq: S.Number, text: S.String })
export const EditChanged = m('EditChanged', { value: S.String })
export const SavedEdit = m('SavedEdit')
export const CancelledEdit = m('CancelledEdit')

export const GotNotes = m('GotNotes', { notes: S.Array(NoteSchema) })
export const Unreachable = m('Unreachable')
export const AtBottom = m('AtBottom', { at: S.Boolean })
export const JumpToBottom = m('JumpToBottom')
export const Scrolled = m('Scrolled')

export const Message = S.Union([
  Navigated,
  Mirrored,
  Widened,
  ToggledPanel,
  ToggledPick,
  Hovered,
  Picked,
  Escaped,
  DraftChanged,
  Sent,
  SelectedTab,
  Resolved,
  Discarded,
  StartedEdit,
  EditChanged,
  SavedEdit,
  CancelledEdit,
  GotNotes,
  Unreachable,
  AtBottom,
  JumpToBottom,
  Scrolled,
])
export type Message = typeof Message.Type

const h = html<Message>()

const feedUrl = (base: string, project: string): string =>
  `${base}/notes/feed?project=${encodeURIComponent(project)}`

const fetchFeed = (base: string, project: string) =>
  Effect.tryPromise(() =>
    fetch(feedUrl(base, project))
      .then((response) => response.json())
      .then((data) => GotNotes({ notes: S.decodeUnknownSync(S.Array(NoteSchema))(data) })),
  ).pipe(Effect.catchCause(() => Effect.succeed(Unreachable())))

const settle = (base: string, project: string, path: string, body: unknown) =>
  Effect.tryPromise(() =>
    fetch(`${base}${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }),
  ).pipe(
    Effect.andThen(fetchFeed(base, project)),
    Effect.catchCause(() => Effect.succeed(Unreachable())),
  )

const FetchNotes = Command.define(
  'FetchNotes',
  { base: S.String, project: S.String },
  GotNotes,
  Unreachable,
)(({ base, project }) => fetchFeed(base, project))

const SendChat = Command.define(
  'SendChat',
  { base: S.String, project: S.String, route: S.String, text: S.String },
  GotNotes,
  Unreachable,
)(({ base, project, route, text }) =>
  settle(base, project, '/notes/capture', { kind: 'chat', project, route, text }),
)

const SendAnnotation = Command.define(
  'SendAnnotation',
  { base: S.String, project: S.String, route: S.String, pending: PendingSchema, text: S.String },
  GotNotes,
  Unreachable,
)(({ base, project, route, pending, text }) =>
  settle(base, project, '/notes/capture', { ...pending, project, route, text }),
)

const SendResolve = Command.define(
  'SendResolve',
  { base: S.String, project: S.String, seq: S.Number },
  GotNotes,
  Unreachable,
)(({ base, project, seq }) => settle(base, project, '/notes/resolve', { project, seq }))

const SendDiscard = Command.define(
  'SendDiscard',
  { base: S.String, project: S.String, seq: S.Number },
  GotNotes,
  Unreachable,
)(({ base, project, seq }) => settle(base, project, '/notes/discard', { project, seq }))

const SendEdit = Command.define(
  'SendEdit',
  { base: S.String, project: S.String, seq: S.Number, text: S.String },
  GotNotes,
  Unreachable,
)(({ base, project, seq, text }) => settle(base, project, '/notes/edit', { project, seq, text }))

const MOUNT = '/__loom'
const FRAME_ID = 'loom-frame'

const Mirror = Command.define('Mirror', { route: S.String }, Mirrored, Mirrored)(({ route }) =>
  Effect.sync(() => {
    history.replaceState(null, '', route)
    return Mirrored()
  }),
)

type Detach = () => void

type View = Window & typeof globalThis

type Inside = { readonly page: Document; readonly view: View }

const frameOf = (): Option.Option<HTMLIFrameElement> =>
  Option.flatMap(Option.fromNullishOr(document.getElementById(FRAME_ID)), (found) =>
    found instanceof HTMLIFrameElement ? Option.some(found) : Option.none(),
  )

const insideOf = (frame: HTMLIFrameElement): Option.Option<Inside> =>
  Option.flatMap(Option.fromNullishOr(frame.contentDocument), (page) =>
    Option.map(Option.fromNullishOr(page.defaultView), (view) => ({ page, view })),
  )

const whileFramed = (
  attach: (frame: HTMLIFrameElement, inside: Inside, offer: (message: Message) => void) => Detach,
): Stream.Stream<Message> =>
  Stream.callback<Message>((queue) =>
    Effect.acquireRelease(
      Effect.sync(() => {
        const offer = (message: Message): void => {
          Queue.offerUnsafe(queue, message)
        }
        const held: {
          frame: HTMLIFrameElement | null
          onLoad: (() => void) | null
          detach: Detach
        } = { frame: null, onLoad: null, detach: () => {} }

        const enter = (frame: HTMLIFrameElement): void => {
          held.detach()
          held.detach = Option.match(insideOf(frame), {
            onNone: () => () => {},
            onSome: (inside) => attach(frame, inside, offer),
          })
        }

        const find = (): void =>
          Option.match(frameOf(), {
            onNone: () => {
              requestAnimationFrame(find)
            },
            onSome: (frame) => {
              const onLoad = (): void => enter(frame)
              frame.addEventListener('load', onLoad)
              held.frame = frame
              held.onLoad = onLoad
              enter(frame)
            },
          })

        find()
        return held
      }),
      (held) =>
        Effect.sync(() => {
          held.detach()
          if (held.frame !== null && held.onLoad !== null) {
            held.frame.removeEventListener('load', held.onLoad)
          }
        }),
    ).pipe(Effect.flatMap(() => Effect.never)),
  )

const routeOf = (view: View): string => `${view.location.pathname}${view.location.search}`

const followingRoute = (inside: Inside, offer: (message: Message) => void): Detach => {
  const { view } = inside
  const report = (): void => offer(Navigated({ route: routeOf(view) }))
  const pushed = view.history.pushState
  const replaced = view.history.replaceState

  view.history.pushState = (...args: Parameters<History['pushState']>): void => {
    pushed.apply(view.history, args)
    report()
  }
  view.history.replaceState = (...args: Parameters<History['replaceState']>): void => {
    replaced.apply(view.history, args)
    report()
  }
  view.addEventListener('popstate', report)
  report()

  return () => {
    view.history.pushState = pushed
    view.history.replaceState = replaced
    view.removeEventListener('popstate', report)
  }
}

const anchorFrom = (
  target: EventTarget | null,
  view: View,
): Option.Option<HTMLAnchorElement> =>
  target instanceof view.Element
    ? Option.flatMap(Option.fromNullishOr(target.closest('a[href]')), (found) =>
        found instanceof view.HTMLAnchorElement ? Option.some(found) : Option.none(),
      )
    : Option.none()

const wantsAWindow = (event: MouseEvent, anchor: HTMLAnchorElement): boolean =>
  anchor.target === '_blank' || event.metaKey || event.ctrlKey || event.button === 1

const insideThisApp = (view: View, href: string): boolean =>
  new URL(href, view.location.href).origin === view.location.origin

const divertedTo = (event: MouseEvent, view: View): Option.Option<string> =>
  Option.flatMap(anchorFrom(event.target, view), (anchor) =>
    wantsAWindow(event, anchor) && insideThisApp(view, anchor.href)
      ? Option.some(anchor.href)
      : Option.none(),
  )

const keepingTabs = (inside: Inside): Detach => {
  const { page, view } = inside
  const onClick = (event: MouseEvent): void =>
    Option.match(divertedTo(event, view), {
      onNone: () => {},
      onSome: (href) => {
        event.preventDefault()
        view.location.assign(href)
      },
    })
  const opened = view.open

  page.documentElement.addEventListener('click', onClick, { capture: true })
  page.documentElement.addEventListener('auxclick', onClick, { capture: true })
  view.open = (url?: string | URL): Window =>
    Option.match(Option.fromNullishOr(url), {
      onNone: () => view,
      onSome: (where) => {
        view.location.assign(String(where))
        return view
      },
    })

  return () => {
    page.documentElement.removeEventListener('click', onClick, { capture: true })
    page.documentElement.removeEventListener('auxclick', onClick, { capture: true })
    view.open = opened
  }
}

const shortcut = (event: KeyboardEvent, page: Document): Option.Option<Message> =>
  isEditable(page.activeElement) || !event.altKey || event.ctrlKey || event.metaKey
    ? Option.none()
    : Match.value(event.code).pipe(
        Match.withReturnType<Option.Option<Message>>(),
        Match.when('KeyA', () => Option.some(ToggledPick())),
        Match.when('KeyN', () => Option.some(ToggledPanel())),
        Match.orElse(() => Option.none()),
      )

const forwardingKeys = (inside: Inside, offer: (message: Message) => void): Detach => {
  const { page } = inside
  const onKey = (event: KeyboardEvent): void =>
    Option.match(shortcut(event, page), {
      onNone: () => {},
      onSome: (message) => {
        event.preventDefault()
        offer(message)
      },
    })
  const onEscape = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') offer(Escaped())
  }

  page.addEventListener('keydown', onKey, { capture: true })
  page.addEventListener('keydown', onEscape, { capture: true })

  return () => {
    page.removeEventListener('keydown', onKey, { capture: true })
    page.removeEventListener('keydown', onEscape, { capture: true })
  }
}

const framed: Stream.Stream<Message> = whileFramed((_frame, inside, offer) => {
  const route = followingRoute(inside, offer)
  const tabs = keepingTabs(inside)
  const keys = forwardingKeys(inside, offer)
  return () => {
    route()
    tabs()
    keys()
  }
})

const pickingInside: Stream.Stream<Message> = whileFramed((frame, inside, offer) => {
  const { page, view } = inside
  const offsetOf = (): { readonly x: number; readonly y: number } => {
    const box = frame.getBoundingClientRect()
    return { x: box.x, y: box.y }
  }
  const elementOf = (target: EventTarget | null): Option.Option<Element> =>
    target instanceof view.Element ? Option.some(target) : Option.none()

  const onMove = (event: MouseEvent): void =>
    Option.match(elementOf(event.target), {
      onNone: () => {},
      onSome: (el) =>
        offer(Hovered({ hover: { rect: shiftedBy(rectOf(el), offsetOf()), tag: tagFor(el) } })),
    })

  const onClick = (event: MouseEvent): void =>
    Option.match(elementOf(event.target), {
      onNone: () => {},
      onSome: (el) => {
        event.preventDefault()
        event.stopPropagation()
        offer(Picked({ pending: shiftedAnchor(anchorOf(el), offsetOf()) }))
      },
    })

  const crosshair = page.createElement('style')
  crosshair.textContent = '*, *::before, *::after { cursor: crosshair !important }'
  page.head.appendChild(crosshair)
  page.addEventListener('mousemove', onMove, { capture: true })
  page.addEventListener('click', onClick, { capture: true })

  return () => {
    crosshair.remove()
    page.removeEventListener('mousemove', onMove, { capture: true })
    page.removeEventListener('click', onClick, { capture: true })
  }
})

const NOTES_ID = 'loom-notes-list'

const noteListElement = (): Element | null => document.getElementById(NOTES_ID)

const ScrollNotes = Command.define('ScrollNotes', Scrolled)(
  Effect.sync(() => {
    requestAnimationFrame(() => {
      const list = noteListElement()
      if (list !== null) list.scrollTop = list.scrollHeight
    })
    return Scrolled()
  }),
)

const nearBottom = (list: Element): boolean =>
  list.scrollHeight - list.scrollTop - list.clientHeight < 40

const bottomStream: Stream.Stream<Message> = Stream.callback<Message>((queue) =>
  Effect.acquireRelease(
    Effect.sync(() => {
      const watch: { list: Element | null; onScroll: (() => void) | null; live: boolean } = {
        list: null,
        onScroll: null,
        live: true,
      }
      const attach = (): void => {
        if (!watch.live) return
        const list = noteListElement()
        if (list === null) {
          requestAnimationFrame(attach)
          return
        }
        const onScroll = (): void => {
          Queue.offerUnsafe(queue, AtBottom({ at: nearBottom(list) }))
        }
        list.addEventListener('scroll', onScroll, { passive: true })
        watch.list = list
        watch.onScroll = onScroll
        onScroll()
      }
      attach()
      return watch
    }),
    (watch) =>
      Effect.sync(() => {
        watch.live = false
        if (watch.list !== null && watch.onScroll !== null) {
          watch.list.removeEventListener('scroll', watch.onScroll)
        }
      }),
  ).pipe(Effect.flatMap(() => Effect.never)),
)

const subscriptions = Subscription.make<Model, Message>()((entry) => ({
  frame: entry(
    { project: S.String },
    {
      modelToDependencies: (model) => ({ project: model.project }),
      dependenciesToStream: () => framed,
    },
  ),
  pick: entry(
    { picking: S.Boolean },
    {
      modelToDependencies: (model) => ({ picking: model.picking }),
      dependenciesToStream: ({ picking }) => (picking ? pickingInside : Stream.empty),
    },
  ),
  bottomWatch: entry(
    { panel: S.Boolean },
    {
      modelToDependencies: (model) => ({ panel: model.panel }),
      dependenciesToStream: ({ panel }) => (panel ? bottomStream : Stream.empty),
    },
  ),
  shellKeys: entry(
    { project: S.String },
    {
      modelToDependencies: (model) => ({ project: model.project }),
      dependenciesToStream: () =>
        Subscription.fromEventFilterMap<KeyboardEvent, Message>({
          target: document,
          type: 'keydown',
          options: { capture: true },
          toMessage: (event) =>
            event.key === 'Escape'
              ? Option.some(Escaped())
              : Option.match(shortcut(event, document), {
                  onNone: () => Option.none<Message>(),
                  onSome: (message) => {
                    event.preventDefault()
                    return Option.some(message)
                  },
                }),
        }),
    },
  ),
}))

const sent = (model: Model): readonly [Model, ReadonlyArray<Command.Command<Message>>] =>
  model.pending === undefined
    ? [
        { ...model, draft: '', pendingScroll: true },
        [
          SendChat({
            base: model.base,
            project: model.project,
            route: model.route,
            text: model.draft,
          }),
        ],
      ]
    : [
        { ...model, draft: '', pending: undefined, pendingScroll: true },
        [
          SendAnnotation({
            base: model.base,
            project: model.project,
            route: model.route,
            pending: model.pending,
            text: model.draft,
          }),
        ],
      ]

const saved = (model: Model): readonly [Model, ReadonlyArray<Command.Command<Message>>] =>
  model.editing === undefined
    ? [model, []]
    : [
        { ...model, editing: undefined },
        [
          SendEdit({
            base: model.base,
            project: model.project,
            seq: model.editing,
            text: model.editText,
          }),
        ],
      ]

const update = (
  model: Model,
  message: Message,
): readonly [Model, ReadonlyArray<Command.Command<Message>>] =>
  Match.value(message).pipe(
    Match.withReturnType<readonly [Model, ReadonlyArray<Command.Command<Message>>]>(),
    Match.tagsExhaustive({
      Navigated: ({ route }) => [{ ...model, route }, [Mirror({ route })]],
      Mirrored: () => [model, []],
      Widened: ({ width }) => [{ ...model, width }, []],
      ToggledPanel: () =>
        model.panel
          ? [{ ...model, panel: false }, []]
          : [
              { ...model, panel: true, pendingScroll: true },
              [FetchNotes({ base: model.base, project: model.project }), ScrollNotes()],
            ],
      ToggledPick: () => [{ ...model, picking: !model.picking, hover: undefined }, []],
      Hovered: ({ hover }) => [{ ...model, hover }, []],
      Picked: ({ pending }) => [
        { ...model, picking: false, pending, hover: undefined, panel: true },
        [],
      ],
      Escaped: () => [{ ...model, picking: false, pending: undefined, hover: undefined }, []],
      DraftChanged: ({ value }) => [{ ...model, draft: value }, []],
      Sent: () => (model.draft.trim() === '' ? [model, []] : sent(model)),
      SelectedTab: ({ tab }) => [{ ...model, tab }, []],
      Resolved: ({ seq }) => [
        model,
        [SendResolve({ base: model.base, project: model.project, seq })],
      ],
      Discarded: ({ seq }) => [
        model,
        [SendDiscard({ base: model.base, project: model.project, seq })],
      ],
      StartedEdit: ({ seq, text }) => [{ ...model, editing: seq, editText: text }, []],
      EditChanged: ({ value }) => [{ ...model, editText: value }, []],
      SavedEdit: () => saved(model),
      CancelledEdit: () => [{ ...model, editing: undefined }, []],
      GotNotes: ({ notes }) =>
        model.pendingScroll
          ? [
              { ...model, notes, reachable: true, pendingScroll: false, atBottom: true },
              [ScrollNotes()],
            ]
          : [{ ...model, notes, reachable: true }, []],
      Unreachable: () => [{ ...model, reachable: false }, []],
      AtBottom: ({ at }) => [{ ...model, atBottom: at }, []],
      JumpToBottom: () => [{ ...model, atBottom: true }, [ScrollNotes()]],
      Scrolled: () => [model, []],
    }),
  )

const wordmark = (): Html => h.span([h.Class('nav-word')], ['Loom Design'])

const routeLabel = (model: Model): Html =>
  h.span([h.Class('shell-route'), h.Title(model.route)], [model.route])

const projectLabel = (model: Model): Html =>
  h.span([h.Class('shell-project')], [model.project])

const WIDTHS: ReadonlyArray<{ readonly label: string; readonly width: number }> = [
  { label: 'fill', width: 0 },
  { label: '1440', width: 1440 },
  { label: '1280', width: 1280 },
  { label: '1024', width: 1024 },
  { label: '768', width: 768 },
  { label: '390', width: 390 },
]

const widthPill = (label: string, width: number, here: boolean): Html =>
  h.button(
    [
      h.Class(clsx('shell-width', here && 'here')),
      h.Type('button'),
      h.Title(width === 0 ? 'Fill the stage' : `Render at ${width} pixels`),
      h.OnClick(Widened({ width })),
    ],
    [label],
  )

const widthRow = (model: Model): Html =>
  h.div(
    [h.Class('shell-widths')],
    Array.map(WIDTHS, (choice) =>
      widthPill(choice.label, choice.width, choice.width === model.width),
    ),
  )

const openCount = (notes: ReadonlyArray<Note>): number =>
  Array.filter(notes, (note) => !note.addressed).length

const pickControl = (model: Model): Html =>
  h.button(
    [
      h.Class(clsx('shell-tool', model.picking && 'armed')),
      h.Type('button'),
      h.Title(model.picking ? 'Picking — escape to cancel' : 'Pick an element (Alt+A)'),
      h.OnClick(ToggledPick()),
    ],
    ['◎ pick'],
  )

const notesControl = (model: Model): Html => {
  const open = openCount(model.notes)
  return h.button(
    [
      h.Class(clsx('shell-tool', model.panel && 'here')),
      h.Type('button'),
      h.Title('Notes (Alt+N)'),
      h.OnClick(ToggledPanel()),
    ],
    ['notes', ...(open === 0 ? [] : [h.span([h.Class('shell-count')], [String(open)])])],
  )
}

const bar = (model: Model): Html =>
  h.div(
    [h.Class('nav shell-nav')],
    [
      wordmark(),
      projectLabel(model),
      routeLabel(model),
      h.div([h.Class('shell-gap')], []),
      widthRow(model),
      pickControl(model),
      notesControl(model),
    ],
  )

const stage = (model: Model): Html =>
  h.div(
    [h.Class('shell-stage')],
    [
      h.iframe(
        [
          h.Id(FRAME_ID),
          h.Class('shell-frame'),
          h.Src(model.entry),
          h.Title('The application'),
          h.Allow('clipboard-write; fullscreen'),
          h.Style(model.width === 0 ? { width: '100%' } : { width: `${model.width}px` }),
        ],
        [],
      ),
    ],
  )

const highlight = (hover: Hover): Html =>
  h.div(
    [
      h.Class('shell-highlight'),
      h.Style({
        left: `${hover.rect.x}px`,
        top: `${hover.rect.y}px`,
        width: `${hover.rect.width}px`,
        height: `${hover.rect.height}px`,
      }),
    ],
    [h.span([h.Class('shell-highlight-tag')], [hover.tag])],
  )

const kindInk = (note: Note): string =>
  Match.value(note).pipe(
    Match.when({ kind: 'chat' }, () => 'chat'),
    Match.when({ kind: 'dom' }, () => 'dom'),
    Match.when({ kind: 'loom' }, () => 'loom'),
    Match.exhaustive,
  )

const pointerOf = (note: Note): Option.Option<string> =>
  Match.value(note).pipe(
    Match.withReturnType<Option.Option<string>>(),
    Match.when({ kind: 'dom' }, (annotation) => Option.some(annotation.selector)),
    Match.when({ kind: 'loom' }, (annotation) => Option.some(annotation.source.section)),
    Match.when({ kind: 'chat' }, () => Option.none()),
    Match.exhaustive,
  )

const noteMeta = (note: Note): Html =>
  h.div(
    [h.Class('note-meta')],
    [
      h.span([h.Class(`note-kind ${kindInk(note)}`)], [note.kind]),
      ...Option.match(pointerOf(note), {
        onNone: () => [],
        onSome: (pointer) => [h.span([h.Class('note-pointer')], [pointer])],
      }),
      h.span([h.Class('note-route')], [note.route]),
    ],
  )

const noteControl = (label: string, message: Message, tone: string): Html =>
  h.button([h.Class(`note-do ${tone}`), h.Type('button'), h.OnClick(message)], [label])

const noteControls = (note: Note): Html =>
  h.div(
    [h.Class('note-controls')],
    [
      noteControl('edit', StartedEdit({ seq: note.seq, text: note.text }), 'quiet'),
      ...(note.addressed
        ? []
        : [noteControl('resolve', Resolved({ seq: note.seq }), 'done')]),
      noteControl('discard', Discarded({ seq: note.seq }), 'quiet'),
    ],
  )

const editRow = (editText: string): Html =>
  h.div(
    [h.Class('note-edit')],
    [
      h.textarea(
        [
          h.Class('note-field'),
          h.Value(editText),
          h.OnInput((value: string) => EditChanged({ value })),
        ],
        [],
      ),
      h.div(
        [h.Class('note-edit-actions')],
        [
          h.button([h.Class('note-save'), h.Type('button'), h.OnClick(SavedEdit())], ['Save']),
          h.button(
            [h.Class('note-cancel'), h.Type('button'), h.OnClick(CancelledEdit())],
            ['Cancel'],
          ),
        ],
      ),
    ],
  )

const noteRow = (note: Note, editing: number | undefined, editText: string): Html =>
  note.seq === editing
    ? editRow(editText)
    : h.div(
        [h.Class('note-row')],
        [noteMeta(note), h.div([h.Class('note-text')], [note.text]), noteControls(note)],
      )

const visibleNotes = (model: Model): ReadonlyArray<Note> =>
  Array.filter(model.notes, (note) =>
    model.tab === 'resolved' ? note.addressed : !note.addressed,
  )

const emptyState = (model: Model): Html =>
  h.div(
    [h.Class('note-empty')],
    [
      model.tab === 'resolved'
        ? 'No resolved notes yet.'
        : 'No open notes. Pick something in the frame, or type one below.',
    ],
  )

const noteList = (model: Model): Html => {
  const notes = visibleNotes(model)
  return h.div(
    [h.Id(NOTES_ID), h.Class('note-list')],
    notes.length === 0
      ? [emptyState(model)]
      : Array.map(notes, (note) => noteRow(note, model.editing, model.editText)),
  )
}

const banner = (): Html =>
  h.div(
    [h.Class('note-banner')],
    [
      h.div([h.Class('note-banner-head')], ["The notes server isn't answering."]),
      h.div([h.Class('note-banner-say')], ['Design serves it from the same port as this page.']),
    ],
  )

const tabButton = (label: string, value: Tab, active: boolean): Html =>
  h.button(
    [
      h.Class(clsx('note-tab', active && 'here')),
      h.Type('button'),
      h.OnClick(SelectedTab({ tab: value })),
    ],
    [label],
  )

const composerKey =
  (draft: string) =>
  (key: string, mods: KeyboardModifiers): Option.Option<Message> => {
    if (key !== 'Enter') return Option.none()
    if (mods.ctrlKey || mods.metaKey) return Option.some(DraftChanged({ value: `${draft}\n` }))
    if (mods.shiftKey) return Option.none()
    return Option.some(Sent())
  }

const draftArea = (model: Model, placeholder: string): Html =>
  h.textarea(
    [
      h.Class('note-field'),
      h.Value(model.draft),
      h.Placeholder(placeholder),
      h.OnInput((value: string) => DraftChanged({ value })),
      h.OnKeyDownPreventDefault(composerKey(model.draft)),
    ],
    [],
  )

const scrollDown = (): Html =>
  h.button(
    [
      h.Class('note-jump'),
      h.Type('button'),
      h.Title('Jump to the latest'),
      h.OnClick(JumpToBottom()),
    ],
    ['↓'],
  )

const composer = (model: Model): Html =>
  h.div(
    [h.Class('note-composer')],
    [
      ...(model.atBottom ? [] : [scrollDown()]),
      ...Option.match(Option.fromNullishOr(model.pending), {
        onNone: () => [],
        onSome: (pending) => [h.div([h.Class('note-aimed')], [`◎ ${pending.label}`])],
      }),
      draftArea(
        model,
        model.pending === undefined
          ? 'Leave a note…'
          : 'What should this element say or do?',
      ),
      h.div(
        [h.Class('note-send-row')],
        [
          ...(model.pending === undefined
            ? []
            : [
                h.button(
                  [h.Class('note-cancel'), h.Type('button'), h.OnClick(Escaped())],
                  ['Cancel'],
                ),
              ]),
          h.button(
            [h.Class('note-send'), h.Type('button'), h.OnClick(Sent())],
            [model.pending === undefined ? 'Send' : 'Add note'],
          ),
        ],
      ),
    ],
  )

const panel = (model: Model): Html =>
  h.aside(
    [h.Class('shell-panel')],
    [
      h.div(
        [h.Class('note-head')],
        [
          tabButton('Open', 'open', model.tab === 'open'),
          tabButton('Resolved', 'resolved', model.tab === 'resolved'),
        ],
      ),
      ...(model.reachable ? [] : [banner()]),
      noteList(model),
      composer(model),
    ],
  )

const view = (model: Model): Html =>
  h.div(
    [h.Class(clsx('shell', model.picking && 'picking'))],
    [
      bar(model),
      h.div(
        [h.Class('shell-body')],
        [stage(model), ...(model.panel ? [panel(model)] : [])],
      ),
      ...(model.picking && model.hover !== undefined ? [highlight(model.hover)] : []),
    ],
  )

import { makeElement, run } from 'foldkit/runtime'

const projectOf = (): string =>
  Option.match(Option.fromNullishOr(document.body.getAttribute('data-loom-project')), {
    onNone: () => 'local',
    onSome: (project) => project,
  })

const entryOf = (): string => `${location.pathname}${location.search}`

const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  const project = projectOf()
  const entry = entryOf()
  return [
    {
      base: MOUNT,
      project,
      entry,
      route: entry,
      width: 0,
      notes: [],
      reachable: true,
      tab: 'open',
      panel: true,
      atBottom: true,
      pendingScroll: false,
      picking: false,
      draft: '',
      editText: '',
    },
    [FetchNotes({ base: MOUNT, project })],
  ]
}

export const start = (): void => {
  const container = document.getElementById('shell')
  if (container === null) return
  run(makeElement({ Model, init, update, view, subscriptions, container }))
}

start()
