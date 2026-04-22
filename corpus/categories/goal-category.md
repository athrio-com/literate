# Category — Goal Category

Closed set of `Category:` values a session-Goal can carry. The
category shapes expectations for what "done" looks like and how tight
the upstream prose requirement is.

## Members

- `exploration` — open-ended investigation. Lighter gating; may
  produce memos or draft ADRs rather than accepted prose.
- `feature` — new user-visible behaviour. Requires upstream spec.
- `bugfix` — spec drift correction. The spec is updated as part of
  the fix.
- `refactor` — internal restructuring with no observable change.
  Contracts stable.
- `prose` — authored work (spec, chapter, story, ADR) with no code.
- `process` — Literate-workflow change. Protocol edits, vocabulary
  decisions, tooling additions.
- `migration` — vendor / implementation change. Tight scope; creep
  triggers a new Goal.

## Morphisms

Categories are disjoint at the Goal level: a single Goal carries
exactly one Category. A session may contain multiple Goals of
different Categories.

## References

- Used in every session-Goal's `Category:` field in
  `corpus/sessions/`.
