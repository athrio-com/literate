# Category — Session Status

Closed set of `Status:` values a session can carry. The default
spontaneous lifecycle is `Open → Closed`. The optional planned
lifecycle is `Planned → Open → Closed`. Either lifecycle may end
at `Abandoned` under explicit Person disposition.

## Members

- `Planned` — pre-scoped under a parent session's `## Plan`. The
  log file exists with provisional Goals copied from the parent
  Plan entry. `Started` is `—` and no work has occurred. The
  session may be revised (gated) while in this state.
- `Open` — work in progress. The log carries `Started:
  YYYY-MM-DDTHH:MM` and an authoritative Goals list.
- `Closed (YYYY-MM-DDTHH:MM)` — terminal, validated by
  `session-end`. The Summary is written, every Goal carries a
  terminal status, every Plan entry (if any) is realised or
  carried forward.
- `Abandoned` — terminal, retired without completion. Gated.
  Reachable from `Planned` (the Person decided not to execute)
  or from `Open` (in-flight retirement).

## Transitions

```
Planned → Open                          (via session-start, planned path)
Planned → Abandoned                     (gated)
Planned → Planned                       (revisions; gated each time)
Open    → Closed (YYYY-MM-DDTHH:MM)     (via session-end, validated)
Open    → Abandoned                     (gated)
```

Terminal states (`Closed`, `Abandoned`) do not transition further.

## Mutability of the field

The `Status:` line is mutable but transitions are restricted to
the diagram above. `Planned → Open` and `Open → Closed` are
performed atomically by `session-start` and `session-end`
respectively. `Abandoned` requires Person Accept of an explicit
disposition note in the session log body.

## References

- Used in every session log header in `corpus/sessions/`.
- The `session-start` Trope writes `Open` (spontaneous) or
  transitions `Planned → Open` (planned).
- The `session-end` Trope writes `Closed (timestamp)` after
  validation.
- Material revision of this set requires a gated material change
  to the `session` Concept first.
