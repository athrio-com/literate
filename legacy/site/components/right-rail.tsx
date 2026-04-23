'use client'

import { useEffect, useState } from 'react'

export interface TocItem {
  readonly id: string
  readonly label: string
  readonly depth: 2 | 3
}

interface RightRailProps {
  /** Optional server-provided items. When omitted, the rail scans the DOM. */
  readonly items?: readonly TocItem[]
  readonly editUrl?: string
  readonly reportUrl?: string
}

function scanHeadings(): TocItem[] {
  const roots = document.querySelectorAll<HTMLElement>('.lf-prose h2[id], .lf-prose h3[id]')
  return Array.from(roots).map((h) => ({
    id: h.id,
    label: h.textContent?.trim() ?? h.id,
    depth: h.tagName === 'H2' ? 2 : 3,
  }))
}

export function RightRail({ items: provided, editUrl, reportUrl }: RightRailProps) {
  const [items, setItems] = useState<readonly TocItem[]>(provided ?? [])
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    if (provided && provided.length) return
    setItems(scanHeadings())
  }, [provided])

  useEffect(() => {
    if (items.length === 0) return
    const targets = items
      .map((it) => document.getElementById(it.id))
      .filter((n): n is HTMLElement => n !== null)
    if (targets.length === 0) return
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length > 0) setActive(visible[0]!.target.id)
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 },
    )
    targets.forEach((t) => obs.observe(t))
    return () => obs.disconnect()
  }, [items])

  if (items.length === 0) {
    return (
      <aside className="lf-toc">
        <div className="lf-toc-heading">On this page</div>
        <div className="lf-toc-empty">No sections.</div>
      </aside>
    )
  }

  return (
    <aside className="lf-toc lf-scroll" aria-label="On this page">
      <div className="lf-toc-heading">On this page</div>
      <ul className="lf-toc-list">
        {items.map((it) => (
          <li
            key={it.id}
            className={`${it.depth === 3 ? 'is-h3' : ''} ${active === it.id ? 'is-active' : ''}`}
          >
            <a href={`#${it.id}`}>
              <span className="lf-toc-rail" />
              {it.label}
            </a>
          </li>
        ))}
      </ul>
      {(editUrl || reportUrl) && (
        <div className="lf-toc-footer">
          {editUrl  ? <a href={editUrl}  target="_blank" rel="noreferrer">Edit on GitHub</a> : null}
          {reportUrl? <a href={reportUrl} target="_blank" rel="noreferrer">Report issue</a> : null}
        </div>
      )}
    </aside>
  )
}
