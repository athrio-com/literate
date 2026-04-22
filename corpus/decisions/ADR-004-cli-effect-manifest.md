# ADR-004 — CLI in Effect; Bun/Deno/Node compatible; manifest via package.json "literate" key

**Date:** 2026-04-22
**Status:** Accepted
**Tags:** `#tooling` `#release`

**Context:**

LF needs a runtime component in two places: the `literate` CLI
(scaffolding, compiling `.literate/`, adding Tropes, checking a
consumer's corpus), and a core library consumed by both the CLI and
future tooling. The concerns that runtime has to cover are exactly
the ones Effect is designed for: typed error channels for each failure
mode (missing manifest, unresolvable Trope, bad version pin,
filesystem error), composed operations with orthogonal observability
(dry-run, verbose), and Layer-based dependency injection that
future-proofs for when Tropes carry runtime behaviour beyond v0.1.

LF should not dictate a consumer's runtime. Consumers may use Bun,
Deno, or Node. The CLI must work on all three without per-runtime
forks. Effect plus `@effect/platform` gives us this portability.

The manifest — where consumers declare which LF version to pin and
which Tropes are installed — has to live somewhere discoverable. A
bespoke file (`literate.toml`, `literate.yaml`) adds a format to
maintain. A prose-native `corpus/manifest.md` with frontmatter is
elegant but forces every CLI invocation to parse Markdown for
configuration. The pragmatic choice is a key inside a file every JS
project already has: `package.json`. This is the Rust convention's
analogue (`Cargo.toml` holds the manifest; here `package.json`'s
`"literate"` key does).

**Decision:**

- The CLI is written with `@effect/cli` on top of `effect` and
  `@effect/platform`. The shared library in `packages/core` also
  uses Effect.
- The CLI is published as `@literate/cli` and runs under Bun, Deno,
  and Node. Bun is the primary tested runtime; Node compatibility is
  a non-goal-dropping guarantee.
- The consumer's manifest is a `"literate"` key inside their project
  `package.json`. Minimum shape:

  ```json
  {
    "literate": {
      "version": "0.1.0",
      "tropes": ["session", "session-start", "session-end"]
    }
  }
  ```

- At v0.1 the CLI exposes five verbs: `init`, `add trope`, `compile`,
  `check`, `version`. Additional verbs (`upgrade`, `remove`,
  `publish`) are follow-up work.

**Consequences:**

- `packages/cli/package.json` depends on `@effect/cli`,
  `@effect/platform`, `effect`, and the workspace package
  `@literate/core`.
- The CLI binary entry is `packages/cli/src/index.ts`; published
  executable name is `literate`.
- `compile` reads the `"literate"` key, resolves the Trope graph
  against LF's `src/tropes/`, and writes the consumer's
  `.literate/`.
- `check` validates the consumer's `corpus/` against the installed
  Tropes' Effect Schemas.
- Consumers without a `package.json` (pure prose projects, for
  instance) can still use LF by carrying a minimal `package.json`
  that holds only the `"literate"` key.
- The exact shape of the `"literate"` key beyond the v0.1 minimum
  (e.g., template source, plugin registry entries) is an open
  question; see ADR TBD when it is settled.
