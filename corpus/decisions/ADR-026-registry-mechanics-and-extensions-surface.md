# ADR-026 — Registry mechanics, extensions surface, and CLI–Trope binding (v0.1)

**Date:** 2026-04-24
**Status:** Accepted
**Tags:** `#tooling` `#release` `#protocol` `#template` `#corpus`

**Resolves:** ADR-025 open questions §1 (registry fetch
mechanism), §2 (version pinning granularity), §3 (override
semantics collapse). Authored on the same day as ADR-024 +
ADR-025; this ADR pins the mechanics those two ADRs left open.
**Amends:** ADR-024 §4 (extensions subfolder shape — overrides
sub-tree eliminated; consumer-authored new Tropes/Concepts
relocate to `.literate/extensions/{tropes,concepts}/`).
**Preserves:** ADR-025 §3 (CLI does not import consumer-vendored
Trope code at runtime).

**Context:**

ADR-025 ratified the shadcn-shaped distribution model and named
five open questions (§Open questions 1–5). P2's implementation
work cannot proceed until at least the first three are pinned.
A fourth question surfaced during P2 implementation planning: if
Tropes are consumer-vendored after tangle, *where does the CLI
get its `continue`/`close` Trope logic*? Three candidates:
(a) the CLI executes the consumer's vendored
`.literate/tropes/<id>/index.ts` via dynamic import;
(b) the CLI bundles its own Trope logic at build time, ignoring
the consumer's vendored copies for execution purposes;
(c) the CLI publishes `@literate/core` to npm and consumers
install it as a peer dep so their vendored Tropes can run.

This ADR pins all four (Q1–Q3 from ADR-025 plus the binding
question).

**Decision:**

### 1. Registry fetch mechanism (ADR-025 Q1)

The CLI ships **two registry-fetcher backends** behind one
service interface:

- **`file://` backend.** URLs of shape `file:///abs/path` or
  bare absolute/relative paths. Reads from disk. Used for LF's
  own self-host (the CLI invoked from inside this repo finds
  `registry/` via `file://` to its own `registry/` subtree),
  for local development of third-party registries before
  publishing, and for offline reproducibility.
- **`github:` backend.** URLs of shape `github:<owner>/<repo>`.
  Translates to HTTPS GET against
  `https://raw.githubusercontent.com/<owner>/<repo>/<ref>/registry/<kind>/<id>/<file>`.
  No GitHub API calls; no auth required for public repos. TLS to
  the host is the only trust mechanism at v0.1 (registry trust
  per ADR-025 Q5, ratified separately).

A registry is identified by a `{ name, url, ref }` triple in
`literate.json`. The fetcher is selected by URL scheme (`file://`
or bare path → file backend; `github:` → github backend). The
`RegistryFetcher` interface is open: additional backends
(`gitlab:`, `forgejo:`, `https+tarball:`, `git+ssh:`) land as
later ADRs introduce them. Adding a backend is one new module
plus one entry in the fetcher registry — no changes to the
verbs.

This excludes `git archive`, sparse checkout, and full `git
clone` from v0.1: each costs latency, requires `git` on the
consumer's machine, and offers no value over raw-file fetch when
the seed payload is three files per Trope. Tarball download is
preserved as a future option for bulk-fetch workflows but not
v0.1.

### 2. Version pinning granularity (ADR-025 Q2)

The `ref` field of a registry entry is a **single ref string**
passed verbatim to the backend:

- For the `github:` backend, `ref` is interpolated into the URL
  path. Any value GitHub accepts at that position works:
  - A semver tag: `v0.1.0`, `v0.2.3-rc.1`.
  - A branch: `main`, `next`.
  - A commit SHA: `abc123def…` (full or 7+ char prefix that
    GitHub resolves).
- For the `file://` backend, `ref` is **ignored**. Local
  registries are uncommitted working trees; consumers wanting
  pinned local fetches use `git worktree` or check out the
  desired ref under a different path.

The default value when `ref` is unspecified is **`main`**.
Recording this as the default is a deliberate choice: v0.1 has no
released LF version, so any pinning policy is provisional.
Consumers wanting reproducibility should pin to a commit SHA.

