# ADR-022 — Consumer `.literate/` role narrowed: init marker + `LITERATE.md` protocol entry + project config

**Date:** 2026-04-23
**Status:** Superseded by ADR-024
**Tags:** `#corpus` `#template` `#self-hosting` `#protocol` `#tooling`

**Amends:** ADR-002 (`.literate/` clause), ADR-004 (manifest clause)
**Preserves:** ADR-007

**Context:**

ADR-002 declared a three-folder invariant for every LF-using repo:
`corpus/` (prose), `src/` (code), `.literate/` (vendored LF
snapshot — Concepts, Tropes, primitives, managed by `literate init`
/ `upgrade` / `add`). ADR-004 placed project configuration under the
`"literate"` key in the consumer's `package.json`. ADR-007 exempted
LF's own repo from `.literate/`, since the bootstrap problem
(vendor what exactly? a prior version of yourself?) made the folder
meaningless for the self-hosted case.

Two pressures accumulated against the original `.literate/` role:

1. **The Effect rewrite made vendoring redundant.** ADR-011 through
   ADR-015 re-authored LF's Concepts and Tropes as typed Effect
   programs in `@literate/*` workspace packages, with Concept /
   Trope prose shipping as sibling `.md` files next to the `.ts`
   source (ADR-015). Any consumer that installs `@literate/cli`
   already has the full Protocol prose on disk under
   `node_modules/@literate/*` (or the JSR equivalent). Vendoring a
   second copy into `.literate/` serves no agent who can read
   `node_modules/`, and the two copies will inevitably drift
   (installed package at v0.3, `.literate/` snapshot still at
   v0.1). The original vendoring role is now negative value.

2. **`package.json.literate` couples LF to the JS ecosystem.** A
   Python project using LF to govern its own prose-before-code
   lifecycle has no `package.json`. Forcing one to carry the
   `"literate"` manifest key is a courtesy violation. LF's
   governance surface should not require the consumer to speak JS
   just to declare "my corpus is at `corpus/` and my agent id is
   `<x>`".

At the same time, the folder is load-bearing in three ways that
the rewrite has not replaced:

a. **Init marker.** The presence of `.literate/` is the unambiguous
   signal that this repo is LF-governed. The CLI uses it to
   disambiguate `literate init` (scaffold) from `literate continue`
   (operate); future verbs key off it; agents orienting fresh can
   test for the folder before attempting a session stamp.

b. **Agent-entry protocol file.** Agents land in consumer repos
   with a wide assortment of framework-specific conventions:
   `CLAUDE.md`, `AGENTS.md`, `.cursor/rules/*.mdc`,
   `.continue/config.json`, `.github/copilot-instructions.md`.
   Restating the LF lifecycle in each of these files, maintained
   by each consumer, is duplication that drifts. A single
   authoritative file — `.literate/LITERATE.md` — that every
   agent-specific file points at removes the duplication and gives
   every fresh agent the same entry. The convention "agent-specific
   file is a thin pointer to `.literate/LITERATE.md`" generalises
   across framework updates: when a new agent framework adds its
   own config convention next year, the consumer adds one more
   pointer, not another copy of the Protocol prose.

c. **Project configuration carrier.** Corpus path, agent defaults,
   wired Tropes, snapshot locations, feature flags — the
   per-project knobs that `package.json.literate` carried. Placing
   them in `.literate/config.*` keeps configuration co-located with
   the rest of LF's surface, makes the folder's purpose coherent
   (a self-contained governance root), and decouples from
   `package.json`'s existence.

The responsible move is to **keep the folder, drop the snapshot
role, and give it a narrower, durable role** — init marker,
protocol entry, and project config — where each element is
something the `node_modules/` copy genuinely cannot provide.

**Decision:**

### 1. Consumer invariant preserves `.literate/`; role is narrowed

Every LF-governed consumer repo contains `.literate/` at its root.
The folder's contents are **author-side**, not vendored:

- `.literate/LITERATE.md` — the **authoritative, human- and
  agent-readable Protocol prose** for this repo. Scaffolded by
  `literate init` from an LF-maintained template; fully mutable by
  the consumer (they may add project-specific rules, constrain
  categories, reorder sections). The file documents LF's lifecycle
  (session start, gate, work, close; Concept / Trope / Step
  algebra; NEVER list) in a form stable across framework minor
  versions.
- `.literate/config.*` — **project-specific configuration**.
  Format is `config.json` by default; `config.toml` or
  `config.yaml` variants are permitted and resolved by the CLI in
  that order. Carries the fields previously held in
  `package.json.literate` (corpus path, snapshot dir, agent id
  defaults, per-repo Trope wiring).
- Nothing else is required. The folder may hold additional files
  (generated indexes, caches, locks) — these are implementation
  details and do not belong in the invariant.

`.literate/` does **not** contain:

- Vendored Concept / Trope prose — that lives in installed
  `@literate/*` packages.
