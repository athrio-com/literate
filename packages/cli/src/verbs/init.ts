/**
 * `literate init [target] [--template <id>] [--registry-url <url>]
 * [--registry-ref <ref>]` (ADR-025 §2 — composes scaffold + tangle;
 * argv surface from ADR-030).
 *
 * Scaffolds a consumer repo from a named template, writes
 * `literate.json` with the configured registry, tangles the
 * template's default Trope/Concept set, runs an initial weave,
 * and writes the **first session log** through the same
 * `session-end` machinery every subsequent session uses
 * (the Protocol does not exempt its own bootstrap — see
 * Session `2026-04-24T1818-dissolve-categories-and-ship-scaffold`
 * G2). For v0.1 the only template is `minimal`.
 */
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { Args, Command, Options } from '@effect/cli'
import { Console, Effect, Layer, Option } from 'effect'

import { scaffold } from '@literate/template-minimal'

import {
  fileSystemSessionStoreLayer,
  InMemoryExecutionLogLayer,
  LiveProseInvokeLayer,
  StubAIInvokeLayer,
  StubGateServiceLayer,
} from '@literate/core'

import { templateMinimalRoot } from '../assets.ts'
import {
  BootstrapSessionFailed,
  ScaffoldError,
  UnknownTemplate,
  type VerbError,
} from '../errors.ts'
import type { SeedKind } from '../registry/manifest.ts'
import { runTangle } from './tangle.ts'
import { runWeave } from './weave.ts'
import { ConfigService } from '../registry/config.ts'
import { FetcherService } from '../registry/fetcher.ts'
import { ManifestService } from '../registry/manifest.ts'
import { WeaverService } from '../weaver/weaver.ts'
import { sessionEndStep } from '../trope-bindings.ts'

export interface RunInitOptions {
  readonly target: string
  readonly template: string
  readonly registryUrl: string
  readonly registryRef: string
  /**
   * Default seed set for the template. Each entry is `<kind>:<id>`.
   * Hard-coded for v0.1 minimal template.
   */
  readonly seeds: ReadonlyArray<{ kind: SeedKind; id: string }>
}

export interface RunInitResult {
  readonly target: string
  readonly scaffoldedFiles: ReadonlyArray<string>
  readonly tangled: ReadonlyArray<{ kind: SeedKind; id: string }>
  readonly literateMdPath: string
  readonly firstSessionPath: string
  readonly firstSessionClosedAt: string
}

const TEMPLATE_DEFAULT_SEEDS: Record<
  string,
  ReadonlyArray<{ kind: SeedKind; id: string }>
> = {
  // Post-G1 (Session 2026-04-24T1818) the `minimal` template ships
  // the canonical Trope set + the full typed Concept set: the
  // Session-2 four (`disposition`, `mode`, `implication`, `session`),
  // the six promoted-from-categories (`session-status`, `goal-status`,
  // `goal-category`, `adr-status`, `step-kind`, `tag`), and the
  // three composing parents (`goal`, `adr`, `step`). Total: 2
  // tropes + 13 concepts = 15 seeds. The corpus-level `person`,
  // `ai`, `protocol` Concepts (still prose-only at `corpus/concepts/`
  // in LF) are deferred — they require a registry-seed-shape
  // promotion to ship.
  minimal: [
    { kind: 'tropes', id: 'session-start' },
    { kind: 'tropes', id: 'session-end' },
    { kind: 'concepts', id: 'disposition' },
    { kind: 'concepts', id: 'mode' },
    { kind: 'concepts', id: 'implication' },
    { kind: 'concepts', id: 'session' },
    { kind: 'concepts', id: 'session-status' },
    { kind: 'concepts', id: 'goal' },
    { kind: 'concepts', id: 'goal-status' },
    { kind: 'concepts', id: 'goal-category' },
    { kind: 'concepts', id: 'adr' },
    { kind: 'concepts', id: 'adr-status' },
    { kind: 'concepts', id: 'tag' },
    { kind: 'concepts', id: 'step' },
    { kind: 'concepts', id: 'step-kind' },
  ],
}

