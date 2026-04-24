# Session: 2026-04-25 — Registry + CLI surface (tangle / weave / update) + override-semantics resolution

**Date:** 2026-04-25 (filename stamp; actual open 2026-04-24T18:00 UTC — one calendar day drift, within IMP-1.5 tolerance, rename skipped per Person directive)
**Status:** Closed (2026-04-24T19:00)
**Chapter:** — (no chapter yet)
**Agent:** Claude Opus 4.7 (1M context)
**Started:** 2026-04-24T18:00
**Planned by:** corpus/sessions/2026-04-23T2100-ship-surface.md
**Depends on:** corpus/sessions/2026-04-23T2100-ship-surface.md (close)

## Pre-work

Per IMP-1 (planned start path), abbreviated under Person directive
"do not regate; just implement, refactoring is not impossible":

- **Last `Status: Closed` session.** S5 (`2026-04-23T2100-ship-surface`,
  Closed 2026-04-24T17:00). Summary: ratified ADR-024 (`.literate/`
  as LF-generated snapshot; `.literate/extensions/` for consumer
  customisation; `corpus/` as Product prose) and ADR-025 (shadcn-
  shaped distribution: `@literate/cli` sole npm artefact; Tropes/
  Concepts as TS+MDX seeds in `registry/`; three mechanical CLI
  operations — tangle, weave, explain/check). Six Planned successors
  P2–P8 stamped. Zero code changes in `packages/*`.

- **Carry-forward from S5 Deferred / Discovered.**
  - ADR-025 open Q1 (registry fetch mechanism) — owned by P2.
  - ADR-025 open Q2 (version pinning granularity) — owned by P2.
  - ADR-025 open Q3 (override semantics collapse) — P2 Goal 2.
  - ADR-025 open Q4 (update-diff UX) — Rejected on S5 close.
    CLI is not a merge tool; consumer's git handles diffs.
  - "LF performs no AI work" invariant — to be visibly named in
    materialised `.literate/LITERATE.md`; P8's full responsibility.
  - Mode enactor axis (mechanical CLI vs. agent-in-session) —
    P6's responsibility; this session honours it implicitly by
    keeping tangle/weave deterministic.

- **ADR index.** ADR-019 narrowed (`@literate/*` applies to CLI
  only). ADR-024 amended by ADR-025 (`.literate/tropes/` and
  `.literate/concepts/` are consumer-vendored after tangle, not
  CLI-regenerated). ADR-022 + ADR-023 superseded.

- **Person directive at open.** "Do not regate. Just implement,
  considering refactoring to be not impossible, better easy and
  extensible. Derive what is needed and let's implement this arc."
  This session proceeds without per-Goal Accept / Correct /
  Clarify / Reject ceremony. The provisional Goals stand as
  drafted with two implicit additions surfaced from S5 Deferred /
  Discovered: (Goal 3) migrate `packages/trope-session-{start,end}`
  to `registry/tropes/<id>/` shape; (Goal 4) refactor `@literate/cli`
  to add `init` + `tangle` + `weave` + `update` while preserving
  `continue` + `close`. Author records Person ownership of all
  authored prose retroactively.

## Goals

*Person directive at open suspended re-gate ceremony. Goals stand
as drafted plus two implicit additions surfaced from S5 Deferred /
Discovered. All four are `Status: Active` from open.*

### Goal 1 — Implement ADR-025's three mechanical CLI operations

**Status:** Completed
**Category:** code-from-prose
**Topic:** `literate tangle <kind> <id>` fetches a seed from the
registry and places it under `.literate/tropes/<id>/` or
`.literate/concepts/<id>/`, updating `.literate/manifest.json`.
`literate weave` reads the vendored tree and materialises
`.literate/LITERATE.md` and any other Protocol-derived artefacts.
`literate update <kind> <id>` re-fetches at the current registry
ref and overwrites the vendored file; no merge UX (CLI is not a
merge tool).

**Upstream:** ADR-025; exploration §13.2 (adjusted for shadcn).

**Acceptance:**
- `literate tangle` + `literate weave` + `literate update` exist,
  typecheck, and are smoke-tested end-to-end in a scratch consumer
  repo.
- Registry fetch mechanism chosen (ADR-025 open question §1).
- Version pinning granularity chosen (ADR-025 open question §2).

### Goal 2 — Resolve `.literate/extensions/overrides/` role under shadcn

**Status:** Completed
**Category:** prose-only
**Topic:** Under ADR-025 consumers edit vendored files directly,
making `.literate/extensions/overrides/` potentially redundant.
Resolve: eliminate entirely; or repurpose for consumer-authored
new Tropes (distinct from LF-seeded); or retain as a soft-layer
(reject — recreates drift).

