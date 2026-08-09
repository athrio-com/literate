export const PlayerOutput = S.Literals(['tangle', 'weave'])
export type PlayerOutput = typeof PlayerOutput.Type

export const Player = S.Struct({
  struck: S.Number,
  beat: S.Number,
  playing: S.Boolean,
  output: S.Option(PlayerOutput),
  full: S.Boolean,
})
export type Player = typeof Player.Type

export const NoteKind = S.Literals(['chat', 'dom', 'loom'])
export type NoteKind = typeof NoteKind.Type

export const NoteTab = S.Literals(['open', 'resolved'])
export type NoteTab = typeof NoteTab.Type

export const Note = S.Struct({
  seq: S.Number,
  kind: NoteKind,
  pointer: S.String,
  route: S.String,
  text: S.String,
  addressed: S.Boolean,
})
export type Note = typeof Note.Type

export const Target = S.Struct({
  kind: NoteKind,
  label: S.String,
  pointer: S.String,
})
export type Target = typeof Target.Type

export const Highlight = S.Struct({
  label: S.String,
  left: S.Number,
  top: S.Number,
  width: S.Number,
  height: S.Number,
})
export type Highlight = typeof Highlight.Type

import { Option, Schema as S } from 'effect'
import { html } from 'foldkit/html'
import { m } from 'foldkit/message'

export const Route = S.Literals(['home', 'why-loom', 'docs', 'community', 'source'])
export type Route = typeof Route.Type

export const Runtime = S.Literals(['bun', 'deno', 'npm', 'pnpm'])
export type Runtime = typeof Runtime.Type

export const Model = S.Struct({
  route: Route,
  chapter: S.String,
  navHidden: S.Boolean,
  drawerOpen: S.Boolean,
  runtime: Runtime,
  searchOpen: S.Boolean,
  caret: S.Number,
  searching: S.Boolean,
  activeSection: S.String,
  player: Player,
  version: S.String,
  query: S.String,
  focus: S.Number,
  copied: S.String,
  notes: S.Array(Note),
  seq: S.Number,
  notesOpen: S.Boolean,
  barCollapsed: S.Boolean,
  picking: S.Boolean,
  noteTab: NoteTab,
  aimed: S.Option(Target),
  draft: S.String,
  highlight: S.Option(Highlight),
})
export type Model = typeof Model.Type

export const WentTo = m('WentTo', { route: Route })
export const OpenedChapter = m('OpenedChapter', { slug: S.String })
export const PickedRuntime = m('PickedRuntime', { runtime: Runtime })
export const ScrolledBar = m('ScrolledBar', { hidden: S.Boolean })
export const OpenedDrawer = m('OpenedDrawer')
export const ClosedDrawer = m('ClosedDrawer')
export const OpenedSearch = m('OpenedSearch')
export const ClosedSearch = m('ClosedSearch')
export const MovedCaret = m('MovedCaret', { at: S.Number })
export const SettledSearch = m('SettledSearch')
export const ToggledPlay = m('ToggledPlay')
export const ReplayedDocument = m('ReplayedDocument')
export const SkippedToEnd = m('SkippedToEnd')
export const ToggledFullHeight = m('ToggledFullHeight')
export const GrewCard = m('GrewCard')
export const Ticked = m('Ticked', { delta: S.Number })
export const ShowedOutput = m('ShowedOutput', { which: PlayerOutput })
export const StageMoved = m('StageMoved')
export const SelectedSection = m('SelectedSection', { id: S.String })
export const SectionScrolled = m('SectionScrolled')
export const SpottedSection = m('SpottedSection', { id: S.String })
export const Typed = m('Typed', { query: S.String })
export const MovedFocus = m('MovedFocus', { delta: S.Number, count: S.Number })
export const Copied = m('Copied', { id: S.String, text: S.String })
export const CopyReset = m('CopyReset')
export const ToggledPicker = m('ToggledPicker')
export const PickingApplied = m('PickingApplied')
export const CancelledPick = m('CancelledPick')
export const AimedAt = m('AimedAt', { highlight: Highlight })
export const AimedAway = m('AimedAway')
export const PickedTarget = m('PickedTarget', { target: Target })
export const ToggledNotes = m('ToggledNotes')
export const ClosedNotes = m('ClosedNotes')
export const CollapsedBar = m('CollapsedBar')
export const ExpandedBar = m('ExpandedBar')
export const ShowedNotes = m('ShowedNotes', { tab: NoteTab })
export const ResolvedNote = m('ResolvedNote', { seq: S.Number })
export const DiscardedNote = m('DiscardedNote', { seq: S.Number })
export const ClearedTarget = m('ClearedTarget')
export const DraftedNote = m('DraftedNote', { text: S.String })
export const SentNote = m('SentNote')

export const Message = S.Union([
  WentTo,
  OpenedChapter,
  PickedRuntime,
  ScrolledBar,
  OpenedDrawer,
  ClosedDrawer,
  OpenedSearch,
  ClosedSearch,
  MovedCaret,
  SettledSearch,
  ToggledPlay,
  ReplayedDocument,
  SkippedToEnd,
  ToggledFullHeight,
  GrewCard,
  Ticked,
  ShowedOutput,
  StageMoved,
  SelectedSection,
  SectionScrolled,
  SpottedSection,
  Typed,
  MovedFocus,
  Copied,
  CopyReset,
  ToggledPicker,
  PickingApplied,
  CancelledPick,
  AimedAt,
  AimedAway,
  PickedTarget,
  ToggledNotes,
  ClosedNotes,
  CollapsedBar,
  ExpandedBar,
  ShowedNotes,
  ResolvedNote,
  DiscardedNote,
  ClearedTarget,
  DraftedNote,
  SentNote,
])
export type Message = typeof Message.Type

export const h = html<Message>()
