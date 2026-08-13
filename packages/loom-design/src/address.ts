import { Array, Match, Option, Schema as S, pipe } from 'effect'
import { LoomSourceSchema, RectSchema, type Rect } from './note'

export const PendingSchema = S.Union([
  S.Struct({ kind: S.tag('dom'), selector: S.String, label: S.String, rect: RectSchema }),
  S.Struct({ kind: S.tag('loom'), source: LoomSourceSchema, label: S.String, rect: RectSchema }),
])
export type Pending = typeof PendingSchema.Type

export const LOOM_ANCHOR = '[data-loom-chapter][data-loom-section]'

export const rectOf = (el: Element): Rect => {
  const box = el.getBoundingClientRect()
  return { x: box.x, y: box.y, width: box.width, height: box.height }
}

export const shiftedBy = (rect: Rect, by: { readonly x: number; readonly y: number }): Rect => ({
  x: rect.x + by.x,
  y: rect.y + by.y,
  width: rect.width,
  height: rect.height,
})

export const labelOf = (el: Element): string =>
  `${el.tagName.toLowerCase()} "${(el.textContent ?? '').trim().slice(0, 40)}"`

const nthOfType = (el: Element): string => {
  const tag = el.tagName.toLowerCase()
  return Option.match(Option.fromNullishOr(el.parentElement), {
    onNone: () => tag,
    onSome: (parent) => {
      const twins = Array.filter(
        Array.fromIterable(parent.children),
        (child) => child.tagName === el.tagName,
      )
      const nth = Option.getOrElse(Array.findFirstIndex(twins, (child) => child === el), () => 0) + 1
      return twins.length > 1 ? `${tag}:nth-of-type(${nth})` : tag
    },
  })
}

const pathTo = (el: Element, budget: number): string =>
  el.parentElement === null || el.parentElement === el.ownerDocument.body || budget === 0
    ? nthOfType(el)
    : `${pathTo(el.parentElement, budget - 1)} > ${nthOfType(el)}`

export const selectorFor = (el: Element): string => (el.id === '' ? pathTo(el, 5) : `#${el.id}`)

export const anchorOf = (el: Element): Pending =>
  Option.match(Option.fromNullishOr(el.closest(LOOM_ANCHOR)), {
    onSome: (woven) => ({
      kind: 'loom' as const,
      source: {
        chapter: woven.getAttribute('data-loom-chapter') ?? '',
        section: woven.getAttribute('data-loom-section') ?? '',
      },
      label: labelOf(el),
      rect: rectOf(el),
    }),
    onNone: () => ({
      kind: 'dom' as const,
      selector: selectorFor(el),
      label: labelOf(el),
      rect: rectOf(el),
    }),
  })

export const shiftedAnchor = (
  pending: Pending,
  by: { readonly x: number; readonly y: number },
): Pending =>
  Match.value(pending).pipe(
    Match.withReturnType<Pending>(),
    Match.when({ kind: 'dom' }, (annotation) => ({
      ...annotation,
      rect: shiftedBy(annotation.rect, by),
    })),
    Match.when({ kind: 'loom' }, (annotation) => ({
      ...annotation,
      rect: shiftedBy(annotation.rect, by),
    })),
    Match.exhaustive,
  )

export const tagFor = (el: Element): string =>
  Option.match(Option.fromNullishOr(el.closest(LOOM_ANCHOR)), {
    onSome: (woven) => woven.getAttribute('data-loom-section') ?? '',
    onNone: () => selectorFor(el),
  })

export const isEditable = (el: Element | null): boolean =>
  pipe(
    Option.fromNullishOr(el),
    Option.flatMap((found) =>
      Option.map(Option.fromNullishOr(found.ownerDocument.defaultView), (view) => ({ found, view })),
    ),
    Option.match({
      onNone: () => false,
      onSome: ({ found, view }) =>
        found instanceof view.HTMLInputElement ||
        found instanceof view.HTMLTextAreaElement ||
        (found instanceof view.HTMLElement && found.isContentEditable),
    }),
  )