- Session logs — `corpus/sessions/`.
- ADRs — `corpus/decisions/`.
- Compiled artefacts — `src/` or the consumer's equivalent.

### 2. `LITERATE.md` as the single agent-entry point

Every consumer's agent-specific entry file — `CLAUDE.md`,
`AGENTS.md`, `.cursor/rules/literate.mdc`,
`.github/copilot-instructions.md`, and any future equivalent —
becomes a **thin pointer** to `.literate/LITERATE.md` rather than
a restatement of the Protocol.

A pointer file typically contains:
- A one-sentence statement: "This repo is governed by the Literate
  Framework."
- A relative link: `See .literate/LITERATE.md for lifecycle rules,
  gating, mutability, and the NEVER list.`
- Optional: project-specific addenda that sit outside the LF
  Protocol (e.g., "our `corpus/specs/` requires a migration-plan
  section").

The CLI's `literate init` verb scaffolds the pointer for the
agent frameworks the consumer selects at init time (defaulting to
`CLAUDE.md` as broadest-fit). The consumer may add more pointers
later without re-running `init`.

### 3. How agents discover Concept / Trope prose (without vendoring)

A fair objection to dropping the vendored-snapshot role is: *if
`.literate/` no longer carries Concept and Trope prose, how does an
agent landing cold learn what a Trope is, or which Tropes are
available in this repo?* The answer is a three-tier discovery path,
with the canonical prose living exactly once (in installed
packages) and every other tier pointing at it.

**Tier 1 — `.literate/LITERATE.md`: the stable meta-prose.**

The file carries the **algebra-level** prose: what Concept /
Trope / Step / Modality / Session / Goal / Gate *are*, at a level
stable across `@literate/*` minor releases. An agent landing cold
reads this once and knows the vocabulary. The file does not
enumerate specific Concepts or specific Tropes (those version
per-package); it defines the algebra and the lifecycle. Stable
meta-prose is authored-once-copied-never: `literate init`
scaffolds it from an LF-maintained template, after which it is the
consumer's authored artefact.

**Tier 2 — Installed `@literate/*` packages: the authoritative,
versioned prose.**

Specific Concept and Trope prose lives in the packages the
consumer has installed. Per ADR-023 (gated in this same session),
LF publishes source, not bundles: every installed `@literate/*`
package carries its authored `.ts` + sibling `.md` / `.mdx`
verbatim. Agents read these directly — the same way they read any
installed library's source:

- Trope narrative — `<install-root>/@literate/trope-<name>/src/prose.mdx`.
- Concept narrative — `<install-root>/@literate/concept-<name>/src/concept.mdx`
  (where Concept packages ship separately), or the `src/` prose
  siblings of whichever package defines the Concept.
- Type algebra — `<install-root>/@literate/core/src/kinds.ts` and
  its sibling prose.

The `<install-root>` depends on the consumer's package manager
and runtime. For Bun (the required runtime per ADR-024) installing
from JSR, the typical paths resolve under
`node_modules/@literate/*` (when the consumer has a workspace) or
`~/.bun/install/cache/@literate/*` (global install). Portable
discovery is: `bun pm ls --json` (or equivalent) returns the
resolved install path for every `@literate/*` package in scope.

`.literate/LITERATE.md`'s "Where to find more" section names these
paths generically and links to the meta-pattern; it does not
hardcode the exact filesystem layout, which shifts across package
managers.

**Tier 3 — CLI comprehension verbs: ergonomic access.**

Later versions of `@literate/cli` ship Unweave-modality verbs (per
ADR-021) that surface installed prose structurally:

- `literate list concepts` — enumerate installed Concepts with
  one-line descriptions.
- `literate list tropes` — enumerate installed Tropes with their
  modality and a one-line description.
- `literate explain concept <name>` — print the Concept's prose,
  schema, and realising Tropes.
- `literate explain trope <name>` — print the Trope's prose,
  Variants, and required services.

These verbs are **ergonomic**, not authoritative; they compose
the same authoritative prose Tier 2 holds. The discovery path is
designed to work without Tier 3 — an agent that only has Tier 1
and Tier 2 can still answer "what is a Trope" (from LITERATE.md)
and "what Tropes are available here" (by walking
`node_modules/@literate/trope-*`). Tier 3 lands when it lands
(post-v0.1).

**What is *not* in the discovery path:** `.literate/` never copies
Concept or Trope prose from installed packages, even as a
convenience mirror. The drift risk (v0.1 snapshot vs. v0.3
installed package) is the exact problem that narrowing the
folder's role resolved; reintroducing a mirror would recreate it.

### 4. `.literate/config.*` replaces `package.json.literate`

The config file schema (defined in `@literate/core` via Effect
Schema) carries:

- `corpus` — path to the corpus directory (default: `corpus`).
- `snapshots` — optional path for any CLI-generated caches
  (default: `.literate/.cache` or similar; absent is fine).
- `agent` — default `agent` identifier for session stamps when
  `LITERATE_AGENT_ID` env var is absent.
- `tropes` — optional wiring declarations for per-repo Trope
  configuration (may be empty / absent).
- `extends` — optional path to another `config.*` to inherit from
  (for monorepos with a shared root config). Deferred to a later
  ADR if use-cases emerge.

The `@literate/cli` resolver reads `.literate/config.json`,
falling back to `.toml` and `.yaml`, in that precedence. If
multiple files are present the JSON wins and a warning is emitted
(there is only one config per repo).

`package.json.literate` is **no longer consulted by the CLI** as of
this ADR's Accept. The `template-minimal` scaffold drops the key.
Existing consumers (of which there are none yet, pre-v0.1) would
need a one-time migration; no migration path is authored because
the framework has not yet shipped.

### 5. ADR-007 is preserved

LF's own repo continues to have no `.literate/`. The root
`CLAUDE.md` and `corpus/CLAUDE.md` pair serves the entry-file role
that `.literate/LITERATE.md` serves for consumers: both are
authored, both are agent-readable, both point at the operational
rules. The self-hosting exemption ADR-007 established stays in
force — LF governs itself by reading its own operational files
directly, not by instantiating a consumer-shaped governance root
inside its own repo.

### 6. Amendments to prior ADRs

- **ADR-002** — `Status:` becomes `Accepted (.literate/ clause
  narrowed by ADR-022)`. Its `corpus/ → src/ → .literate/` diagram
  stays historically accurate; what changes is what `.literate/`
  *contains*. The body is untouched.
- **ADR-004** — `Status:` becomes `Accepted (manifest clause
  superseded by ADR-022; runtime-matrix clause amended by
  ADR-024)`. The `package.json.literate` key is retired; CLI
  manifest resolution moves to `.literate/config.*`. The body is
  untouched.
- **ADR-007** — unaffected. LF's repo still has no `.literate/`.

**Consequences:**

- **Template changes.** `packages/template-minimal/files/.literate/`
  gains `LITERATE.md` (with scaffolded Protocol prose derived from
  the legacy `LITERATE.md` at `legacy/LITERATE.md`, updated for the
  rewrite's algebra) and `config.json` (with the schema-valid
  default fields). The `.keep` placeholder is removed. The
  template's `package.json` drops the `"literate"` key; the
  template's `corpus/CLAUDE.md` becomes a thin pointer to
  `.literate/LITERATE.md` (or is removed if `CLAUDE.md` at repo
  root is enough).
- **CLI changes.** `@literate/cli` resolves per-project config
  from `.literate/config.*` rather than `package.json.literate`.
  A small adjustment in `runContinue` / `runClose` / `scaffold()`;
  the e2e smoke test's fixture gains `.literate/config.json` and
  loses the `"literate"` key in its `package.json`.
- **New `literate init` verb becomes substantive.** The verb is
  no longer a thin template-copy; it scaffolds a real governance
  root (`.literate/LITERATE.md` + `.literate/config.json` +
  optional agent-entry pointer file). The verb's design is
  scoped to this session's successor (per Goal 2's plan).
