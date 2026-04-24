# ADR-025 — LF adopts a shadcn-shaped distribution model

**Date:** 2026-04-24
**Status:** Accepted
**Tags:** `#release` `#tooling` `#protocol` `#migration` `#corpus`

**Supersedes:** ADR-023
**Amends:** ADR-019 (namespace scope), ADR-024 (`.literate/tropes/` ownership clause)
**Preserves:** ADR-005, ADR-015

**Context:**

Prior iterations of LF's ship shape assumed Tropes would be
`@literate/trope-*` npm packages a consumer installs, and the CLI
would materialise or import from them. ADR-023 committed to
publishing TypeScript source; a subsequent iteration committed to
bundled JavaScript. Both treated `@literate/trope-*` as
npm-distributed runtime artefacts.

A mid-session follow-up to the exploration protocol pivoted the
distribution model. The reference point is **shadcn/ui**: no
runtime package, authored source fetched from a registry and
copied into the consumer's repo, consumer owns the vendored copy.
Adopted for LF, this model:

- Closes the question of sharing an Effect runtime between the CLI
  and consumer-installed Tropes. Tropes are source files the CLI
  manipulates as text; Effect usage belongs to the CLI internally
  and to the consumer's own toolchain if they execute Trope TS
  code. The CLI does not import Tropes at runtime.
- Makes reflexivity honestly discharged. The consumer receives
  authored TypeScript and MDX for every Trope and Concept they
  adopt. The only bundled artefact is the CLI itself, which is
  infrastructure, not pedagogy.
- Simplifies override semantics. The consumer owns the vendored
  file and edits it directly. A separate `.literate/extensions/overrides/`
  mechanism becomes either redundant or narrow.
- Removes a registry service from the problem. Distribution is
  HTTP fetch of raw files from a git repository.

**Decision:**

### 1. Two classes of shipped material

LF ships:

- **One CLI**, published to npm as `@literate/cli` as a bundled
  JavaScript tool. Consumer installs globally or as a dev
  dependency. The CLI contains no Trope logic; it is a fetcher,
  file-placer, materialiser, and explainer.
- **Seed files**, authored TypeScript and MDX for Tropes and
  Concepts, living in LF's own git repo under `registry/`. These
  are *not* published to npm. The CLI fetches them on demand and
  copies them verbatim into the consumer's repo.

There is no `@literate/trope-*` or `@literate/concept-*`
published package. Those identifiers survive only as
registry-path conventions (§4).

### 2. The CLI's three operations

The CLI performs three operations. All are mechanical and
deterministic; no AI reasoning happens at the framework level.

- **Tangle** — fetch a seed from a registry, place it at the
  correct path in the consumer's repo, update
  `.literate/manifest.json` with what was added. Invoked by
  `literate init` (scaffold + all seeded Tropes for a template)
  and `literate add <kind> <id>` (single seed).
- **Weave** — read all Tropes and Concepts currently present in
  the consumer's `.literate/` tree, materialise the reader-facing
  `.literate/LITERATE.md` and any other derived artefacts the
  Protocol defines. Deterministic, idempotent, inputs-only.
  Overwrites its own output on every run; does not touch vendored
  Tropes or Concepts.
- **Explain / check** — read the consumer's tree and describe
  what's there (`literate list tropes`, `literate explain <id>`)
  or validate structural invariants (`literate check`). Unweave
  is a synonym for explain — reconstructing a Trope's rationale
  by reading its prose.

The vocabulary — weave, tangle — is LF's adaptation of the
literate-programming lineage. Meanings specialise: in LF at the
framework level, weave and tangle are *mechanical* operations.
AI-driven weave/tangle (the prose ↔ code work) happens inside
the consumer's authoring session under LF's Protocol, enacted by
the consumer's agent. **LF-the-framework performs no AI work.**

### 3. Execution model

The CLI does not import Tropes at runtime. From the CLI's
perspective, Tropes are data: source files the CLI reads as text
and copies to places on disk.

Trope TypeScript code, when present, is executed by the
consumer's TypeScript toolchain in the consumer's application or
scripts — not by the CLI. The CLI's Effect use is internal:
Schema validation of `literate.json`, validation of fetched seed
shapes, error channels for registry fetch failures.

