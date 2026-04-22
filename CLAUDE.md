# Literate Framework — Maintainer Entry Point

*This file orients AI collaborators working on LF itself. It is
deliberately short: its job is to send you to the right Protocol file
for the work you're about to do.*

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
