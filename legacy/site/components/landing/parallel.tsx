const CODE = `import { proseFrom, type Trope } from "@literate/core"
import { DecisionsConcept } from "@literate/concept-decisions"
import corpusTrope from "@literate/trope-corpus"
import categoryTrope from "@literate/trope-category"
import ADRSubkind from "./subkinds/ADR.ts"

export const decisionsTrope: Trope<typeof DecisionsConcept> = {
  _tag: "Trope",
  id: "decisions",
  version: "0.1.0",
  realises: DecisionsConcept,
  prose: proseFrom(import.meta.url, "./prose.mdx"),
  dependencies: [corpusTrope, categoryTrope],
  subkinds: [ADRSubkind],
  members: [],
}`

export function Parallel() {
  return (
    <section className="lx-section">
      <div className="lx-section-head">
        <div className="lx-section-label">Prose becomes code</div>
        <span className="lx-section-kicker">
          Every Trope ships as typed prose plus typed module.
        </span>
      </div>

      <div className="lx-parallel">
        <div className="lx-panel">
          <div className="lx-panel-head">
            <span className="lx-panel-role">prose</span>
            <span className="lx-panel-path">packages/trope-decisions/src/prose.mdx</span>
          </div>
          <div className="lx-panel-body lx-panel-prose">
            <h3>Decisions</h3>
            <p>
              A decision is a dated, gated statement that fixes one
              structural choice. ADRs live at{' '}
              <code>corpus/decisions/</code> and carry a status of{' '}
              <em>Proposed</em>, <em>Accepted</em>, or{' '}
              <em>Superseded</em>.
            </p>
            <p>
              ADR bodies are append-only once accepted. Only the{' '}
              <code>Status:</code> line is mutable, and only to record
              supersession.
            </p>
          </div>
        </div>

        <div className="lx-panel">
          <div className="lx-panel-head">
            <span className="lx-panel-role">code</span>
            <span className="lx-panel-path">packages/trope-decisions/src/index.ts</span>
          </div>
          <div className="lx-panel-body lx-panel-code">
            <pre><code>{CODE}</code></pre>
          </div>
        </div>
      </div>
    </section>
  )
}