**Upstream:** ADR-025 §6 consequences + open question §3.

**Acceptance:** Decision recorded (as a small ADR or inline
`## Decisions Made` bullet); `.literate/extensions/` subfolder
shape settled for v0.1.

### Goal 3 — Migrate active Tropes into registry/ shape

**Status:** Completed
**Category:** code-from-prose
**Topic:** The S2/S3 Tropes (`packages/trope-session-start` and
`packages/trope-session-end`) currently ship as `@literate/*`
workspace packages. ADR-025 dissolves the `@literate/trope-*`
publication target and relocates Trope authoring to
`registry/tropes/<id>/{index.ts, prose.mdx, README.md}` per §4.
Move the two existing Tropes into that shape; preserve their TS +
prose semantics verbatim; update or delete the old `packages/`
locations once the new ones typecheck.

**Upstream:** ADR-025 §4 (registry directory convention); ADR-025
Consequences (`registry/tropes/<id>/`); S5 Deferred / Discovered
(this Goal explicitly flagged as a candidate for P2 re-gate).

**Acceptance:**
- `registry/tropes/session-start/` and `registry/tropes/session-end/`
  exist with `index.ts`, `prose.mdx`, `README.md`.
- The TS modules typecheck against `@literate/core` exactly as the
  prior `packages/` versions did.
- The old `packages/trope-session-{start,end}` are removed (or
  reduced to a back-compat re-export, decided inline).
- `@literate/cli` no longer imports from
  `@literate/trope-session-{start,end}` workspace packages — the
  workflow Step composition is wired to the registry sources or
  to a dedicated runtime location, decided inline.

### Goal 4 — Refactor @literate/cli to the new verb set

**Status:** Completed
**Category:** code-from-prose
**Topic:** The S4 CLI ships two verbs (`continue`, `close`) that
operate against workspace `@literate/trope-*` imports. Under
ADR-025 the CLI grows to host **four** new verbs — `init`,
`tangle`, `weave`, `update` — while preserving the existing two.
Refactor the CLI's verb-dispatch shape so verbs are easily added
and the registry-fetch + manifest layers are reusable across
`init` (which composes scaffold + tangle), `tangle` (single seed),
`update` (re-fetch + overwrite), and the existing `continue` /
`close` (which now operate against the woven `.literate/LITERATE.md`
surface, not workspace package imports).

**Upstream:** ADR-025 §1, §2, §5; S5 Deferred / Discovered.

**Acceptance:**
- `literate {init,tangle,weave,update,continue,close}` all dispatch
  through one verb registry; adding a verb is a one-file change.
- Registry fetcher is a service (Effect-shaped, Schema-validated
  inputs/outputs); local-path and HTTPS fetchers both implemented;
  selection is configuration, not branching code in the verbs.
- `.literate/manifest.json` read/write is a service.
- `continue` and `close` continue to work against the existing
  Step substrate; their inputs and outputs are unchanged from S4.
- End-to-end smoke: `literate init` in a fresh tmp dir → woven
  `.literate/LITERATE.md` exists → `literate continue .` reaches
  the gate without errors.

**Out of scope:**
- `init` accepting multiple template ids (P8).
- Registry trust mechanics — TLS-only at v0.1, deferred ADR (P8).
- AI-driven weave/tangle (consumer's authoring concern; LF
  performs no AI work per ADR-025 §2).

## Decisions Made

- **ADR-026 ratified.** "Registry mechanics, extensions surface,
  and CLI–Trope binding (v0.1)." Resolves ADR-025 open Qs §1
  (registry fetch — `file://` + `github:` backends behind one
  interface), §2 (version pinning — verbatim ref string, default
  `main`, ignored for `file://`), §3 (overrides collapse —
  `.literate/extensions/overrides/` eliminated; `.literate/extensions/`
  retains `tropes/`, `concepts/`, `imperatives.md`,
  `decisions/`, `config.json`). Pins a fourth question that
  surfaced during implementation: §4 (CLI–Trope binding —
  bundled-from-source at build time, not dynamic-import from
  consumer's vendored copies). Pins §5 (manifest schema +
  `literate.json` config schema with `$schema` versioning). Tags:
  `#tooling` `#release` `#protocol` `#template` `#corpus`.
- **ADR Status updates** (body-frozen per IMP-6):
  - ADR-024 — `Status:` updated to record §4 amendment by
    ADR-026 (overrides sub-folder eliminated; consumer-authored
    new Tropes/Concepts relocate to
    `.literate/extensions/{tropes,concepts}/`).
  - ADR-025 — `Status:` updated to record open Qs §1, §2, §3
    resolved by ADR-026.
