/**
 * `@literate/trope-lfm` — annotation grammar tests.
 *
 * Covers:
 *   1. `computeLfmId` is deterministic: same body → same hash.
 *   2. `computeLfmId` is sensitive: different body → different hash.
 *   3. `rewriteAnnotations` rewrites matching `@lfm(<oldId>)` to
 *      `@lfm(<newId>)`.
 *   4. `rewriteAnnotations` removes the annotation when `newId` is
 *      `null` (LFM-deletion path).
 *   5. `rewriteAnnotations` returns `null` when no rewrite is
 *      needed (so the caller can skip the write).
 */
import { describe, expect, test } from 'bun:test'

import { computeLfmId, rewriteAnnotations } from '../index.ts'

describe('computeLfmId', () => {
  test('is deterministic', async () => {
    const body = '# Algebra\n\nLF is built on a four-level algebra.\n'
    const a = await computeLfmId(body)
    const b = await computeLfmId(body)
    expect(a).toBe(b)
    expect(a).toMatch(/^[0-9a-f]{8}$/)
  })

  test('is sensitive to body changes', async () => {
    const a = await computeLfmId('A')
    const b = await computeLfmId('B')
    expect(a).not.toBe(b)
  })
})

describe('rewriteAnnotations', () => {
  test('rewrites a matching annotation', () => {
    const src = 'see @lfm(a3f2c8b1) for context'
    const out = rewriteAnnotations(src, 'a3f2c8b1', 'def01234')
    expect(out).toBe('see @lfm(def01234) for context')
  })

  test('rewrites multiple matches in one pass', () => {
    const src = '@lfm(deadbeef) and @lfm(deadbeef) and @lfm(cafef00d)'
    const out = rewriteAnnotations(src, 'deadbeef', 'feedface')
    expect(out).toBe('@lfm(feedface) and @lfm(feedface) and @lfm(cafef00d)')
  })

  test('removes the annotation when newId is null (deletion)', () => {
    const src = 'foo @lfm(a3f2c8b1) bar'
    const out = rewriteAnnotations(src, 'a3f2c8b1', null)
    expect(out).toBe('foo  bar')
  })

  test('returns null when no rewrite is needed', () => {
    const src = '@lfm(cafef00d) and prose without the target id'
    const out = rewriteAnnotations(src, 'a3f2c8b1', 'def01234')
    expect(out).toBeNull()
  })

  test('ignores unrelated parenthesised content', () => {
    const src = '@adr(ADR-001) and @other(a3f2c8b1)'
    const out = rewriteAnnotations(src, 'a3f2c8b1', 'def01234')
    expect(out).toBeNull()
  })
})
