/**
 * @adr ADR-002
 * @adr ADR-004
 *
 * `literate init [template]` — copy a template package's tree into a
 * target directory and run `compile` to produce .literate/.
 *
 * v0.1 ships one template (`minimal`); the template is itself a
 * workspace package (`@literate/template-minimal`) whose `tree/`
 * subfolder is the scaffold.
 */

import { Args, Command, Options } from '@effect/cli'
import { FileSystem, Path } from '@effect/platform'
import { Console, Effect } from 'effect'
import { templateRoot } from '@literate/template-minimal'
import { compileLiterate } from '../compile.ts'

const templateName = Args.text({ name: 'template' }).pipe(
  Args.withDefault('minimal'),
  Args.withDescription("Template id (only 'minimal' in v0.1)."),
)

const target = Options.text('target').pipe(
  Options.withAlias('t'),
  Options.withDefault('.'),
  Options.withDescription('Target directory (default: cwd).'),
)

const copyDir = (
  fs: FileSystem.FileSystem,
  path: Path.Path,
  from: string,
  to: string,
): Effect.Effect<void, unknown, never> =>
  Effect.gen(function* () {
    const entries = yield* fs.readDirectory(from)
    yield* fs.makeDirectory(to, { recursive: true })
    for (const entry of entries) {
      const src = path.join(from, entry)
      const dst = path.join(to, entry)
      const stat = yield* fs.stat(src)
      if (stat.type === 'Directory') {
        yield* copyDir(fs, path, src, dst)
      } else {
        const buf = yield* fs.readFile(src)
        yield* fs.writeFile(dst, buf)
      }
    }
  })

export const initCommand = Command.make(
  'init',
  { template: templateName, target },
  ({ template, target }) =>
    Effect.gen(function* () {
      if (template !== 'minimal') {
        yield* Console.error(`Unknown template: ${template}. Only 'minimal' in v0.1.`)
        return yield* Effect.fail(new Error(`Unknown template: ${template}`))
      }
      const fs = yield* FileSystem.FileSystem
      const path = yield* Path.Path
      const dest = path.resolve(target)
      yield* Console.log(`Scaffolding '${template}' into ${dest}`)
      yield* copyDir(fs, path, templateRoot, dest)
      yield* Console.log('Template copied. Compiling .literate/ …')
      yield* compileLiterate(dest)
      yield* Console.log('Done.')
    }),
).pipe(Command.withDescription('Scaffold a new consumer repo.'))
