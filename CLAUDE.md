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

You are in the LF source repository. LF is **self-hosted** in a narrow
sense: LF's own authoring follows LF's own rules, but the invariant
`corpus/ → src/ ← .literate/` collapses here. There is **no
`.literate/` folder** in this repo — LF *is* the thing `.literate/` is
compiled from, so there is no snapshot to vendor against yourself.
The `src/` role is realised as `packages/*` (see ADR-002, ADR-009)
because LF the product is a set of typed npm-publishable units.

The two places you will read and write:

- **`corpus/`** — LF-project prose. ADRs, specs, chapters, sessions,
  categories, terms about *LF-as-a-product*: tooling choices, release
  process, layout decisions, dev log. Governed by
  [`corpus/CLAUDE.md`](./corpus/CLAUDE.md), which is the operational
  Protocol for LF-project work.
- **`packages/*`** — LF the product. Each Concept, each Trope, the
  starter template, the core library, and the CLI ship as a
  workspace package. Cross-references are real TypeScript imports;
  missing or wrong-typed references are compile errors.

The root of LF's product surface — the Protocol as consumers read it —
is [`LITERATE.md`](./LITERATE.md). When you draft or revise Protocol
text, you draft a Concept package or a Trope package under
`packages/` and the compiled `LITERATE.md` plus consumer
`.literate/` snapshots are derived from those pieces.

## Before authoring anything

1. Open [`corpus/CLAUDE.md`](./corpus/CLAUDE.md) — it defines the
   session lifecycle, gating rules, mutability profiles, and tag
   vocabulary for LF-project work.
2. Open [`LITERATE.md`](./LITERATE.md) — the authoritative framework
   Protocol. Anything that ships to consumers (Concepts, Tropes,
   schemas) must be consistent with it.
3. Check [`corpus/decisions/decisions.md`](./corpus/decisions/decisions.md)
   for prior decisions that constrain this session's work.

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
4. **The algebra holds.** Everything authored fits one of three
   levels: Concept (what), Trope (how), Authored (instance).
   Reach for the right level; do not conflate.
