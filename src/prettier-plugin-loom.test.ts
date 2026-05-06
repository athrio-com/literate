import { describe, test, expect } from "bun:test"
import * as prettier from "prettier"
import plugin from "./prettier-plugin-loom"

async function fmt(source: string, options: Record<string, any> = {}): Promise<string> {
  return prettier.format(source, {
    parser: "loom",
    plugins: [plugin],
    semi: false,
    ...options,
  })
}

describe("prettier-plugin-loom", () => {
  test("preserves headings and prose", async () => {
    const source = `# Hello World [Typescript]

This is prose at column 0.

# Section [Tag]

More prose here.
`
    const result = await fmt(source)
    expect(result).toBe(source)
  })

  test("formats typescript code blocks", async () => {
    const source = `[typescript]

# Greeting [Greet]

  const   x   =   1
  const y=2
`
    const result = await fmt(source)
    expect(result).toContain("  const x = 1")
    expect(result).toContain("  const y = 2")
  })

  test("preserves 2-space indent on formatted code", async () => {
    const source = `[typescript]

# Handler [Handle]

  app.get("/hello", (c) => {
  const name = "World"
  return c.text(name)
  })
`
    const result = await fmt(source)
    const lines = result.split("\n")
    const codeLines = lines.filter((l) => l.trim() && /^\s/.test(l))
    for (const line of codeLines) {
      expect(line.startsWith("  ")).toBe(true)
    }
  })

  test("skips code blocks with transclusions", async () => {
    const source = `[typescript]

# Greeting [Greet]

  {{Import as needed}}

  const   x=1
`
    const result = await fmt(source)
    expect(result).toContain("{{Import as needed}}")
  })

  test("preserves fenced blocks verbatim", async () => {
    const fenced = "```bash\nbun tangle.ts corpus/Loom.loom\n```"
    const source = `[typescript]

# How to run

${fenced}

# Code [Main]

  const x = 1
`
    const result = await fmt(source)
    expect(result).toContain(fenced)
  })

  test("handles multi-line function formatting", async () => {
    const source = `[typescript]

# Service [Svc]

  function greet(name:string,age:number,location:string){return name+" is "+age+" from "+location}
`
    const result = await fmt(source)
    expect(result).not.toContain("function greet(name:string,age:number")
    const lines = result.split("\n").filter((l) => l.trim().startsWith("function") || l.trim().startsWith("return"))
    expect(lines.length).toBeGreaterThanOrEqual(1)
  })

  test("preserves blank lines between sections", async () => {
    const source = `[typescript]

# First [A]

  const a = 1

# Second [B]

  const b = 2
`
    const result = await fmt(source)
    expect(result).toContain("# First [A]")
    expect(result).toContain("# Second [B]")
    expect(result).toContain("  const a = 1")
    expect(result).toContain("  const b = 2")
  })

  test("formats json code blocks", async () => {
    const source = `[typescript]

# Config [PackageJson]

  [json]
  {"name":"test","version":"1.0.0","dependencies":{"hono":"^4"}}
`
    const result = await fmt(source)
    expect(result).toContain('"name": "test"')
  })

  test("preserves yield* in tangle bodies", async () => {
    const source = `[typescript]

# Tangle [IndexTs, dist/index.ts]

  const { PackageJson } = yield* ConfigLoom
  compose(PackageJson)
`
    const result = await fmt(source)
    expect(result).toContain("yield* ConfigLoom")
    expect(result).not.toContain("yield *")
  })

  test("formats a complete loom file", async () => {
    const source = `# MyApp [Typescript]

# Imports [Imports]

  import {Hono} from "hono"

# App [App]

  const app=new Hono()

# Handler [Handle]

  app.get("/hello",(c)=>{
  const name=c.req.param("name")??"World"
  return c.text("Hello "+name)
  })

# Tangle [IndexTs, dist/index.ts]

  compose(
    Imports,
    App,
    Handle
  )
`
    const result = await fmt(source)
    expect(result).toContain('import { Hono } from "hono"')
    expect(result).toContain("const app = new Hono()")
    expect(result).toContain("# MyApp [Typescript]")
    expect(result).toContain("# Tangle [IndexTs, dist/index.ts]")
  })
})
