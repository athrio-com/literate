import Link from 'next/link'

export const metadata = {
  title: 'Not found',
}

export default function DocsNotFound() {
  return (
    <>
      <div className="lf-breadcrumbs">
        <Link href="/docs">Docs</Link>
        <span className="lf-crumb-sep"> › </span>
        <span className="is-current">Not found</span>
      </div>
      <h1 className="lf-h1">Page not found</h1>
      <p className="lf-deck">
        No docs page matches this slug. Pick one from the sidebar.
      </p>
      <p>
        Or try the <Link href="/docs">overview</Link>, the{' '}
        <Link href="/docs/getting-started">getting-started guide</Link>, or the{' '}
        <Link href="/docs/algebra">three-level algebra</Link>.
      </p>
    </>
  )
}
