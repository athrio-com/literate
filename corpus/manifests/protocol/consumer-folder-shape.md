::metadata{id=c43b78ed, disposition={ base: 'Protocol', scope: 'consumer-folder-shape' }, layer={ kind: 'protocol', path: 'protocol', holds: 'domains' }, domain=consumer-folder-shape, status=Reconciled}

# Consumer Folder Shape

A consumer's `.literate/` folder is **LF-generated**: the CLI
recursively overwrites its `concepts/` and `tropes/` subtrees
on every weave. Consumer customisations live in
`.literate/extensions/`, which the CLI reads as additional
input but never overwrites. The split keeps the framework
authoritative without taking ownership of the consumer's
authored work.

## Three subdirectories

```
.literate/
├── concepts/<id>/      LF-generated; vendored Concept seeds
├── tropes/<id>/        LF-generated; vendored Trope seeds
├── extensions/         consumer-owned; survives weave
├── LITERATE.md         LF-generated; woven from the above
└── manifest.json       LF-generated; vendoring record
```

## The vendored subtrees

`literate tangle <kind> <id>` fetches a seed from the
configured registry and places its files at
`.literate/<kind>/<id>/`. Each seed's files are
`{concept.mdx | prose.mdx, index.ts, README.md, SEED.md}`.

The consumer **owns** the vendored copy. LF guarantees no
overwrites of `extensions/`; LF *does* overwrite
`concepts/<id>/` and `tropes/<id>/` on the next `update` of
that seed. A consumer who wants to modify a vendored Concept's
prose either:

- forks the registry and points their `literate.json` at the
  fork (the modified concept becomes their canonical version);
- composes an extension under `extensions/` that augments the
  vendored Concept (the original stays vendored, the extension
  adds);
- accepts that their hand-edits are lost on the next `update`
  of that seed.

## The extensions subtree

`extensions/` holds consumer-authored Concepts, Tropes, and
imperatives. Its shape mirrors the vendored shape:

```
.literate/extensions/
├── concepts/<id>/      consumer Concepts
├── tropes/<id>/        consumer Tropes
└── imperatives.md      consumer-side Mandatory Agent Instructions
```

`weave` reads everything under `extensions/` as additional
input and includes it in the woven `LITERATE.md` output. The
woven file is itself overwritten on every weave; consumer
customisation persists in `extensions/`, not in the woven
output.

## `LITERATE.md` as the woven entry point

`.literate/LITERATE.md` is the **agent-facing** Protocol
prose — what an agent reads to learn how to work in this
consumer's repo. It concatenates the vendored Concept and
Trope prose with the consumer's extensions, prefaced by the
LF-generated sigil so the file is identifiable as
machine-generated.

The consumer's repo-root `CLAUDE.md` typically points the
agent at `.literate/LITERATE.md` as its first read.

## `manifest.json`

`.literate/manifest.json` records the vendoring: which seeds
are present, from which registry, at which ref, and when they
were fetched. The manifest is the source of truth for
`literate update`'s decision about what to re-fetch.

```path
packages/cli/src/verbs/init.ts
```

```path
packages/cli/src/verbs/tangle.ts
```

```path
packages/cli/src/verbs/weave.ts
```

```path
packages/cli/src/registry/manifest.ts
```
