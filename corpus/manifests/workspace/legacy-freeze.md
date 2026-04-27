::metadata{id=bf4e66f8, disposition={ base: 'Infrastructure', scope: 'legacy-freeze' }, layer={ kind: 'workspace', path: 'workspace', holds: 'domains' }, domain=legacy-freeze, status=Reconciled}

# Legacy Freeze

The `legacy/` tree is **frozen** and never publishes. Its
contents are preserved verbatim as a read-only reference
subtree. No file under `legacy/` is edited without an
explicit Person-authorised freeze lift recorded in the active
session's `## Decisions Made`.

## What lives in `legacy/`

- **`legacy/packages/*`** — a parallel `@literate/*` package
  set (Concepts, Tropes, CLI, template, core) authored on a
  three-level algebra and a published-Trope distribution
  shape, both superseded by the active surface.
- **`legacy/site/`** — a Next.js scaffold not used by the
  active surface.
- **`legacy/LITERATE.md`** — the framework Protocol prose
  authored on the three-level algebra; supersession by the
  active Protocol is structural, not narrative.
- **`legacy/package.json`, `legacy/mise.toml`,
  `legacy/moon.yml`, `legacy/tsconfig.*.json`,
  `legacy/.moon/`** — root tooling for the frozen subtree.

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

The `legacy/` tree carries authoritative prose — the prior
framework Protocol, its Concepts, its Tropes, its design
clarifications — that the active surface can reference for
context without absorbing. The freeze keeps that reference
material available for cold reading while guaranteeing it
never leaks into the active code or prose surface: no imports,
no publishes, no edits.

The two surfaces are intentionally disjoint. The active
surface declares what LF is; the frozen surface preserves
what LF authored before. A reader who needs the latter can
read it directly; a reader who needs the former never has to.

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
