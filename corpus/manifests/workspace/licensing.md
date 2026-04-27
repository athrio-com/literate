::metadata{id=aed6cd59, disposition={ base: 'Infrastructure', scope: 'licensing' }, layer={ kind: 'workspace', path: 'workspace', holds: 'domains' }, domain=licensing, status=Reconciled}

# Licensing

LF is **dual-licensed under MIT OR Apache-2.0**. A consumer
may choose either licence; both are permissive and
permissively-bridge to the other major OSS licence families.

## What this means in practice

- **`MIT OR Apache-2.0`** is declared in every published
  package's `package.json` `"license"` field.
- A consumer's downstream license can be MIT, Apache-2.0,
  permissive variants (BSD, ISC), or copyleft-with-permissive-
  upstream (GPLv2 with classpath, etc.). The choice is the
  consumer's; LF's dual licence does not constrain it.
- The Apache-2.0 patent grant is available when a consumer
  needs explicit patent provisions; the MIT path is available
  when the consumer prefers minimal text.

## Templates ship MIT by default

Template seeds (e.g. `@literate/template-minimal`) ship with
their generated files marked **MIT**. A consumer who needs a
different licence for their generated tree relicenses by
editing the template-output `package.json` after `init`. The
template's own source files (the seed files LF distributes)
remain dual-licensed; the *output* of `init` is the
consumer's repo, and they own the licence on that output.

## Licence files

Two licence files live at the repo root:

- `LICENSE-MIT` — the MIT licence text.
- `LICENSE-APACHE` — the Apache 2.0 licence text.

Either file alone is a valid attribution path for a
downstream consumer. Both are kept to make the dual-licence
intent unambiguous.

## Why dual

A single permissive licence (MIT) has the broadest
compatibility but no explicit patent grant. A single
permissive-with-patent licence (Apache-2.0) has the patent
grant but is sometimes incompatible with consumer-specific
licence preferences. Dual-licensing gives every consumer the
choice that matches their constraints without forcing LF to
predict them.

```path
README.md
```

```path
package.json
```
