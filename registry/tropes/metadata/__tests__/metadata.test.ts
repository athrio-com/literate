/**
 * `@literate/trope-metadata` — parse / serialise tests.
 *
 * Covers:
 *   1. Concept + Trope construction (identity, version, schema).
 *   2. `parseMetadataDirective` round-trips the canonical form.
 *   3. `parseYamlFrontmatter` parses the legacy `---` form.
 *   4. `parseMetadataBlock` prefers directive form over YAML.
 *   5. Splitter walks brace / bracket / quote depth.
 *   6. `serialiseMetadataBlock` orders canonical keys first.
 *   7. Round-trip: serialise then parse yields the same record
 *      across the canonical LFM-frontmatter shape.
 */
import { describe, expect, test } from 'bun:test'

import { MetadataConcept } from '../../../concepts/metadata/index.ts'
import {
  metadataTrope,
  parseMetadataBlock,
  parseMetadataDirective,
  parseYamlFrontmatter,
  serialiseMetadataBlock,
  splitDirectiveAttrs,
} from '../index.ts'

describe('MetadataConcept', () => {
  test('construction', () => {
    expect(MetadataConcept._tag).toBe('Concept')
    expect(MetadataConcept.id).toBe('metadata')
    expect(MetadataConcept.version).toBe('0.1.0')
  })
})

describe('metadataTrope', () => {
  test('binds to MetadataConcept', () => {
    expect(metadataTrope._tag).toBe('Trope')
    expect(metadataTrope.id).toBe('metadata')
    expect(metadataTrope.realises).toBe(MetadataConcept)
    expect(metadataTrope.disposition.base).toBe('Protocol')
    expect(metadataTrope.disposition.scope).toBe('metadata-substrate')
  })
})

describe('splitDirectiveAttrs', () => {
  test('splits flat key=val pairs', () => {
    const out = splitDirectiveAttrs('id=9a6b8081, status=Reconciled')
    expect(out).toEqual([
      ['id', '9a6b8081'],
      ['status', 'Reconciled'],
    ])
  })

  test('preserves commas inside braces', () => {
    const out = splitDirectiveAttrs(
      "disposition={base:'Protocol', scope:'algebra'}, status=Reconciled",
    )
    expect(out).toEqual([
      ['disposition', "{base:'Protocol', scope:'algebra'}"],
      ['status', 'Reconciled'],
    ])
  })

  test('strips surrounding single quotes', () => {
    const out = splitDirectiveAttrs("domain='annotation-substrate'")
    expect(out).toEqual([['domain', 'annotation-substrate']])
  })

  test('preserves commas inside quoted strings', () => {
    const out = splitDirectiveAttrs(
      "summary='hello, world', status=Reconciled",
    )
    expect(out).toEqual([
      ['summary', 'hello, world'],
      ['status', 'Reconciled'],
    ])
  })
})

describe('parseMetadataDirective', () => {
  test('parses a head-of-file directive', () => {
    const src =
      "::metadata{id=9a6b8081, disposition={base:'Protocol', scope:'algebra'}, layer={kind:'protocol', path:'protocol', holds:'domains'}, domain=algebra, status=Reconciled}\n\n# Algebra\n\nbody\n"
    const out = parseMetadataDirective(src)
    expect(out).not.toBeNull()
    expect(out!.form).toBe('directive')
    expect(out!.meta).toEqual({
      id: '9a6b8081',
      disposition: "{base:'Protocol', scope:'algebra'}",
      layer: "{kind:'protocol', path:'protocol', holds:'domains'}",
      domain: 'algebra',
      status: 'Reconciled',
    })
    expect(out!.body).toBe('# Algebra\n\nbody\n')
  })

  test('returns null when input does not start with directive', () => {
    expect(parseMetadataDirective('# Heading\n\nbody')).toBeNull()
    expect(parseMetadataDirective('---\nid: abc\n---\n')).toBeNull()
  })
})

describe('parseYamlFrontmatter', () => {
  test('parses the legacy --- form', () => {
    const src =
      "---\nid: 9a6b8081\ndisposition: { base: 'Protocol', scope: 'algebra' }\ndomain: algebra\nstatus: Reconciled\n---\n\n# Algebra\n\nbody\n"
    const out = parseYamlFrontmatter(src)
    expect(out).not.toBeNull()
    expect(out!.form).toBe('yaml')
    expect(out!.meta['id']).toBe('9a6b8081')
    expect(out!.meta['disposition']).toBe(
      "{ base: 'Protocol', scope: 'algebra' }",
    )
    expect(out!.meta['domain']).toBe('algebra')
    expect(out!.meta['status']).toBe('Reconciled')
    expect(out!.body).toBe('# Algebra\n\nbody\n')
  })

  test('returns null when no fence is present', () => {
    expect(parseYamlFrontmatter('# Heading\n')).toBeNull()
  })
})

describe('parseMetadataBlock', () => {
  test('prefers the directive form when both could match', () => {
    const directive = '::metadata{id=abc12345}\n\n# Body\n'
    const yaml = '---\nid: abc12345\n---\n\n# Body\n'
    expect(parseMetadataBlock(directive)!.form).toBe('directive')
    expect(parseMetadataBlock(yaml)!.form).toBe('yaml')
  })

  test('returns null when neither form matches', () => {
    expect(parseMetadataBlock('# Just prose\n')).toBeNull()
  })
})

describe('serialiseMetadataBlock', () => {
  test('orders canonical keys first', () => {
    const out = serialiseMetadataBlock({
      status: 'Reconciled',
      id: '9a6b8081',
      domain: 'algebra',
      extra: 'foo',
    })
    // id first, then domain, then status; extra at the end.
    expect(out).toBe(
      '::metadata{id=9a6b8081, domain=algebra, status=Reconciled, extra=foo}',
    )
  })

  test('preserves brace literals verbatim', () => {
    const out = serialiseMetadataBlock({
      disposition: "{base:'Protocol', scope:'algebra'}",
    })
    expect(out).toBe(
      "::metadata{disposition={base:'Protocol', scope:'algebra'}}",
    )
  })

  test('quotes values that contain whitespace', () => {
    const out = serialiseMetadataBlock({
      summary: 'hello world',
    })
    expect(out).toBe("::metadata{summary='hello world'}")
  })

  test('omits empty values', () => {
    const out = serialiseMetadataBlock({
      id: '9a6b8081',
      dependencies: '',
    })
    expect(out).toBe('::metadata{id=9a6b8081}')
  })
})

describe('round-trip', () => {
  test('serialise then parse yields the same record', () => {
    const meta = {
      id: '9a6b8081',
      disposition: "{base:'Protocol', scope:'annotation-substrate'}",
      layer: "{kind:'protocol', path:'protocol', holds:'domains'}",
      domain: 'annotation-substrate',
      status: 'Reconciled',
    }
    const serialised = serialiseMetadataBlock(meta)
    const parsed = parseMetadataDirective(serialised)
    expect(parsed).not.toBeNull()
    expect(parsed!.meta).toEqual(meta)
  })
})
