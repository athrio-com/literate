import { Console, Effect } from "effect"
import { FileSystem, Path } from "@effect/platform"
import { BunContext, BunRuntime } from "@effect/platform-bun"
import { unified } from "unified"
import remarkParse from "remark-parse"
import { visit } from "unist-util-visit"
import type { Code, Root } from "mdast"

interface Block {
  readonly target: string
  readonly content: string
}

const parseMeta = (meta: string | null | undefined): Record<string, string> => {
  if (!meta) return {}
  const result: Record<string, string> = {}
  const re = /(\w+)="([^"]*)"/g
  let m: RegExpExecArray | null
  while ((m = re.exec(meta)) !== null) {
    result[m[1]!] = m[2]!
  }
  return result
}

const extractBlocks = (source: string): ReadonlyArray<Block> => {
  const tree = unified().use(remarkParse).parse(source) as Root
  const blocks: Block[] = []
  visit(tree, "code", (node: Code) => {
    const attrs = parseMeta(node.meta)
    const target = attrs["tangle"]
    if (target !== undefined) {
      blocks.push({ target, content: node.value })
    }
  })
  return blocks
}

const tangleManifest = (manifestPath: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const path = yield* Path.Path
    const source = yield* fs.readFileString(manifestPath)
    const blocks = extractBlocks(source)
    if (blocks.length === 0) {
      yield* Console.log(`no tangle blocks in ${manifestPath}`)
      return
    }
    yield* Effect.forEach(blocks, ({ target, content }) =>
      Effect.gen(function* () {
        const dir = path.dirname(target)
        if (dir !== "." && dir !== "") {
          yield* fs.makeDirectory(dir, { recursive: true })
        }
        const body = content.endsWith("\n") ? content : content + "\n"
        yield* fs.writeFileString(target, body)
        yield* Console.log(`tangled → ${target}`)
      })
    )
  })

const main = Effect.gen(function* () {
  const args = Bun.argv.slice(2)
  if (args.length !== 1) {
    yield* Console.error("usage: bun tangle.ts <manifest.md>")
    return yield* Effect.fail(new Error("missing argument"))
  }
  yield* tangleManifest(args[0]!)
})

BunRuntime.runMain(main.pipe(Effect.provide(BunContext.layer)))
