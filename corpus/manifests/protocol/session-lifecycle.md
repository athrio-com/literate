::metadata{id=82b984cc, disposition={ base: 'Protocol', scope: 'session-lifecycle' }, layer={ kind: 'protocol', path: 'protocol', holds: 'domains' }, domain=session-lifecycle, status=Reconciled}

# Session Lifecycle

A **session** is the unit of authored work in LF. Sessions are
**immutable, append-only records of events**: every Goal, every
Decision, every Plan entry lands in the session log and stays
there. Sessions produce edits to the world (LFMs, code,
configuration) but the log itself is never rewritten.

## Status vocabulary

A session is one of:

- `Planned` — pre-scoped by a parent session in its `## Plan`
  block; not yet started.
- `Open` — currently being worked. Exactly one session may be
  Open per repo at a time (modulo the orphan-handling protocol).
- `Closed (YYYY-MM-DDTHH:MM)` — terminal. Validated by the
  `session-end` Trope; no further edits to the body.
- `Abandoned` — terminal. Closed without completion, with a
  one-line rationale.

The transitions are: `Planned → Open → Closed`,
`Planned → Abandoned`, `Open → Abandoned`. Reverse transitions
are forbidden.

## Two start paths

A session opens through one of two paths:

- **Spontaneous start.** No `Status: Planned` log is ready,
  and the Person's prompt names a new request. The
  `session-start` Trope creates a new log at
  `corpus/sessions/YYYY-MM-DDTHHMM-<slug>.md` with
  `Status: Open`.
- **Planned start.** A `Status: Planned` log exists with all
  dependencies satisfied; the Person confirms it is the
  intended next session. `session-start` flips its status from
  `Planned` to `Open`, freezes the parent's `## Plan` entry by
  setting `Realised by:`, and re-gates the provisional Goals.

A third state — an **Open orphan** — is a non-`Planned` log
left in `Status: Open` from a prior thread. The `session-start`
Trope detects it and refuses to open a fresh session without
explicit Person consent (resume / close / revert).

## The execution log as event store

The session log is the **execution event store**. Every Step
invocation is persisted (memoised by InvocationKey); every
Step's output is recorded; every Goal change appends an entry.
Replay reads the log and re-derives the world's state.

The log is parsed into structured sections:

- `## Pre-work` — what `session-start` surfaced.
- `## Goals` — gated Goal entries.
- `## Plan` — optional multi-session arc.
- `## Decisions Made` — ungated bullets recording each LFM
  authored or Concept-level revision Accepted in the session.
- `## Work Done` — files created/modified/deleted with
  rationale.
- `## Summary` — written once at close.
- `## Deferred / Discovered` — carry-over items.

## Mutability

The session log's body is **append-once**. Goal entries and
Plan entries are gated when added; Status transitions on Goals
flow atomically from accepted decisions; the Summary is written
once at close. The journal of intent is preserved verbatim; the
log is not rewritten to make history neater.

This append-only discipline is the inverse of the LFM
mutability profile (LFMs are fully mutable). The split is
deliberate: sessions are events; LFMs are state.

## `Protocol.continue` as the entry point

The Protocol exposes a single function the agent harness
invokes each turn: `Protocol.continue(repoRoot)`. The function
returns one of three outcomes — `Completed | Suspended |
NoAction`. The harness loops on `Suspended` until the Protocol
returns `Completed` or `NoAction`.

`continue` reads the session state, replays from the log, and
advances. The imperatives in `corpus/CLAUDE.md` are the prose
explanation of what `continue` does — not instructions the
agent interprets from prose.

```path
corpus/sessions/sessions.md
```

```path
corpus/CLAUDE.md
```

```path
packages/core/src/protocol.ts
```

```path
packages/core/src/execution.ts
```
