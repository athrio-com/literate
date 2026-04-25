# `lfm` — Concept seed

A **Literate Framework Manifest** is a typed, mutable,
declarative document stating the current state of one
Dispositional Domain within one Layer. Each LFM stands alone
(self-sufficient prose; no supersession chains); cross-references
exist only as soft `@lfm(<short-hash>)` annotations. Identified
by a content hash recomputed on edit. Status is operational
(written by `reconcile`), not historical (git holds the history).
LFMs replace ADRs as the spine of a repo's framework state.
