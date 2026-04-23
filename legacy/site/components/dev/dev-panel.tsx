'use client'

import { useEffect } from 'react'
import { IS_DEV, useDev } from './dev-context'

export function DevPanel() {
  if (!IS_DEV) return null
  return <DevPanelInner />
}

function DevPanelInner() {
  const { tropes, disabled, panelOpen, togglePanel, setPanelOpen, setEnabled, resetAll } = useDev()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const isTyping = target?.matches('input, textarea, [contenteditable]')
      if (isTyping) return
      if (e.key.toLowerCase() === 'd' && e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        togglePanel()
      } else if (e.key === 'Escape' && panelOpen) {
        setPanelOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [togglePanel, setPanelOpen, panelOpen])

  const sorted = [...tropes].sort((a, b) => {
    if (a.core !== b.core) return a.core ? -1 : 1
    return a.idx.localeCompare(b.idx)
  })
  const coreCount = sorted.filter((t) => t.core).length
  const optCount = sorted.length - coreCount
  const offCount = sorted.filter((t) => !t.core && disabled.has(t.idx)).length

  return (
    <>
      <button
        type="button"
        className="lf-dev-fab"
        onClick={togglePanel}
        aria-label="Open dev tropes panel"
        aria-expanded={panelOpen}
        title="Dev tropes (shift+D)"
      >
        <span className="lf-dev-fab-dot" />
        <span className="lf-dev-fab-text">tropes</span>
        {offCount > 0 && <span className="lf-dev-fab-badge">{offCount}</span>}
      </button>

      <div
        className="lf-dev-panel"
        data-open={panelOpen ? 'true' : 'false'}
        aria-hidden={!panelOpen}
        role="dialog"
        aria-label="Dev tropes panel"
      >
        <div className="lf-dev-panel-head">
          <div>
            <div className="lf-dev-panel-title">Tropes</div>
            <div className="lf-dev-panel-sub">
              {coreCount} core · {optCount} optional · {offCount} off
            </div>
          </div>
          <div className="lf-dev-panel-actions">
            <button type="button" className="lf-dev-btn" onClick={resetAll} disabled={offCount === 0}>
              reset
            </button>
            <button
              type="button"
              className="lf-dev-btn"
              onClick={() => setPanelOpen(false)}
              aria-label="Close panel"
            >
              ×
            </button>
          </div>
        </div>

        {sorted.length === 0 ? (
          <div className="lf-dev-panel-empty">
            No tropes registered on this page.
          </div>
        ) : (
          <ul className="lf-dev-trope-list">
            {sorted.map((t) => {
              const off = !t.core && disabled.has(t.idx)
              return (
                <li key={t.idx} className="lf-dev-trope-row" data-core={t.core ? 'true' : 'false'}>
                  <label className="lf-dev-trope-toggle">
                    <input
                      type="checkbox"
                      checked={!off}
                      disabled={t.core}
                      onChange={(e) => setEnabled(t.idx, e.target.checked)}
                      aria-label={`Toggle ${t.idx}`}
                    />
                    <span className="lf-dev-trope-idx">{t.idx}</span>
                    {t.label && <span className="lf-dev-trope-label">{t.label}</span>}
                    {t.core && <span className="lf-dev-trope-tag">core</span>}
                  </label>
                </li>
              )
            })}
          </ul>
        )}

        <div className="lf-dev-panel-foot">
          <kbd>shift</kbd>+<kbd>D</kbd> toggle · <kbd>esc</kbd> close
        </div>
      </div>
    </>
  )
}
