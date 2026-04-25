---
id: eff0d243
disposition: { base: 'Infrastructure', scope: 'distribution-model' }
layer: { kind: 'infrastructure', path: 'infrastructure', holds: 'domains' }
domain: distribution-model
status: Reconciled
---

# Distribution Model

LF follows a **shadcn-shaped distribution model**: only
`@literate/cli` publishes to npm as bundled JavaScript; Tropes
and Concepts ship as **registry seeds** vendored into the
consumer's repo by the CLI. The consumer **owns** the vendored
copy after fetch; the CLI does not re-fetch unless explicitly
asked.

## What ships

Two artefacts:

1. **`@literate/cli`** on npm — a single bundled JS file with
   embedded Concept and Trope sources for the CLI's own
   composition needs (`continue`, `close` Trope dispatch).
2. **`registry/`** at `https://github.com/<repo>/literate` —
   the canonical Concept and Trope source files, fetched at
   `tangle` time.

## What does not ship

- **No npm packages for individual Concepts or Tropes.** The
  rewrite-stage attempt to ship each Trope as
  `@literate/trope-<id>` was retired: vendoring as registry
  seeds replaces it.
- **No compiled binaries.** Bun has compile-to-binary
  capability; LF defers it to post-1.0.

## Registry mechanics

The CLI's `tangle` verb fetches a seed from the configured
registry. Two registry shapes:

- **`file://`** — a local path to a registry tree. Used in
  the LF dev repo (`bundled://` is a synonym pointing at the
  in-repo `registry/`).
- **`github:owner/repo[#ref]`** — a GitHub repository at the
  given ref. The fetcher reads the seed files via the GitHub
  raw URL; trust is TLS-only (see `@lfm(4a2dcd7b)`
  `infrastructure/registry-trust.md`).

After fetch, the seed files land at
`.literate/<kind>/<id>/{concept.mdx | prose.mdx, index.ts,
README.md, SEED.md}` and `.literate/manifest.json` records
the vendoring (kind, id, registry url, ref, fetchedAt).

## Update mechanics

`literate update <kind> <id>` re-fetches a vendored seed at
its registry ref. The pinning is **verbatim**: the manifest
records the ref the consumer specified; `update` honours that
ref unless the consumer passes `--ref <new>`.

The default ref is `main`. Consumers who want reproducibility
across re-clones pin to a specific commit hash.

## Overrides

A consumer who wants to modify a vendored seed has three
options:

1. **Fork the registry.** Point `literate.json`'s registry
   URL at the fork; the modified seeds become canonical.
2. **Compose an extension.** Place a new Concept or Trope
   under `.literate/extensions/<kind>/<id>/`. The weave reads
   it as additional input. The vendored seed is unchanged.
3. **Hand-edit and accept loss.** Edit the vendored seed
   directly. The next `update` overwrites the edits.

## CLI-side bundled bindings

For the verbs that *execute* a Trope (`continue`, `close`),
the CLI bundles its own copy of the Trope sources at build
time (per `packages/cli/src/trope-bindings.ts`). This avoids
dynamically importing a consumer's vendored copy at runtime
— which would tie the CLI's behaviour to whatever the consumer
modified.

The bundled-binding pattern is the boundary: the consumer
owns the vendored copy for *reading* and *composing*; the
CLI uses its own copy for *executing*.

```path
packages/cli/src/registry/config.ts
```

```path
packages/cli/src/registry/manifest.ts
```

```path
packages/cli/src/registry/fetcher.ts
```

```path
packages/cli/src/trope-bindings.ts
```

```path
packages/cli/src/verbs/tangle.ts
```

```path
packages/cli/src/verbs/update.ts
```

```path
packages/cli/src/verbs/weave.ts
```
