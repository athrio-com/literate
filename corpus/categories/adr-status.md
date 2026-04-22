# Category — ADR Status

Closed set of `Status:` values an ADR can carry. A freshly drafted
ADR has `Open`; on Accept it transitions to `Accepted`; a later ADR
may supersede it, changing the line to `Superseded by ADR-NNN`.
Deferral is for decisions deliberately postponed with context
preserved.

## Members

- `Open` — drafted, presented for review, not yet decided.
- `Accepted` — in force. Code and downstream prose may derive from it.
- `Deferred` — deliberately postponed. Decision postponed, context
  preserved in the ADR body.
- `Superseded by ADR-NNN` — replaced by a later ADR. Marked atomically
  when the superseding ADR is accepted.

## Transitions

```
Open → Accepted        (review gate Accept)
Open → Deferred        (review gate Defer)
Open → (deleted)       (review gate Reject; number returns to pool)
Accepted → Superseded by ADR-NNN
Deferred → Accepted    (rare; requires re-presentation)
```

Terminal states (`Superseded`, `Deferred` in practice) do not
transition further.

## References

- Used in every ADR header in `corpus/decisions/`.
- Superseded transitions are applied atomically on Accept of the
  superseding ADR.
