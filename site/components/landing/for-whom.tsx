const FOR = [
  'You pair with an AI daily and your prose is drifting from your code.',
  'You write ADRs and want them to compose mechanically, not by hand.',
  'You want type-checked cross-references between prose units.',
  'You’ve felt the pain of a RAG over unstructured markdown.',
]

const NOT_FOR = [
  'You don’t write prose before code — LF assumes prose-first discipline.',
  'You need a drag-and-drop authoring surface today. (v0.2+.)',
  'You want a framework that generates code without review gates.',
]

export function ForWhom() {
  return (
    <section className="lx-section lx-section-split">
      <div>
        <div className="lx-section-label">For you if</div>
        <ul className="lx-for-list">
          {FOR.map((x) => <li key={x}>{x}</li>)}
        </ul>
      </div>
      <div className="lx-for-not">
        <div className="lx-section-label">Not for you if</div>
        <ul className="lx-for-list">
          {NOT_FOR.map((x) => <li key={x}>{x}</li>)}
        </ul>
      </div>
    </section>
  )
}
