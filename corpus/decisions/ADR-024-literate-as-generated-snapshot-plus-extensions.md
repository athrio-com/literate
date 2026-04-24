# ADR-024 — `.literate/` as LF-generated snapshot; consumer customizations in `.literate/extensions/`; `corpus/` as Product prose

**Date:** 2026-04-24
**Status:** Accepted (.literate/tropes/ and .literate/concepts/ ownership clauses amended by ADR-025: consumer-vendored after tangle, not CLI-regenerated; three-folder contract and LITERATE.md/weave-output regeneration preserved; §4 extensions sub-tree shape amended by ADR-026: overrides sub-folder eliminated, consumer-authored new Tropes/Concepts relocate to .literate/extensions/{tropes,concepts}/)
**Tags:** `#corpus` `#template` `#protocol` `#tooling` `#self-hosting`

**Supersedes:** ADR-022
**Amends:** ADR-002 (`.literate/` clause)
**Preserves:** ADR-007

**Context:**

ADR-022 narrowed the consumer `.literate/` folder from ADR-002's
"vendored LF snapshot" to "init marker + consumer-authored
`LITERATE.md` + `config.*`." Under that framing the consumer
*authored* everything in `.literate/` and the framework never
wrote to the folder.

A mid-session Discussion-mode exploration (captured at
`temp/2026-04-24-exploration-protocol.md`; Protocol disposition,
§3) resolved the framing differently. Three observations drove
the revision:

1. **LF generates derived Protocol prose per project from installed
   Tropes.** Each `@literate/trope-*` package the consumer has
   wired in contributes a materialised prose artefact specific
   to the consumer's Trope graph. The natural home for those
   derived artefacts is a *snapshot* folder the CLI owns and
   regenerates on every `literate compile`. Authoring
   customizations inside a folder the CLI overwrites is
   structurally fragile: a direct edit to an LF-generated
   `.literate/<name>.mdx` is lost on the next compile. ADR-022's
   "consumer authors `.literate/LITERATE.md`" collides with this
   regeneration model — either the CLI must reason about which
   files it owns vs. which the consumer authored (introducing an
   authorship-provenance bookkeeping burden the Protocol does
   not justify), or consumer-authored material must live
   somewhere the CLI never writes.

2. **Consumers still need a customization surface.** They need
   to override a Trope's prose, extend the Mandatory Agent
   Instructions with project-specific rules, pin a prose template
   against drift, or author project-local Protocol material (e.g.,
   a consumer's own ADRs *about how they're customizing LF*, which
   are Protocol-level in LF's taxonomy but project-specific in
   scope). A second folder — explicitly customizations, explicitly
   surviving regeneration — cleanly separates these concerns.

3. **Product work and Protocol work occupy different registers.**
   A consumer's ADRs about their own product (auth flows, domain
   decisions) belong to the Product register. A consumer's ADRs
   about how they're customizing LF belong to the Protocol
   register. Placing both in `corpus/` at v0.1 is acceptable *if*
   the header disambiguates — but the *register* is architectural,
   not cosmetic. ADR-022 conflated the two by placing Protocol
   customizations in `.literate/` and Product prose in `corpus/`
   without naming the underlying register distinction. The new
   framing names it: `corpus/` is Product; `.literate/extensions/`
   is Protocol customization.

Under the revised framing the three folders split cleanly:

| Folder | Owner | Regenerated on compile | Register |
|---|---|---|---|
| `corpus/` | Consumer | No | Product |
| `.literate/` | LF | **Yes — fully overwritten** | Protocol (derived) |
| `.literate/extensions/` | Consumer | No (survives regeneration) | Protocol (authored) |

This resolves ADR-022's collision: the CLI owns `.literate/`
entirely and may recursively remove it at the start of every
compile without losing consumer work, because consumer work lives
outside `.literate/` or inside `.literate/extensions/`. ADR-022's
intent (a clean, agent-readable governance surface) survives; the
*location* of the author-side material shifts.

**Decision:**

### 1. Three-folder consumer invariant

Every LF-governed consumer repo has:

- **`corpus/`** — the consumer's **Product** prose. ADRs about
  what they're building, specs, chapters, stories, session logs
  for Product work, Concept definitions for their domain. LF
  tooling **never writes to `corpus/`**. The consumer owns every
  byte. The existing `corpus/` shape from LF's own repo (indexes,
  sessions/, decisions/, specs/, chapters/, categories/, memos/)
  is the default layout; consumers may adjust.
