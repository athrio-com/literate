import { Data, Effect, Layer } from "effect"

// ── Code ─────────────────────────────────────────────────────────────────
//
// Data. The literal text of a section. Typed entity, not a raw string.
// Resolves to pure text when emitted.

export class Code extends Data.TaggedClass("Code")<{
  readonly content: string
}> {
  indent(n: number): Code {
    const prefix = " ".repeat(n)
    return new Code({
      content: this.content
        .split("\n")
        .map((l) => (l ? prefix + l : l))
        .join("\n"),
    })
  }

  wrap(before: string, after: string): Code {
    return new Code({ content: before + this.content + after })
  }

  concat(other: Code): Code {
    return new Code({ content: this.content + "\n" + other.content })
  }

  toString(): string {
    return this.content
  }
}

// ── Tangle ───────────────────────────────────────────────────────────────
//
// Effectful computation result. Carries tag (Service member name),
// emission path, and the composed Code. When run at the end of the world,
// the runtime writes code.toString() to the path.

export class Tangle extends Data.TaggedClass("Tangle")<{
  readonly tag: string
  readonly path: string
  readonly code: Code
}> {}

// ── Template ─────────────────────────────────────────────────────────────
//
// Parameterized computation. Sections with {{param: type}} declarations
// become Template Service members.

export class Template<P extends Record<string, any>> extends Data.TaggedClass(
  "Template",
)<{
  readonly apply: (params: P) => Effect.Effect<Code>
}> {
  static make<P extends Record<string, any>>(
    apply: (params: P) => Effect.Effect<Code>,
  ): Template<P> {
    return new Template({ apply })
  }
}

// ── DSL ──────────────────────────────────────────────────────────────────

export function compose(
  ...parts: ReadonlyArray<string | Effect.Effect<Code>>
): Effect.Effect<Code> {
  return Effect.gen(function* () {
    const resolved: string[] = []
    for (const part of parts) {
      if (typeof part === "string") {
        resolved.push(part)
      } else {
        const code = yield* part
        resolved.push(code.content)
      }
    }
    return new Code({ content: resolved.join("\n") })
  })
}

export function needs(
  ...services: ReadonlyArray<{ readonly Default: Layer.Layer<any, any, any> }>
): ReadonlyArray<Layer.Layer<any, any, any>> {
  return services.map((s) => s.Default)
}