// ---------------------------------------------------------------------------
// First-session-log bootstrap
//
// Writes a fully-formed `Status: Open` session log at
// `corpus/sessions/<stamp>-init-scaffold.md` (relative to the target
// repo). Includes every section the `session-end` validator requires:
// `## Pre-work`, `## Goals` (one terminal Goal), `## Decisions Made`,
// `## Work Done`, `## Summary`, `## Deferred / Discovered`. Also
// seeds the `corpus/sessions/sessions.md` index with a header + a
// row for this log carrying `Open` status (`session-end`'s
// `updateSessionsIndexStep` rewrites the row to `Closed` atomically).
// Returns the relative log path (the format `sessionEndStep` and
// `fileSystemSessionStoreLayer` consume).

// Matches `nowTimestamp` in `packages/core/src/session-store-fs.ts` —
// session-end's `stampClosedStep` uses local time for `Closed (...)`,
// so init's first-session header + filename use the same convention to
// avoid inconsistency between the `Started:` line and the `Closed:`
// stamp the validator writes.
const localNow = (): { stampLog: string; stampFile: string; date: string } => {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const yyyy = d.getFullYear()
  const mm = pad(d.getMonth() + 1)
  const dd = pad(d.getDate())
  const hh = pad(d.getHours())
  const min = pad(d.getMinutes())
  const date = `${yyyy}-${mm}-${dd}`
  return {
    stampLog: `${date}T${hh}:${min}`,
    stampFile: `${date}T${hh}${min}`,
    date,
  }
}

interface WriteFirstSessionLogOpts {
  readonly target: string
  readonly tangled: ReadonlyArray<{ kind: SeedKind; id: string }>
  readonly template: string
}

const writeFirstSessionLog = async (
  opts: WriteFirstSessionLogOpts,
): Promise<string> => {
  const { stampLog, stampFile, date } = localNow()
  const slug = 'init-scaffold'
  const filename = `${stampFile}-${slug}.md`
  const sessionRel = `corpus/sessions/${filename}`
  const sessionAbs = path.join(opts.target, sessionRel)

  const tangleLines = opts.tangled
    .map((t) => `- Tangled \`${t.kind}/${t.id}\` from registry into \`.literate/${t.kind}/${t.id}/\`.`)
    .join('\n')

  const body = `# Session: ${date} — Scaffold via \`literate init ${opts.template}\`

**Date:** ${date}
**Status:** Open
**Agent:** literate-cli (mechanical)
**Started:** ${stampLog}
**Disposition:** \`{ base: 'Infrastructure' }\`
**Mode:** Weaving

## Pre-work

This is the first session log of this repo, written by
\`literate init ${opts.template}\` as part of the canonical
scaffold shape. The init action is itself the first
invocation of the Protocol — the Protocol does not exempt its
own bootstrap. The session-end machinery below validates and
closes this log via the same code path every subsequent
session uses (see ADR-026 §4 + the \`session-end\` Trope at
\`.literate/tropes/session-end/\`).

## Goals

### Goal 1 — Scaffold this repo as an LF project using \`${opts.template}\`

**Status:** Completed
**Category:** feature
**Topic:** Establish the canonical LF scaffold shape so the
Protocol can run in this repo.
**Upstream:** ADR-024 (\`.literate/\` snapshot), ADR-025
(shadcn-shaped distribution), ADR-026 (registry mechanics).
**Acceptance:**
- \`CLAUDE.md\` at repo root pointing to \`.literate/LITERATE.md\`.
- \`.literate/concepts/\` and \`.literate/tropes/\` populated by
  tangling each default seed.
- \`.literate/manifest.json\` records the vendoring (kind, id,
  registry, ref, fetchedAt, files).
- \`.literate/LITERATE.md\` materialised by \`weave\`.

## Decisions Made

None. This session ships substrate; architectural decisions
belong to subsequent authored sessions.

## Work Done

- Scaffolded template files from \`@literate/template-minimal\`.
- Wrote \`literate.json\` with the configured registry.
${tangleLines}
- Wove \`.literate/LITERATE.md\` from the vendored seeds.
- Wrote this session log + the \`corpus/sessions/sessions.md\`
  index entry, then invoked \`session-end\` to validate and stamp
  \`Closed (timestamp)\`.

## Summary

Scaffolded this repository from the \`${opts.template}\`
template via \`literate init\`. Vendored ${opts.tangled.length}
registry seeds. Materialised \`.literate/LITERATE.md\`. The
Protocol is now runnable in this repo; the next session can
use \`literate continue .\` to open authored work.

## Deferred / Discovered

None at scaffold time.
`

  await fs.mkdir(path.dirname(sessionAbs), { recursive: true })
  await fs.writeFile(sessionAbs, body, 'utf8')

  // Seed the sessions index — header + row for this log. Pre-existing
  // index (e.g., re-init in a non-empty corpus) is preserved by
  // appending the new row to the existing table; absent index is
  // created fresh.
  const indexAbs = path.join(opts.target, 'corpus', 'sessions', 'sessions.md')
  const indexRow = `| [${filename}](./${filename}) | Scaffold via \`literate init ${opts.template}\` | Open |`
  let existing = ''
  try {
    existing = await fs.readFile(indexAbs, 'utf8')
  } catch {
    existing = ''
  }
  if (existing.trim() === '') {
    const header = `# Sessions — index

Session logs, newest first.

| File | Topic | Status |
|---|---|---|
${indexRow}
`
    await fs.writeFile(indexAbs, header, 'utf8')
  } else {
    // Insert the new row immediately after the header separator
    // line `|---|---|---|`.
    const lines = existing.split('\n')
    const sepIdx = lines.findIndex((l) => /^\|[-:|\s]+\|$/.test(l.trim()))
    if (sepIdx >= 0) {
      lines.splice(sepIdx + 1, 0, indexRow)
      await fs.writeFile(indexAbs, lines.join('\n'), 'utf8')
    } else {
      // No separator; append at end.
      const next = existing.endsWith('\n') ? existing + indexRow + '\n' : existing + '\n' + indexRow + '\n'
      await fs.writeFile(indexAbs, next, 'utf8')
    }
  }

  return sessionRel
}

