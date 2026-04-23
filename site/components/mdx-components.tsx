import Link from 'next/link'
import type { MDXRemoteProps } from 'next-mdx-remote/rsc'
import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from 'react'

/**
 * Slug an inline heading's children text so the right-rail TOC can link
 * into it. Matches rehype-slug's default behaviour closely enough for
 * our content: lowercase, dash-separated, non-alphanumerics stripped.
 */
function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-{2,}/g, '-')
}

function textFromChildren(children: ReactNode): string {
  if (children == null) return ''
  if (typeof children === 'string' || typeof children === 'number') return String(children)
  if (Array.isArray(children)) return children.map(textFromChildren).join('')
  if (typeof children === 'object' && 'props' in (children as { props?: unknown })) {
    const props = (children as { props?: { children?: ReactNode } }).props
    return textFromChildren(props?.children)
  }
  return ''
}

function headingWithId(level: 2 | 3) {
  const Tag = (level === 2 ? 'h2' : 'h3') as 'h2' | 'h3'
  const className = level === 2 ? 'lf-h2' : 'lf-h3'
  const Heading = ({ children, id, ...rest }: HTMLAttributes<HTMLHeadingElement>) => {
    const resolvedId = id ?? toSlug(textFromChildren(children))
    return (
      <Tag id={resolvedId} className={className} {...rest}>
        {children}
      </Tag>
    )
  }
  Heading.displayName = `H${level}`
  return Heading
}

function SmartLink({ href, children, className, title }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (!href) return <a className={className} title={title}>{children}</a>
  if (/^https?:/.test(href)) {
    return (
      <a href={href} className={className} title={title} target="_blank" rel="noreferrer">
        {children}
      </a>
    )
  }
  if (href.startsWith('#')) {
    return <a href={href} className={className} title={title}>{children}</a>
  }
  return <Link href={href} className={className} title={title}>{children}</Link>
}

export const mdxComponents: MDXRemoteProps['components'] = {
  h1: (props) => <h1 className="lf-h1" {...props} />,
  h2: headingWithId(2),
  h3: headingWithId(3),
  a: SmartLink,
  blockquote: (props) => <blockquote className="lf-blockquote" {...props} />,
}
