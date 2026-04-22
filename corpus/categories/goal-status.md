# Category — Goal Status

Closed set of `Status:` values a session-Goal can carry. A Goal is a
session-scope specification that names the work and its upstream
prose. Status is added on Accept (not present in the draft presented
for gating).

## Members

- `Active` — being worked on now.
- `Completed` — Acceptance criteria met. Set atomically on completion;
  ungated.
- `Superseded by Goal N` — replaced by a later Goal. Set atomically
  when the new Goal is accepted; ungated.
- `Abandoned` — retired without completion. Gated (authorial
  retirement, not mechanical).

## Transitions

```
Active → Completed
Active → Superseded by Goal N
Active → Abandoned         (gated)
```

Terminal states do not transition further.

## References

- Used in every session log's `## Goals` section in
  `corpus/sessions/`.
- The `session-end` Trope checks no Goal remains `Active` at session
  close.
