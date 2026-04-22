export const metadata = {
  title: 'Literate Framework — prose-first software authoring',
}

export default function HomePage() {
  return (
    <main className="prose">
      <h1>Literate Framework</h1>
      <p className="lede">
        <strong>Prose-first, gated, AI-collaborative software authoring.</strong>
      </p>
      <p>
        Literate Framework (LF) is a methodology and toolkit for building
        software where prose is the source. Architectural decisions,
        behavioural specifications, chapter plans, persona stories, and
        session logs are the primary artefacts. Implementation code is
        derived from prose by an AI collaborator, with a person authoring
        meaning and gating every piece of new prose before anything
        downstream follows.
      </p>
      <pre>
{`Concept     (interface — what something IS)
    ↓ realised by
Trope       (class — how the Concept is done in LF)
    ↓ instantiated by consumers as
Authored    (file in consumer's corpus)`}
      </pre>
      <p>
        <a className="button" href="/docs">
          Read the docs →
        </a>
      </p>
    </main>
  )
}
