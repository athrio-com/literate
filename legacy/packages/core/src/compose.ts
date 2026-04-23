/**
 * @adr ADR-001
 * @adr ADR-008
 *
 * Trope graph composition. Walks the typed dependency edges (real module
 * references), produces a topologically ordered list, detects cycles.
 *
 * Because dependencies are typed object references, the resolver never
 * has to look anything up by string. A consumer's manifest declares
 * which Tropes to install; those Trope modules are imported normally
 * (npm/Bun resolution); this function flattens the graph.
 */

import { Effect, Data } from 'effect'
import type { AnyTrope } from './kinds.ts'

export class CyclicTropeDependency extends Data.TaggedError('CyclicTropeDependency')<{
  readonly cycle: ReadonlyArray<string>
}> {}

export const composeTropes = (
  roots: ReadonlyArray<AnyTrope>,
): Effect.Effect<ReadonlyArray<AnyTrope>, CyclicTropeDependency> =>
  Effect.gen(function* () {
    const ordered: AnyTrope[] = []
    const visited = new Set<string>()
    const stack = new Set<string>()
    const seenRefs = new Map<string, AnyTrope>()

    const visit = (
      trope: AnyTrope,
      path: ReadonlyArray<string>,
    ): Effect.Effect<void, CyclicTropeDependency> =>
      Effect.gen(function* () {
        const id = trope.id
        if (visited.has(id)) return
        if (stack.has(id)) {
          const cycleStart = path.indexOf(id)
          yield* new CyclicTropeDependency({
            cycle:
              cycleStart >= 0 ? [...path.slice(cycleStart), id] : [...path, id],
          })
          return
        }
        // Detect identity collision (two different Trope objects, same id).
        const existing = seenRefs.get(id)
        if (existing && existing !== trope) {
          yield* Effect.logWarning(
            `Trope id collision: '${id}' has two distinct realisations.`,
          )
        }
        seenRefs.set(id, trope)

        stack.add(id)
        for (const dep of trope.dependencies) {
          yield* visit(dep, [...path, id])
        }
        stack.delete(id)
        visited.add(id)
        ordered.push(trope)
      })

    for (const root of roots) {
      yield* visit(root, [])
    }
    return ordered
  })

/** Collect every distinct Concept reachable from the given Tropes. */
export const collectConcepts = (
  tropes: ReadonlyArray<AnyTrope>,
): ReadonlyArray<AnyTrope['realises']> => {
  const seen = new Map<string, AnyTrope['realises']>()
  const visit = (concept: AnyTrope['realises']) => {
    if (seen.has(concept.id)) return
    seen.set(concept.id, concept)
    for (const dep of concept.dependencies) visit(dep)
  }
  for (const t of tropes) visit(t.realises)
  return [...seen.values()]
}
