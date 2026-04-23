import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import {
  getConcept,
  getContent,
  getMember,
  getSubkind,
  getTrope,
  stripTitle,
  type MdxDoc,
} from '@/lib/source'
import { TOPICS, findTopic, type SectionSource } from '@/lib/topics'
import { mdxComponents } from '@/components/mdx-components'

interface DocPageProps {
  params: Promise<{ slug: string[] }>
}

const CLI_SLUGS = ['init', 'add-trope', 'compile', 'check', 'version', 'manifest'] as const
const ALGEBRA_SUB_SLUGS = ['subkinds', 'members', 'authored'] as const
const TOP_PAGES = ['getting-started', 'algebra'] as const

export async function generateStaticParams() {
  const params: { slug: string[] }[] = []
  for (const t of TOPICS) params.push({ slug: [t.slug] })
  for (const sub of ALGEBRA_SUB_SLUGS) params.push({ slug: ['algebra', sub] })
  for (const verb of CLI_SLUGS) params.push({ slug: ['cli', verb] })
  for (const slug of TOP_PAGES) params.push({ slug: [slug] })
  return params
}

async function loadSection(source: SectionSource): Promise<MdxDoc | null> {
  switch (source.kind) {
    case 'content':
      return getContent(...source.slug)
    case 'concept':
      return getConcept(source.id)
    case 'trope':
      return getTrope(source.id)
    case 'subkind':
      return getSubkind(source.tropeId, source.subkindId)
    case 'member':
      return getMember(source.tropeId, source.memberId)
  }
}

function relSourcePath(absolute: string): string {
  const idx = absolute.indexOf('/literate/')
  return idx >= 0 ? absolute.slice(idx + '/literate/'.length) : absolute
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-{2,}/g, '-')
}

export async function generateMetadata({ params }: DocPageProps) {
  const { slug } = await params
  const topic = slug.length === 1 ? findTopic(slug[0]!) : undefined
  if (topic) {
    return { title: topic.title, description: topic.description }
  }
  const doc = await getContent(...slug)
  if (doc) {
    return {
      title: doc.title,
      ...(doc.description ? { description: doc.description } : {}),
    }
  }
  return { title: 'Not found' }
}

function Breadcrumbs({ slug }: { slug: string[] }) {
  const hrefs = ['/docs', ...slug.map((_, i) => `/docs/${slug.slice(0, i + 1).join('/')}`)]
  const labels = ['Docs', ...slug.map((s) => s.replace(/-/g, ' '))]
  return (
    <div className="lf-breadcrumbs">
      {labels.map((p, i) => {
        const last = i === labels.length - 1
        return (
          <span key={`${i}-${p}`}>
            {last ? (
              <span className="is-current">{p}</span>
            ) : (
              <Link href={hrefs[i]!}>{p}</Link>
            )}
            {!last ? <span className="lf-crumb-sep"> › </span> : null}
          </span>
        )
      })}
    </div>
  )
}

export default async function DocPage({ params }: DocPageProps) {
  const { slug } = await params

  if (slug.length === 1) {
    const topic = findTopic(slug[0]!)
    if (topic) {
      const intro = topic.intro ? await loadSection(topic.intro) : null
      const sections = await Promise.all(
        topic.sections.map(async (s) => ({
          heading: s.heading,
          doc: await loadSection(s.source),
        })),
      )
      return (
        <>
          <Breadcrumbs slug={slug} />
          <h1 className="lf-h1">{topic.title}</h1>
          <p className="lf-deck">{topic.description}</p>
          {intro ? (
            <MDXRemote source={stripTitle(intro.body)} components={mdxComponents} />
          ) : null}
          {sections.map((s, i) =>
            s.doc ? (
              <section key={i} className="lf-section-divider">
                <h2 id={slugify(s.heading)} className="lf-h2">{s.heading}</h2>
                <MDXRemote source={stripTitle(s.doc.body)} components={mdxComponents} />
                <p className="lf-source-attr">
                  Source: <code>{relSourcePath(s.doc.sourcePath)}</code>
                </p>
              </section>
            ) : null,
          )}
        </>
      )
    }
  }

  const doc = await getContent(...slug)
  if (!doc) notFound()
  return (
    <>
      <Breadcrumbs slug={slug} />
      <MDXRemote source={doc.body} components={mdxComponents} />
    </>
  )
}
