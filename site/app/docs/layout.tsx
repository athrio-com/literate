import type { ReactNode } from 'react'
import { buildSidebar } from '@/lib/sidebar'
import { DocsSidebar } from '@/components/docs-sidebar'
import { RightRail } from '@/components/right-rail'
import { TropeRegion } from '@/components/dev'

export default async function DocsLayout({ children }: { children: ReactNode }) {
  const sections = await buildSidebar()
  return (
    <div className="lf-shell">
      <TropeRegion idx="docs-sidebar" label="Docs sidebar" core>
        <DocsSidebar sections={sections} />
      </TropeRegion>
      <TropeRegion idx="docs-main" label="Docs main" core as="main" className="lf-main">
        <article className="lf-prose">{children}</article>
      </TropeRegion>
      <TropeRegion idx="docs-right-rail" label="Right rail">
        <RightRail />
      </TropeRegion>
    </div>
  )
}
