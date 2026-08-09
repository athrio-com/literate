import { Array } from 'effect'
import type { Html } from 'foldkit/html'
import { h } from './model'
import { broadSeam, carpetMark, vocabularyCarpet } from './components'

type Mark = {
  readonly glyph: string
  readonly colour: string
  readonly tint: string
  readonly name: string
  readonly says: string
}

export const marks: ReadonlyArray<Mark> = [
  {
    glyph: '---',
    colour: '#8B5CF6',
    tint: '#F0EAFE',
    name: 'Frontmatter',
    says: 'Frontmatter opens a chapter and carries its metadata.',
  },
  {
    glyph: '#',
    colour: '#2E6FF2',
    tint: '#EAF1FE',
    name: 'Section',
    says: 'A heading opens a section and names it.',
  },
  {
    glyph: '{{ }}',
    colour: '#5A8DF6',
    tint: '#EDF3FE',
    name: 'Warp',
    says: 'Warps bind variables which are used for values interpolation.',
  },
  {
    glyph: '[ ]',
    colour: '#2E6FF2',
    tint: '#EAF1FE',
    name: 'Sink',
    says: 'A sink names the file a section tangles into.',
  },
  {
    glyph: '{ }',
    colour: '#8A5A00',
    tint: '#FDF3DF',
    name: 'Specifier',
    says: 'A specifier gives a section its language or its role.',
  },
  {
    glyph: '=>',
    colour: '#00996B',
    tint: '#E4F7F0',
    name: 'Arrow',
    says: 'An arrow turns from prose into code.',
  },
  {
    glyph: '~',
    colour: '#E8501F',
    tint: '#FDEEE8',
    name: 'Tilde',
    says: 'A tilde turns back from code into prose.',
  },
  {
    glyph: `::${'['} ]`,
    colour: '#8B5CF6',
    tint: '#F0EAFE',
    name: 'Anchor',
    says: 'An anchor transcludes the section or a warp.',
  },
]

const glyphChip = (mark: Mark): Html =>
  h.span(
    [h.Class('mark-glyph'), h.Style({ color: mark.colour, background: `${mark.colour}1F` })],
    [mark.glyph],
  )

const markCard = (mark: Mark): Html =>
  h.div(
    [
      h.Class('mark-card'),
      h.Style({ '--mark-ink': mark.colour, '--mark-tint': mark.tint }),
    ],
    [
      h.span(
        [h.Class('mark-card-head')],
        [glyphChip(mark), h.span([h.Class('mark-name')], [mark.name])],
      ),
      h.span([h.Class('mark-says')], [mark.says]),
    ],
  )

export const vocabulary = (): Html =>
  h.div(
    [h.Class('section'), h.Id('loom-marks')],
    [
      h.div(
        [h.Class('section-head')],
        [
          carpetMark(vocabularyCarpet, '42px', broadSeam),
          h.div(
            [h.Class('lines')],
            [
              h.span([h.Class('eyebrow')], ['Loom syntax']),
              h.h2([], ['The whole vocabulary']),
            ],
          ),
        ],
      ),
      h.div([h.Class('mark-set')], Array.map(marks, markCard)),
    ],
  )
