---
id: 56305840
disposition: { base: 'Protocol', scope: 'repo-shape' }
layer: { kind: 'protocol', path: 'protocol', holds: 'domains' }
domain: repo-shape
status: Reconciled
---

# Repo Shape

Every LF-using repo follows the same canonical shape:

```
corpus/        →  authored prose (sessions, manifests, memos)
   ↓ (derives)
src/           →  derivative code (consumer's product code)
   ↓ (vendors)
.literate/     →  consumer-vendored Protocol seeds + LITERATE.md
```

## `corpus/` — authored prose

`corpus/` holds everything authored by the Person + agent
collaboration. Sessions, manifests (LFMs), memos. It is the
**source of truth** for the repo's framework state. Sessions
are immutable; manifests are mutable.

For LF's own dev repo, `corpus/` additionally holds operational
prose (`CLAUDE.md`, `tags.md`) and — historically —
`decisions/` (deleted in the LFM rewrite). For consumer repos,
`corpus/` holds whatever Product-level prose the consumer
authors.

## `src/` — derivative code

`src/` holds the consumer's product code. For LF's own dev
repo, the analogous tree is `packages/` (the active workspace).
The relation is: prose lands in `corpus/`; code in `src/` (or
`packages/`) realises that prose. The relation is one-way —
code derives from prose, never the reverse.

The framework does not own `src/`. A consumer organises it
however their language and framework dictate.

## `.literate/` — consumer-vendored Protocol seeds

`.literate/` is **LF-generated**. Running `literate tangle`
fetches Protocol seeds (Concepts and Tropes) from a registry
and vendors them into `.literate/concepts/<id>/` and
`.literate/tropes/<id>/`. Running `literate weave`
materialises `.literate/LITERATE.md` from the vendored seeds.

The folder is recursively overwritten on weave. Hand-edits do
not survive. Customisation lives in `.literate/extensions/`,
which the weave reads as additional input but does not
overwrite.

For LF's own dev repo, `.literate/` is **absent**. LF is
self-hosted — its `registry/` *is* the registry; its
`packages/` *is* the consumer code. There is no vendoring
into LF itself. See `@lfm(c1f847cc)` `protocol/self-hosting.md`
for the rationale.

## Why three folders, not one

The split forces a clean separation of authorship from
derivation. Prose authors in `corpus/`; code lives in `src/`;
the framework's vocabulary lives in `.literate/`. A consumer
who reads only one folder gets one job done:

- A reader new to the repo reads `corpus/` to understand
  what's been decided and `corpus/sessions/` to understand
  why.
- A reader who needs to change product code reads `src/` and
  trusts that the framework state is captured by the LFMs in
  `corpus/manifests/`.
- An agent reads `.literate/LITERATE.md` to learn the
  Protocol-level prose the framework expects of it.

## Mutability profiles

| Folder | Profile |
|---|---|
| `corpus/sessions/` | Append-once log entries; gated where required |
| `corpus/manifests/` | Mutable LFMs; status written by `reconcile` |
| `corpus/memos/` | Ephemeral; creation + material reduction gated |
| `src/` (or `packages/`) | Fully mutable consumer code |
| `.literate/concepts,tropes/` | LF-generated; recursively overwritten on weave |
| `.literate/extensions/` | Consumer-owned; survives weave |
| `.literate/LITERATE.md` | LF-generated; regenerated on weave |

```path
corpus/CLAUDE.md
```

```path
corpus/sessions/sessions.md
```

```path
package.json
```
