#!/usr/bin/env bun
/**
 * `literate` CLI entry point. Parses argv, dispatches to the
 * verb in `verbs/registry.ts`. Six verbs at v0.1:
 *
 *   continue   open or resume an LF session (Protocol-mode)
 *   close      close an Open LF session (Protocol-mode)
 *   init       scaffold a new consumer repo + tangle defaults
 *   tangle     fetch a registry seed and vendor it
 *   weave      materialise `.literate/LITERATE.md`
 *   update     re-fetch a vendored seed at its registry ref
 *
 * Verbs ship as one-file modules under `src/verbs/`; the registry
 * at `src/verbs/registry.ts` enumerates them. Adding a verb is a
 * one-file change plus one entry in the registry.
 */
import { usageBanner, VERBS } from '../verbs/registry.ts'
import type { VerbContext } from '../verbs/verb.ts'

const ctx: VerbContext = {
  cwd: process.cwd(),
  env: process.env,
  stdout: process.stdout,
  stderr: process.stderr,
}

const main = async (): Promise<number> => {
  const [, , verb, ...rest] = process.argv
  if (!verb || verb === '--help' || verb === '-h' || verb === 'help') {
    process.stdout.write(usageBanner())
    return verb ? 0 : 0
  }

  const handler = VERBS[verb]
  if (!handler) {
    process.stderr.write(`literate: unknown verb '${verb}'\n\n`)
    process.stderr.write(usageBanner())
    return 2
  }

  if (rest[0] === '--help' || rest[0] === '-h') {
    process.stdout.write(handler.usage + '\n')
    return 0
  }

  return handler.run(rest, ctx)
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    const exitCode = (err as { exitCode?: number }).exitCode ?? 1
    process.stderr.write(`literate: ${(err as Error).message ?? String(err)}\n`)
    process.exit(exitCode)
  })
