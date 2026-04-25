# `session-end` — Trope seed

The Protocol-mode workflow Trope that closes an LF session.
Reads the log, runs seven validations (Goals terminal, Summary
populated, Plan entries terminal, sections present), and
either raises `SessionEndIncomplete { missing }` (the session
stays Open until every gap is addressed) or stamps
`Status: Closed (timestamp)` atomically and updates the
sessions index.
