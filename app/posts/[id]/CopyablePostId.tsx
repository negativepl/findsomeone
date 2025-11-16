'use client'

import { Copy, Check, X } from 'lucide-react'
import { useButtonFeedback } from '@/lib/hooks/useButtonFeedback'
import { motion, AnimatePresence } from 'framer-motion'

interface CopyablePostIdProps {
  postId: string
}

export function CopyablePostId({ postId }: CopyablePostIdProps) {
  const { state, triggerSuccess, triggerError } = useButtonFeedback()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(postId)
      triggerSuccess()
    } catch (err) {
      console.error('Failed to copy:', err)
      triggerError()
    }
  }

  // Ikona zmienia się w zależności od stanu
  const Icon = state === 'success' ? Check : state === 'error' ? X : Copy

  // Tekst zmienia się w zależności od stanu
  const text = state === 'success' ? 'Skopiowano!' : state === 'error' ? 'Błąd' : 'Kopiuj ID'

  return (
    <motion.button
      onClick={handleCopy}
      className="relative inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full border border-border bg-muted hover:bg-accent text-foreground text-sm font-medium transition-all duration-200"
      style={{
        minWidth: state === 'success' ? '130px' : '100px',
      }}
      title={state === 'idle' ? 'Kopiuj ID ogłoszenia' : undefined}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.15 }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={state}
          className="flex items-center gap-1.5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            animate={{
              scale: state !== 'idle' ? [1, 1.2, 1] : 1,
              rotate: state === 'success' ? [0, -10, 0] : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            <Icon className="w-4 h-4" />
          </motion.div>
          <span className="whitespace-nowrap">{text}</span>
        </motion.div>
      </AnimatePresence>
    </motion.button>
  )
}
