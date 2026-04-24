/**
 * `@literate/template-minimal` — the minimal consumer scaffold.
 *
 * The template's files live in the sibling `files/` tree. This
 * module exposes their absolute path (via `import.meta.url`) and
 * a small `scaffold(targetDir)` function that copies the tree into
 * a target directory — used by the e2e smoke test and by the
 * (deferred) `literate init` verb.
 *
 * The scaffold copies every file verbatim. A consumer should then
 * edit `corpus/CLAUDE.md` and `package.json` to fit their project.
 */
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

export const TEMPLATE_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'files',
)

export interface ScaffoldOptions {
  readonly target: string
  /** Overwrite files that already exist at the target. Default: false. */
  readonly overwrite?: boolean
  /**
   * Absolute path to the source `files/` tree. Defaults to the
   * sibling `../files/` resolved via `import.meta.url`. The CLI
   * passes an explicit root when running from a bundle so the
   * tree can live under the CLI's embedded `dist/assets/` path.
   */
  readonly root?: string
}

export interface ScaffoldResult {
  readonly copiedFiles: ReadonlyArray<string>
  readonly skippedFiles: ReadonlyArray<string>
}

const walkDir = async (root: string): Promise<string[]> => {
  const out: string[] = []
  const stack: string[] = [root]
  while (stack.length > 0) {
    const cur = stack.pop()!
    const entries = await fs.readdir(cur, { withFileTypes: true })
    for (const e of entries) {
      const full = path.join(cur, e.name)
      if (e.isDirectory()) stack.push(full)
      else if (e.isFile()) out.push(full)
    }
  }
  return out
}

export const scaffold = async (
  opts: ScaffoldOptions,
): Promise<ScaffoldResult> => {
  const src = opts.root ?? TEMPLATE_ROOT
  const targetAbs = path.resolve(opts.target)
  const files = await walkDir(src)
  const copied: string[] = []
  const skipped: string[] = []
  for (const file of files) {
    const rel = path.relative(src, file)
    const dest = path.join(targetAbs, rel)
    await fs.mkdir(path.dirname(dest), { recursive: true })
    if (!opts.overwrite) {
      try {
        await fs.access(dest)
        skipped.push(rel)
        continue
      } catch {
        // Destination does not exist — fall through to copy.
      }
    }
    await fs.copyFile(file, dest)
    copied.push(rel)
  }
  return { copiedFiles: copied, skippedFiles: skipped }
}
