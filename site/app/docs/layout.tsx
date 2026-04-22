import type { ReactNode } from 'react'
import { buildSidebar } from '@/lib/sidebar'

export default async function DocsLayout({ children }: { children: ReactNode }) {
  const sections = await buildSidebar()
  return (
    <div className="docs-shell">
      <aside className="docs-sidebar">
        {sections.map((section) => (
          <div key={section.title}>
            <h2>{section.title}</h2>
            <ul>
              {section.leaves.map((leaf) => {
                const href = leaf.slug ? `/docs/${leaf.slug}` : '/docs'
                return (
                  <li key={href}>
                    <a href={href}>{leaf.label}</a>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </aside>
      <article className="docs-content">{children}</article>
    </div>
  )
}
