/**
 * @adr ADR-001
 * @adr ADR-002
 * @adr ADR-008
 *
 * Compile the consumer's .literate/ from their package.json manifest.
 *
 * The flow:
 *   1. Read consumer's package.json; validate the "literate" key.
 *   2. Resolve each manifest entry to a Trope value via the bundled
 *      catalog (typed module references, not string lookup).
 *   3. composeTropes(roots) produces the topologically sorted list,
 *      detects cycles.
 *   4. Materialize: write each Trope's prose, subkind prose, member
 *      prose into .literate/tropes/<id>/. Mirror Concepts into
 *      .literate/concepts/<id>.mdx.
 *   5. Write .literate/manifest.json with the resolved graph.
 */

import { FileSystem, Path } from '@effect/platform'
import { Console, Data, Effect, Schema } from 'effect'
import {
  PackageJsonWithLiterate,
  collectConcepts,
  composeTropes,
  type AnyTrope,
} from '@literate/core'
import { BUNDLED_TROPES, resolveTrope, tropePackageNames } from './catalog.ts'

export class UnknownTropePackage extends Data.TaggedError('UnknownTropePackage')<{
  readonly key: string
  readonly known: ReadonlyArray<string>
}> {}

export class MissingManifest extends Data.TaggedError('MissingManifest')<{
  readonly path: string
}> {}

const writeMdx = (
  fs: FileSystem.FileSystem,
  path: Path.Path,
  destDir: string,
  filename: string,
  prose: () => Promise<string>,
) =>
  Effect.gen(function* () {
    const body = yield* Effect.tryPromise(() => prose())
    yield* fs.makeDirectory(destDir, { recursive: true })
    yield* fs.writeFileString(path.join(destDir, filename), body + '\n')
  })

export const materializeTrope = (
  fs: FileSystem.FileSystem,
  path: Path.Path,
  literateRoot: string,
  trope: AnyTrope,
) =>
  Effect.gen(function* () {
    const tropeDir = path.join(literateRoot, 'tropes', trope.id)
    yield* writeMdx(fs, path, tropeDir, 'TROPE.mdx', trope.prose)
    for (const sub of trope.subkinds) {
      yield* writeMdx(
        fs,
        path,
        path.join(tropeDir, 'subkinds'),
        `${sub.id}.mdx`,
        sub.prose,
      )
    }
    for (const m of trope.members) {
      yield* writeMdx(
        fs,
        path,
        path.join(tropeDir, 'members'),
        `${m.id}.mdx`,
        m.prose,
      )
    }
  })

export const materializeConcept = (
  fs: FileSystem.FileSystem,
  path: Path.Path,
  literateRoot: string,
  concept: AnyTrope['realises'],
) =>
  writeMdx(
    fs,
    path,
    path.join(literateRoot, 'concepts'),
    `${concept.id}.mdx`,
    concept.prose,
  )

export const compileLiterate = (projectRoot: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const path = yield* Path.Path

    const pkgPath = path.join(projectRoot, 'package.json')
    const exists = yield* fs.exists(pkgPath)
    if (!exists) yield* new MissingManifest({ path: pkgPath })

    const raw = yield* fs.readFileString(pkgPath)
    const parsed = JSON.parse(raw) as unknown
    const manifest = yield* Schema.decodeUnknown(PackageJsonWithLiterate)(parsed)

    const roots: AnyTrope[] = []
    for (const key of manifest.literate.tropes) {
      const t = resolveTrope(key)
      if (!t) {
        yield* new UnknownTropePackage({ key, known: tropePackageNames() })
        continue
      }
      roots.push(t)
    }

    const ordered = yield* composeTropes(roots)
    const concepts = collectConcepts(ordered)

    const literateRoot = path.join(projectRoot, '.literate')
    yield* fs.remove(literateRoot, { recursive: true }).pipe(Effect.ignore)
    yield* fs.makeDirectory(literateRoot, { recursive: true })

    for (const c of concepts) {
      yield* materializeConcept(fs, path, literateRoot, c)
    }
    for (const t of ordered) {
      yield* materializeTrope(fs, path, literateRoot, t)
    }

    const snapshot = {
      lf: '0.1.0',
      compiledAt: new Date().toISOString(),
      concepts: concepts.map((c) => ({ id: c.id, version: c.version })),
      tropes: ordered.map((t) => ({
        id: t.id,
        version: t.version,
        realises: t.realises.id,
        dependencies: t.dependencies.map((d) => d.id),
        subkinds: t.subkinds.map((s) => s.id),
        members: t.members.map((m) => m.id),
      })),
    }
    yield* fs.writeFileString(
      path.join(literateRoot, 'manifest.json'),
      JSON.stringify(snapshot, null, 2) + '\n',
    )

    yield* Console.log(
      `Compiled .literate/ — ${concepts.length} concepts, ${ordered.length} tropes.`,
    )
  })

export { BUNDLED_TROPES }
