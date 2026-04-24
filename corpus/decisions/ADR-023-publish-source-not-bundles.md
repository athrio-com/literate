# ADR-023 — LF publishes source, not bundles

**Date:** 2026-04-23
**Status:** Superseded by ADR-025
**Tags:** `#release` `#tooling` `#protocol` `#self-hosting`

**Extends:** ADR-009, ADR-015

**Context:**

LF's ship surface — `@literate/core`, every `@literate/trope-*`
package, every future `@literate/concept-*` package, the CLI, the
templates — is fundamentally **literate**: the framework's meaning
is carried by the authored TypeScript *plus* the sibling
Concept/Trope prose (per ADR-015's `prose(import.meta.url,
./<name>.md)` pattern). Every Trope package composes two
artefacts at the filesystem level:

- `src/index.ts` — the Effect program (Schema declarations, Step
  composition, typed I/O).
- `src/prose.mdx` (and/or `src/concept.mdx` for Concept packages)
  — the human-readable narrative that motivates the program.

ADR-015 established that TypeScript is the composition surface and
`.md`/`.mdx` siblings are the prose surface, resolved at runtime
via `import.meta.url`. The Trope *is* both files together. Neither
is complete without the other.

Modern TypeScript publishing defaults to a compile step — `tsup`,
`tsdown`, `rollup`, `esbuild`, `tsc --declaration` — producing a
`dist/` with bundled JavaScript and generated `.d.ts` files. The
`files` field in `package.json` typically points at `dist/` and
excludes `src/`. Reasons: faster consumer installs, smaller
install footprint, no consumer-side TS compile, tree-shaking via
bundler hints.

For LF, that default is actively wrong. Compilation strips exactly
the information that makes a Trope *a Trope*:

1. **Sibling `.md`/`.mdx` prose is not copied** unless explicitly
   configured (and often not supported by mainstream bundlers in
   a first-class way). Even when copied, the compiled
   `dist/index.js` loses its *colocation* with the prose; the
   `import.meta.url` resolution in compiled output points into
   `dist/`, not into a location where the `.mdx` sibling lives
   unless the bundler mirrors the layout.
2. **Comments and JSDoc are stripped** by default. Authored
   descriptions, rationale, cross-references to ADRs and
   Concepts — gone. A consumer browsing `node_modules/@literate/*`
   to understand a Trope sees minified anonymous functions instead
   of the authored algebra.
3. **Effect program structure is flattened.** Dead-code
   elimination, inlining, and bundling produce output optimised
   for a runtime interpreter, not for a human reader. The Trope's
   composition — which Steps it runs, which Services it requires,
   in what order — becomes opaque.
4. **Type-level expressiveness collapses into `.d.ts`.** Generated
   declaration files preserve the public API surface but lose the
   in-line type comments, the Schema-literal structures, the
   tagged-union exhaustive branches. Types round-trip structurally
   but not pedagogically.

The deeper principle: **LF's framework code is simultaneously
documentation.** This is Knuth's literate programming applied
reflexively — LF *is* a literate programming tool, and its own
ship surface must model what it advocates. If we publish compiled
JS, we advertise "publish the bundle" as the modern-TS default
while secretly relying on our own uncompiled source for meaning.
The inversion is embarrassing and dishonest.

A parallel pressure: ADR-024 (gated in this same session) commits
to JSR as the publishing registry. JSR is *designed* for
TS-source publishing — it's the idiomatic fit. npm accepts TS
source too (nothing stops us from listing `src/**/*.ts` in
`files`), but the convention and the tooling both lean toward
dist-bundles. JSR leans the other way. Codifying the
source-not-bundles invariant now makes both registries' choices
clean: on JSR it's idiomatic; on npm (if we ever dual-publish
for mirror purposes) it's a conscious deviation with a documented
reason.

**Decision:**

LF publishes authored source verbatim. Every `@literate/*` package
ships its `src/` tree (TypeScript + sibling `.md`/`.mdx` + any
other authored support files) directly to the registry. No
`tsdown`, no `tsup`, no `tsc --emit`, no `dist/`, no bundler, no
minifier. The `package.json` `files` array enumerates authored
paths:

```jsonc
{
  "files": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "src/**/*.md",
    "src/**/*.mdx",
    "src/**/*.json",
    "README.md",
    "LICENSE-*"
  ]
}
```

For JSR (the primary registry per ADR-024), the equivalent is
`jsr.json`'s `exports`/`include` fields declaring the same
authored paths.

### Corollaries

1. **No single-file binary distribution.** `bun build --compile`
   produces a standalone executable but inlines `.ts` and `.mdx`
   sources as opaque bytes; the runtime `prose(import.meta.url,
   …)` pattern breaks (no filesystem to read from), and the
   self-similarity principle fails (an agent inspecting the
   binary sees no authored prose). Compiled-binary distribution
   is ruled out as a ship channel. If an offline / no-runtime
   install scenario ever demands a binary, it ships as a
   *secondary* convenience artefact with a documented caveat —
   not as a replacement for the source-bearing package.

2. **Tree-shaking and dead-code elimination are the consumer's
   concern.** When a consumer's build tool (Bun bundle, Webpack,
   Vite, Rollup) consumes an `@literate/*` package in a larger
   application, it is free to shake unused exports and minify at
   its own build-time. LF publishes unshaken, unminified source
   because the consumer's build tool cannot distinguish "unused at
   runtime" from "prose-only reference intentionally kept for
   readability" unless it sees the authored source. The consumer's
   bundler wins against LF's unshaken source trivially; LF's
   prose wins against LF's pre-shaken bundles structurally.

3. **`prose(import.meta.url, './prose.mdx')` resolves correctly
   through install.** Bun (the required runtime per ADR-024) and
   Deno both resolve `import.meta.url` to the installed package's
   `src/` path when the package ships source. The sibling `.mdx`
   sits where the resolution expects it. The ADR-015 pattern is
   preserved end-to-end, from authoring to install to runtime
   read.

4. **Type inference, not emission.** Consumers' TypeScript tooling
   infers types from the authored `.ts` source directly. We do
   not ship `.d.ts` files. This is a consequence of the
   "publish source" decision, not a separate one — generated
   `.d.ts` is itself a bundling artefact, and Bun/Deno/Node (with
   a TS loader) all handle direct `.ts` consumption. If a
   consumer uses a toolchain that cannot consume `.ts` (e.g., a
   legacy CommonJS pipeline), they are not in LF's supported
   consumer set per ADR-024.

5. **Documentation rendering reads source.** The eventual LF docs
   site (if / when it ships) renders prose and types from the
   authored source in each `@literate/*` package, not from a
   generated intermediate. The docs pipeline is source-first in
   the same way publishing is.

### Non-decisions

- **Package README.** Each package ships a `README.md` at its
  root. This is not "compiled" in any meaningful sense; it's
  authored prose summarising the package for registry listings.
  No conflict with source-not-bundles.
- **License files.** Each package ships `LICENSE-MIT` and
  `LICENSE-APACHE` per ADR-003. Not compiled, no conflict.
- **Schema `.json` exports.** If a package exports a pre-built
  Schema JSON (e.g., for tooling that wants to load it without a
  TS runtime), that JSON is authored alongside the `.ts` source
  or generated by a dev-time script committed to the repo. The
  JSON is *shipped as source*, not compiled from source at
  publish time. If we ever need publish-time JSON emission, we
  revisit with a successor ADR.
- **`@literate/cli`'s bin entry.** The `bin` in `package.json` (or
  `jsr.json`) points at `src/bin/literate.ts`. The shebang is
  `#!/usr/bin/env bun`. Bun resolves the TS source at bin
  invocation time; no pre-compile. ADR-024 commits to Bun as the
  required runtime, making this shape coherent.

**Consequences:**

- **`@literate/*` packages ship `src/` verbatim.** No `dist/`
  ever lands at publish time. No package has a `build` npm
  script. The package's `main` / `module` / `exports` /
  `bin` fields all point into `src/`.
- **`prose()` helpers in `@literate/core` work identically for
  LF maintainers (reading source from the repo) and for consumers
  (reading source from `node_modules/@literate/*`). The
  self-similarity principle extends through install.
- **`@literate/cli`'s bin shebang is `#!/usr/bin/env bun`** and
  stays that way. `bunx jsr:@literate/cli` and
  `bun add -g jsr:@literate/cli` both work; consumers without Bun
  on PATH get a shebang error, which is the ADR-024-expected
  behaviour (consumers install Bun per the documented install
  path).
- **Package installation is larger in file count** (many small
  `.ts` and `.mdx` files) and smaller in bytes than a minified
  bundle. File count is not a meaningful cost for server-side or
  CLI-installed packages; byte size is smaller than a bundle
  that has inlined its deps. For the LF audience (developers
  governing their own repos), either metric is acceptable.
- **The publish pipeline is trivial.** `bunx jsr publish` (or
  `deno publish`) with a correct `jsr.json` is the whole release
  artefact per package. No build step, no artefact staging, no
  build-cache invalidation, no "works in dev, fails in dist"
  class of bug. A GitHub Actions workflow (per ADR-024's OIDC
  requirement) runs one command per package or uses a workspace
  publish command.
- **CI correctness.** Typechecking (`bun run typecheck` =
  `tsc --noEmit`) is the only compile-like gate. Tests run against
  `src/` directly. There is no build step to break; there is no
  dist to check for drift from src.
- **Documentation inversion.** Historically, TS projects publish
  `.d.ts` and consumers read types via IDE inference; the source
  stays hidden. In LF, the source *is* the published artefact;
  consumers (humans and agents) read the authored `.ts` and
  `.mdx` the same way maintainers do. This inverts the default
  but matches the framework's literate principle.
- **Agent discovery (from ADR-022 §3) works.** ADR-022's Tier 2
  ("installed `@literate/*` packages are authoritative, versioned
  prose") is only true because of this ADR. Compiled publishing
  would break Tier 2 and push agents back toward Tier 1 or
  vendored snapshots; source publishing keeps Tier 2 rich.
- **Performance.** The consumer's runtime (Bun / Deno) pays a
  one-time TS parse at CLI invocation. Bun's TS parse is
  fast enough that typical CLI invocations complete in tens of
  milliseconds. For a governance tool invoked interactively by
  an agent, this is inconsequential. A long-running LF-invoking
  daemon (were one to exist) could preload via a warmed runtime
  cache.
- **Source-as-artefact is a Protocol invariant, not a release
  choice.** Future `@literate/*` packages inherit it; the
  publish scripts in the successor session enforce it (reject a
  package whose `files` array points outside the authored set).
