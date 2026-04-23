'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { SidebarSection } from '@/lib/sidebar'
import { SITE } from '@/lib/site-config'

interface DocsSidebarProps {
  readonly sections: readonly SidebarSection[]
}

function hrefFor(slug: string): string {
  return slug ? `/docs/${slug}` : '/docs'
}

export function DocsSidebar({ sections }: DocsSidebarProps) {
  const pathname = usePathname() ?? '/docs'
  const currentSlug = pathname === '/docs' ? '' : pathname.replace(/^\/docs\//, '')

  return (
    <aside className="lf-sidebar lf-scroll" aria-label="Docs navigation">
      <div className="lf-sidebar-inner">
        {sections.map((section) => (
          <div key={section.title} className="lf-sidebar-section">
            <div className="lf-sidebar-heading">{section.title}</div>
            <ul className="lf-sidebar-list">
              {section.leaves.map((leaf) => {
                const active = leaf.slug === currentSlug
                return (
                  <li key={leaf.slug || 'overview'} className={active ? 'is-active' : ''}>
                    <Link className="lf-sidebar-item" href={hrefFor(leaf.slug)}>
                      <span className="lf-sidebar-rail" />
                      <span className="lf-sidebar-label">{leaf.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
        <div className="lf-sidebar-footer">
          <div className="lf-sidebar-kicker">
            v{SITE.versionFull} · updated {SITE.releaseDate}
          </div>
        </div>
      </div>
    </aside>
  )
}