### 4. Registry model

The canonical registry is LF's own git repository at a pinned
tag or commit SHA. Third-party registries are any git
repositories following the same directory convention. The
consumer's `literate.json` lists the registries this repo trusts:

```jsonc
{
  "registries": [
    { "name": "literate", "url": "github:literate/literate", "ref": "v0.1.0" }
  ]
}
```

A registry's directory convention:

```
<registry-root>/
  registry/
    tropes/
      <id>/
        index.ts
        prose.mdx
        README.md
    concepts/
      <id>/
        index.ts
        concept.mdx
        README.md
```

The transport is HTTP fetch of raw files. No registry service.
No npm publishing for Tropes. No package manager resolution.

### 5. Two manifest files

- **`literate.json`** at repo root — consumer-authored config.
  Lists trusted registries, default agent id, per-project pins.
  Survives across weaves and tangles.
- **`.literate/manifest.json`** — CLI-maintained ledger.
  Records what has been vendored into this consumer: each
  Trope/Concept id, the registry it came from, the ref, the
  fetched-at timestamp, the file paths placed. Updated by tangle
  operations; not touched by weave. Consumer may read; the CLI
  is authoritative for writes.

This resolves ADR-024's deferred config-location question.
Consumer project config goes at repo root (`literate.json`); CLI
state of what-is-vendored goes inside `.literate/`
(`.literate/manifest.json`).

### 6. Consumer owns vendored files

On tangle, the CLI places files at
`.literate/tropes/<id>/...` and `.literate/concepts/<id>/...`.
From that moment the consumer owns those files. They are:

- Editable — consumer may modify the TS or MDX directly.
- Committable — they land in the consumer's git history.
- Removable — `literate remove <kind> <id>` deletes the files and
  updates `.literate/manifest.json`.
- Rewritable — the consumer may author new content on top.

This supersedes ADR-024's "`.literate/` is LF-generated and
overwritten on compile" for the `.literate/tropes/` and
`.literate/concepts/` subtrees. The `.literate/LITERATE.md` and
other weave-output files remain CLI-generated and overwritten on
weave.

### 7. No update guarantees

LF makes no commitment that future LF versions remain compatible
with a consumer's vendored copies. Upgrade is explicit:
`literate update <kind> <id>` re-fetches the seed at the current
registry ref and surfaces a three-way-merge diff against the
consumer's current file. The consumer decides what to carry
forward.

The framework is a seeded starting point, not a living
dependency. This matches shadcn/ui's posture and aligns with
LF's Protocol discipline: upstream change is reconciled
deliberately by the consumer, not mechanically by the CLI.

### 8. CLI distribution: bundled JS on npm

The CLI ships as a bundled JavaScript file with a
`#!/usr/bin/env node` shebang, published to npm under
`@literate/cli`. Any Node-shaped runtime (Node, Bun, Deno) runs
it. npm Trusted Publishing via GitHub Actions OIDC is the
intended release pipeline; mechanics are deferred to a later
session.

Bundling the CLI is acceptable because the CLI is
infrastructure, not pedagogy. The pedagogy lives in the seed
files, which arrive at the consumer's repo as authored TS + MDX.
The reflexivity obligation is honestly discharged: what the
consumer receives *is* literate source.

### 9. Amendments to prior ADRs

- **ADR-023** — `Status:` becomes `Superseded by ADR-025`. The
  source-first publish invariant dissolves under this ADR because
  `@literate/trope-*` no longer publishes at all. The
  reflexivity argument ADR-023 advanced is preserved — this ADR
  discharges it differently, by having the consumer receive
  source directly rather than by publishing source to npm.
- **ADR-019** — `Status:` becomes `Accepted (npm-scope clause
  narrowed by ADR-025)`. The `@literate/*` npm scope applies
  only to `@literate/cli` under the new model. Trope and Concept
  identifiers are registry-path conventions (`registry/tropes/<id>`,
  `registry/concepts/<id>`), not npm-scoped packages.
