import { MDXRemote } from 'next-mdx-remote/rsc'
import { getContent } from '@/lib/source'

export const metadata = {
  title: 'Docs — Literate Framework',
}

export default async function DocsHomePage() {
  const doc = await getContent('overview')
  if (!doc) {
    return (
      <>
        <h1>Docs</h1>
        <p>Overview content missing — see <code>site/content/overview.mdx</code>.</p>
      </>
    )
  }
  return (
    <>
      <p className="breadcrumb">Docs</p>
      <MDXRemote source={doc.body} />
    </>
  )
}
