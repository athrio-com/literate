'use client'

import { useEffect, useState } from 'react'

const SHORTCUTS: ReadonlyArray<{ keys: readonly string[]; label: string }> = [
  { keys: ['⌘', 'K'], label: 'Open search' },
  { keys: ['g', 'h'], label: 'Go home' },
  { keys: ['g', 'd'], label: 'Go to docs' },
  { keys: ['t'],      label: 'Toggle theme' },
  { keys: ['?'],      label: 'Show this overlay' },
]

export function ShortcutsOverlay() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const isTyping = target?.matches('input, textarea, [contenteditable]')
      if (isTyping) return
      if (e.key === '?') {
        e.preventDefault()
        setOpen((v) => !v)
      } else if (e.key === 'Escape') {
        setOpen((v) => (v ? false : v))
      } else if (e.key.toLowerCase() === 't' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const html = document.documentElement
        const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
        html.setAttribute('data-theme', next)
        try { localStorage.setItem('lf-theme', next) } catch {}
        window.dispatchEvent(new Event('lf:theme-change'))
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div
      className="lf-modal-scrim lf-modal-scrim-quiet"
      data-open={open ? 'true' : 'false'}
      aria-hidden={!open}
      onMouseDown={() => setOpen(false)}
    >
      <div
        className="lf-shortcuts"
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard shortcuts"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="lf-shortcuts-title">Keyboard</div>
        <ul>
          {SHORTCUTS.map((s) => (
            <li key={s.label}>
              <span className="lf-shortcut-keys">
                {s.keys.map((k, i) => <kbd key={i}>{k}</kbd>)}
              </span>
              <span className="lf-shortcut-label">{s.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