- **ADR-024** — `Status:` becomes `Accepted (.literate/tropes/
  and .literate/concepts/ ownership clauses amended by ADR-025;
  three-folder contract preserved)`. The three-folder structure
  (`corpus/`, `.literate/`, `.literate/extensions/`) is unchanged.
  What shifts is who owns `.literate/tropes/` and
  `.literate/concepts/`: under ADR-024 they were LF-regenerated;
  under this ADR they are consumer-vendored after tangle. The
  rest of `.literate/` (LITERATE.md, manifest.json, and other
  weave outputs) remains CLI-authored.
- **ADR-005** — preserved. Prose-first in authoring stays. The
  earlier ship-shape amendment (weave at ship time) is moot
  because Tropes do not ship as packages; `prose()` resolves
  trivially against co-located vendored source.
- **ADR-015** — preserved. `prose(import.meta.url, './prose.mdx')`
  works as originally specified. Sibling resolution happens
  against the vendored `.literate/tropes/<id>/prose.mdx`, which
  is where the consumer's runtime (if any) reads it from.
- **ADR-004** — runtime-matrix clause unchanged from the
  post-ADR-024 state. Any Node-shaped runtime runs the CLI.
  Manifest clause is resolved by §5 of this ADR (`literate.json`
  at repo root).

**Consequences:**

- `@literate/cli` is the only npm-published artefact. No
  `@literate/trope-*` or `@literate/concept-*` publishes.
- Trope and Concept authoring in LF's own repo happens under
  `registry/tropes/<id>/` and `registry/concepts/<id>/`. The
  active `packages/@literate/trope-*` layout from S2–S4 is
  reshaped to match; migration is mechanical file moves,
  landed in a successor session.
- Consumer repos contain no `@literate/*` entries in
  `node_modules/` except `@literate/cli`.
- `.literate/tropes/<id>/...` and `.literate/concepts/<id>/...`
  are consumer-owned source trees. The CLI places them on tangle
  and leaves them alone; the consumer commits them to git.
- `.literate/LITERATE.md` and other weave outputs remain
  CLI-generated and overwritten on every weave.
- `.literate/extensions/` role narrows. The override subfolder
  may collapse entirely (consumer edits the vendored file
  directly). `.literate/extensions/` becomes the place where
  consumer-authored *new* Tropes live (distinct from LF-seeded
  ones) — or also collapses into `.literate/tropes/` with a
  marker in the manifest distinguishing origin. Resolved in a
  successor session; flagged in §10.
- Override upstream-change reconciliation is replaced by the
  update diff: `literate update <kind> <id>` re-fetches and
  surfaces a three-way merge.
- Registry third-party trust is the consumer's concern. They
  list registries in `literate.json`; the CLI fetches from them.
  No signatures or checksums at v0.1; flagged in §10.
- Reflexivity is discharged honestly: the consumer receives
  literate source for every Trope and Concept; the CLI is the
  only bundled artefact; the bundling is acceptable because the
  CLI is infrastructure, not pedagogy.

**Open questions (flagged for subsequent sessions):**

1. **Registry fetch mechanism.** Raw GitHub URLs via
   `raw.githubusercontent.com`? `git archive`? Sparse checkout?
   Tarball download? Decide in the registry-implementation
   session (P2 candidate).
2. **Version pinning granularity.** Git tag vs. commit SHA vs.
   semver-over-tags? Default likely git tag with semver
   convention; needs ADR.
3. **Override semantics collapse.** With consumers editing
   vendored files directly, what role does
   `.literate/extensions/overrides/` retain? Candidates:
   eliminate entirely; or repurpose for consumer-authored *new*
   Tropes; or keep as a soft-layer for cases where the consumer
   wants a diff-tracked overlay rather than an in-place edit.
4. **Update diff surfacing UX.** For `literate update <kind>
   <id>` when the consumer has edited the vendored file, what
   tooling surfaces the three-way merge? `git merge-file`?
   Plain `diff3`? An editor integration? Decide alongside the
   update verb's implementation.
5. **Registry trust.** Does the CLI verify checksums or
   signatures on fetched seeds, or trust the git source (TLS to
   the registry host)? v0.1 likely trusts TLS; future ADRs may
   add content-addressable checks.
