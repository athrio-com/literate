/**
 * Verb interface (ADR-026 §Consequences — adding a verb is a
 * one-file change).
 *
 * A Verb takes the parsed remainder of `argv` (everything after
 * the verb name) plus a small context (cwd, env), runs to
 * completion, and returns a process exit code. Errors that the
 * verb wants to surface as one-line stderr + non-zero exit may
 * `throw`; the dispatcher in `bin/literate.ts` catches and
 * formats.
 */
export interface VerbContext {
  readonly cwd: string
  readonly env: Readonly<Record<string, string | undefined>>
  readonly stdout: NodeJS.WriteStream
  readonly stderr: NodeJS.WriteStream
}

export interface Verb {
  readonly name: string
  readonly summary: string
  readonly usage: string
  run(argv: ReadonlyArray<string>, ctx: VerbContext): Promise<number>
}

export const usageError = (verb: Verb, message: string): Error => {
  const err = new Error(`${verb.name}: ${message}\n\n${verb.usage}`)
  ;(err as { exitCode?: number }).exitCode = 2
  return err
}