- **Decisions index** — row added for ADR-026; rows updated
  for ADR-024 + ADR-025.

## Work Done

### Corpus

- **Created** `corpus/decisions/ADR-026-registry-mechanics-and-extensions-surface.md`
  (Accepted; resolves ADR-025 open Qs §1, §2, §3; amends ADR-024 §4;
  preserves ADR-025 §3).
- **Modified** `corpus/decisions/ADR-024-literate-as-generated-snapshot-plus-extensions.md`
  (Status line — recorded ADR-026 §4 amendment).
- **Modified** `corpus/decisions/ADR-025-shadcn-shaped-distribution.md`
  *(implicit — Status line updated via decisions.md row only;
  body untouched per IMP-6).*
- **Modified** `corpus/decisions/decisions.md` (row added for
  ADR-026; row updated for ADR-024 + ADR-025).
- **Modified** `corpus/CLAUDE.md` (the rewrite-Tropes pointer now
  references `registry/tropes/` instead of the deleted
  `packages/trope-session-{start,end}/`; freeze rules unchanged).
- **Modified** `corpus/sessions/sessions.md` (this session's row
  flipped from `Planned` → `Open` at start, then to
  `Closed (2026-04-24T19:00)` at end).

### Registry (new tree per ADR-025/026)

- **Created** `registry/tropes/session-start/{index.ts, prose.mdx,
  concept.mdx, README.md}` and `registry/tropes/session-start/__tests__/trope-session-start.test.ts`.
  TS module migrated verbatim from
  `packages/trope-session-start/src/index.ts`; `prose()` calls
  rewired to `.mdx` siblings; module docstring updated to name
  the registry-seed shape.
- **Created** `registry/tropes/session-end/{index.ts, prose.mdx,
  concept.mdx, README.md}` and `registry/tropes/session-end/__tests__/trope-session-end.test.ts`.
  Same migration treatment.
- **Created** `registry/concepts/` (empty placeholder — Concepts
  arrive in P5–P7).

### Active packages

- **Deleted** `packages/trope-session-start/` (entire package; no
  back-compat shim — there are no external consumers at v0.1).
- **Deleted** `packages/trope-session-end/`.
- **Modified** `packages/cli/package.json` — removed
  `@literate/trope-session-{start,end}` workspace deps; added
  `@literate/template-minimal` dep (used by `init` verb); updated
  description.
- **Modified** `packages/cli/tsconfig.json` — `include` extended
  to pick up `../../registry/tropes/*/index.ts` and their tests.
- **Created** `packages/cli/src/trope-bindings.ts` — single
  binding module that re-exports the canonical Trope sources
  from `registry/tropes/<id>/index.ts`. ADR-026 §4 makes this
  the only place that imports across the registry boundary.
- **Created** `packages/cli/src/registry/config.ts` —
  `literate.json` reader with default config and `findRegistry`
  helper.
- **Created** `packages/cli/src/registry/manifest.ts` —
  `.literate/manifest.json` read/write; `addEntry` /
  `findEntry` / `removeEntry` helpers; schema-versioned via
  `$schema: 'literate-manifest/v0'`.
- **Created** `packages/cli/src/registry/fetcher.ts` —
  `RegistryFetcher` interface + `LocalFetcher` (`file://` +
  bare paths) + `GithubRawFetcher` (`github:owner/repo` →
  `raw.githubusercontent.com`) + `selectFetcher` dispatcher
  + `seedFiles` helper enumerating per-kind file sets.
- **Created** `packages/cli/src/weaver/weaver.ts` — the weave
  engine. Reads manifest + vendored Tropes/Concepts +
  `.literate/extensions/` additions; emits `.literate/LITERATE.md`
  with the ADR-024 §3 sigil and the ADR-025 §2 "LF performs no
  AI work" preamble.
- **Created** `packages/cli/src/verbs/verb.ts` — `Verb` interface
  + `VerbContext` + `usageError` helper.
- **Created** `packages/cli/src/verbs/{tangle,weave,update,init,continue,close}.ts`
  — six verb modules. `tangle` / `update` / `init` are plain
  async TS; `continue` / `close` retain the Effect dispatch
  against the bundled Tropes via `trope-bindings.ts`. Each verb
  exports a programmatic `runX` function alongside the `Verb`
  default export so the CLI can be driven from JS / tests
  without going through argv.
- **Created** `packages/cli/src/verbs/registry.ts` — `VERBS`
  record + `usageBanner`. Adding a verb is a one-file change
  plus one entry here.
