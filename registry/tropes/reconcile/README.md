# `reconcile` — Trope seed

Walk every LFM in the corpus, derive each one's status by
comparing the declared state against the implementation, write
status back, and maintain soft-link reference hashes when LFM
bodies have changed. Mechanical and deterministic — no AI in
the loop. Invoked via the `literate reconcile` CLI verb. The
default check is path-existence (declared paths must exist);
Domain-specific checks are a future extension.
