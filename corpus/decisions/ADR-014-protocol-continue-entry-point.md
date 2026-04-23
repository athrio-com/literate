# ADR-014 — `Protocol.continue` as the single entry point

**Date:** 2026-04-23
**Status:** Accepted
**Tags:** `#execution` `#protocol`

**Extends:** ADR-011

**Context:**

ADR-011 established executable monadic prose; ADR-013 formalised
the log and replay. What remains is the shape of the *entry point*
the agent harness invokes each turn.

Under the pre-ADR-011 model, the entry point was prose: the agent
read `corpus/CLAUDE.md`, followed IMP-1 through IMP-6 in English,
decided what to do. The same procedure produced different
outcomes for different agents because prose is interpretive. The
imperative preamble authored in session
`2026-04-23T0919-imperatives-for-lf-protocol` mitigated this but
did not remove it — an agent that misread a single conditional
could stamp a fresh `Status: Open` on a live `Planned` session,
wasting the Person's context.

With the Step substrate in place, the procedure the agent follows
on every turn is itself a Step — a `workflow` Step, deterministic
over the log, with its own Execution Log entries. Because it is
a function, it cannot be misread.

**Decision:**

`@athrio/core` ships a single top-level procedure, `Protocol.continue`:

```typescript
export const Protocol = {
  continue: (repoRoot: string) => Effect.Effect<
    ProtocolOutcome, ProtocolError, StepContext
  >,
}

export type ProtocolOutcome =
  | { readonly _tag: 'Completed';  readonly session: SessionRef }
  | { readonly _tag: 'Suspended';  readonly pending: GatePending | AIPending | ExternalPending }
  | { readonly _tag: 'NoAction';   readonly reason: string }

export type ProtocolError =
  | ReplayDivergence
  | LogWriteError
  | SessionMalformed
  | OrphanConflict
```

### Algorithm

On every turn the agent harness calls `Protocol.continue(repoRoot)`.
The function:

1. Reads the filesystem: `corpus/sessions/`, `corpus/decisions/`,
   `corpus/categories/`, `corpus/CLAUDE.md`.
2. Locates the active session by consulting
   `corpus/sessions/sessions.md` and the individual session logs.
   Path-detection (spontaneous / planned / orphan) is a set of
   `effect` and `io` Steps composed into a `workflow` Step
   (`session-start.detect-path`).
3. Loads the active session's Execution Log via
   `ExecutionLogService`.
4. Invokes the root Step for that session — typically
   `session-start.open` for a new session, otherwise the Trope of
   the currently active Goal — under `memo`. Replay skips every
   `completed` record; the first incomplete Step executes.
5. One of three outcomes:
   - **`Completed`** — every Step resolved through
     `session-end.close`. The log is stamped `Status: Closed`;
     the function returns.
   - **`Suspended`** — a `gate`, `ai`, or `io` Step threw
     `Suspend`. The runtime wrote the pending record; the
     function returns the pending payload for the harness to
     surface.
   - **`NoAction`** — no session to act on. Returned when no
     `Status: Open` session exists, no ready `Status: Planned`
     session exists, and the Person has not initiated a new one.

The harness:

- `Completed` → prints the session's Summary and exits.
- `Suspended` → renders the pending payload (the gate draft, the
  AI prompt, the external request) to the Person / LLM / system;
  the turn ends.
- `NoAction` → prompts the Person to declare a new session or
  specify which `Planned` session to open; the turn ends.

### The imperatives become prose

The rules IMP-1 through IMP-6 in `corpus/CLAUDE.md` become the
prose explanation of `Protocol.continue`, not instructions the
agent interprets. They remain authored for readers who want to
understand what the function does; the enforcement lives in the
Step graph:

| Imperative | Realised by |
|---|---|
| IMP-1 session start | `session-start.detect-path`, `session-start.open` |
| IMP-2 decision routing | `adr-flow`, `concept-flow` workflow Tropes |
| IMP-3 scope change | `goal-flow.append-goal`, `goal-flow.supersede` |
| IMP-4 multi-session plan | `session-plan` workflow Trope |
| IMP-5 session end | `session-end.close` workflow Step |
| IMP-6 NEVER | enforced by types and schema validation; no Step exists that can perform a forbidden action |

### Harness substrate

The agent harness (the thing that invokes `Protocol.continue`)
runs the Effect with a live `StepContext`:

- `ExecutionLog` → file-backed `ExecutionLogService` writing to
  the active session log's `## Execution Log` fenced block.
- `ProseInvoke` → file-loading renderer with the templating
  grammar of ADR-015.
- `AIInvoke` → bound to the current LLM (model id recorded in
  the `agent` field of the `ExecutionRecord`).
- `GateService` → writes a `gate-pending` record, throws
  `Suspend`, returns to the harness.
- I/O services (filesystem, git) → wrapped implementations that
  record observed state in `io` Step memoisation.

V0.1 the harness ships as a CLI (`@athrio/cli`, ADR-016) invoked
from chat-loop wrappers, IDE integrations, or a future
`@athrio/runtime` library embedded directly in agent frameworks.

**Consequences:**

- The agent's first tool call on every turn is (conceptually) a
  single invocation of `Protocol.continue`. The decision tree is
  a function, not interpretive prose.
- `corpus/CLAUDE.md` shrinks in purpose: it documents the
  function, it does not command the agent. The document remains
  useful as the authoritative description of what the
  implementation must do.
- The "continue with goals" failure mode from session
  `2026-04-23T0919` becomes structurally impossible.
- Agents without the harness degrade gracefully: they read prose
  and execute manually. The `## Execution Log` section stays
  empty; future harnessed turns populate it without breaking
  anything.
- `Protocol.continue` composes. A higher-level driver can invoke
  it in a loop (with explicit turn boundaries) to run an entire
  session non-interactively, as long as every suspension has an
  automated resolver. Useful for tests and scheduled agents.
- The `ProtocolOutcome` tagged union is the public contract of
  the harness surface. Adding a new outcome is a gated ADR
  amendment.