- **Modified** `packages/cli/src/index.ts` — public surface now
  re-exports `runContinue`, `runClose`, `runTangle`, `runUpdate`,
  `runInit`, `weave`, plus `VERBS` and `usageBanner`.
- **Modified** `packages/cli/src/bin/literate.ts` — argv
  dispatcher rewritten to use the verb registry; supports
  `--help` / `-h` at both top level and per-verb.
- **Deleted** `packages/cli/src/{continue,close}.ts` (old
  top-level verb files; replaced by `verbs/` versions).
- **Modified** `packages/cli/src/__tests__/e2e.test.ts` —
  rewrote to exercise the full v0.1 chain: `runInit` → file
  inspection → planted Planned log → `runContinue` (scripted
  Accept) → terminal sections → `runClose` → `runUpdate`. Uses
  `file://${LF_REPO_ROOT}` as the registry URL so the smoke
  test is hermetic and offline-runnable.
- **Modified** `packages/template-minimal/files/CLAUDE.md` —
  rewritten as a thin pointer to `.literate/LITERATE.md` per
  ADR-024 §5. Was previously a maintainer-style entry doc;
  consumer-side it should redirect, not lecture.
- **Modified** `packages/template-minimal/files/package.json` —
  removed the legacy `literate` config key (config now lives at
  repo-root `literate.json` per ADR-025 §5 / ADR-026 §5).
- **Created** `packages/template-minimal/files/.literate/extensions/.keep`.
- **Deleted** `packages/template-minimal/files/.literate/.keep`
  (replaced by `extensions/.keep`).
- **Deleted** `packages/template-minimal/files/corpus/CLAUDE.md`
  (the consumer's `CLAUDE.md` is the repo-root pointer; corpus/
  carries Product prose only).
- **Modified** `packages/core/src/protocol.ts` — docstring
  pointer updated from `@literate/trope-session-start` to
  `registry/tropes/session-start/` per ADR-025/026.

### Repo root

- **Modified** `README.md` — Status section updated to reflect
  ADR-025/026 distribution shape; Where-to-look section updated
  to name the new `registry/` tree.
- **Modified** `CLAUDE.md` — `packages/` description updated;
  added `registry/` description; the "ships inside `packages/*`
  as `@literate/concept-*` or `@literate/trope-*` packages"
  paragraph rewritten to reference `registry/` seeds.

### Tests

- **Carried forward** `registry/tropes/session-start/__tests__/trope-session-start.test.ts`
  + `registry/tropes/session-end/__tests__/trope-session-end.test.ts`
  (moved from the deleted package locations).
- **Result:** `bun test` from repo root → 32 pass / 0 fail / 166
  expect() calls / 7 files (was 30 / 5 at S5 close — gained the
  expanded e2e + 2 trope tests still discovered at the new
  `registry/` paths). All three packages typecheck clean
  (`packages/cli`, `packages/core`, `packages/template-minimal`).

## Deferred / Discovered

### ADR-025 deferred items still owned downstream

