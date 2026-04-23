import type { ReactNode } from 'react'
import Link from 'next/link'
import { AlgebraArrowGlyph } from '@/components/icons'

interface NodeProps {
  kicker: string
  name: string
  italic: string
  body: ReactNode
  code: string
}

function AlgebraNode({ kicker, name, italic, body, code }: NodeProps) {
  return (
    <div className="lx-alg-node">
      <div className="lx-alg-kicker">{kicker}</div>
      <div className="lx-alg-name">
        {name} <span className="lx-alg-italic">— {italic}</span>
      </div>
      <p className="lx-alg-body">{body}</p>
      <div className="lx-alg-code">{code}</div>
    </div>
  )
}

function Arrow({ label }: { label: string }) {
  return (
    <div className="lx-alg-arrow">
      <AlgebraArrowGlyph />
      <span>{label}</span>
    </div>
  )
}

export function Algebra() {
  return (
    <section className="lx-section">
      <div className="lx-section-head">
        <div className="lx-section-label">The three-level algebra</div>
        <Link className="lx-section-more" href="/docs/algebra">Read the reference →</Link>
      </div>

      <div className="lx-algebra">
        <AlgebraNode
          kicker="Level 1"
          name="Concept"
          italic="interface"
          body={<>Declares <em>what something is</em>. Schema, invariants, relationships. Pure declaration.</>}
          code="@literate/concept-decisions"
        />
        <Arrow label="realised by" />
        <AlgebraNode
          kicker="Level 2"
          name="Trope"
          italic="class"
          body={<>Describes <em>how the Concept is done in LF</em>. Prose-first, Effect Schema-backed, composable.</>}
          code="@literate/trope-decisions"
        />
        <Arrow label="instantiated as" />
        <AlgebraNode
          kicker="Level 3"
          name="Authored"
          italic="instance"
          body={<>A file in the consumer&rsquo;s <code>corpus/</code>. An ADR, a session log, a spec.</>}
          code="corpus/decisions/ADR-009.md"
        />
      </div>
    </section>
  )
}
