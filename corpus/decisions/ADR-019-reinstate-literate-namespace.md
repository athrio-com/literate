# ADR-019 — Reinstate `@literate/*` namespace for rewrite packages

**Date:** 2026-04-23
**Status:** Accepted (npm-scope clause narrowed by ADR-025: `@literate/*` applies to `@literate/cli` only; Trope/Concept identifiers are registry-path conventions)
**Tags:** `#release` `#tooling` `#migration`

**Context:**

ADR-016 ("`@athrio/*` namespace; `framework/` project folder;
multi-project split") committed every rewrite-shipped package to
the `@athrio/` scope. The stated concern was "version-number
fiction" — publishing `@literate/core@1.0.0` with an interface
incompatible with a hypothetical `@literate/core@0.1.0` already in
consumers' hands. ADR-018 §7 then codified that concern as a
*deprecation of `@literate/*`*, noting in the same paragraph that
"Consumers of `@literate/*` (zero at time of writing — the legacy
scaffold is pre-1.0 and unpublished) migrate to `@athrio/*`".

Two facts have surfaced since:

1. **The `@athrio/` scope is not available to LF.** `Athrio` is
   the sister-repo product at
   `/Users/yegor/Projects/Coding/athrio-com/athrio/` — the proven
   Literate-Programming-Protocol implementation from which LF is
   being abstracted. The `@athrio/` npm scope is reserved for
   that platform. LF publishing under `@athrio/*` would
   mis-attribute LF's release surface to a sibling product.
2. **The "version-number fiction" concern was theoretical.**
   ADR-018 §7 itself records zero consumers and zero publications
   of legacy `@literate/*`. With no consumer ever having
   installed `@literate/core@0.x.y`, publishing
   `@literate/core@1.0.0` from the rewrite is a first
   publication, not a silent replacement. The concern that drove
   ADR-016's namespace choice never materialised.

These two facts together invalidate ADR-016's *namespace* clause
and the clauses of ADR-018 that depended on it (§3 referencing
`@athrio/*`; §7 deprecating `@literate/*`). The rest of ADR-016
(the multi-project `framework/` layout, the package manager
choice, the preservation of ADR-004 and ADR-009 in substance)
stands. The rest of ADR-018 (legacy code freeze, root corpus as
the global living corpus, ADR numbering continuity, no
cross-namespace imports, freeze-lift procedure) stands.

**Decision:**

### 1. Namespace

Every rewrite-shipped LF package is scoped `@literate/`. No LF
package is ever published under `@athrio/`. The `@athrio/` scope
is reserved for the sister-repo Athrio product and is outside
this repository's release surface.

Anticipated names (superseding ADR-016's list; not all published
in v0.1):

- `@literate/core` — the core algebra: `Step`, `ProseRef`,
  `ExecutionLog`, `Suspend`, combinators, schemas, the runtime
  substrate, `Protocol.continue`.
- `@literate/runtime` — the agent harness (ships inside
  `@literate/core` in v0.1; extracted if release cadence
  diverges).
- `@literate/cli` — the consumer-facing CLI.
- `@literate/concept-<id>` — one package per Concept.
- `@literate/trope-<id>` — one package per Trope.
- `@literate/template-<name>` — starter scaffolds.
  `@literate/template-minimal` in v0.1.
- `@literate/eslint-plugin` — determinism rules (deferred).

### 2. Amendment to ADR-018 §3 and §7

ADR-018's body is append-only. This ADR amends its *decisions*
by the following equivalences; readers should treat ADR-018 §3
and §7 as superseded by this section wherever the two conflict:

- **§3 amendment.** New code under `framework/packages/*` ships
  as `@literate/*`, not `@athrio/*`. The rest of §3 (new code
  lives in `framework/`; none is added under legacy `packages/`
  or `site/`) is unchanged.
