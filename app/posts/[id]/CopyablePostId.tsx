'use client'

import { Copy } from 'lucide-react'
import { toast } from 'sonner'

interface CopyablePostIdProps {
  postId: string
}

export function CopyablePostId({ postId }: CopyablePostIdProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(postId)
      toast.success('Skopiowano ID ogłoszenia')
    } catch (err) {
      console.error('Failed to copy:', err)
      toast.error('Nie udało się skopiować')
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full border border-border hover:bg-muted bg-card text-foreground transition-colors text-sm font-medium"
      title="Kopiuj ID ogłoszenia"
    >
      <Copy className="w-4 h-4" />
      <span>Kopiuj ID</span>
    </button>
  )
}
