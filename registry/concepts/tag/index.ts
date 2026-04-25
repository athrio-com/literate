/**
 * `concepts/tag` — the Tag Concept seed.
 *
 * Tags are slugged labels used on ADRs (and forward, on other
 * authored prose) for cross-cut search and conflict detection.
 * The Tag *type* ships with LF as a Protocol mechanism — every
 * LF user has tags. The specific tag *set* a project uses (its
 * authored slug enumeration) is consumer content, **not** part
 * of this Concept's Schema. LF's own slug set lives in
 * `corpus/tags.md`; consumers author their own at the same
 * relative path in their corpus.
 *
 * The Schema constrains shape only: a tag is a `#` followed by
 * a lowercase ASCII slug. Closed-set membership is enforced by
 * each consumer separately — typically by a `Schema.Literal(...)`
 * over their authored slug set in their own corpus, or by a
 * `tag-flow` Trope that reads the slug set from disk at the
 * gate.
 *
 * Promoted from `corpus/categories/tags.md`. Splits the legacy
 * file: the type-level shape becomes this Concept; LF's specific
 * slug instances move to `corpus/tags.md` as authored content.
 *
 * Distribution shape (ADR-025/026): registry seed at
 * `registry/concepts/tag/index.ts`. Tangled via
 * `literate tangle concepts tag`.
 *
 * Upstream LFMs: see corpus/manifests/protocol/algebra.md and
 *   sibling LFMs for the current-state declarations this seed
 *   realises.
 */
import { Schema } from 'effect'
import { concept, prose, type Concept } from '@literate/core'

const ConceptProse = prose(import.meta.url, './concept.mdx')

export const TAG_SLUG_PATTERN = /^#[a-z][a-z0-9-]*$/

export const TagSchema = Schema.String.pipe(
  Schema.pattern(TAG_SLUG_PATTERN, {
    message: () =>
      'tag must match `#[a-z][a-z0-9-]*` (e.g. `#process`, `#self-hosting`)',
  }),
  Schema.brand('Tag'),
)
export type Tag = Schema.Schema.Type<typeof TagSchema>

/**
 * A consumer's authored slug set. Constructs a `Schema.Literal(...)`
 * Schema branded as `Tag` over the closed set the caller supplies.
 * LF's own corpus reads its slug set from `corpus/tags.md` and
 * passes it here when typed enforcement is required.
 */
export const closedTagSet = <const Slugs extends ReadonlyArray<string>>(
  slugs: Slugs,
): Schema.Schema<Slugs[number]> => Schema.Literal(...slugs)

export const TagConcept: Concept<Tag> = concept({
  id: 'tag',
  version: '0.1.0',
  description:
    "The Tag Concept — slugged labels used on ADRs (and forward, on other authored prose) for cross-cut search and conflict detection. Schema constrains shape only (`#[a-z][a-z0-9-]*`). Each consumer authors their own slug set at `corpus/tags.md`; closed-set membership is enforced per-consumer (e.g. via `closedTagSet(slugs)` or by a tag-flow Trope reading the slug set at gate time).",
  instanceSchema: TagSchema,
  prose: ConceptProse,
})

export default TagConcept
