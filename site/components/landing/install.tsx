import type { ReactNode } from 'react'
import Link from 'next/link'
import { CopyButton } from '@/components/copy-button'

interface StepProps {
  n: number
  title: string
  note: string
  children: ReactNode
}

function Step({ n, title, note, children }: StepProps) {
  return (
    <div className="lx-step">
      <div className="lx-step-n">{String(n).padStart(2, '0')}</div>
      <div className="lx-step-body">
        <div className="lx-step-title">{title}</div>
        <div className="lx-step-note">{note}</div>
        {children}
      </div>
    </div>
  )
}

function Cmd({ text }: { text: string }) {
  return (
    <div className="lx-cmd">
      <span className="lx-cmd-prompt">$</span>
      <code>{text}</code>
      <CopyButton text={text} />
    </div>
  )
}

const MANIFEST = `{
  "literate": {
    "version": "0.1.0",
    "tropes": [
      "session",
      "session-start",
      "session-end",
      "decisions"
    ]
  }
}`

export function Install() {
  return (
    <section className="lx-section" id="install">
      <div className="lx-section-head">
        <div className="lx-section-label">Install</div>
        <span className="lx-section-kicker">Node 20+ · TypeScript · any package manager.</span>
      </div>

      <div className="lx-install">
        <div className="lx-install-steps">
          <Step n={1} title="Add the CLI" note="As a dev dependency in your repo.">
            <Cmd text="npm i -D @literate/cli" />
          </Step>
          <Step
            n={2}
            title="Scaffold a consumer repo"
            note="Creates corpus/, src/, .literate/, CLAUDE.md."
          >
            <Cmd text="npx literate init minimal" />
          </Step>
          <Step
            n={3}
            title="Add Tropes"
            note="Pin the realisations you want."
          >
            <Cmd text="npx literate add trope decisions session session-start" />
          </Step>
          <Step
            n={4}
            title="Compile & check"
            note="Materialise .literate/ and validate your corpus."
          >
            <Cmd text="npx literate compile && npx literate check" />
          </Step>
        </div>

        <aside className="lx-install-side">
          <div className="lx-side-label">Manifest</div>
          <p className="lx-side-note">
            The CLI writes a minimal manifest into your{' '}
            <code>package.json</code>:
          </p>
          <pre className="lx-mini-code"><code>{MANIFEST}</code></pre>
          <Link href="/docs/cli/manifest" className="lx-side-link">
            Manifest reference →
          </Link>
        </aside>
      </div>
    </section>
  )
}
