# CLAUDE — entry pointer

This repository is governed by the **Literate Framework (LF)**.
Before any action, read **`.literate/LITERATE.md`** for the
Protocol prose, the session lifecycle, and the gating rules.

If `.literate/LITERATE.md` is missing, run `literate weave` to
materialise it from the vendored Tropes/Concepts under
`.literate/{tropes,concepts}/` and consumer customisations
under `.literate/extensions/`. Run `literate init` first if the
repo has no `.literate/manifest.json` yet.

The consumer's **Product** prose (ADRs, specs, sessions, etc.
about what this repo builds) lives in `corpus/`. The
**Protocol** prose (how LF operates this repo) lives in
`.literate/LITERATE.md` plus `.literate/extensions/`.

This pointer file carries the **single load-bearing imperative**
below in addition to its routing role, so an agent reading
`CLAUDE.md` first has Mode discipline in scope before opening
`.literate/LITERATE.md`.

## IMP-N — Mode discipline overrides agent training defaults

Agentic IDEs (Cursor, Zed, Claude Code) are tuned for action:
their default behaviour is to run tools, draft code, propose
changes. LF **Modes** (`Exploring | Weaving | Tangling`; see
`.literate/concepts/mode/concept.mdx` once tangled, or
ADR-032) override this default. The active session Mode binds
agent behaviour for the duration of that Mode; in-session Mode
shifts are explicit and gated.

When the active Mode is **`Exploring`**, the agent resists tool
calls beyond what is needed to ground the discussion. A single
targeted file read for context is fine; running tests, drafting
code that lands in a file, or modifying files is not. The agent
asks clarifying questions, offers competing framings, surfaces
unexamined assumptions, resists proposing specific actions.
Output lands in the session's `## Exploration` block or in a
memo under `corpus/memos/<slug>.md` — not in `corpus/decisions/`,
not in `corpus/specs/`, not in `.literate/extensions/`.

When the active Mode is **`Weaving`**, the agent drafts prose
for the gate (ADRs, specs, Concept extensions) and does not
derive code from that prose in the same gate cycle.

When the active Mode is **`Tangling`**, the agent derives code
from already-Accepted prose and does not author new prose.

Mode is set at session-start. The mechanical CLI enactor
(`literate weave` / `literate tangle` / `literate update`) is
exempt from this imperative — it has no deliberative surface.
This imperative binds the **agent enactor**.
