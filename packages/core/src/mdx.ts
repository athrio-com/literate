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
