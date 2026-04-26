/**
 * MDX-parse shape + prose-schema authoring helpers.
 *
 * `ParsedMdx` is the mdast Root node type produced by
 * `remark-parse` (optionally with `remark-mdx`). Core only declares
 * the structural type and helpers — the actual parse happens at the
 * CLI layer so the core package stays free of remark dependencies.
 *
 * `requireMdxStructure` is the canonical helper for authoring a
 * Trope's `proseSchema` (ADR-025 §Consequences, P3 Goal 1). Given a
 * required H1 prefix and an ordered list of required H2 slugs, it
 * returns a `Schema.Schema<ParsedMdx>` that validates structural
 * conformance — the markers that make a Trope a Trope — without
 * constraining the paragraph content underneath.
 *
 * Related: `ADR-015` (TS + sibling `.md`), `ADR-025` (mechanical
 * weave), `ADR-026 §4` (CLI bundles Trope sources at build time so
 * the weave has access to each Trope's `proseSchema`).
 */
import { Schema } from 'effect'

export interface MdastNode {
  readonly type: string
  readonly children?: ReadonlyArray<MdastNode>
  readonly value?: string
  readonly depth?: number
  readonly position?: unknown
}

export interface ParsedMdx {
  readonly type: 'root'
  readonly children: ReadonlyArray<MdastNode>
}

export const ParsedMdxSchema: Schema.Schema<ParsedMdx> = Schema.declare(
  (u: unknown): u is ParsedMdx => {
    if (typeof u !== 'object' || u === null) return false
    const o = u as Record<string, unknown>
    return o['type'] === 'root' && Array.isArray(o['children'])
  },
  { identifier: 'ParsedMdx' },
)

const nodeText = (node: MdastNode): string => {
  if (typeof node.value === 'string') return node.value
  if (!node.children) return ''
  return node.children.map(nodeText).join('')
}

export const headingsOfDepth = (
  root: ParsedMdx,
  depth: number,
): ReadonlyArray<string> => {
  const out: string[] = []
  for (const node of root.children) {
    if (node.type === 'heading' && node.depth === depth) {
      out.push(nodeText(node))
    }
  }
  return out
}

export const slugify = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

export interface RequireMdxStructureParams {
  /** Substring the authored H1 must start with (e.g. `"Session-Start Trope"`). */
  readonly h1: string
  /** Slugified H2 section names that must all be present, order-insensitive. */
  readonly h2Slugs: ReadonlyArray<string>
}

/**
 * Author a `proseSchema` that enforces a Trope's structural contract:
 * a top-level H1 matching the given prefix, plus the given set of H2
 * section slugs. Paragraph content inside each section is not
 * constrained. Returns a refinement on `ParsedMdxSchema`.
 */
export const requireMdxStructure = (
  params: RequireMdxStructureParams,
): Schema.Schema<ParsedMdx> =>
  ParsedMdxSchema.pipe(
    Schema.filter((root) => {
      const h1s = headingsOfDepth(root, 1)
      if (h1s.length === 0) return 'missing required H1 heading'
      if (!h1s[0]!.startsWith(params.h1)) {
        return `H1 heading must start with "${params.h1}"; got "${h1s[0]}"`
      }
      const h2s = new Set(headingsOfDepth(root, 2).map(slugify))
      const missing = params.h2Slugs.filter((s) => !h2s.has(s))
      if (missing.length > 0) {
        return `missing required H2 section(s): ${missing.join(', ')}`
      }
      return true
    }),
  )

// ---------------------------------------------------------------------------
// arcSchema — sub-Trope-aware proseSchema composition.
//
// A Trope's body may contain `:::name{key=val}…:::` container directives
// (and their inline / leaf cousins) that bind to sub-Tropes. `arcSchema`
// composes a parent Trope's structural contract with its sub-Tropes'
// proseSchemas: it validates the parent's h1 + required directive names,
// then for each named container directive section it extracts the
// directive's children, wraps them in a synthetic `ParsedMdx` root, and
// runs the sub-Trope's `proseSchema` against that subtree.
//
// See `corpus/manifests/protocol/annotation-substrate.md` and
// `corpus/manifests/protocol/algebra.md` (Composition section).

/**
 * One sub-Trope binding inside an Arc. Optional `schema` validates the
 * directive's body as a synthetic `ParsedMdx`; if absent, presence of
 * the directive at top level is the only check.
 */
export interface ArcSection {
  /** Directive name (matches the parent's `:::name{}` slug). */
  readonly slug: string
  /** Whether the directive is required at top level. Defaults to `true`. */
  readonly required?: boolean
  /** Sub-Trope's `proseSchema`. If absent, presence is the only check. */
  readonly schema?: Schema.Schema<ParsedMdx, any, never>
}

export interface ArcSchemaParams {
  /** Substring the authored H1 must start with. */
  readonly h1: string
  /** Sub-Trope sections (by directive name) the parent Arc binds. */
  readonly sections: ReadonlyArray<ArcSection>
}

const isContainerDirective = (
  node: MdastNode,
): node is MdastNode & { name?: string; children: ReadonlyArray<MdastNode> } =>
  node.type === 'containerDirective'

const directiveName = (node: MdastNode): string | undefined =>
  (node as { name?: unknown }).name as string | undefined

/**
 * Author a `proseSchema` that composes a parent Trope's structural
 * contract with sub-Trope schemas via container directives.
 */
export const arcSchema = (
  params: ArcSchemaParams,
): Schema.Schema<ParsedMdx, any, never> =>
  ParsedMdxSchema.pipe(
    Schema.filter((root) => {
      const h1s = headingsOfDepth(root, 1)
      if (h1s.length === 0) return 'missing required H1 heading'
      if (!h1s[0]!.startsWith(params.h1)) {
        return `H1 heading must start with "${params.h1}"; got "${h1s[0]}"`
      }
      // Group container directives by name at top level.
      const directives = new Map<string, MdastNode[]>()
      for (const node of root.children) {
        if (!isContainerDirective(node)) continue
        const name = directiveName(node)
        if (!name) continue
        const list = directives.get(name) ?? []
        list.push(node)
        directives.set(name, list)
      }
      // Required-presence check.
      const missing: string[] = []
      for (const section of params.sections) {
        const required = section.required ?? true
        if (!required) continue
        if (!directives.has(section.slug)) missing.push(section.slug)
      }
      if (missing.length > 0) {
        return `missing required directive section(s): ${missing.map((s) => `:::${s}`).join(', ')}`
      }
      // Sub-Trope schema dispatch.
      for (const section of params.sections) {
        if (!section.schema) continue
        const found = directives.get(section.slug) ?? []
        for (const node of found) {
          const synthetic: ParsedMdx = {
            type: 'root',
            children: node.children ?? [],
          }
          const parsed = Schema.decodeUnknownEither(section.schema)(synthetic)
          if (parsed._tag === 'Left') {
            return `directive :::${section.slug} body failed sub-schema: ${parsed.left.message}`
          }
        }
      }
      return true
    }),
  )
