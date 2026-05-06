import { describe, test, expect } from "bun:test"
import { Effect } from "effect"
import { parse } from "./loom"
import {
  buildVirtualDocuments,
  translateToVirtual,
  translateFromVirtual,
  createLanguageRouter,
  LANGUAGE_SERVERS,
  type LanguageServerConfig,
} from "./multiplexer"

// ── Virtual document building ──────────────────────────────────────────

describe("buildVirtualDocuments", () => {
  test("builds virtual document for Python blocks", () => {
    const source = `[python]

# Data loader

Loads data from CSV files.

  import pandas as pd

  def load_data(path: str) -> pd.DataFrame:
      return pd.read_csv(path)

# Processor

Cleans the loaded data.

  def process(df: pd.DataFrame) -> pd.DataFrame:
      return df.dropna()
`
    const doc = Effect.runSync(parse(source))
    const vdocs = buildVirtualDocuments(doc, "file:///test.loom", source)

    expect(vdocs.size).toBe(1)

    const pyDoc = vdocs.get("python")!
    expect(pyDoc).toBeDefined()
    expect(pyDoc.languageId).toBe("python")
    expect(pyDoc.uri).toContain(".virtual.py")

    expect(pyDoc.content).toContain("import pandas as pd")
    expect(pyDoc.content).toContain("def load_data")
    expect(pyDoc.content).toContain("def process")

    expect(pyDoc.mappings.length).toBeGreaterThan(0)
  })

  test("ignores TypeScript blocks", () => {
    const source = `[typescript]

# Greeting [Greet]

  console.log("hello")
`
    const doc = Effect.runSync(parse(source))
    const vdocs = buildVirtualDocuments(doc, "file:///test.loom", source)

    expect(vdocs.size).toBe(0)
  })

  test("builds separate virtual documents for multiple languages", () => {
    const source = `[typescript]

# TS section [Greet]

  console.log("hello")

# Python section

  [python]
  import os

# Scala section

  [scala]
  val x = 42
`
    const doc = Effect.runSync(parse(source))
    const vdocs = buildVirtualDocuments(doc, "file:///test.loom", source)

    const pyDoc = vdocs.get("python")
    const scalaDoc = vdocs.get("scala")

    expect(pyDoc).toBeDefined()
    expect(scalaDoc).toBeDefined()
    expect(pyDoc!.content).toContain("import os")
    expect(scalaDoc!.content).toContain("val x = 42")
  })

  test("dedents code blocks", () => {
    const source = `[python]

# Module

  import os

  def main():
      print("hello")
`
    const doc = Effect.runSync(parse(source))
    const vdocs = buildVirtualDocuments(doc, "file:///test.loom", source)
    const pyDoc = vdocs.get("python")!

    expect(pyDoc.content).toContain("import os")
    expect(pyDoc.content).toContain("def main():")
    expect(pyDoc.content).toContain('    print("hello")')
    expect(pyDoc.content).not.toMatch(/^\s{2}import os/m)
  })
})

// ── Position translation ───────────────────────────────────────────────

describe("translateToVirtual", () => {
  test("translates position within a mapped range", () => {
    const sourceText = "line0\nline1\ncode_here\nline3"
    const virtualText = "# line0\n# line1\ncode_here\n# line3"
    const mappings = [{ sourceOffset: 12, generatedOffset: 16, length: 9 }]

    const result = translateToVirtual(
      sourceText,
      virtualText,
      mappings,
      { line: 2, character: 0 },
    )

    expect(result).not.toBeNull()
    expect(result!.line).toBe(2)
  })

  test("returns null for position outside mapped ranges", () => {
    const sourceText = "prose line\ncode_here"
    const virtualText = "# prose line\ncode_here"
    const mappings = [{ sourceOffset: 11, generatedOffset: 13, length: 9 }]

    const result = translateToVirtual(
      sourceText,
      virtualText,
      mappings,
      { line: 0, character: 0 },
    )

    expect(result).toBeNull()
  })
})

describe("translateFromVirtual", () => {
  test("translates position back from virtual to source", () => {
    const sourceText = "line0\nline1\ncode_here\nline3"
    const virtualText = "# line0\n# line1\ncode_here\n# line3"
    const mappings = [{ sourceOffset: 12, generatedOffset: 16, length: 9 }]

    const result = translateFromVirtual(
      sourceText,
      virtualText,
      mappings,
      { line: 2, character: 5 },
    )

    expect(result).not.toBeNull()
  })

  test("returns null for unmapped virtual position", () => {
    const sourceText = "prose\ncode"
    const virtualText = "# prose\ncode"
    const mappings = [{ sourceOffset: 6, generatedOffset: 8, length: 4 }]

    const result = translateFromVirtual(
      sourceText,
      virtualText,
      mappings,
      { line: 0, character: 0 },
    )

    expect(result).toBeNull()
  })
})

// ── Language Router ────────────────────────────────────────────────────

describe("LanguageRouter", () => {
  test("detects language at position", () => {
    const router = createLanguageRouter(LANGUAGE_SERVERS)
    const source = `[python]

# Greeting

Hello world

  import os
  print("hello")
`
    const lang = router.getLanguageAtPosition(
      "file:///test.loom",
      source,
      { line: 6, character: 2 },
    )
    expect(lang).toBe("python")
  })

  test("returns null for prose positions", () => {
    const router = createLanguageRouter(LANGUAGE_SERVERS)
    const source = `[python]

# Greeting

Hello world prose here.

  import os
`
    const lang = router.getLanguageAtPosition(
      "file:///test.loom",
      source,
      { line: 4, character: 0 },
    )
    expect(lang).toBeNull()
  })

  test("identifies external languages", () => {
    const router = createLanguageRouter(LANGUAGE_SERVERS)

    expect(router.isExternalLanguage("python")).toBe(true)
    expect(router.isExternalLanguage("scala")).toBe(true)
    expect(router.isExternalLanguage("typescript")).toBe(false)
    expect(router.isExternalLanguage("javascript")).toBe(false)
    expect(router.isExternalLanguage("unknown")).toBe(false)
  })

  test("isExternalLanguage uses custom configs", () => {
    const configs: LanguageServerConfig[] = [
      {
        languageId: "rust",
        command: "rust-analyzer",
        args: [],
        fileExtension: ".rs",
      },
    ]
    const router = createLanguageRouter(configs)

    expect(router.isExternalLanguage("rust")).toBe(true)
    expect(router.isExternalLanguage("python")).toBe(false)
  })

  test("hover returns null when no document is tracked", async () => {
    const router = createLanguageRouter(LANGUAGE_SERVERS)
    router.initialize(null)

    const result = await router.hover(
      "file:///nonexistent.loom",
      { line: 0, character: 0 },
    )
    expect(result).toBeNull()
  })

  test("graceful degradation when language server not installed", async () => {
    const configs: LanguageServerConfig[] = [
      {
        languageId: "python",
        command: "nonexistent-language-server-binary-that-does-not-exist",
        args: [],
        fileExtension: ".py",
      },
    ]
    const router = createLanguageRouter(configs)
    router.initialize(null)

    const source = `[python]

# Test

  import os
`
    await router.documentOpened("file:///test.loom", source)

    const result = await router.hover(
      "file:///test.loom",
      { line: 4, character: 2 },
    )
    expect(result).toBeNull()
  })

  test("shutdown is idempotent", async () => {
    const router = createLanguageRouter(LANGUAGE_SERVERS)
    router.initialize(null)

    await router.shutdown()
    await router.shutdown()
  })
})
