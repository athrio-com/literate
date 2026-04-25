# `layer` — Concept seed

A typed container in `corpus/manifests/`. Four top-level kinds —
`apps`, `workspace`, `infrastructure`, `protocol` — group the
LFM tree so that current-state declarations are reachable by
walking a small, typed taxonomy. Layers hold either Domains
directly (flat) or further sub-layers (recursive nesting under
`apps/` and `infrastructure/`). The directory itself is the
grouping; filenames carry no Layer prefix.