- **§7 amendment.** There is no deprecation of `@literate/*`.
  Legacy `packages/*` carrying `@literate/*` names remain frozen
  per ADR-018 §1 and unpublished. The rewrite's
  `framework/packages/*` ship the first real publications under
  `@literate/*`. Legacy package names and rewrite package names
  share the `@literate/` scope by design; the two are disambiguated
  by release (legacy never publishes; rewrite publishes) and by
  workspace boundary (root workspace vs `framework/` workspace).

ADR-016's *namespace* decision is superseded by this ADR. Its
*multi-project split*, *package-manager-and-tooling*, and
*relationship-to-legacy* sections (other than the `@athrio/`
spelling) stand.

### 3. Name-collision handling

Inside this monorepo the legacy `packages/*` declare
`@literate/core`, `@literate/cli`, `@literate/concept-*`,
`@literate/trope-*`, `@literate/template-minimal`; the rewrite's
`framework/packages/*` will declare some identical names
(`@literate/core`, `@literate/cli`, …).

Collision is handled by workspace isolation per ADR-016's
multi-project split: root `package.json` workspaces only
enumerate `packages/*`; `framework/package.json` workspaces only
enumerate `framework/packages/*`. Each project has its own
`node_modules/`; `@literate/core` resolves to the rewrite inside
`framework/` and to the legacy inside root (where the legacy is
frozen and no new code consumes it).

At publish time only `framework/packages/*` publish; legacy
`packages/*` remain unpublished per ADR-018 §1 and §7 (as
amended).

### 4. Consumer manifest key

ADR-016 anticipated a rename of the consumer manifest key from
`literate` to `athrio`. That migration is retracted. The consumer
manifest key stays `literate` (as set by legacy ADR-004). A
future ADR may revisit the manifest key if a reason unrelated to
namespace arises.

### 5. Living prose updates (mutable surfaces only)

The following mutable prose surfaces are updated to replace
`@athrio/*` with `@literate/*` as part of this decision. Frozen
ADR bodies (ADR-011 through ADR-018) are **not** edited; they
remain historically accurate as the journal of what was decided,
even where a later ADR supersedes a clause.

- Root `CLAUDE.md` — maintainer-orientation prose.
- `corpus/CLAUDE.md` — "Working with `packages/` and
  `framework/packages/`" section; NEVER-list bullet on legacy
  imports (references the namespace in its rationale).
- `framework/CLAUDE.md` and `framework/README.md`.
- `framework/package.json`, `framework/packages/core/package.json`
  — `name` fields.
- `corpus/categories/tags.md` — the `#migration` tag's definition
  currently reads "`@literate/*` → `@athrio/*`"; editorial
  revision to drop that example.

The session log `2026-04-23T1200-athrio-framework-genesis.md`
remains as-is (append-once journal body) and its sessions-index
row is unchanged; the historical record of the earlier decision
is preserved intact.

### 6. Relationship to ADR-016

ADR-016's `Status:` becomes `Superseded by ADR-019 (namespace
clause)`. The non-namespace portions of ADR-016 (multi-project
split, package manager, tooling, relationship to legacy ADR-004
and ADR-009) are not superseded and remain Accepted in substance.

**Consequences:**

- Every rewrite package ships under `@literate/*`. No LF package
  ships under `@athrio/*`.
- Legacy `packages/*` keep their `@literate/*` names and stay
  frozen and unpublished per ADR-018.
- The consumer manifest key stays `literate`. The migration to
  `athrio` anticipated by ADR-016 does not occur.
- ADR-016 is marked `Superseded by ADR-019 (namespace clause)`;
  its body is unedited.
- ADR-018's §3 and §7 are amended in substance by this ADR; its
  body is unedited.
- A publish-time tool must still distinguish rewrite packages
  from legacy packages; the workspace boundary is the mechanism.
  No legacy package is publishable; any attempt to publish from
  the root workspace is out-of-scope for v0.1 and will be gated
  by a future release-process ADR.
- The sister-repo `@athrio/` scope remains available to the
  Athrio product, unencumbered by LF publications.
