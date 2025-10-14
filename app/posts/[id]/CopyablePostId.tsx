'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface CopyablePostIdProps {
  postId: string
}

export function CopyablePostId({ postId }: CopyablePostIdProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(postId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-black/10 hover:bg-black/5 hover:border-black/30 text-black/60 hover:text-black transition-colors text-[10px] sm:text-sm font-medium"
      title="Kopiuj ID ogłoszenia"
    >
      {copied ? (
        <>
          <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
          <span className="text-green-600">Skopiowano</span>
        </>
      ) : (
        <>
          <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>Kopiuj ID</span>
        </>
      )}
    </button>
  )
}
