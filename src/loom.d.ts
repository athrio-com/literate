declare module "*.loom" {
  import type { Effect } from "effect"

  export const blocks: readonly string[]
  export const program: Effect.Effect<void, never, never>
  const _default: Record<string, (...args: any[]) => Effect.Effect<string, never, never>>
  export default _default
}
