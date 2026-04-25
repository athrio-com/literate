/**
 * Node-fs-backed `SessionStore` binding.
 *
 * Resolves relative paths against an injected `repoRoot` and uses
 * `node:fs/promises` for all operations. `rename` is a plain
 * `fs.rename` — git-tracking is not attempted at v0.1 (a caller that
 * wants `git mv` semantics can wrap this binding). `now()` captures
 * the current wall clock in local time, matching the convention in
 * the existing corpus (S2 § Pre-work flagged that IMP-1.5 prescribes
 * UTC but prior logs use EEST).
 */
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { Effect, Layer } from 'effect'
import {
  SessionStore,
  SessionStoreError,
  type SessionStoreService,
  type Timestamp,
} from './services.ts'

const pad = (n: number, w = 2): string => String(n).padStart(w, '0')

const nowTimestamp = (): Timestamp => {
  const d = new Date()
  const iso = d.toISOString()
  const logStamp =
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  const filenameStamp =
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}${pad(d.getMinutes())}`
  return { iso, logStamp, filenameStamp }
}

const mapFsError = <Op extends SessionStoreError['operation']>(
  operation: Op,
  relPath: string,
) =>
  (error: unknown) =>
    new SessionStoreError({
      operation,
      path: relPath,
      reason: error instanceof Error ? error.message : String(error),
    })

export const makeFileSystemSessionStore = (
  repoRoot: string,
): Effect.Effect<SessionStoreService> =>
  Effect.sync(() => {
    const abs = (rel: string) => path.join(repoRoot, rel)
    const service: SessionStoreService = {
      listDir: (relPath) =>
        Effect.tryPromise({
          try: async () => {
            const entries = await fs.readdir(abs(relPath), {
              withFileTypes: true,
            })
            // Return both files and directories so callers can
            // recurse. Filtering happens caller-side (e.g.,
            // `isSessionFilename` in session-start). The
            // in-memory implementation already returns immediate
            // children of both kinds; this matches.
            return entries
              .filter((e) => e.isFile() || e.isDirectory())
              .map((e) => e.name)
              .sort()
          },
          catch: mapFsError('listDir', relPath),
        }),
      read: (relPath) =>
        Effect.tryPromise({
          try: () => fs.readFile(abs(relPath), 'utf8'),
          catch: mapFsError('read', relPath),
        }),
      write: (relPath, content) =>
        Effect.tryPromise({
          try: async () => {
            await fs.mkdir(path.dirname(abs(relPath)), { recursive: true })
            await fs.writeFile(abs(relPath), content, 'utf8')
          },
          catch: mapFsError('write', relPath),
        }),
      rename: (oldRelPath, newRelPath) =>
        Effect.tryPromise({
          try: async () => {
            await fs.mkdir(path.dirname(abs(newRelPath)), { recursive: true })
            await fs.rename(abs(oldRelPath), abs(newRelPath))
          },
          catch: mapFsError('rename', `${oldRelPath}→${newRelPath}`),
        }),
      now: () => Effect.sync(nowTimestamp),
    }
    return service
  })

export const fileSystemSessionStoreLayer = (
  repoRoot: string,
): Layer.Layer<SessionStore> =>
  Layer.effect(SessionStore, makeFileSystemSessionStore(repoRoot))
