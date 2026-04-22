/**
 * @adr ADR-002
 * @adr ADR-005
 * @adr ADR-010
 *
 * Docs source. Reads Concept and Trope MDX from the workspace
 * packages/, plus site-authored content from site/content/.
 *
 * Runs at build/render time only (Next.js RSC), uses node:fs.
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'

const REPO_ROOT = path.resolve(process.cwd(), '..')
const PACKAGES_DIR = path.join(REPO_ROOT, 'packages')
const CONTENT_DIR = path.join(process.cwd(), 'content')

export interface MdxDoc {
  readonly slug: string
  readonly title: string
  readonly description?: string
  readonly body: string
  readonly sourcePath: string
}

export interface PackageMeta {
  readonly id: string
  readonly version?: string
  readonly description?: string
}

const exists = async (p: string) =>
  fs
    .access(p)
    .then(() => true)
    .catch(() => false)

async function readMdx(file: string): Promise<{
  frontmatter: Record<string, unknown>
  body: string
}> {
  const raw = await fs.readFile(file, 'utf8')
  const { data, content } = matter(raw)
  return { frontmatter: data, body: content.trim() }
}

function deriveTitle(body: string, fallback: string): string {
  const match = body.match(/^#\s+(.+?)\s*$/m)
  return match ? match[1]! : fallback
}

/**
 * Drop the leading H1 from an MDX body so the body can be composed
 * into a parent page that supplies its own heading hierarchy.
 */
export function stripTitle(body: string): string {
  return body.replace(/^#\s+.+?\n+/, '').trimStart()
}

async function listPackages(prefix: string): Promise<readonly string[]> {
  const entries = await fs.readdir(PACKAGES_DIR, { withFileTypes: true })
  return entries
    .filter((e) => e.isDirectory() && e.name.startsWith(prefix))
    .map((e) => e.name.slice(prefix.length))
    .sort()
}

export const listConceptIds = (): Promise<readonly string[]> =>
  listPackages('concept-')

export const listTropeIds = (): Promise<readonly string[]> => listPackages('trope-')

export async function readPackageMeta(pkg: string): Promise<PackageMeta> {
  const file = path.join(PACKAGES_DIR, pkg, 'package.json')
  if (!(await exists(file))) return { id: pkg }
  const json = JSON.parse(await fs.readFile(file, 'utf8')) as {
    version?: string
    description?: string
  }
  return {
    id: pkg,
    ...(json.version ? { version: json.version } : {}),
    ...(json.description ? { description: json.description } : {}),
  }
}

const buildDoc = (
  slug: string,
  body: string,
  sourcePath: string,
  description: string | undefined,
  titleOverride?: string,
): MdxDoc => ({
  slug,
  title: titleOverride ?? deriveTitle(body, slug),
  body,
  sourcePath,
  ...(description ? { description } : {}),
})

export async function getConcept(id: string): Promise<MdxDoc | null> {
  const file = path.join(PACKAGES_DIR, `concept-${id}`, 'src', 'concept.mdx')
  if (!(await exists(file))) return null
  const { frontmatter, body } = await readMdx(file)
  return buildDoc(
    id,
    body,
    file,
    typeof frontmatter.description === 'string' ? frontmatter.description : undefined,
  )
}

export async function getTrope(id: string): Promise<MdxDoc | null> {
  const file = path.join(PACKAGES_DIR, `trope-${id}`, 'src', 'prose.mdx')
  if (!(await exists(file))) return null
  const { body } = await readMdx(file)
  return buildDoc(id, body, file, undefined)
}

export async function getSubkind(
  tropeId: string,
  subkindId: string,
): Promise<MdxDoc | null> {
  const file = path.join(
    PACKAGES_DIR,
    `trope-${tropeId}`,
    'src',
    'subkinds',
    `${subkindId}.mdx`,
  )
  if (!(await exists(file))) return null
  const { body } = await readMdx(file)
  return buildDoc(`${tropeId}/${subkindId}`, body, file, undefined)
}

export async function getMember(
  tropeId: string,
  memberId: string,
): Promise<MdxDoc | null> {
  const file = path.join(
    PACKAGES_DIR,
    `trope-${tropeId}`,
    'src',
    'members',
    `${memberId}.mdx`,
  )
  if (!(await exists(file))) return null
  const { body } = await readMdx(file)
  return buildDoc(`${tropeId}/${memberId}`, body, file, undefined)
}

export async function getContent(...slugParts: string[]): Promise<MdxDoc | null> {
  const file = path.join(CONTENT_DIR, ...slugParts) + '.mdx'
  if (!(await exists(file))) return null
  const { frontmatter, body } = await readMdx(file)
  const title = typeof frontmatter.title === 'string' ? frontmatter.title : undefined
  const description =
    typeof frontmatter.description === 'string' ? frontmatter.description : undefined
  return buildDoc(slugParts.join('/'), body, file, description, title)
}

export async function listConceptMetas(): Promise<readonly PackageMeta[]> {
  const ids = await listConceptIds()
  return Promise.all(
    ids.map((id) => readPackageMeta(`concept-${id}`).then((m) => ({ ...m, id }))),
  )
}

export async function listTropeMetas(): Promise<readonly PackageMeta[]> {
  const ids = await listTropeIds()
  return Promise.all(
    ids.map((id) => readPackageMeta(`trope-${id}`).then((m) => ({ ...m, id }))),
  )
}
