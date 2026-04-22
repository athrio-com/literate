# Protocol

The Literate Programming Protocol: the rules governing how a session
runs, how prose is gated, how closed vocabularies work, and how code
is derived. In LF's own prose, bare "Protocol" always means the
Literate Protocol (LPP), never a product-specific protocol.

In this repo the Protocol is carried by three files:

- `LITERATE.md` — the authoritative framework Protocol; the ship
  surface consumers read.
- `CLAUDE.md` at the repo root — the maintainer orientation shim.
- `corpus/CLAUDE.md` — the operational rules for LF-project work.

When a consumer repo is scaffolded by `literate init`, it vendors
`LITERATE.md` and a consumer-facing `CLAUDE.md` into its
`.literate/` folder. Both carry the pinned LF version.

## Used in

- `README.md`, `LITERATE.md`, `CLAUDE.md`, `corpus/CLAUDE.md`.
- Every ADR in `corpus/decisions/`.

## Not to be confused with

- Any product-specific protocol a consumer may define. LF's
  Protocol is the methodology; a product's "protocol" (e.g., a URL
  scheme) is a product concern that lives in the consumer's own
  repo, not in LF.

## See also

- [`person.md`](./person.md)
- [`ai.md`](./ai.md)
