/**
 * `literate weave` (ADR-025 §2).
 *
 * Materialise `.literate/LITERATE.md` from the vendored
 * `.literate/{tropes,concepts}/` tree plus consumer extensions.
 * Mechanical, deterministic, idempotent. Owns its own output;
 * does not touch vendored files.
 */
import { weave } from '../weaver/weaver.ts'
import type { Verb, VerbContext } from './verb.ts'

const weaveVerb: Verb = {
  name: 'weave',
  summary:
    'Materialise `.literate/LITERATE.md` from vendored Tropes/Concepts and consumer extensions.',
  usage: 'Usage: literate weave',

  async run(_argv, ctx: VerbContext): Promise<number> {
    const result = await weave(ctx.cwd)
    ctx.stdout.write(`wove ${result.literateMdPath}\n`)
    if (result.tropesIncluded.length > 0) {
      ctx.stdout.write(
        `  tropes: ${result.tropesIncluded.join(', ')}\n`,
      )
    }
    if (result.conceptsIncluded.length > 0) {
      ctx.stdout.write(
        `  concepts: ${result.conceptsIncluded.join(', ')}\n`,
      )
    }
    if (result.extensionsIncluded.length > 0) {
      ctx.stdout.write(
        `  extensions: ${result.extensionsIncluded.join(', ')}\n`,
      )
    }
    return 0
  },
}

export default weaveVerb
export { weave }
