'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { IS_DEV, useDev } from './dev-context'

interface TropeRegionProps {
  readonly idx: string
  readonly label?: string
  readonly core?: boolean
  readonly className?: string
  readonly as?: 'div' | 'section' | 'article' | 'aside' | 'header' | 'footer' | 'main' | 'nav'
  readonly children: ReactNode
}

export function TropeRegion({
  idx,
  label,
  core = false,
  className,
  as: Tag = 'div',
  children,
}: TropeRegionProps) {
  const { register, unregister, disabled } = useDev()

  useEffect(() => {
    register(label !== undefined ? { idx, label, core } : { idx, core })
    return () => unregister(idx)
  }, [idx, label, core, register, unregister])

  const isDisabled = !core && disabled.has(idx)

  if (isDisabled) return null

  return (
    <Tag className={className} data-idx={idx} data-trope-region={core ? 'core' : 'opt'}>
      {children}
      {IS_DEV && <IdxBadge idx={idx} core={core} />}
    </Tag>
  )
}

function IdxBadge({ idx, core }: { idx: string; core: boolean }) {
  const [copied, setCopied] = useState(false)

  const onCopy = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(idx)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {}
  }

  return (
    <button
      type="button"
      className="lf-dev-idx"
      data-core={core ? 'true' : 'false'}
      onClick={onCopy}
      title={`Copy idx: ${idx}${core ? ' (core)' : ''}`}
      aria-label={`Copy idx ${idx}`}
    >
      <CopyGlyph />
      <span className="lf-dev-idx-text">{copied ? 'copied' : `copy idx: ${idx}`}</span>
    </button>
  )
}

function CopyGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5.5 2.5h6a1 1 0 0 1 1 1v8M3.5 5.5h6a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1Z"
      />
    </svg>
  )
}
