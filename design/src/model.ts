import { Schema as S } from 'effect'
import { html } from 'foldkit/html'
import { m } from 'foldkit/message'
import * as Gomoku from '../../examples/gomoku/gomoku'

export const Accent = S.Literals(['rust', 'duo', 'ochre', 'olive', 'moss', 'fuchsia', 'electric', 'grape'])
export type Accent = typeof Accent.Type

export const TitleColors = S.Literals(['three', 'two'])
export type TitleColors = typeof TitleColors.Type

export const Model = S.Struct({
  theme: S.Literals(['dark', 'light']),
  accent: Accent,
  titleColors: TitleColors,
  rotatorIndex: S.Number,
  rotatorPhase: S.Literals(['normal', 'out', 'in-start']),
  activeSection: S.String,
  exampleTab: S.Literals(['loom', 'tangled', 'play']),
  loomView: S.Literals(['preview', 'source']),
  exampleExpanded: S.Boolean,
  game: Gomoku.Model,
  version: S.String,
  query: S.String,
  focus: S.Number,
  copied: S.String,
})
export type Model = typeof Model.Type

export const ToggledTheme = m('ToggledTheme')
export const ThemeApplied = m('ThemeApplied')
export const SelectedAccent = m('SelectedAccent', { accent: Accent })
export const AccentApplied = m('AccentApplied')
export const SelectedTitleColors = m('SelectedTitleColors', { titleColors: TitleColors })
export const TitleColorsApplied = m('TitleColorsApplied')
export const SelectedTab = m('SelectedTab', { tab: S.Literals(['loom', 'tangled', 'play']) })
export const SelectedLoomView = m('SelectedLoomView', { view: S.Literals(['preview', 'source']) })
export const ExpandedExample = m('ExpandedExample')
export const GotGameMessage = m('GotGameMessage', { message: Gomoku.Message })
export const SelectedSection = m('SelectedSection', { id: S.String })
export const SectionScrolled = m('SectionScrolled')
export const SpottedSection = m('SpottedSection', { id: S.String })
export const Typed = m('Typed', { query: S.String })
export const MovedFocus = m('MovedFocus', { delta: S.Number, count: S.Number })
export const Copied = m('Copied', { id: S.String, text: S.String })
export const CopyReset = m('CopyReset')
export const RotatedOut = m('RotatedOut')
export const RotatedIn = m('RotatedIn')
export const RotatorSettled = m('RotatorSettled')

export const Message = S.Union([
  ToggledTheme,
  ThemeApplied,
  SelectedAccent,
  AccentApplied,
  SelectedTitleColors,
  TitleColorsApplied,
  SelectedTab,
  SelectedLoomView,
  ExpandedExample,
  GotGameMessage,
  SelectedSection,
  SectionScrolled,
  SpottedSection,
  Typed,
  MovedFocus,
  Copied,
  CopyReset,
  RotatedOut,
  RotatedIn,
  RotatorSettled,
])
export type Message = typeof Message.Type

export const h = html<Message>()
