import { Duration, Effect, FileSystem, Stream } from 'effect'
import { BunRuntime, BunServices } from '@effect/platform-bun'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const src = join(root, 'src')
const dist = join(root, 'dist')

const scopeToShadow = (css: string): string => css.replaceAll(':root', ':host')

const forStringLiteral = (css: string): string =>
  css
    .replaceAll('\\', '\\\\')
    .replaceAll("'", "\\'")
    .replaceAll('"', '\\"')
    .replaceAll('\r', '')
    .replaceAll('\n', '\\n')

const build = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  yield* fs.makeDirectory(dist, { recursive: true })

  const stylesheet = join(dist, 'overlay.css')
  yield* Effect.tryPromise(() =>
    Bun.spawn(['bunx', '@tailwindcss/cli', '-i', join(src, 'overlay.css'), '-o', stylesheet, '--minify'], {
      stdout: 'inherit',
      stderr: 'inherit',
    }).exited,
  )
  const css = scopeToShadow(yield* fs.readFileString(stylesheet))

  const built = yield* Effect.tryPromise(() =>
    Bun.build({ entrypoints: [join(src, 'overlay.ts')], target: 'browser', minify: true }),
  )
  const bundle = yield* Effect.promise(() => built.outputs[0].text())

  yield* fs.writeFileString(
    join(dist, 'overlay.js'),
    bundle.replaceAll('__LOOM_NOTES_CSS__', forStringLiteral(css)),
  )

  const bundled = (name: string) =>
    Effect.tryPromise(() =>
      Bun.build({ entrypoints: [join(src, `${name}.ts`)], target: 'browser', minify: true }),
    ).pipe(
      Effect.flatMap((result) => Effect.promise(() => result.outputs[0].text())),
      Effect.flatMap((text) => fs.writeFileString(join(dist, `${name}.js`), text)),
    )

  yield* bundled('shell')
  yield* bundled('ui')

  yield* Effect.log('built dist/overlay.js, dist/shell.js and dist/ui.js')
})

const watching = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  yield* Effect.log(`watching ${src} for changes`)
  yield* fs.watch(src).pipe(
    Stream.debounce(Duration.millis(100)),
    Stream.runForEach(() =>
      build.pipe(
        Effect.catchCause((cause) => Effect.logError('the build failed', cause)),
      ),
    ),
  )
})

const program = process.argv.includes('--watch')
  ? build.pipe(Effect.andThen(watching))
  : build

BunRuntime.runMain(program.pipe(Effect.provide(BunServices.layer)))
