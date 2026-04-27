::metadata{id=c1f847cc, disposition={ base: 'Protocol', scope: 'self-hosting' }, layer={ kind: 'protocol', path: 'protocol', holds: 'domains' }, domain=self-hosting, status=Reconciled}

# Self-Hosting

LF's own dev repo is **self-hosted**: it uses LF on itself
without going through the consumer-facing vendoring shape.
There is no `.literate/` folder in the LF dev repo. The
framework's prose lives at `corpus/CLAUDE.md` for agent-facing
imperatives and at `registry/` for the canonical Concept and
Trope sources.

## What's absent

A consumer-facing LF repo has:

- `.literate/concepts/<id>/` — vendored Concept seeds.
- `.literate/tropes/<id>/` — vendored Trope seeds.
- `.literate/LITERATE.md` — woven Protocol prose.
- `.literate/extensions/` — consumer customisations.
- `.literate/manifest.json` — vendoring record.
- `literate.json` at the repo root — registry config.

LF's own repo has **none** of these. Tangling and weaving onto
itself would create a circular surface (LF is the registry).

## What's present in lieu

- **`registry/concepts/<id>/`** — canonical Concept sources.
  These *are* the seeds; the consumer-facing
  `.literate/concepts/<id>/` is a vendored copy of these
  sources at `tangle` time.
- **`registry/tropes/<id>/`** — canonical Trope sources.
- **`corpus/CLAUDE.md`** — operational prose for agents
  working in LF's own repo. The consumer-facing
  `.literate/LITERATE.md` is the woven Protocol explanation;
  the dev-repo `corpus/CLAUDE.md` is the imperative version
  agents read directly.

## Why no `.literate/` in LF's own repo

Vendoring would make LF read its own canonical sources twice
— once at `registry/` and again at `.literate/`. The two
copies would drift. Consumers benefit from vendoring (their
copy is theirs to evolve); LF authoring its own framework does
not.

The consequence: **LF's own dev repo is a special case**, not
the typical consumer experience. New maintainers are oriented
through `CLAUDE.md` at the repo root, which sends them to
`corpus/CLAUDE.md` for the operational protocol and to
`registry/` for the canonical seeds.

## The maintainer's reading order

1. Read `CLAUDE.md` at the repo root — orientation shim.
2. Read `corpus/CLAUDE.md` — Mandatory Agent Instructions and
   session lifecycle.
3. Inspect `registry/` for the Concept and Trope seeds being
   shipped.
4. Inspect `corpus/manifests/` for current-state declarations
   (the LFMs).
5. Inspect `corpus/sessions/` for history.

## Bootstrap exception

When a consumer runs `literate init`, the CLI itself writes the
first session log into the new consumer repo (per the
`init`-bootstrap convention). The Protocol does not exempt its
own bootstrap — even the first session is closed via the same
`session-end` machinery every subsequent session uses. The CLI
is the enactor for that one bootstrap session.

```path
corpus/CLAUDE.md
```

```path
CLAUDE.md
```

```path
registry/concepts/disposition/index.ts
```

```path
registry/tropes/session-start/index.ts
```
