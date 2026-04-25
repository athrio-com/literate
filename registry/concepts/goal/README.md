# `goal` — Concept seed

The typed shape of a session-Goal. Composes `goal-status` and
`goal-category` as typed properties. Carries `topic`,
`upstream`, optional `scope` / `outOfScope` / `acceptance`
arrays, and optional `notes`. v0.1 ships as a passive type
surface; future Tropes (`goal-flow`) will compose authoring +
gating Steps over this shape.
