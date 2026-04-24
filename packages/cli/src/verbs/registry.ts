/**
 * Verb registry — the single source of truth for which verbs the
 * CLI dispatches. Adding a verb is one new file in `verbs/` plus
 * one entry here.
 */
import closeVerb from './close.ts'
import continueVerb from './continue.ts'
import initVerb from './init.ts'
import tangleVerb from './tangle.ts'
import updateVerb from './update.ts'
import weaveVerb from './weave.ts'
import type { Verb } from './verb.ts'

export const VERBS: Readonly<Record<string, Verb>> = {
  [continueVerb.name]: continueVerb,
  [closeVerb.name]: closeVerb,
  [initVerb.name]: initVerb,
  [tangleVerb.name]: tangleVerb,
  [weaveVerb.name]: weaveVerb,
  [updateVerb.name]: updateVerb,
} as const

export const usageBanner = (): string => {
  const lines: string[] = [
    'literate — Literate Framework CLI',
    '',
    'Usage: literate <verb> [args...]',
    '',
    'Verbs:',
  ]
  for (const v of Object.values(VERBS)) {
    lines.push(`  ${v.name.padEnd(10)} ${v.summary}`)
  }
  lines.push(
    '',
    'Run `literate <verb> --help` for verb-specific usage.',
    '',
    'See `.literate/LITERATE.md` (after `literate init` or `weave`)',
    'for the Protocol prose.',
    '',
  )
  return lines.join('\n')
}

export type { Verb }
