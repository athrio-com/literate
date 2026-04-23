import { MDXRemote } from 'next-mdx-remote/rsc'
import { getContent } from '@/lib/source'
import { mdxComponents } from '@/components/mdx-components'

export const metadata = {
  title: 'Docs',
}

export default async function DocsHomePage() {
  const doc = await getContent('overview')
  if (!doc) {
    return (
      <>
        <h1 className="lf-h1">Docs</h1>
        <p>Overview content missing — see <code>site/content/overview.mdx</code>.</p>
      </>
    )
  }
  return (
    <>
      <div className="lf-breadcrumbs">
        <span className="is-current">Docs</span>
      </div>
      <MDXRemote source={doc.body} components={mdxComponents} />
    </>
  )
}
