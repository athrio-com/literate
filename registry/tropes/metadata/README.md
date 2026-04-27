# `metadata` — Trope seed

Parses and serialises typed head-of-file metadata blocks. Owns
the round-trip between the canonical directive form
(`::metadata{key=val, ...}`) and the typed `Metadata` record;
also reads the legacy YAML `---`-fenced form during migration.

The principal API is the pair of pure helpers
`parseMetadataBlock` / `serialiseMetadataBlock`, plus the
narrower `parseMetadataDirective` / `parseYamlFrontmatter`
when a caller needs to know which wire form it just parsed.
The Trope's `realise` is a minimal validation Step;
substrate-level work happens in the helpers.
