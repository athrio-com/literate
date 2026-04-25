# `session-start` — Trope seed

The Protocol-mode workflow Trope that opens an LF session.
Detects the start path (spontaneous, planned, or open-orphan)
by reading `corpus/sessions/`, opens the chosen log with
`Status: Open` and a populated header, surfaces prior context
into a `## Pre-work` block, and (on the planned path) re-gates
each provisional Goal before stamping it `Active`.
