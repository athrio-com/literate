::metadata{id=06997960, disposition={ base: 'Infrastructure', scope: 'namespace' }, layer={ kind: 'workspace', path: 'workspace', holds: 'domains' }, domain=namespace, status=Reconciled}

# Namespace

LF's active workspace packages live under the **`@literate/*`** npm
scope. The `@athrio/*` scope is reserved for the sister-repo
Athrio product (the LFM-Protocol implementation from which LF
is abstracted); LF never publishes under `@athrio/*`.

## What ships under `@literate/*`

Per the shadcn-shaped distribution model
(`:lfm[distribution-model]{hash=32aa53dc}` `infrastructure/distribution-model.md`),
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

The framework's name is the framework's scope. LF is its own
framework, distinct from the Athrio product that uses it; the
two carry distinct scopes (`@literate/*` for the framework,
`@athrio/*` for the product) so consumers can depend on either
without coupling to the other.

## Scope discipline

Three rules:

1. **`@literate/*` is reserved for the active workspace at
   `packages/*`.** The `legacy/packages/` subtree shares the
   scope but is frozen and never publishes
   (`:lfm[legacy-freeze]{hash=bf4e66f8}` `workspace/legacy-freeze.md`).
2. **`@literate/cli` is the only published artefact.** Other
   workspace packages are bundled into the CLI binary.
3. **`@athrio/*` is reserved for the sister-repo Athrio
   product.** LF never publishes under `@athrio/*`.

```path
packages/cli/package.json
```

```path
packages/core/package.json
```

```path
packages/template-minimal/package.json
```
