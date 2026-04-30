import { Console, Effect, Schema } from "effect"
import { FileSystem, Path } from "@effect/platform"
import { BunContext, BunRuntime } from "@effect/platform-bun"
import { unified } from "unified"
import remarkParse from "remark-parse"
import { visit } from "unist-util-visit"
import * as YAML from "yaml"
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

const parseFrontmatter = (source: string): Record<string, unknown> => {
  const match = source.match(/^---\n([\s\S]*?)\n---/)
  return match ? (YAML.parse(match[1]!) ?? {}) : {}
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

const writeBlock = ({ target, content }: Block) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const path = yield* Path.Path
    const dir = path.dirname(target)
    if (dir !== "." && dir !== "") {
      yield* fs.makeDirectory(dir, { recursive: true })
    }
    const body = content.endsWith("\n") ? content : content + "\n"
    yield* fs.writeFileString(target, body)
    yield* Console.log(`tangled → ${target}`)
  })

const validateConcept = (frontmatter: Record<string, unknown>) =>
  Effect.gen(function* () {
    const path = yield* Path.Path
    const conceptModulePath = path.resolve("src/concept.ts")
    const mod = yield* Effect.tryPromise({
      try: () => import(conceptModulePath),
      catch: (e) => new Error(`failed to import src/concept.ts: ${e}`),
    })
    const result = Schema.decodeUnknownEither(mod.Concept)(frontmatter)
    if (result._tag === "Left") {
      yield* Console.error(`✗ ${frontmatter["name"]}: frontmatter does not satisfy Concept schema`)
      yield* Console.error(String(result.left))
      return yield* Effect.fail(new Error("validation failed"))
    }
    yield* Console.log(`✓ ${frontmatter["name"]}: validates as Concept`)
  })

const tangleManifest = (manifestPath: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const source = yield* fs.readFileString(manifestPath)
    const frontmatter = parseFrontmatter(source)
    const blocks = extractBlocks(source)
    if (blocks.length === 0) {
      yield* Console.log(`no tangle blocks in ${manifestPath}`)
    } else {
      yield* Effect.forEach(blocks, writeBlock)
    }
    if (frontmatter["kind"] === "Concept") {
      yield* validateConcept(frontmatter)
    }
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
