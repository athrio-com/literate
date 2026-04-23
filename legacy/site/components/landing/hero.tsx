import Link from 'next/link'
import { SITE } from '@/lib/site-config'
import { CopyButton } from '@/components/copy-button'

const INSTALL_CMD = 'npm i -D @literate/cli'

export function Hero() {
  return (
    <section className="lx-hero">
      <div className="lx-hero-meta">
        <span>The Literate Framework</span>
        <span className="lx-dot" />
        <span>v{SITE.version} — released {SITE.releaseDate}</span>
        <span className="lx-dot" />
        <span>{SITE.license}</span>
      </div>

      <h1 className="lx-hero-title">
        A framework for authoring software<br />
        where <em>prose is the source</em>.
      </h1>

      <p className="lx-hero-thesis">
        A person authors decisions, specifications, and session logs.
        An AI drafts under their direction and derives code from prose
        that has been accepted. LF is the vocabulary, the review gate,
        and the compiler that makes that loop mechanical.
      </p>

      <div className="lx-hero-actions">
        <Link className="lx-btn lx-btn-primary" href="/docs">Read the protocol</Link>
        <CopyButton
          text={INSTALL_CMD}
          className="lx-btn"
          idleLabel="copy"
          copiedLabel="copied"
        >
          <code>{INSTALL_CMD}</code>
        </CopyButton>
      </div>
    </section>
  )
}
