import Link from 'next/link'
import { SITE } from '@/lib/site-config'
import { Wordmark } from '@/components/wordmark'

interface FooterCol {
  readonly title: string
  readonly items: ReadonlyArray<{ label: string; href: string }>
}

const COLS: readonly FooterCol[] = [
  {
    title: 'Docs',
    items: [
      { label: 'Overview',        href: '/docs' },
      { label: 'Getting started', href: '/docs/getting-started' },
      { label: 'The protocol',    href: '/docs/algebra' },
      { label: 'Algebra',         href: '/docs/algebra' },
    ],
  },
  {
    title: 'Reference',
    items: [
      { label: 'Concepts', href: '/docs/concepts' },
      { label: 'Tropes',   href: '/docs/tropes' },
      { label: 'CLI',      href: '/docs/cli/init' },
      { label: 'Manifest', href: '/docs/cli/manifest' },
    ],
  },
  {
    title: 'Project',
    items: [
      { label: 'GitHub',   href: SITE.github },
      { label: 'Sessions', href: '/docs/sessions' },
      { label: 'Licence',  href: SITE.github + '/blob/main/LICENSE-MIT' },
    ],
  },
]

export function LandingFooter() {
  return (
    <footer className="lx-footer">
      <div className="lx-footer-main">
        <div>
          <Wordmark showVersion={false} />
          <p className="lx-footer-tag">{SITE.tagline}</p>
        </div>
        {COLS.map((col) => (
          <div key={col.title} className="lx-footer-col">
            <div className="lx-footer-heading">{col.title}</div>
            <ul>
              {col.items.map((it) => {
                const external = /^https?:/.test(it.href)
                return (
                  <li key={it.href + it.label}>
                    {external ? (
                      <a href={it.href} target="_blank" rel="noreferrer">{it.label}</a>
                    ) : (
                      <Link href={it.href}>{it.label}</Link>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
      <div className="lx-footer-rule" />
      <div className="lx-footer-bottom">
        <span>© 2026 {SITE.org} · {SITE.license}</span>
        <span>v{SITE.versionFull} · updated {SITE.releaseDate}</span>
      </div>
    </footer>
  )
}
