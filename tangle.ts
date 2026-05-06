import { Console, Effect } from "effect"
import { BunRuntime } from "@effect/platform-bun"
import { readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { parse, projectTangle } from "./src/loom"

const main = Effect.gen(function* () {
  const args = process.argv.slice(2)
  if (args.length === 0) {
    yield* Console.error("usage: bun tangle.ts <file.loom> [--base dir]")
    return yield* Effect.fail(new Error("missing argument"))
  }

  const loomPath = args[0]!
  const baseIdx = args.indexOf("--base")
  const base = baseIdx >= 0 && args[baseIdx + 1]
    ? resolve(args[baseIdx + 1])
    : resolve(dirname(loomPath))

  const source = readFileSync(loomPath, "utf-8")
  const doc = yield* parse(source)

  if (doc.diagnostics.length > 0) {
    for (const d of doc.diagnostics) {
      yield* Console.error(`  ! ${d.message}`)
    }
  }

  const result = yield* projectTangle(doc, loomPath)

  if (result.diagnostics.length > 0) {
    for (const d of result.diagnostics) {
      yield* Console.error(`  ! ${d}`)
    }
  }

  if (result.files.length === 0) {
    yield* Console.log("no files to tangle")
    return
  }

  for (const file of result.files) {
    const target = resolve(base, file.path)
    mkdirSync(dirname(target), { recursive: true })
    const content = file.content.endsWith("\n") ? file.content : file.content + "\n"
    writeFileSync(target, content)
    yield* Console.log(`tangled → ${file.path}`)
  }
})

BunRuntime.runMain(main)
