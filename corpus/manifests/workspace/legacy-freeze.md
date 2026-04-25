---
id: 5842b2de
disposition: { base: 'Infrastructure', scope: 'legacy-freeze' }
layer: { kind: 'workspace', path: 'workspace', holds: 'domains' }
domain: legacy-freeze
status: Reconciled
---

# Legacy Freeze

The `legacy/` tree is **frozen** and never publishes. Its
contents are preserved verbatim as historical reference for
the rewrite. No file under `legacy/` is edited without an
explicit Person-authorised freeze lift recorded in the active
session's `## Decisions Made`.

## What lives in `legacy/`

- **`legacy/packages/*`** — the pre-rewrite `@literate/*`
  packages (Concepts, Tropes, CLI, template, core authored
  before the Step substrate and registry-seed shape).
- **`legacy/site/`** — the pre-rewrite Next.js scaffold.
- **`legacy/LITERATE.md`** — the pre-rewrite framework
  Protocol prose, authored on the legacy three-level algebra.
- **`legacy/package.json`, `legacy/mise.toml`,
  `legacy/moon.yml`, `legacy/tsconfig.*.json`,
  `legacy/.moon/`** — pre-rewrite root tooling.

## Three rules

1. **Never publishes.** The `legacy/package.json` workspace
   is not enumerated by the active root `package.json`. No
   legacy package is installed, built, or published from this
   repo.
2. **Never imports backward.** Active `packages/*` code does
   not import from `legacy/packages/*`. The TypeScript module
   graph is structurally isolated — the active workspace's
   `tsconfig.json` does not include any `legacy/` paths.
3. **Never edits without explicit lift.** Reading `legacy/`
   for historical context is encouraged; editing it requires
   a Person-authorised freeze lift recorded in the active
   session.

## Why preserve at all

The rewrite re-authored the framework's Protocol on a deeper
algebra (Step substrate, registry-seed shape, Disposition ×
Mode split). Several authoritative decisions and
clarifications live in the legacy prose; reading them is the
fastest way to understand *why* the rewrite landed the way it
did.

Deletion would force the rewrite's prose to relitigate
decisions the legacy already settled. Preservation under a
hard freeze keeps the historical record without contaminating
the active surface.

## Lifting the freeze

A freeze lift is rare and explicit. The workflow:

1. Open or have an active session.
2. The Person directs the lift in their prompt, naming the
   specific file(s).
3. The agent records the lift under the session's
   `## Decisions Made` block before any edit lands.
4. The edit is performed; the change is committed.
5. The freeze remains in force for every other file.

There is no general "lift the freeze" mode. Each lift is
file-scoped and session-scoped.

```path
legacy/LITERATE.md
```

```path
legacy/package.json
```
