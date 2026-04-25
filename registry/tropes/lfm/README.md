# `lfm` — Trope seed

The Trope that authors and validates one Literate Framework
Manifest. Computes the content hash, runs self-sufficiency
checks, and writes the LFM to
`corpus/manifests/<layer-path>/<domain>.md`. A separately-exposed
`updateReferences` Step rewrites soft `@lfm(<old-hash>)`
annotations across the corpus when an LFM's hash changes —
called by the `reconcile` Trope, not by the main composition.
The LFM **is** this Trope; every LFM file is one invocation.
