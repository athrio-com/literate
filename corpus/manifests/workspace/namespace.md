---
id: 435e223f
disposition: { base: 'Infrastructure', scope: 'namespace' }
layer: { kind: 'workspace', path: 'workspace', holds: 'domains' }
domain: namespace
status: Reconciled
---

# Namespace

LF's rewrite packages live under the **`@literate/*`** npm
scope. The `@athrio/*` scope is reserved for the sister-repo
Athrio product (the LFM-Protocol implementation from which LF
is abstracted); LF never publishes under `@athrio/*`.

## What ships under `@literate/*`

Per the shadcn-shaped distribution model
(`@lfm(eff0d243)` `infrastructure/distribution-model.md`),
**only one package publishes** to npm at v0.1: `@literate/cli`.

The internal workspace packages (`@literate/core`,
`@literate/template-minimal`) carry the same npm scope by
convention but are bundled into the CLI rather than published
independently. Their `package.json` files declare them as
private/unpublished; they exist as workspace dependencies of
`@literate/cli`.

The Concept and Trope seeds under `registry/` do **not** ship
as npm packages. They are fetched from a git registry by the
CLI's `tangle` verb and vendored into the consumer's repo.

## Why `@literate/*` and not `@athrio/*`

`@athrio/*` was the original namespace candidate when LF was
expected to live as a sub-project of Athrio. The decision to
spin LF out as its own framework — abstracted from Athrio's
LFM-Protocol implementation — required a distinct scope.
`@literate/*` was the obvious choice: the framework's name is
the framework's scope.

The legacy code under `legacy/packages/` was authored in a
transitional period and carries the `@literate/*` scope
already; the rewrite maintains that scope rather than
reverting.

## Scope discipline

Three rules:

1. **No package outside `packages/*` may use `@literate/*`.**
   The `legacy/packages/` tree carries the scope historically
   but is frozen and never publishes
   (`@lfm(5842b2de)` `workspace/legacy-freeze.md`).
2. **`@literate/cli` is the only published artefact.** Other
   workspace packages are bundled into the CLI binary.
3. **`@athrio/*` is reserved.** Any future Athrio integration
   work uses that scope; LF does not.

```path
packages/cli/package.json
```

```path
packages/core/package.json
```

```path
packages/template-minimal/package.json
```
