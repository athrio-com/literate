# Literate Framework — Maintainer Entry Point

*This file orients AI collaborators working on LF itself. It is
deliberately short: its job is to send you to the right Protocol file
for the work you're about to do.*

---

## Before any action — Mandatory Agent Instructions

These steps are imperative, in order, and override any urge to begin
investigating the repo from the prompt alone. The full agent
procedure (start path detection, gating, end procedure, NEVER list)
lives in [`corpus/CLAUDE.md`](./corpus/CLAUDE.md) under
**Mandatory Agent Instructions**. Read it before acting.

1. **Open** [`corpus/CLAUDE.md`](./corpus/CLAUDE.md) and read its
   `## Mandatory Agent Instructions` section in full. It tells you
   exactly what to do for SESSION START, DURING-session decisions,
   the optional planning step, SESSION END, and the NEVER list.
2. **Detect the start path** per IMP-1 in that file: check for a
   `Status: Open` orphan, then for ready `Status: Planned` sessions,
   then default to spontaneous. Do **not** open exploratory tool
   calls into `packages/` or anywhere else before this step
   resolves.
3. **Re-gate every Goal** before any work, even when continuing a
   planned session. "Continue with goals" is a planned-start
   trigger, not a permission to skip the gate (IMP-1.6).
4. **When in doubt, ask the Person.** A clarifying question costs
   less than a wrong session-Open or a wrong scope.

If you are reading this file because the Person typed "continue",
"next", "let's go", "continue with goals" or similar in a fresh
thread: there is almost certainly a `Status: Planned` session
waiting. Resolve it via IMP-1 in `corpus/CLAUDE.md`.

---

## Where you are

This repository is fully dedicated to the Literate Framework (LF).
One active workspace, one coordination area, one frozen reference
tree.

Living:

- **`packages/`** — the active `@literate/*` workspace packages
  (`cli`, `core`, `template-minimal`). The **only**
  npm-published artefact is `@literate/cli`; `@literate/core` and
  `@literate/template-minimal` are bundled into the CLI binary.
- **`registry/`** — Concept and Trope seeds as authored TS+MDX
  (`registry/tropes/<id>/{index.ts, prose.mdx, README.md, SEED.md}`,
  `registry/concepts/<id>/{index.ts, concept.mdx, README.md, SEED.md}`).
  The CLI fetches from here on `tangle`/`update` and bundles
  these sources at build time for `continue`/`close`/`reconcile`.
  This is the canonical Concept/Trope authoring location in LF's
  own repo.
- **`corpus/`** — the **global living corpus**. Sessions,
  manifests (LFMs), and operational prose (`CLAUDE.md`, `tags.md`)
  tracking LF as a project. Governed by
  [`corpus/CLAUDE.md`](./corpus/CLAUDE.md).
  - **`corpus/manifests/`** holds the current-state spine: one LFM
    per Layer-Domain pair. The framework's typed declarations of
    what is.
  - **`corpus/sessions/`** holds the immutable session-log record:
    why decisions were made.

Frozen (read-only):

- **`legacy/`** — the legacy scaffold, preserved verbatim as
  historical reference. Contains the prior `packages/` (legacy
  `@literate/*` packages), `site/` (legacy Next.js),
  `LITERATE.md` (legacy framework Protocol prose), and the
  pre-rewrite root tooling. Never publishes. Never edited without
  an explicit Person-authorised freeze lift recorded in the
  active session's `## Decisions Made`.

## Before authoring anything

1. Open [`corpus/CLAUDE.md`](./corpus/CLAUDE.md) — it defines the
   session lifecycle, gating rules, mutability profiles, and the
   NEVER list.
2. Check [`corpus/manifests/`](./corpus/manifests/) for the
   current-state declarations that constrain this session's work.
   Each LFM stands alone; cross-references are operational
   `@lfm(<short-hash>)` annotations only.
3. `legacy/LITERATE.md` is the legacy Protocol (frozen). Read it
   for historical context; do not edit it. New Protocol prose
   ships as registry seeds under `registry/tropes/<id>/` and
   `registry/concepts/<id>/`, with prose in sibling `.mdx` files
   referenced by `index.ts` via `prose(import.meta.url, …)`.

## The two protocols

LF defines the **Literate Programming Protocol (LPP)** — the
methodology this repo ships. Do not confuse LPP with any
product-scope protocol that a specific LF-using product might
define. When precision is needed, use "LPP" or "Literate Protocol";
reserve bare "Protocol" in LF's own prose for LPP.

## Principles

1. **Prose before code.** Nothing code-shaped lands until the
   prose motivating it is authored and gated. Every Concept,
   Trope, LFM, spec, and session Goal is presented for Accept /
   Correct / Clarify / Reject before anything downstream follows.
2. **Mutable LFMs; append-once sessions.** LFMs are state — each
   stands alone, evolves freely, status written by `reconcile`.
   Sessions are events — append-once log entries that produce
   edits to LFMs and code.
3. **Person authors meaning; AI drafts and derives syntax.** The
   Person owns all output. The AI drafts prose, surfaces
   inconsistencies, and produces code from accepted prose.
4. **The algebra holds.** Everything authored fits one of four
   levels: Concept (what), Trope (how), Step (executable unit of
   how), authored instance. Reach for the right level; do not
   conflate.
5. **The Protocol is the program.** `Protocol.continue(repoRoot)`
   is the single entry point the agent harness invokes each turn.
   The imperatives in `corpus/CLAUDE.md` are the prose explanation
   of what that function does, not instructions the agent
   interprets from prose.

## The `@athrio/` scope

The `@athrio/` npm scope is reserved for the sister-repo Athrio
product — the LFM-Protocol implementation from which LF is
abstracted. LF never publishes under `@athrio/*`.
