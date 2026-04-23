export function Manifesto() {
  return (
    <section className="lx-section lx-prose-section">
      <div className="lx-section-label">What LF is</div>
      <div className="lx-prose">
        <p>
          The <strong>Literate Framework</strong> is a methodology and
          toolkit for authoring software where prose is the source. It
          differs from Knuth&rsquo;s classical literate programming in two
          pragmatic ways: prose and code live in separate files
          (no interleaving), and the AI replaces the mechanical{' '}
          <em>tangle</em> step.
        </p>
        <p>
          Every new or revised piece of authored prose &mdash; a decision, a
          specification, a session goal &mdash; passes a review gate before
          it lands, and before any downstream artefact follows. The
          person authors meaning. The AI drafts and derives. The
          algebra holds.
        </p>
      </div>
    </section>
  )
}
