::metadata{id=d3b990b2, disposition={ base: 'Protocol', scope: 'annotation-substrate' }, layer={ kind: 'protocol', path: 'protocol', holds: 'domains' }, domain=annotation-substrate, status=Reconciled}

# Annotation substrate

LF authored prose carries typed cross-references and typed
sub-Trope embeddings through a single annotation surface
prefixed with `:`. The same syntax covers citation (point at a
Trope defined elsewhere) and instantiation (embed a Trope inline
with parameters and an optional body). Reading any LFM, session
log, or registry seed prose, the eye sees one marker — `:` — for
all typed substrate content.

The syntax is the CommonMark **directive** proposal as
implemented by `remark-directive`: three densities of one form,
all sharing the same directive-name resolution mechanism.

## Three densities

**Inline directive** — a single `:` followed by a directive
name, an optional bracketed label, and optional braced
attributes. Lives inside a paragraph.

```
:trope[session-start]
:lfm[algebra]{hash=1d2b036a}{layer=protocol}
```

The minimal form `:trope[id]` carries a directive name and a
label; the label is the lookup key. The agent reading inline
prose recognises `:trope[…]` as a citation and resolves it
through `learn`. Inline directives never carry an authored
body.

**Leaf directive** — a double `::` followed by the directive
name and attributes; renders as a block but carries no nested
prose. Used for parameterised emit — the directive's job is to
declare typed values whose meaning is fully contained in the
parameters.

```
::metadata{disposition=protocol, scope=algebra, status=Reconciled}
```

The canonical leaf directive is `::metadata`, which replaces
the legacy YAML frontmatter (`---` blocks) for typed head-of-
file metadata. A leaf directive's body is empty by definition;
all information is in `{key=val}` attributes.

**Container directive** — a triple `:::` followed by directive
name and attributes, an authored body of arbitrary Markdown
prose, and a closing `:::` fence. Used for parameterised
sections that wrap typed authored prose.

```
:::declaration{kind=Concept}
A Concept declares a typed primitive in LF's vocabulary.
:::
```

The body inside a container is plain Markdown plus inline and
leaf directives. The container's `proseSchema` validates the
inner prose against the directive's bound Trope.

## Flat-containers rule

Container directives **do not nest** inside other container
directives. A document body lists `:::` blocks at one level;
hierarchical depth is carried by Markdown headings (h1/h2/h3)
for human readability rather than by `:::` nesting for type
structure. When a sub-Trope genuinely needs typed substructure,
the substructure lives either as inline or leaf directives in
the body — lightweight typed marks within prose — or, when
substantial, as a separately authored Trope referenced through
an inline `:trope[id]` annotation.

The rule keeps validation linear (the parser walks one level of
directive children at the document body), keeps the Arc shallow
and readable, and prevents the deeply-nested structural soup
that fenced syntaxes invite.

## Directive-name to Trope-id mapping

The mapping is one-to-one: the directive name `metadata`
resolves directly to the Trope at `registry/tropes/metadata/`;
`declaration` resolves to `registry/tropes/declaration/`;
`trope` resolves to the Trope-of-Trope seed
(`registry/tropes/trope/`, when authored). `learn :::metadata`
returns the same result as `learn metadata` — one substrate,
one lookup table.

Aliasing is not part of v0.1. If an actual conflict between
desired short directive names and Trope ids appears, an alias
map is added; until then strict 1:1 keeps the substrate simple.

## Annotation vs directive

Inline `:trope[id]` *cites* a Trope (asks the reader to look it
up). Leaf `::metadata{...}` and container `:::declaration{...}`
*instantiate* a Trope (embed it with parameters, optionally with
authored body). The same syntactic family covers both jobs by
varying density:

- inline = pure citation (no parameters, no body).
- leaf = parameterised emit (parameters, no body).
- container = parameterised body (parameters and body).

The agent treats inline references as resolution requests
through `learn`; leaf and container directives as
instantiations whose validation runs through the parent Trope's
`proseSchema` and dispatches to the sub-Trope's `proseSchema`.

## Resolution semantics

Every `:directive[label]{attrs}` annotation in authored prose is
resolvable through the universal `learn` verb (see :lfm[learn-and-coherence]{hash=c3606f28}).
`learn :directive[label]` returns the bound Trope's typed spec
plus the Concept it realises. Failure to resolve surfaces
through `reconcile` as a coherence diagnostic — see
:lfm[learn-and-coherence]{hash=c3606f28} for the coherence thesis.

## LFM references — name as label, hash as attribute

LFM cross-references use the form `:lfm[<name>]{hash=<8-hex>}`.
The label `<name>` is the LFM's `domain` field — readable,
stable across body edits. The `hash` attribute carries the
SHA-256 prefix of the LFM body (frontmatter excluded), giving
the same content-addressed integrity check the legacy
`@lfm(<hash>)` form provided.

Authors write the loose form `:lfm[<name>]` (no hash). Reconcile
populates the hash attribute mechanically by resolving the name
to its file at `corpus/manifests/<layer>/<domain>.md`,
computing the body hash, and writing the attribute in place.
Subsequent reconcile runs verify the hash matches the live
body; rewrite policy below.

### Per-location rewrite policy

The hash-rewrite policy depends on where the reference lives:

- **In `corpus/manifests/<layer>/<domain>.md` (LFM-to-LFM
  references).** When the target LFM's body changes, reconcile
  updates the `hash` attribute in place. LFMs declare current
  state; references reflect the latest body.
- **In `corpus/sessions/<...>.md` (session-to-LFM references).**
  Reconcile populates the `hash` attribute once at first
  reconcile and never updates it after. Session logs are
  append-once and journal point-in-time references; the stale
  hash is the feature.
- **In `registry/` and `.literate/` authored prose.** Live
  cascade, same as LFM-to-LFM; these surfaces declare current
  substrate state.

## Compatibility with `@lfm(<hash>)`

The substrate also accepts the bare `@lfm(<short-hash>)`
form as a legacy alias. Reconcile reads either form and
rewrites bare `@lfm(<hash>)` references to
`:lfm[<name>]{hash=<hash>}` mechanically (idempotent — a
second run produces no diff). The unified `:lfm[<name>]{…}`
form is the canonical write target; the bare form exists so
that authored prose written before the unification still
parses.

## What annotations are not

Annotations are not Markdown links, code references, or
generic metadata. They are typed substrate references. A
Markdown link to a file path is just a link; an inline
`:trope[id]` is a typed citation that the substrate validates.
Authoring discipline keeps the two kinds of references
separate: prose links are for prose-level navigation; `:`
annotations are for typed substrate references.

```path
packages/core/src/mdx.ts
```