const writeLiterateConfig = (
  target: string,
  registryUrl: string,
  registryRef: string,
  template: string,
): Effect.Effect<void, ScaffoldError> =>
  Effect.tryPromise({
    try: async () => {
      const config = {
        $schema: 'literate-config/v0',
        registries: [
          { name: 'literate', url: registryUrl, ref: registryRef },
        ],
        template,
      }
      await fs.writeFile(
        path.join(target, 'literate.json'),
        JSON.stringify(config, null, 2) + '\n',
        'utf8',
      )
    },
    catch: (e) =>
      new ScaffoldError({
        target,
        reason: e instanceof Error ? e.message : String(e),
      }),
  })

export const runInit = (
  opts: RunInitOptions,
): Effect.Effect<
  RunInitResult,
  VerbError,
  ConfigService | FetcherService | ManifestService | WeaverService
> =>
  Effect.gen(function* () {
    const targetAbs = path.resolve(opts.target)

    if (opts.template !== 'minimal') {
      return yield* Effect.fail(
        new UnknownTemplate({
          template: opts.template,
          available: Object.keys(TEMPLATE_DEFAULT_SEEDS),
        }),
      )
    }

    // Scaffold + config + extensions bootstrap (I/O-only; wrapped
    // as one tryPromise for a single ScaffoldError channel).
    const scaffoldResult = yield* Effect.tryPromise({
      try: async () => {
        await fs.mkdir(targetAbs, { recursive: true })
        const res = await scaffold({
          target: targetAbs,
          overwrite: false,
          root: templateMinimalRoot(),
        })
        const extDir = path.join(targetAbs, '.literate', 'extensions')
        await fs.mkdir(extDir, { recursive: true })
        const keepPath = path.join(extDir, '.keep')
        try {
          await fs.access(keepPath)
        } catch {
          await fs.writeFile(keepPath, '', 'utf8')
        }
        return res
      },
      catch: (e) =>
        new ScaffoldError({
          target: targetAbs,
          reason: e instanceof Error ? e.message : String(e),
        }),
    })

    // Write literate.json only if absent.
    const hasConfig: boolean = yield* Effect.tryPromise({
      try: () => fs.access(path.join(targetAbs, 'literate.json')),
      catch: () => null,
    }).pipe(
      Effect.map(() => true),
      Effect.catchAll(() => Effect.succeed(false)),
    )
    if (!hasConfig) {
      yield* writeLiterateConfig(
        targetAbs,
        opts.registryUrl,
        opts.registryRef,
        opts.template,
      )
    }

    // Tangle each default seed.
    const tangled: Array<{ kind: SeedKind; id: string }> = []
    for (const seed of opts.seeds) {
      yield* runTangle({
        repoRoot: targetAbs,
        kind: seed.kind,
        id: seed.id,
      })
      tangled.push(seed)
    }

    // Initial weave.
    const woven = yield* runWeave(targetAbs)

    // Bootstrap session log: write the first session at
    // `corpus/sessions/<stamp>-init-scaffold.md` with all
    // required sections present and `Status: Open`, then run it
    // through `sessionEndStep` so it lands as `Closed (timestamp)`
    // via the same machinery every subsequent session uses.
    const firstSessionRel = yield* Effect.tryPromise({
      try: () =>
        writeFirstSessionLog({
          target: targetAbs,
          tangled,
          template: opts.template,
        }),
      catch: (e) =>
        new ScaffoldError({
          target: targetAbs,
          reason:
            e instanceof Error
              ? `failed to write first session log: ${e.message}`
              : String(e),
        }),
    })

    const closure = yield* sessionEndStep
      .realise({ sessionPath: firstSessionRel })
      .pipe(
        Effect.provide(
          Layer.mergeAll(
            fileSystemSessionStoreLayer(targetAbs),
            InMemoryExecutionLogLayer,
            StubGateServiceLayer,
            LiveProseInvokeLayer,
            StubAIInvokeLayer,
          ),
        ),
        Effect.mapError(
          (e: unknown): VerbError =>
            new BootstrapSessionFailed({
              target: targetAbs,
              sessionPath: firstSessionRel,
              reason:
                e instanceof Error
                  ? e.message
                  : typeof e === 'object' && e !== null && 'message' in e
                    ? String((e as { message: unknown }).message)
                    : String(e),
            }),
        ),
      )

    return {
      target: targetAbs,
      scaffoldedFiles: scaffoldResult.copiedFiles,
      tangled,
      literateMdPath: woven.literateMdPath,
      firstSessionPath: closure.sessionPath,
      firstSessionClosedAt: closure.closedAt,
    }
  })

