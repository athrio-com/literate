# ADR-029 — Bun is the CLI's required runtime

**Date:** 2026-04-24
**Status:** Accepted
**Tags:** `#tooling` `#release` `#migration`

**Context:**

ADR-004 committed LF not to dictate a consumer's runtime and
specified the CLI as Bun/Deno/Node-compatible. ADR-025 §8
reframed that as "bundled JS on npm, Node-shaped runtime." In
practice LF's CLI has always been Bun-first: `engines.bun` is
the declared runtime, `Bun.build()` is the bundler API the build
script calls programmatically, `prose(import.meta.url, …)`
resolves sibling `.md` files via Bun-native URL semantics, and
the authored TS sources are directly runnable under Bun without
a transpile step. The any-Node-shaped-runtime clause was never
a user request; it fell out of the bundled-JS shape.

Documenting Bun/Deno/Node compatibility creates ongoing
maintenance for a non-goal: every verb addition, every service
refactor, every bundler-flag change has to be checked against
three runtimes instead of one. The cost is continuous; the
benefit is hypothetical (no consumer has ever asked).

**Decision:**

The CLI's required runtime is **Bun**. Concretely:

- `packages/cli/scripts/build.ts` builds with
  `Bun.build({ target: 'bun' })`. The bundle shebang is
  `#!/usr/bin/env bun`.
- `packages/cli/package.json` declares `engines: { "bun": ">=1.1.0" }`
  and does not declare `engines.node`.
- `packages/cli/scripts/smoke-install.sh` packs the CLI, installs
  the tarball into a fresh scratch project via `bun init` +
  `bun add <tarball>`, then exercises `literate --help` and
  `literate init`. The harness stays hermetic but exercises a
  pure-Bun install path.
- Install documentation in `README.md` lists only Bun-native
  forms — `bun add -g @literate/cli` for persistent install,
  `bunx --package="$TGZ" literate …` for one-shot from tarball.
  No `npx`, no Node mentions in human-facing install prose.
- `@literate/core` and `@literate/template-minimal` drop the
  `@types/node` devDep; `@types/bun` covers `node:*` module
  types Bun reimplements.

**Boundary:**

- This ADR scopes the **CLI's** runtime, not consumer code. A
  consumer's project runs under whatever runtime they choose;
  LF commits only to how its own CLI runs.
- `node:*` module imports stay (`node:fs/promises`, `node:path`,
  `node:url`, etc.). Bun reimplements them; the import syntax is
  the same.
- The `npm install <tarball>` line inside `smoke-install.sh` has
  already been replaced; the hermetic harness is not a documented
  install surface. No `npm` appears in `README.md` or any
  human-facing install doc.

**Rationale:**

- The CLI's actual dependencies — `Bun.build()` for bundling,
  `bun:test` for the suite, Bun-native TS-source execution for dev
  — are Bun features, not Node features. Documenting them as
  "works on any Node-shaped runtime" was always aspirational.
- Fewer runtimes to verify means fewer drift vectors. A verb
  refactor needs to pass Bun; that's it.
- Bun install is a first-class registry workflow (`bun add`,
  `bun add -g`, `bunx --package=<tarball>`); no feature gap vs.
  npm for LF's install surface.

**Consequences:**

- LF's CLI will not run under Node without a compatibility shim
  (specifically: the `#!/usr/bin/env bun` shebang). If a future
  consumer requires Node compatibility, that is a new ADR, not a
  reversal of this one.
- `@effect/cli` adoption (Planned successor
  `effect-cli-argv-surface`) builds on the same Bun substrate —
  nothing in that successor's scope crosses the runtime boundary.
- The install smoke harness continues to use `npm`-style file
  layout (`node_modules/.bin/literate`) because that is the
  cross-tool install convention Bun shares with npm for published
  packages. The command paths are Bun-native.

**Amends:** ADR-004 (runtime-matrix clause narrowed here — ADR-004's
`Status:` line updated mechanically to annotate the narrowing;
ADR-004 body untouched per IMP-6). ADR-025 §8's "Node-shaped
runtime" framing is reframed as "Bun runtime" via the same
Status-line annotation pattern.

**Superseded by:** —
