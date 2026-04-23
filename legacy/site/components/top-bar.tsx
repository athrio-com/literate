'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SITE } from '@/lib/site-config'
import { Wordmark } from './wordmark'
import { ThemeToggle } from './theme-toggle'
import { GitHubGlyph } from './icons'

const NAV: ReadonlyArray<{ href: string; label: string; match: (p: string) => boolean }> = [
  { href: '/docs',        label: 'Docs',     match: (p) => p.startsWith('/docs') },
  { href: '/docs/algebra', label: 'Algebra', match: (p) => p.startsWith('/docs/algebra') },
]

export function TopBar() {
  const pathname = usePathname() ?? '/'
  const openSearch = () => document.dispatchEvent(new Event('lf:open-search'))

  return (
    <header className="lf-topbar">
      <div className="lf-topbar-left">
        <Wordmark />
      </div>

      <nav className="lf-topnav" aria-label="Primary">
        {NAV.map((n) => (
          <Link
            key={n.href}
            className={`lf-topnav-item ${n.match(pathname) ? 'lf-topnav-active' : ''}`}
            href={n.href}
          >
            {n.label}
          </Link>
        ))}
      </nav>

      <div className="lf-topbar-right">
        <button className="lf-search-trigger" onClick={openSearch} aria-label="Open search">
          <span>Search docs</span>
          <kbd>⌘K</kbd>
        </button>
        <a
          className="lf-icon-btn"
          title="GitHub"
          href={SITE.github}
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub"
        >
          <GitHubGlyph />
        </a>
        <ThemeToggle />
      </div>
    </header>
  )
}
