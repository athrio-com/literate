/**
 * Protocol.continue — the single entry point (ADR-014).
 *
 * V0.1 ships a skeleton. Full path-detection (spontaneous / planned /
 * orphan) and root-Step dispatch are authored as workflow Tropes in
 * `registry/tropes/session-start/` and `registry/tropes/session-end/`
 * (per ADR-025/026 — Tropes are git-registry seeds, not npm
 * packages). The shape of the outcome union and the error channel
 * land here so that consumers can type against the public surface.
 */
import { Data, Effect } from 'effect'
import type { AIPending, ExternalPending, GatePending } from './suspend.ts'

export interface SessionRef {
  readonly _tag: 'SessionRef'
  readonly path: string
  readonly slug: string
}

export type ProtocolOutcome =
  | { readonly _tag: 'Completed'; readonly session: SessionRef }
  | {
      readonly _tag: 'Suspended'
      readonly pending: GatePending | AIPending | ExternalPending
    }
  | { readonly _tag: 'NoAction'; readonly reason: string }

export class SessionMalformed extends Data.TaggedError('SessionMalformed')<{
  readonly path: string
  readonly reason: string
}> {}

export class OrphanConflict extends Data.TaggedError('OrphanConflict')<{
  readonly openSessions: ReadonlyArray<string>
}> {}

export type ProtocolError = SessionMalformed | OrphanConflict

export const Protocol = {
  /**
   * V0.1 skeleton: returns `NoAction` with a message explaining that no
   * session-start workflow Trope is yet wired. The harness surface is
   * already typed against the final signature.
   */
  continue: (
    repoRoot: string,
  ): Effect.Effect<ProtocolOutcome, ProtocolError> =>
    Effect.succeed({
      _tag: 'NoAction' as const,
      reason:
        `Protocol.continue is scaffolded. repoRoot=${repoRoot}. ` +
        'Workflow Tropes (session-start, session-end, gate-flow, ' +
        'adr-flow, goal-flow) must be authored before continue() can ' +
        'dispatch. See corpus/decisions/ADR-014 and ADR-017.',
    }),
}
