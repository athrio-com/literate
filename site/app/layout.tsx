import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'

export const metadata: Metadata = {
  title: 'Literate Framework',
  description: 'Prose-first, gated, AI-collaborative software authoring.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="site-nav">
          <a href="/" className="brand">
            Literate
          </a>
          <a href="/docs">Docs</a>
          <a
            href="https://github.com/athrio-com/literate"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </nav>
        {children}
      </body>
    </html>
  )
}
