'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { SearchEntry } from '@/lib/search-index'

interface SearchModalProps {
  readonly entries: readonly SearchEntry[]
}

/**
 * Always mounted — hydration pays the React mount cost once and each
 * open flips `data-open` instead of remounting. CSS controls visibility;
 * no animation. ⌘K / Ctrl-K toggles, ↑/↓ navigate, ↵ opens, Esc closes.
 */
export function SearchModal({ entries }: SearchModalProps) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      } else if (e.key === 'Escape') {
        setOpen((v) => (v ? false : v))
      }
    }
    const onTrigger = () => setOpen(true)
    document.addEventListener('keydown', onKey)
    document.addEventListener('lf:open-search', onTrigger as EventListener)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('lf:open-search', onTrigger as EventListener)
    }
  }, [])

  useEffect(() => {
    if (open) {
      setQ('')
      setActive(0)
      inputRef.current?.focus()
    }
  }, [open])

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const matches = needle
      ? entries.filter(
          (e) =>
            e.title.toLowerCase().includes(needle) ||
            e.path.toLowerCase().includes(needle),
        )
      : entries.slice(0, 12)
    const groups = new Map<string, SearchEntry[]>()
    for (const e of matches) {
      const arr = groups.get(e.group) ?? []
      arr.push(e)
      groups.set(e.group, arr)
    }
    return Array.from(groups.entries())
  }, [q, entries])

  const flat = useMemo(() => filtered.flatMap(([, xs]) => xs), [filtered])

  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(i + 1, Math.max(flat.length - 1, 0)))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      const chosen = flat[active]
      if (chosen) {
        setOpen(false)
        router.push(chosen.href)
      }
    }
  }

  return (
    <div
      className="lf-modal-scrim"
      data-open={open ? 'true' : 'false'}
      aria-hidden={!open}
      onMouseDown={() => setOpen(false)}
    >
      <div
        className="lf-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Search the docs"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="lf-modal-header">
          <div className="lf-modal-title">Search the docs</div>
          <input
            ref={inputRef}
            className="lf-modal-input"
            placeholder="Find pages, sections, concepts…"
            value={q}
            tabIndex={open ? 0 : -1}
            onChange={(e) => { setQ(e.target.value); setActive(0) }}
            onKeyDown={onInputKey}
          />
        </div>
        <div className="lf-modal-body lf-scroll">
          {flat.length === 0 ? (
            <div className="lf-result-empty">No matches for “{q}”.</div>
          ) : (
            filtered.map(([group, items]) => (
              <div key={group} className="lf-result-group">
                <div className="lf-result-heading">{group}</div>
                {items.map((it) => {
                  const idx = flat.indexOf(it)
                  return (
                    <Link
                      key={it.href + it.title}
                      className={`lf-result-item ${idx === active ? 'is-active' : ''}`}
                      href={it.href}
                      tabIndex={open ? 0 : -1}
                      onClick={() => setOpen(false)}
                    >
                      <span className="lf-result-title">{it.title}</span>
                      <span className="lf-result-path">{it.path}</span>
                    </Link>
                  )
                })}
              </div>
            ))
          )}
        </div>
        <div className="lf-modal-footer">
          <span><kbd>↵</kbd> open</span>
          <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
          <span><kbd>esc</kbd> close</span>
        </div>
      </div>
    </div>
  )
}
