/**
 * Directive parser + `arcSchema` smoke test.
 *
 * Exercises the substrate-revision Goals 1 + 2: `remark-directive` is
 * wired into the weaver's parse pipeline so `:`/`::`/`:::` directive
 * nodes appear in the parsed mdast tree, and `arcSchema` composes
 * sub-Trope schemas via container directive dispatch.
 */
import { describe, expect, test } from 'bun:test'
import { Schema } from 'effect'
import remarkDirective from 'remark-directive'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import { unified } from 'unified'

import {
  arcSchema,
  headingsOfDepth,
  ParsedMdxSchema,
  requireMdxStructure,
  slugify,
  type MdastNode,
  type ParsedMdx,
} from '@literate/core'

const processor = unified().use(remarkParse).use(remarkMdx).use(remarkDirective)

const parse = (md: string): ParsedMdx =>
  processor.parse(md) as unknown as ParsedMdx

describe('remark-directive — directive node emission', () => {
  test('inline directive emits a textDirective node', () => {
    const md = `Some text with :trope[session-start] inline.\n`
    const root = parse(md)
    const flat = JSON.stringify(root)
    expect(flat).toContain('"textDirective"')
    expect(flat).toContain('session-start')
  })

  test('leaf directive emits a leafDirective node', () => {
    const md = `\n::metadata{disposition=protocol scope=algebra}\n`
    const root = parse(md)
    const flat = JSON.stringify(root)
    expect(flat).toContain('"leafDirective"')
    expect(flat).toContain('metadata')
    expect(flat).toContain('disposition')
  })

  test('container directive emits a containerDirective node with body children', () => {
    const md = `\n:::declaration{kind=Concept}\nA Concept declares a typed primitive.\n:::\n`
    const root = parse(md)
    expect(root.type).toBe('root')
    const found = (root.children as ReadonlyArray<MdastNode>).find(
      (n) => n.type === 'containerDirective',
    )
    expect(found).toBeDefined()
    expect((found as { name?: string }).name).toBe('declaration')
    expect(found?.children?.length).toBeGreaterThan(0)
  })

  test('ParsedMdxSchema accepts the directive-bearing root', () => {
    const md = `# Title\n\n:::declaration{kind=Concept}\nBody.\n:::\n`
    const root = parse(md)
    const decoded = Schema.decodeUnknownSync(ParsedMdxSchema)(root)
    expect(decoded.type).toBe('root')
  })
})

describe('arcSchema — sub-Trope dispatch via container directives', () => {
  const innerSchema = requireMdxStructure({ h1: '', h2Slugs: [] })

  const parentSchema = arcSchema({
    h1: 'Parent Trope',
    sections: [
      { slug: 'declaration', required: true },
      { slug: 'metadata', required: false },
    ],
  })

  test('accepts a body with the required directive present', () => {
    const md =
      `# Parent Trope\n\nIntro paragraph.\n\n:::declaration{kind=Concept}\nA Concept declares a typed primitive.\n:::\n`
    const root = parse(md)
    const decoded = Schema.decodeUnknownEither(parentSchema)(root)
    expect(decoded._tag).toBe('Right')
  })

  test('rejects a body missing a required directive', () => {
    const md = `# Parent Trope\n\nIntro paragraph only — no directives.\n`
    const root = parse(md)
    const decoded = Schema.decodeUnknownEither(parentSchema)(root)
    expect(decoded._tag).toBe('Left')
  })

  test('arcSchema composes with a sub-Trope proseSchema', () => {
    // Sub-Trope schemas validate the directive's body — which has no h1
    // because the parent Trope's h1 already does that duty. Use a
    // permissive sub-schema that only checks for an h2 inside.
    const subSchema = ParsedMdxSchema.pipe(
      Schema.filter((root) => {
        const h2s = new Set(headingsOfDepth(root, 2).map(slugify))
        return h2s.has('details') || 'missing required h2: details'
      }),
    )
    const composing = arcSchema({
      h1: 'Composing Trope',
      sections: [{ slug: 'declaration', required: true, schema: subSchema }],
    })
    // Container body lacks the required `## details` h2 → sub-schema fails.
    const failingMd =
      `# Composing Trope\n\n:::declaration\nBody without the required h2.\n:::\n`
    const failing = Schema.decodeUnknownEither(composing)(parse(failingMd))
    expect(failing._tag).toBe('Left')

    // Container body has the required `## details` h2 → both pass.
    const passingMd =
      `# Composing Trope\n\n:::declaration\n## details\n\nBody with the h2.\n:::\n`
    const passing = Schema.decodeUnknownEither(composing)(parse(passingMd))
    expect(passing._tag).toBe('Right')
  })

  test('rejects when h1 prefix does not match', () => {
    const md = `# Wrong\n\n:::declaration\nBody.\n:::\n`
    const root = parse(md)
    const decoded = Schema.decodeUnknownEither(parentSchema)(root)
    expect(decoded._tag).toBe('Left')
  })
})