A semver-over-tags convention (`vMAJOR.MINOR.PATCH`) is
**recommended but not enforced** by v0.1 tooling. A future ADR may
introduce a `literate:resolve <name>` verb that consults a
manifest file at the registry root listing version → ref
mappings; deferred until the release cadence is known.

### 3. Overrides collapse and `.literate/extensions/` shape (ADR-025 Q3)

`.literate/extensions/overrides/` is **eliminated entirely** at
v0.1. Per ADR-025 §6, consumers own vendored files after tangle
and edit them directly. A separate overrides sub-tree would
recreate the drift the shadcn pivot dissolved.

The `.literate/extensions/` folder retains a narrower contract.
At v0.1 it carries any combination of:

- **`.literate/extensions/tropes/<id>/`** — consumer-authored
  *new* Tropes, distinct from LF-seeded ones. Same internal shape
  as a registry seed (`index.ts`, `prose.mdx`, optional
  `README.md`). `weave` reads these alongside `.literate/tropes/`
  and includes their prose in `.literate/LITERATE.md`. The
  manifest does **not** track these files (origin is consumer,
  not registry).
- **`.literate/extensions/concepts/<id>/`** — symmetric for
  Concepts.
- **`.literate/extensions/imperatives.md`** — additional
  Mandatory Agent Instructions the consumer wants appended to
  LF's base set. `weave` reads this file (if present) and merges
  its content into the materialised `.literate/LITERATE.md` after
  the base imperatives, under a clear section header.
- **`.literate/extensions/decisions/`** — Protocol-register
  ADRs the consumer authors about *how they're customising LF*
  (parallel to `corpus/decisions/`, but Protocol-scoped). LF
  tooling does not read this folder at v0.1; it exists as a
  recognised authorial location so consumers needing the split
  immediately have it.
- **`.literate/extensions/config.json`** — interim per-project
  config, reading the value ADR-024 §6 named as the v0.1 default.
  The `literate.json` repo-root file added by ADR-025 §5
  supersedes this; the extensions config is preserved as a
  fallback for projects that already adopted it. New projects
  should use `literate.json`.

The folder remains **read-only to the framework** apart from one
exception: `init` writes a `.keep` placeholder to ensure the
folder ships and is committed even when empty. After init, LF
tooling reads from `.literate/extensions/` but never writes to it.

### 4. CLI–Trope binding: bundled, not vendored (new question)

The CLI ships its `continue` and `close` verbs with **bundled
Trope logic** sourced at build time from
`registry/tropes/session-start/` and `registry/tropes/session-end/`.
The CLI does not dynamically import the consumer's vendored
`.literate/tropes/<id>/index.ts` files at runtime.

Rationale:

- ADR-025 §3 states the CLI "does not import Tropes at runtime"
  and that consumer-side Trope TS execution is the consumer's
  toolchain's concern. Bundling at build time satisfies both.
- A consumer's vendored `.literate/tropes/<id>/index.ts` is
  source they may edit, but those edits are for *their* scripts
  and integrations, not for changing CLI behaviour. Treating
  vendored Trope TS as configurable CLI extension would
  re-introduce the override-drift problem the shadcn pivot
  dissolved.
- Avoiding runtime dynamic-import keeps the CLI self-contained:
  no peer dependency on `@literate/core`, no need for the
  consumer to install Bun or any TS runtime to use the CLI.
- The CLI's bundled Trope logic and the consumer's vendored
  Trope source come from the same file in `registry/tropes/<id>/`.
  Consumers who want their CLI behaviour to track upstream simply
  `literate update`; consumers who want to diverge edit their
  vendored copy for their own scripts and accept that CLI
  behaviour does not follow.

A consequence: the CLI's `package.json` no longer lists
`@literate/trope-session-start` or `@literate/trope-session-end`
as dependencies. Imports are resolved from `registry/tropes/<id>/`
via in-tree relative paths; the build process inlines them.

For v0.1 we run the CLI directly from source via Bun (no separate
build step exists yet). The `bin/literate.ts` entry point imports
from `../../../registry/tropes/<id>/index.ts` directly. When the
bundling pipeline lands (deferred to a release-engineering
session), the same relative imports will be inlined by the
bundler. Either way the consumer never installs an
`@literate/trope-*` package — the binding is internal to the CLI.

