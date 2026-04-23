import Link from 'next/link'

export const metadata = {
  title: 'Not found',
}

export default function NotFound() {
  return (
    <main className="lf-main">
      <article className="lf-prose">
        <div className="lf-breadcrumbs">
          <Link href="/">Home</Link>
          <span className="lf-crumb-sep"> › </span>
          <span className="is-current">Not found</span>
        </div>
        <h1 className="lf-h1">Page not found</h1>
        <p className="lf-deck">
          The page you requested doesn’t exist — it may have been
          renamed or the link you followed is outdated.
        </p>
        <p>
          Try the <Link href="/docs">docs overview</Link> or the{' '}
          <Link href="/docs/algebra">three-level algebra</Link>.
        </p>
      </article>
    </main>
  )
}
