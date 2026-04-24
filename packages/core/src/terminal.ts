/**
 * Node-readline-backed `TerminalIO` for the live CLI binding.
 *
 * Lives in its own module because `services.ts` is runtime-agnostic
 * aside from its public types; the `node:readline` coupling is
 * quarantined here. Works on Bun and Node (both ship a
 * spec-compatible `node:readline`).
 */
import * as readline from 'node:readline'
import { Effect } from 'effect'
import { GateUnresolved, type TerminalIO } from './services.ts'

export interface NodeTerminal {
  readonly io: TerminalIO
  readonly close: () => void
}

/**
 * Build a `TerminalIO` that reads newline-terminated lines from
 * `input` and writes raw bytes to `output`. Defaults to
 * `process.stdin` / `process.stdout`. Call `close()` to release the
 * underlying `readline.Interface`; outstanding reads resolve with
 * `GateUnresolved` on close.
 */
export const makeNodeTerminalIO = (opts?: {
  readonly input?: NodeJS.ReadableStream
  readonly output?: NodeJS.WritableStream
}): NodeTerminal => {
  const input = opts?.input ?? process.stdin
  const output = opts?.output ?? process.stdout
  const rl = readline.createInterface({ input, output, terminal: false })
  const pendingReads: Array<(line: string) => void> = []
  const pendingOnClose: Array<() => void> = []
  let closed = false
  rl.on('line', (line) => {
    const next = pendingReads.shift()
    if (next) {
      // If a reader is waiting, deliver the line; also drop the
      // matching close handler so we don't fail it later.
      pendingOnClose.shift()
      next(line)
    }
  })
  rl.on('close', () => {
    closed = true
    for (const fn of pendingOnClose.splice(0)) fn()
    // Any readers still waiting at close time get no line;
    // discard them (their close handlers already fired).
    pendingReads.splice(0)
  })
  const io: TerminalIO = {
    readLine: () =>
      Effect.async<string, GateUnresolved>((resume) => {
        if (closed) {
          resume(
            Effect.fail(new GateUnresolved({ reason: 'stdin closed' })),
          )
          return
        }
        pendingReads.push((line) => resume(Effect.succeed(line)))
        pendingOnClose.push(() =>
          resume(
            Effect.fail(new GateUnresolved({ reason: 'stdin closed' })),
          ),
        )
      }),
    write: (s) =>
      Effect.sync(() => {
        output.write(s)
      }),
  }
  return {
    io,
    close: () => {
      if (!closed) rl.close()
    },
  }
}
