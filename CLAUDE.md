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
tree (see [ADR-020](./corpus/decisions/ADR-020-unify-monorepo-layout.md)
for the layout decision; previous split at `framework/` vs. root
`packages/` was collapsed on 2026-04-23).

Living:

- **`packages/`** — the active `@literate/*` workspace packages.
  V0.1 ships `@literate/core` (the Step substrate from ADR-011
  through ADR-014). Every new Concept, Trope, template, and the
  CLI lands here as an independently shippable npm package
  (ADR-009, preserved).
- **`corpus/`** — the **global living corpus**. ADRs, sessions,
  categories, concepts, specs, chapters tracking LF as a project.
  Legacy decisions (ADR-001…ADR-010) and rewrite decisions
  (ADR-011 onwards) live here. Governed by
  [`corpus/CLAUDE.md`](./corpus/CLAUDE.md).

Frozen (read-only per ADR-018 + ADR-020):

- **`legacy/`** — the legacy scaffold, preserved verbatim as
  historical reference. Contains the prior `packages/` (20+
  legacy `@literate/*` packages), `site/` (legacy Next.js),
  `LITERATE.md` (legacy framework Protocol prose), and the
  pre-rewrite root tooling (`package.json`, `mise.toml`,
  `moon.yml`, `tsconfig.*.json`, lockfiles, `.moon/`). Never
  publishes. Never edited without an explicit Person-authorised
  freeze lift recorded in the active session's `## Decisions
  Made` (ADR-018 §8 procedure stays).

## Before authoring anything

1. Open [`corpus/CLAUDE.md`](./corpus/CLAUDE.md) — it defines the
   session lifecycle, gating rules, mutability profiles, and tag
   vocabulary for LF-project work. Its NEVER list includes the
   ADR-018 freeze (now targeting `legacy/`).
2. Check [`corpus/decisions/decisions.md`](./corpus/decisions/decisions.md)
   for prior decisions that constrain this session's work. ADRs
   011–020 are the rewrite-stage foundations; read them in order
   before authoring workflow Tropes or touching `packages/`.
   Notes on supersession: ADR-019 supersedes ADR-016's namespace
   clause (LF ships under `@literate/*`, not `@athrio/*`); ADR-020
   supersedes ADR-016's layout clause (one workspace at repo root;
   no `framework/` folder).
3. `legacy/LITERATE.md` is the legacy Protocol (frozen per
   ADR-018). Read it for historical context; do not edit it. New
   Protocol prose ships inside `packages/*` as `@literate/concept-*`
   or `@literate/trope-*` packages, with prose in sibling `.md`
   files referenced by `.ts` via `prose(import.meta.url, …)`
   per [ADR-015](./corpus/decisions/ADR-015-typescript-composition-md-siblings.md).

## The two protocols

LF defines the **Literate Programming Protocol (LPP)** — the
methodology this repo ships. Do not confuse LPP with any product-scope
protocol that a specific LF-using product might define. When precision
is needed, use "LPP" or "Literate Protocol"; reserve bare "Protocol"
in LF's own prose for LPP.

## Principles

1. **Prose before code.** Nothing code-shaped lands until the prose
   motivating it is authored and gated. Every Concept, Trope, spec,
   and session Goal is presented for Accept / Correct / Clarify /
   Reject before anything downstream follows.
2. **Append-only ADR bodies.** Once accepted, an ADR's body is
   frozen; only its `Status:` line is mutable (to record supersession
   or deferral).
3. **Person authors meaning; AI drafts and derives syntax.** The
   Person owns all output. The AI drafts prose, surfaces
   inconsistencies, and produces code from accepted prose.
4. **The algebra holds.** Everything authored fits one of four
   levels: Concept (what), Trope (how), **Step** (executable unit
   of how), Authored (instance). Reach for the right level; do
   not conflate. The Step layer was added by
   [ADR-011](./corpus/decisions/ADR-011-executable-monadic-prose.md);
   read it before authoring workflow Tropes.
5. **The Protocol is the program.** `Protocol.continue(repoRoot)`
   is the single entry point the agent harness invokes each turn
   (see [ADR-014](./corpus/decisions/ADR-014-protocol-continue-entry-point.md)).
   The imperatives in `corpus/CLAUDE.md` are the prose
   explanation of what that function does, not instructions the
   agent interprets from prose.

## The `@athrio/` scope

The `@athrio/` npm scope is reserved for the sister-repo Athrio
product at `/Users/yegor/Projects/Coding/athrio-com/athrio/` — the
Literate-Programming-Protocol implementation from which LF is
abstracted. LF never publishes under `@athrio/*`
(ADR-019 supersedes ADR-016 on this).
