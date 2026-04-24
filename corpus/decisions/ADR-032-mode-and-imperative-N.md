# ADR-032 — Mode ADT (Exploring | Weaving | Tangling) + IMP-N

**Date:** 2026-04-24
**Status:** Accepted
**Tags:** `#protocol` `#process`

**Extends:** ADR-001 (algebra), ADR-005 (prose-before-code),
ADR-017 (gate decisions), ADR-025 §5 (enactor axis flagged).
**Companion:** ADR-031 (Disposition — the orthogonal
referential-frame axis).

**Context:**

ADR-021 conflated two orthogonal axes into the `Modality` ADT;
ADR-031 split the referential-frame component out as
**Disposition**. This ADR splits the operational-stance
component — *how the work is being done* — out as **Mode**, a
closed three-case ADT.

The legacy `Modality.Weave / Tangle / Unweave / Untangle /
Attest` values were partially operational-stance markers
(`Weave`, `Tangle`) and partially comprehension-direction
markers (`Unweave`, `Untangle`, `Attest`). At the
operational-stance level the framework needs three modes only:

- **`Exploring`** — deliberation, discovery, discussion.
  Non-authoritative; output stays in journal blocks or memos.
- **`Weaving`** — prose authoring under the gate.
- **`Tangling`** — code (or other artefact) derivation from
  Accepted prose.

The legacy ADT had no `Exploring` value. Without it, an agent
in a deliberation session has no Mode to be in — and agentic
IDEs default to action, so deliberation collapses into
premature implementation. The missing `Exploring` Mode is the
direct cause of the "agent jumped straight to drafting code"
failure pattern. The fix is a typed three-case ADT plus a
load-bearing prose imperative (IMP-N) that binds agent
behaviour to the active Mode.

The `Unweave / Untangle / Attest` values from ADR-021 do not
move to Mode. They were comprehension directions, not
operational stances — an `Unweave` Trope (citation tracing)
is operationally `Tangling` (deterministic derivation from
existing prose); an `Attest` Trope is operationally `Tangling`
(deterministic invariant check). Folding them into `Tangling`
is the natural simplification.

**Decision:**

`Mode` is a closed three-case ADT plus a Mandatory Agent
Instruction (**IMP-N**) that binds agent behaviour to the
active Mode.

### Shape

```typescript
type Mode = 'Exploring' | 'Weaving' | 'Tangling'
```

Effect Schema:

```typescript
Schema.Union(
  Schema.Literal('Exploring'),
  Schema.Literal('Weaving'),
  Schema.Literal('Tangling'),
)
```

### The enactor axis

A Mode is enacted by one of two enactor classes:

- **Agent-in-session** — gated, AI-assisted, conversational.
  The Person and the agent are co-present; the agent's
  behaviour is bound by IMP-N for the active Mode.
- **Mechanical CLI** — deterministic, non-AI, batch.
  `literate weave` / `literate tangle` / `literate update`
  are mechanical enactments of `Weaving` / `Tangling` (the
  CLI never enters `Exploring` — it has no deliberative
  surface). IMP-N does not bind the CLI enactor.

The same Mode Concept covers both enactors; the discipline
expectations differ. Enactor is named at the prose level
(`registry/concepts/mode/concept.mdx`) and surfaces as a
typed schema (`EnactorSchema`) for forward use; v0.1 does not
require an explicit enactor field on Steps.

### IMP-N — Mode discipline overrides agent training defaults

Authored verbatim in `corpus/CLAUDE.md` (immediately before
IMP-6) and in the consumer-facing template at
`packages/template-minimal/files/CLAUDE.md` (so the next
`literate weave` carries it through to consumers' own
`.literate/` materialisations).

The text:

> Agentic IDEs (Cursor, Zed, Claude Code) are tuned for
> action: their default behaviour is to run tools, draft code,
> propose changes. LF Modes override this default. The active
> session Mode binds agent behaviour for the duration of that
> Mode; in-session Mode shifts are explicit and gated.
>
> When the active Mode is `Exploring`, the agent resists tool
> calls beyond what is needed to ground the discussion. A
> single targeted file read for context is fine; running
> tests, drafting code that lands in a file, or modifying
> files is not. Output lands in the session's `## Exploration`
> block or in a memo under `corpus/memos/<slug>.md`.
>
> When the active Mode is `Weaving`, the agent drafts prose
> for the gate and does not derive code in the same gate
> cycle.
>
> When the active Mode is `Tangling`, the agent derives code
> from already-Accepted prose and does not author new prose.

The imperative is load-bearing: without it, an agent in
`Exploring` Mode collapses exploration into premature
implementation because the IDE's training default biases
toward action. The imperative is also short and citable —
the canonical form lives in `corpus/CLAUDE.md`; the
consumer-facing copy in `packages/template-minimal/files/CLAUDE.md`
mirrors it for distribution.

### Distribution

`Mode` ships as a registry seed at `registry/concepts/mode/`.
`concept.mdx` carries the prose body (the three modes, the
enactor axis, the heuristic for setting Mode at session-start,
the Mode × Disposition product space). `index.ts` carries the
typed Schema, the `Mode` ergonomic constructors, and the
`EnactorSchema` for forward use.

### Where Mode lands

- **Sessions** carry `mode?: Mode` (optional at v0.1; see
  `concept-session`). Default by heuristic (see
  `concept-mode`'s prose). Setting Mode at session-start
  through a typed Step is **deferred** past v0.1 — the
  Concept seed plus IMP-N together are the load-bearing
  v0.1 surface; the in-session Mode-shift validator on
  `session-end` is also deferred and listed in this
  session's `## Deferred / Discovered`.
- **Tropes** may carry `mode?: Mode` once the metalanguage
  migration lands (Modality → Disposition + Mode). The
  migration is the same deferred refactor named in ADR-031.
- **CLI verbs** are implicitly `Tangling` (or `Weaving` for
  prose-emitting verbs). The CLI does not need a typed Mode
  field at v0.1.

**Boundary:**

- This ADR scopes the **operational-stance axis**. The
  referential-frame axis (`Disposition`) is ADR-031's
  domain.
- IMP-N binds the **agent enactor** only. The mechanical
  CLI enactor has no deliberative surface and is exempt.
- Setting Mode at session-start through a typed Step and
  validating in-session Mode shifts at session-end are
  deferred past v0.1; the Concept seed plus IMP-N are the
  load-bearing v0.1 surface.

**Consequences:**

- `registry/concepts/mode/{concept.mdx, index.ts, README.md}`
  is the new authoritative typed surface for the
  operational-stance axis.
- `corpus/CLAUDE.md` carries IMP-N immediately before IMP-6
  (the NEVER list). The standing IMP-1 through IMP-6
  ordering is preserved; IMP-N is positioned where
  Mode-discipline is the governing concern between the
  during-session imperatives (IMP-2, IMP-3, IMP-4) and the
  session-end imperative (IMP-5).
- `packages/template-minimal/files/CLAUDE.md` carries IMP-N
  in addition to its routing role, so consumers receive the
  imperative in the most-read entry-point file.
- `concept-session` carries `mode?: Mode` in its instance
  Schema (added alongside this ADR).
- The Mode-setting Step on `session-start` and the
  Mode-transition validator on `session-end` are
  deferred — listed in the authoring session's
  `## Deferred / Discovered`.

**Superseded by:** —
