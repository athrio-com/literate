# Session: 2026-04-26 — Mode Concept + IMP-N (Mode-discipline imperative)

**Date:** 2026-04-26 (provisional; rename on open per IMP-1.5 if drift)
**Status:** Abandoned (2026-04-24T17:07 — superseded by `corpus/sessions/2026-04-24T1712-typed-concepts-disposition-mode-implication.md` which collapses P5/P6/P7 into one fast-mode session sharing structure across the three Concept authoring goals)
**Chapter:** — (no chapter yet)
**Agent:** —
**Started:** —
**Planned by:** corpus/sessions/2026-04-23T2100-ship-surface.md
**Depends on:** corpus/sessions/2026-04-25T0900-registry-and-cli-surface.md, corpus/sessions/2026-04-26T0900-disposition-concept.md

## Goals

*Provisional — re-gate per IMP-1.6 at session open.*

### Goal 1 — Author `@literate/concept-mode` with typed Schema

**Topic:** Mode names the **operational stance** of a session (or
step within it). Ships as `@literate/concept-mode` with Effect
Schema over the ADT:

```
Mode = Exploring | Weaving | Tangling
```

- **Exploring** — deliberation, discovery, discussion.
  Non-authoritative. Agent resists tool calls, resists drafting,
  resists commitment. Output lands in `## Exploration` journal
  section or in a memo under `corpus/memos/`.
- **Weaving** — prose authoring under the gate. Agent drafts;
  Person Accepts / Corrects / Clarifies / Rejects.
- **Tangling** — derivation of code from accepted prose. No new
  prose authored; code traces back to upstream prose by ADR /
  spec / Concept references.

Mode is orthogonal to Disposition (authored in P5). Mode ×
Disposition is a 2D product space; exhaustive handling via typed
pattern-match on `(mode._tag, disposition.base)` at every
branching site.

**Name the enactor axis explicitly** (flagged by ADR-025 §5):
a Mode is enacted either by an **agent-in-session** (gated,
AI-assisted) or by the **mechanical CLI** (deterministic,
non-AI). Same Mode Concept; different enactor; different
per-enactor discipline. The CLI's `weave` and `tangle` operations
(ADR-025 §2) are mechanical enactments of Mode Weaving and Mode
Tangling under Disposition Protocol.

**Upstream:** ADR-025 §5 (enactor axis flagged); exploration §9 +
§13.6.

**Acceptance:**
- `registry/concepts/mode/concept.mdx` + `index.ts` authored
  with typed Schema.
- `concept-session` revised to carry `mode: Mode`.
- `trope-session-start` revised: new Step reads/sets Mode at
  open; if ambiguous, asks. Default: Exploring when the prompt
  is under-shaped; Weaving when the prompt names a concrete
  intent.
- `trope-session-end` revised to validate Mode transitions (Mode
  shifts mid-session are gated and timestamped).

### Goal 2 — Author IMP-N (Mode-discipline imperative)

**Topic:** A new Mandatory Agent Instruction that binds agent
behaviour to the active Mode:

> **IMP-N — Mode discipline overrides agent training defaults.**
> Cursor, Zed, and similar agentic IDEs are tuned for action:
> they default to running tools, drafting code, proposing
> changes. LF Modes override this default.
>
> When the active session Mode is `Exploring`, the agent must
> resist tool calls beyond what's needed to ground the
> discussion. A single targeted file read for context is fine;
> running tests, drafting code, or modifying files is not.
> The agent asks clarifying questions, offers competing framings,
> surfaces unexamined assumptions, resists proposing specific
> actions. Output lands in the session's `## Exploration` block
> or in a memo under `corpus/memos/`.
>
> When the active Mode is `Weaving`, the agent drafts prose for
> the gate and does not derive code.
>
> When the active Mode is `Tangling`, the agent derives code from
> accepted prose and does not author new prose.
>
> Mode is set at session-start per the `session-start` Trope and
> is itself gated. In-session Mode shifts are explicit and gated.

The imperative is load-bearing because agentic IDEs bias toward
action by default; without it, an agent in Exploring Mode
collapses exploration into premature implementation. It is the
prose-level soft override that lands early enough in context to
bind behaviour.

**Upstream:** Exploration §11 + §13.6; this session's Goal 1.

**Acceptance:**
- IMP-N lands in `corpus/CLAUDE.md` (LF's own maintainer
  instructions).
- The LITERATE.md template (seed that weave materialises for
  consumers) carries IMP-N so every consumer's
  `.literate/LITERATE.md` includes it.
- Session-start Trope surfaces the active Mode prominently at
  session open so an agent reading the materialised
  `.literate/LITERATE.md` sees both the imperative and the
  current Mode in one place.

### Goal 3 — Memos folder formalised

**Topic:** `corpus/memos/` already exists in LF's own repo.
Formalise its role in the Protocol: **Exploring Mode output that
does not promote to the session's `## Exploration` block lives
in `corpus/memos/<slug>.md`**. Memos carry a `Reduced into:`
field in the memos index once reduced into an upstream ADR, spec,
or Goal.

**Upstream:** Exploration §11.3.

**Acceptance:** `corpus/memos/memos.md` index exists (if not
already); memo shape documented in the Protocol prose; reduction
path (memo → upstream artefact) named.