const targetArg = Args.text({ name: 'target' }).pipe(
  Args.withDescription(
    'Target directory (defaults to the current working directory).',
  ),
  Args.optional,
)

const templateOpt = Options.text('template').pipe(
  Options.withAlias('t'),
  Options.withDescription('Template id (defaults to `minimal`).'),
  Options.withDefault('minimal'),
)

const registryUrlOpt = Options.text('registry-url').pipe(
  Options.withDescription(
    'Registry url. Defaults to LITERATE_REGISTRY_URL env var, falling back to `bundled://`.',
  ),
  Options.optional,
)

const registryRefOpt = Options.text('registry-ref').pipe(
  Options.withDescription(
    'Registry ref. Defaults to LITERATE_REGISTRY_REF env var, falling back to `main`.',
  ),
  Options.optional,
)

const initCommand = Command.make(
  'init',
  {
    target: targetArg,
    template: templateOpt,
    registryUrl: registryUrlOpt,
    registryRef: registryRefOpt,
  },
  ({ target, template, registryUrl, registryRef }) =>
    Effect.gen(function* () {
      const seeds = TEMPLATE_DEFAULT_SEEDS[template]
      if (!seeds) {
        return yield* Effect.fail(
          new UnknownTemplate({
            template,
            available: Object.keys(TEMPLATE_DEFAULT_SEEDS),
          }),
        )
      }
      const env = process.env
      const resolvedTarget = Option.getOrElse(target, () => process.cwd())
      const resolvedUrl = Option.getOrElse(
        registryUrl,
        () => env['LITERATE_REGISTRY_URL'] ?? 'bundled://',
      )
      const resolvedRef = Option.getOrElse(
        registryRef,
        () => env['LITERATE_REGISTRY_REF'] ?? 'main',
      )

      const result = yield* runInit({
        target: resolvedTarget,
        template,
        registryUrl: resolvedUrl,
        registryRef: resolvedRef,
        seeds,
      })
      yield* Console.log(`initialised LF consumer repo at ${result.target}`)
      yield* Console.log(
        `  scaffolded: ${result.scaffoldedFiles.length} file(s)`,
      )
      for (const t of result.tangled) {
        yield* Console.log(`  tangled ${t.kind}/${t.id}`)
      }
      yield* Console.log(`  wove ${result.literateMdPath}`)
      yield* Console.log(
        `  first session: ${result.firstSessionPath} (Closed ${result.firstSessionClosedAt})`,
      )
    }),
).pipe(
  Command.withDescription(
    'Scaffold a new LF consumer repo and vendor the template seeds.',
  ),
)

export default initCommand