### 5. Manifest shape (`.literate/manifest.json`)

The manifest the CLI maintains per ADR-025 §5 carries:

```jsonc
{
  "$schema": "literate-manifest/v0",
  "vendored": [
    {
      "kind": "tropes",
      "id": "session-start",
      "registry": "literate",
      "ref": "main",
      "fetchedAt": "2026-04-25T09:00:00Z",
      "files": [
        ".literate/tropes/session-start/index.ts",
        ".literate/tropes/session-start/prose.mdx",
        ".literate/tropes/session-start/README.md"
      ]
    }
  ]
}
```

Schema-versioned via `$schema`; an Effect Schema in the CLI
validates reads and rejects unknown shapes with a clear error.
`vendored` is an ordered array (insertion order preserved across
read/write cycles) so Trope ordering in the woven `LITERATE.md`
is stable.

`literate.json` at repo root carries the consumer-side config:

```jsonc
{
  "$schema": "literate-config/v0",
  "registries": [
    { "name": "literate", "url": "github:literate/literate", "ref": "main" }
  ],
  "agent": "your-agent-id",
  "template": "minimal"
}
```

Both files are JSON-with-comments via `JSON.parse` after stripping
comments — no JSON5 dependency at v0.1; trailing-comma support
deferred.

**Consequences:**

- The CLI gains four new verbs (`init`, `tangle`, `weave`,
  `update`) and refactors verb dispatch into a registry so adding
  a verb is a one-file change. Existing `continue` and `close`
  verbs remain.
- Tropes relocate from `packages/trope-session-{start,end}/` to
  `registry/tropes/{session-start,session-end}/`. The
  `packages/trope-session-*` workspace packages are removed (no
  back-compat shim — there are no external consumers at v0.1).
  CLI `package.json` drops the workspace deps.
- The active `packages/` workspace shrinks to three packages:
  `@literate/cli`, `@literate/core`, `@literate/template-minimal`.
  `@literate/core` is the only published dep the CLI needs at
  build time; per ADR-019/ADR-025 it remains *internal* to the
  CLI bundle (build-time only, not published as a peer).
  Note: §4 above discharges the binding without requiring
  `@literate/core` to publish.
- `.literate/extensions/overrides/` is removed from the
  scaffold and from documentation. Consumers running an older
  scaffold see the folder as inert until they remove it.
- The materialised `.literate/LITERATE.md` includes the static
  preamble `> LF-the-framework performs no AI work` per ADR-025
  §2 prominently in the header, satisfying P8's flagged
  responsibility partway (full template-minimal finalisation
  remains P8).
- ADR-024 §4 is amended: the bullet listing
  `.literate/extensions/overrides/tropes/<id>/...` no longer
  applies. The remaining bullets (`decisions/`, `imperatives.md`,
  `config.*`) carry forward. The new `tropes/` and `concepts/`
  bullets in §3 above replace the overrides framing.
- Registry-trust mechanics (ADR-025 Q5) remain TLS-only at v0.1.
  Owned by P8.

**Open questions (deferred):**

1. **Bundling pipeline.** The CLI ships from source under Bun at
   v0.1. A bundled JS shipping target (per ADR-025 §1, §8) needs
   a release-engineering session to choose `bun build` /
   `tsdown` / `tsup`, configure the inline of `registry/tropes/`
   imports, and stand up npm Trusted Publishing.
2. **Semver-over-tags convention.** Recommended but not
   enforced. A `literate:resolve` verb that consults a registry
   `versions.json` mapping is a candidate v0.2 addition.
3. **Manifest collision detection.** When two registries provide
   the same `<kind>/<id>`, the CLI silently picks the first at
   v0.1. A later ADR may introduce per-registry namespacing
   (`<registry>/<kind>/<id>`).
4. **Extensions reading order.** Where in the woven
   `LITERATE.md` do consumer-authored Tropes from
   `.literate/extensions/tropes/` appear (before LF-seeded
   Tropes, after, or interleaved)? v0.1 puts them in a separate
   "Consumer Extensions" section after the framework section;
   reorderings are deferred.