- **`.literate/`** — LF's **generated snapshot**. On every
  `literate compile` the CLI recursively removes `.literate/`
  and writes the current materialised Protocol prose derived
  from the installed `@literate/*` Trope graph. Direct edits are
  **undefined behaviour**; the next compile overwrites them. The
  CLI's existing `fs.remove(literateRoot, { recursive: true })`
  before write is the correct enforcement and is preserved. The
  folder structure inside `.literate/` is LF's to evolve; the
  `.literate/tropes/`, `.literate/concepts/`, and any other
  subtrees are implementation details of the compile step.
- **`.literate/extensions/`** — the consumer's **Protocol
  customization** surface. LF **reads** this on compile (to merge
  overrides into the snapshot, to honour consumer-added
  imperatives, to pick up consumer-authored Protocol prose
  referenced by the installed Trope graph) but **never writes**
  to it. Writes to `.literate/extensions/` **survive
  regeneration by design**. Consumer-authored ADRs about Protocol
  customization, overrides for installed Tropes, and extensions
  to the Mandatory Agent Instructions live here.

### 2. `corpus/` is Product prose only

`corpus/` carries Product-register material exclusively. The
consumer's ADRs about their auth system, their domain Concepts,
their specs for what they're building — all in `corpus/`.

ADRs *about how the consumer is customizing LF* (Protocol
register) belong in `.literate/extensions/decisions/` eventually.
At v0.1 the exploration permits both registers to sit in `corpus/`
with a `disposition:` header field disambiguating (§3.3 and §8 of
the exploration protocol); the folder split is P5+ work under the
Disposition Concept session. This ADR names the invariant; the
disposition-field mechanism lands in a later ADR.

### 3. `.literate/` is LF-owned and ephemeral

The `literate compile` step:

1. Resolves the consumer's Trope graph from their installed
   `@literate/*` packages.
2. Recursively removes `.literate/` (with `.literate/extensions/`
   preserved — the CLI filters this subtree from the removal).
3. Materialises per-Trope prose into `.literate/tropes/<id>.mdx`,
   per-Concept prose into `.literate/concepts/<id>.mdx`, etc.
4. Merges any `.literate/extensions/overrides/tropes/<id>/*`
   files over the materialised output (overrides shape decided
   in a later ADR per the exploration's §4; this ADR only fixes
   the folder contract).

Direct edits to `.literate/<anything-except-extensions>` do not
survive a compile. The CLI emits a **generated-file sigil** at the
top of every materialised `.mdx`:

```mdx
{/* GENERATED by LF — edit via .literate/extensions/overrides/
    or eject; see LITERATE.md */}
```

The sigil makes the generated/authored distinction visible at
file-read time without requiring agents or humans to consult the
Protocol first.

### 4. `.literate/extensions/` is the customization surface

Writes to `.literate/extensions/` survive regeneration. The folder
carries, at minimum (shape extends as later ADRs land):

- `.literate/extensions/overrides/tropes/<id>/...` — per-Trope
  prose overrides. Resolved by the compile step as described
  above. The override contract and upstream-hash reconciliation
  mechanism is the subject of a later ADR (exploration §4 and §5).
- `.literate/extensions/decisions/` — consumer-authored ADRs
  about their LF customization (Protocol register). Parallel to
  `corpus/decisions/` but scoped to Protocol concerns. Optional
  at v0.1 — consumers may continue placing such ADRs in `corpus/`
  with a disposition-field header until the folder split is
  ratified.
- `.literate/extensions/imperatives.md` (optional) — additional
  Mandatory Agent Instructions the consumer wants appended to
  LF's base set. Read on compile and merged into the materialised
  `.literate/imperatives.md` (or equivalent) the CLI produces for
  agent consumption.
- Other file shapes as later ADRs introduce them.

### 5. Agent entry: `LITERATE.md` is authoritative; `CLAUDE.md` is an optional pointer

**`LITERATE.md` is the Protocol file.** It tells agents (and
humans) precisely what LF is, what Concepts and Tropes govern
this repo, how the session lifecycle flows, how the gate works,
what the NEVER list contains. It is the entry point to LF and
to this repo's `corpus/`. Protocol is the way everything works;
`LITERATE.md` is the authored prose of that Protocol.

