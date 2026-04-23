'use client'

import { useState } from 'react'

const QUESTIONS: ReadonlyArray<{ q: string; a: string }> = [
  {
    q: 'Is this Knuth’s literate programming?',
    a: 'No. Prose and code live in separate files, and the AI replaces the mechanical tangle step. The weave output is the prose corpus itself.',
  },
  {
    q: 'What does the AI actually do?',
    a: 'It drafts prose under the person’s direction, surfaces inconsistencies, and derives code from prose that has been accepted. The person authors meaning and owns all output.',
  },
  {
    q: 'Why TypeScript packages for prose units?',
    a: 'Cross-references between Tropes and Concepts become real module imports — a missing or wrong-typed reference is a compile-time error. See ADR-009.',
  },
  {
    q: 'Can I use it with Claude / Cursor / my own agent?',
    a: 'Yes. LF ships a CLAUDE.md that encodes the operational Protocol; adapting it for other agents is straightforward prose work.',
  },
  {
    q: 'What’s the licence?',
    a: 'Dual MIT + Apache-2.0. Use whichever is compatible with your project.',
  },
]

function Item({ q, a, openByDefault = false }: { q: string; a: string; openByDefault?: boolean }) {
  const [open, setOpen] = useState(openByDefault)
  return (
    <div className={`lx-faq-item ${open ? 'is-open' : ''}`}>
      <button className="lx-faq-q" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span>{q}</span>
        <span className="lx-faq-icon">{open ? '–' : '+'}</span>
      </button>
      {open && <div className="lx-faq-a">{a}</div>}
    </div>
  )
}

export function Faq() {
  return (
    <section className="lx-section">
      <div className="lx-section-label">Questions</div>
      <div className="lx-faq">
        {QUESTIONS.map((it, i) => (
          <Item key={it.q} q={it.q} a={it.a} openByDefault={i === 0} />
        ))}
      </div>
    </section>
  )
}
