import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { SITE } from '@/lib/site-config'
import { TopBar } from '@/components/top-bar'
import { SearchModal } from '@/components/search-modal'
import { ShortcutsOverlay } from '@/components/shortcuts-overlay'
import { ThemeScript } from '@/components/theme-script'
import { DevProvider, DevPanel } from '@/components/dev'
import { buildSearchIndex } from '@/lib/search-index'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Literate Framework',
    template: '%s — Literate Framework',
  },
  description: SITE.description,
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const searchEntries = buildSearchIndex()
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <DevProvider>
          <TopBar />
          {children}
          <SearchModal entries={searchEntries} />
          <ShortcutsOverlay />
          <DevPanel />
        </DevProvider>
      </body>
    </html>
  )
}
