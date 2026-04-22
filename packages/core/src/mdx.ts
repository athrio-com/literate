/**
 * @adr ADR-005
 *
 * MDX reader. Validates frontmatter against a caller-supplied Effect
 * Schema, returns frontmatter + prose body. Used by the docs site to
 * render Concept and Trope MDX with their metadata.
 */

import { Effect, Schema, Data } from 'effect'
import matter from 'gray-matter'
import { readFile } from 'node:fs/promises'

export class MdxReadError extends Data.TaggedError('MdxReadError')<{
  readonly path: string
  readonly cause: unknown
}> {}

export class MdxParseError extends Data.TaggedError('MdxParseError')<{
  readonly path: string
  readonly issue: string
}> {}

export interface ParsedMdx<A> {
  readonly frontmatter: A
  readonly prose: string
  readonly sourcePath: string
}

export const readMdx = <A, I>(schema: Schema.Schema<A, I>, path: string) =>
  Effect.gen(function* () {
    const raw = yield* Effect.tryPromise({
      try: () => readFile(path, 'utf8'),
      catch: (cause) => new MdxReadError({ path, cause }),
    })
    const { data, content } = matter(raw)
    const frontmatter = yield* Schema.decodeUnknown(schema)(data).pipe(
      Effect.mapError(
        (err) => new MdxParseError({ path, issue: err.message ?? String(err) }),
      ),
    )
    return {
      frontmatter,
      prose: content.trim(),
      sourcePath: path,
    } satisfies ParsedMdx<A>
  })

export const readMdxSync = async <A, I>(
  schema: Schema.Schema<A, I>,
  path: string,
): Promise<ParsedMdx<A>> =>
  Effect.runPromise(readMdx(schema, path))