- **Ecosystem-agnosticism lands.** A Python or Rust project using
  LF adopts the same `.literate/` shape as a TS project. No
  `package.json` required. The framework governs prose-before-code
  uniformly across ecosystems.
- **Agent-entry consolidation.** Consumers add one pointer per
  agent framework they care about; the canonical Protocol prose
  lives in one place. Updating the Protocol (via an LF minor
  release) does not require touching every pointer file —
  `LITERATE.md` is authored, not vendored, but `literate upgrade`
  can offer a diff against the shipping template if the consumer
  opted into upgrades.
- **Migration cost.** Zero at this point. No consumer ships with
  LF yet. Post-v0.1 migrations follow the standard LF release
  pattern (semver minor with a `literate upgrade` path).
- **Init marker semantics.** `.literate/` presence becoming the
  marker means any repo with a stray empty `.literate/` folder is
  treated as LF-governed. The CLI's `literate init` refuses to
  overwrite a populated `.literate/` without an `--upgrade` flag;
  an empty `.literate/` is treated as "partially initialised" and
  completed. Details fall to the successor session.
- **Self-similarity preserved.** LF's own repo does not get
  `.literate/`; its entry files stay where they are. The framework
  governs itself by the same prose-before-code principle without
  instantiating the consumer-shaped governance root.
- **Name disambiguation.** `.literate/LITERATE.md` and
  `legacy/LITERATE.md` share a filename but serve different roles:
  the legacy file is the frozen pre-rewrite Protocol ship surface
  (governed by the legacy framework); the new
  `.literate/LITERATE.md` is the consumer's own authored Protocol
  entry. There is no active "root `LITERATE.md`" in LF's current
  repo (the legacy one moved to `legacy/` in ADR-020).
