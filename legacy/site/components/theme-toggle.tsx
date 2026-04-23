'use client'

import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

function readTheme(): Theme {
  if (typeof document === 'undefined') return 'light'
  const attr = document.documentElement.getAttribute('data-theme')
  return attr === 'dark' ? 'dark' : 'light'
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    setTheme(readTheme())
    const sync = () => setTheme(readTheme())
    window.addEventListener('lf:theme-change', sync)
    return () => window.removeEventListener('lf:theme-change', sync)
  }, [])

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    try { localStorage.setItem('lf-theme', next) } catch {}
    setTheme(next)
    window.dispatchEvent(new Event('lf:theme-change'))
  }

  return (
    <button
      className="lf-theme-toggle"
      onClick={toggle}
      title="Toggle theme"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
    >
      <span className={`lf-theme-knob ${theme === 'dark' ? 'is-dark' : ''}`} />
      <span className="lf-theme-label">{theme === 'dark' ? 'Dark' : 'Light'}</span>
    </button>
  )
}