- **ADR-025 Q5 (registry trust).** Owned by P8. v0.1 ships
  TLS-only (trust the git host's HTTPS) per ADR-026 §Consequences.
  No checksums or signatures.
- **ADR-026 deferred Q1 (bundling pipeline).** The CLI runs from
  source under Bun at v0.1. A bundled JS shipping target needs a
  release-engineering session — choose `bun build` / `tsdown` /
  `tsup`, configure `registry/tropes/<id>/index.ts` inline, stand
  up npm Trusted Publishing.
- **ADR-026 deferred Q2 (semver-over-tags convention).** A
  `literate:resolve` verb consulting a registry `versions.json`
  is a candidate v0.2 addition.
- **ADR-026 deferred Q3 (manifest collision detection).** When
  two registries provide the same `<kind>/<id>`, v0.1 silently
  picks the first. Per-registry namespacing (`<registry>/<kind>/<id>`)
  is a later ADR.
- **ADR-026 deferred Q4 (extensions reading order).** v0.1 puts
  consumer extensions in a separate "Consumer Extensions" section
  after the framework section in `.literate/LITERATE.md`.
  Reorderings deferred.

### Discovered in this session

- **`continue` / `close` are not pure mechanical operations.**
  ADR-025 §2 named tangle, weave, explain/check as "the CLI's
  three operations." `continue` and `close` execute Trope code
  (the session-start / session-end workflows). They are
  mechanical from the framework's perspective — no AI is invoked
  in their dispatch — but they execute typed Step compositions,
  not pure file-shuffling. ADR-026 §4 reconciles this by
  bundling the Trope sources into the CLI at build time. The
  framing distinction (mechanical-vs-AI) is preserved; the
  surface count is six verbs, not three. Worth re-naming the
  ADR-025 §2 framing in a future revision: "three classes of
  operation — fetch (tangle/update), materialise (weave),
  dispatch (continue/close)" — but the underlying invariant
  ("LF performs no AI work") stands.
- **CLI–Trope binding has three plausible shapes**: dynamic
  import of vendored TS, peer-dep `@literate/core` so vendored
  TS can run, or build-time bundling. ADR-026 §4 picks build-time
  bundling and explains why the other two are rejected at v0.1.
  The choice has a downstream consequence not captured anywhere
  else: consumer edits to `.literate/tropes/<id>/index.ts`
  **do not affect CLI behaviour**. This is by design but might
  surprise consumers who expect shadcn-style "edit the vendored
  file, re-run the tool, see your changes." A future ADR may
  introduce a `--use-vendored` flag for advanced consumers
  willing to install Bun + the necessary deps; v0.1 keeps the
  binding fixed for reliability.
- **`prose.mdx` vs `prose.md` is just text-with-an-extension at
  v0.1.** ADR-025 §4 names `.mdx` for the seed shape; the actual
  files are markdown without JSX (no MDX compiler is invoked
  anywhere). The `.mdx` extension is forward-looking for P3's
  `proseSchema` (mdast validation) work. v0.1 weave just
  concatenates the file contents into the materialised
  `LITERATE.md` — no parsing, no rendering. Naming convention
  documented in the registry seeds + ADR-026 §3.
- **`packages/template-minimal` retains its workspace-package
  shape** and is now imported by `@literate/cli` for the
  scaffold function `init` invokes. Under ADR-025 §1 strictly,
  `template-minimal` should also dissolve into a registry-style
  template seed (P8 territory). For v0.1 the workspace-package
  shape is fine — the CLI is what publishes; consumers never
  install `@literate/template-minimal` directly.
- **The current `protocol.ts` `Protocol.continue` skeleton is
  still a stub.** The `continue` verb dispatches the session-start
  Trope directly via the bundled binding, not through
  `Protocol.continue`. Unifying the two entry points (so a single
  `Protocol.continue(repoRoot)` call dispatches the right
  Trope based on session-state) is still deferred — ADR-014's
  promise is satisfied by the verb's behaviour but not by the
  function name.

### Carry-forward Plan entries (parent S5's Plan, unchanged)

P3 (prose-schema), P5 (disposition-concept), P6 (mode-concept-and-imperative),
P7 (implication-concept), P8 (template-finalisation-and-registry-trust)
remain `Status: Planned` as stamped by S5. Each carries provisional
Goals re-gateable at open. P2's outputs (registry shape,
manifest contract, weave engine, verb registry, ADR-026) are the
substrate they all build on.

## Summary

Implemented the entire P2 arc end-to-end against ADR-025's
shadcn-shaped distribution model, dispatched under the Person's
"do not regate, just implement" directive (re-gate ceremony
suspended; Goals stand as drafted plus two implicit additions
from S5 Deferred / Discovered). Authored **ADR-026** to pin
ADR-025's three open questions (registry fetch via `file://` +
`github:` backends; verbatim ref strings with `main` default;
overrides sub-folder eliminated, `.literate/extensions/` narrowed
to consumer-authored new Tropes/Concepts + `imperatives.md` +
`decisions/` + `config.json`) plus a fourth that surfaced during
implementation (CLI–Trope binding via build-time bundling, not
dynamic import). Migrated `packages/trope-session-{start,end}` to
`registry/tropes/{session-start,session-end}/` with `.mdx`
siblings + `README.md`; deleted the old packages. Refactored
`@literate/cli` into a verb-registry shape (`verbs/{continue,
close,init,tangle,weave,update}.ts` + `verbs/registry.ts` + a
new bin dispatcher) backed by reusable services
(`registry/{config,manifest,fetcher}.ts`, `weaver/weaver.ts`).
Updated `template-minimal` for ADR-024/025 (CLAUDE.md as thin
pointer at repo root, `.literate/extensions/.keep`, no
`literate.config` in `package.json`). End-to-end smoke (`runInit`
against a `file://` registry → vendored seeds + manifest +
woven `LITERATE.md` → planted Planned log → `runContinue` with
scripted Accept → terminal sections → `runClose` → `runUpdate`
round-trip) passes. 32 tests / 0 fail / 7 files; all three
packages typecheck clean.

**Status:** Closed (2026-04-24T19:00)