`LITERATE.md` is **LF-provided** (shipped as part of the
installed framework) and **materialised by `literate compile`**
into **`.literate/LITERATE.md`**. Like every other file in
`.literate/`, it is regenerated on every compile and reflects
the current installed Trope graph. Direct edits to
`.literate/LITERATE.md` do not survive regeneration; consumer
customization happens through `.literate/extensions/` and is
merged into the materialised file on compile.

**`CLAUDE.md` at repo root is an optional pointer.** Its sole
role is to instruct agents that open `CLAUDE.md` first
(Claude's default read path) to *immediately read
`.literate/LITERATE.md`* for the authoritative Protocol. It
carries no imperatives and no Protocol prose of its own —
typically one or two sentences plus the pointer. LF ships a
`CLAUDE.md` in the `template-minimal` scaffold as a convenience
for repos whose agents read `CLAUDE.md` by default; a consumer
who deletes the file loses nothing load-bearing, because
`.literate/LITERATE.md` is still the Protocol surface and the
CLI itself names `.literate/LITERATE.md` as the reading target
in its help output and in any error that blocks progress.

**Everything works without `CLAUDE.md`.** The three agent-entry
vectors are:

1. **`.literate/LITERATE.md`** — the authoritative destination.
2. **`CLAUDE.md` / `AGENTS.md` / `.cursor/rules/literate.mdc` /
   `.github/copilot-instructions.md`** — optional pointers LF
   (or the consumer) ships into the repo for agent frameworks
   whose convention it is to read those files first. Each is a
   thin redirect to `.literate/LITERATE.md`.
3. **The CLI** — `literate` commands print a one-line pointer to
   `.literate/LITERATE.md` in their help output and in recoverable
   error messages, so an agent invoking the CLI without having
   opened any file lands on the Protocol surface via the CLI's
   own text.

The template scaffolds `CLAUDE.md` by default; other agent-
framework pointers are not scaffolded and are added by the
consumer as their tooling demands. All pointers share the same
redirect target and update in lockstep if LF ever relocates
`LITERATE.md` (unlikely post-v0.1).

### 6. Config file location is deferred

ADR-022 placed project configuration in `.literate/config.*`.
Under the new framing `.literate/` is regenerated, so config
cannot live there. The candidate locations are:

- `.literate/extensions/config.*` — survives regeneration;
  consistent with the extensions-are-author-side framing.
- `literate.config.*` at repo root — outside `.literate/`
  entirely; more conventional for tool configuration (cf.
  `tsconfig.json`, `package.json`, `bunfig.toml` all at root).
- Reinstating `package.json.literate` — ADR-022 had a concrete
  reason to drop this (non-JS consumers); that reason stands.

The exploration protocol does not resolve the choice. This ADR
defers the decision to a later session (candidate: P5 Disposition
session, which re-opens the `.literate/extensions/` structure
question; or a separate P-config session). Until then, the CLI
reads config from **`.literate/extensions/config.json`** as an
interim default — consistent with the extensions-are-author-side
framing, minimal ceremony, easily relocated by a later ADR.

### 7. ADR-007 preserved

LF's own repo still has no `.literate/` and no
`.literate/extensions/`. Its `corpus/` carries Protocol-register
material directly (no Product register exists for LF's own work —
LF is the product, and its product prose *is* its Protocol
prose). The self-hosted collapse ADR-007 described remains valid
under the new framing; a full structural re-explanation in terms
of Disposition-monomodality (exploration §8.6) lands under P5
when the Disposition Concept is authored.

### 8. Amendments to prior ADRs

- **ADR-022** — `Status:` becomes `Superseded by ADR-024`. Its
  body is preserved (append-only per IMP-6); its authored
  reasoning remains historically accurate up to the moment
  the exploration protocol surfaced; the Status line flip records
  that this ADR replaces it.
- **ADR-002** — `Status:` becomes `Accepted (.literate/ clause
  superseded by ADR-024; src/ clause preserved)`. The
  three-folder diagram in ADR-002's body is partially superseded:
  `.literate/` is no longer described as "vendored LF snapshot"
  in the narrow ADR-022 sense nor in the original ADR-002 sense,
  but as an LF-generated snapshot with consumer customizations
  living in a sibling. ADR-002's body stays append-only; its
  status line captures the shift.
- **ADR-007** — unaffected. LF's own repo still has no
  `.literate/`.
- **ADR-004** — `Status:` becomes `Accepted (manifest clause
  unresolved; runtime matrix unchanged under ADR-025/ADR-026)`.
  The manifest location is deferred per §6 of this ADR.

**Consequences:**

- **CLI compile flow owns `.literate/` exclusively.** Every
  compile starts with a recursive remove of `.literate/` (modulo
  the `.literate/extensions/` preservation), proceeds to
  materialise the current Trope graph, and ends with the
  generated-file sigils in place. No authorship-provenance
  bookkeeping is required; the folder contract is all-LF or
  all-consumer per subtree.
- **Consumer customization is durable and explicit.** All
  consumer Protocol-side authorship lives in
  `.literate/extensions/`. A consumer audit (what have we
  customized?) is a directory listing; no grep through
  `.literate/` looking for "manually edited" markers is required
  because the CLI never reads back from the generated subtree.
- **Template-minimal scaffold updates.** The template ships:
  - `corpus/` with empty indexes (unchanged from current).
  - `.literate/extensions/.keep` (placeholder directory).
  - `CLAUDE.md` at repo root — a **thin pointer file** redirecting
    agents to `.literate/LITERATE.md` as the authoritative
    Protocol. Typically one or two sentences: "This repo is
    governed by the Literate Framework. Read
    `.literate/LITERATE.md` for the Protocol before any other
    action." Carries no imperatives or prose of its own.
  - `package.json` with dependencies (literate installed as a
    dev dep at this pivot — see ADR-025/026).
  - No `.literate/LITERATE.md` is shipped in the template; the
    file is materialised by the consumer's first `literate
    compile` from the installed `@literate/*` packages.
  - No `.literate/config.json` ships with the template; the
    consumer runs `literate init` or edits
    `.literate/extensions/config.json` if per-project config is
    needed.
- **ADR-022's agent-discovery-tier framing is reshaped.** ADR-022
  §3 described a three-tier discovery path (meta-prose in a
  consumer-authored `LITERATE.md`; installed `@literate/*`
  packages as authoritative versioned source; CLI comprehension
  verbs as ergonomic surface). Under the new framing the tiers
  collapse inward:
  - **Authoritative Protocol prose** is **`.literate/LITERATE.md`**
    — LF-provided, materialised by compile, reflecting the
    installed Trope graph plus any merged `.literate/extensions/`
    customizations. One file, one place to read.
  - **Installed package source** is no longer the agent's direct
    reading target. Under ADR-025 (publish bundled JS) installed
    `@literate/*` packages ship single-TS-file bundles with prose
    inlined at build time; the authored `.ts` + `.mdx` siblings
    of the LF repo do not travel through npm. Agents who need
    finer grain than `.literate/LITERATE.md` offers consult the
    CLI (Tier 3) rather than `node_modules/`.
  - **CLI comprehension verbs** (`literate list tropes`,
    `literate explain <x>`, etc.) remain the ergonomic surface,
    deferred post-v0.1 per the exploration's §13.
  The shift is: one authoritative prose file, materialised
  per-repo, reflecting installed state. Simpler than ADR-022's
  three-tier story; coherent with ADR-025's bundled-source
  decision.
- **The `.literate/` sigil is load-bearing, not decorative.**
  Agents and humans reading a `.literate/<x>.mdx` must see the
  sigil and understand the file is regenerated. Without the
  sigil, a consumer might edit `.literate/tropes/session-start.mdx`
  directly, lose the edit on next compile, and experience an
  uncaused drift they cannot debug.
- **Migration from ADR-022 is trivial.** No consumer has adopted
  the ADR-022 shape. `template-minimal` has an empty
  `.literate/.keep` placeholder (the ADR-022 scaffold work was
  deferred); the shift to `.literate/extensions/.keep` is
  mechanical.
- **Generated-file mdast shape includes the sigil.** Any
  `proseSchema` (exploration §6, deferred to P3) applied to
  generated files must either accept the sigil as a leading
  comment or have it stripped before validation. Flag for the
  P3 session.
