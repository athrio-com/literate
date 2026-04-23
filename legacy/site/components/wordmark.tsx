import Link from 'next/link'
import { SITE } from '@/lib/site-config'

interface WordmarkProps {
  showVersion?: boolean
  href?: string
}

/**
 * The LF wordmark: italic serif § as a typographic mark, plus "literate"
 * in sans, plus an optional version pill. Change the mark glyph or
 * version in lib/site-config.ts.
 */
export function Wordmark({ showVersion = true, href = '/' }: WordmarkProps) {
  return (
    <Link className="lf-wordmark" href={href} aria-label={`${SITE.name} home`}>
      <span className="lf-wordmark-mark" aria-hidden>{SITE.mark}</span>
      <span className="lf-wordmark-text">{SITE.name}</span>
      {showVersion ? <span className="lf-wordmark-ver">v{SITE.version}</span> : null}
    </Link>
  )
}
