'use client'

import { useState } from 'react'

interface CopyButtonProps {
  readonly text: string
  readonly className?: string
  readonly children?: React.ReactNode
  readonly idleLabel?: string
  readonly copiedLabel?: string
}

export function CopyButton({
  text,
  className = 'lx-cmd-copy',
  children,
  idleLabel = 'copy',
  copiedLabel = 'copied',
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    } catch {}
  }

  return (
    <button className={className} onClick={onClick} aria-label="Copy to clipboard">
      {children}
      <span className="lx-copy-tag">{copied ? copiedLabel : idleLabel}</span>
    </button>
  )
}
