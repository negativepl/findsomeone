'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface TextFlipProps {
  words: string[]
  interval?: number
  className?: string
  textClassName?: string
  animationDuration?: number
  onWordChange?: (index: number) => void
}

export function TextFlip({
  words,
  interval = 3000,
  className,
  textClassName,
  animationDuration = 0.5,
  onWordChange,
}: TextFlipProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length)
    }, interval)

    return () => clearInterval(timer)
  }, [words.length, interval])

  useEffect(() => {
    if (onWordChange) {
      onWordChange(currentIndex)
    }
  }, [currentIndex, onWordChange])

  return (
    <span className={cn('inline-block relative', className)}>
      <AnimatePresence mode="wait">
        <motion.span
          key={currentIndex}
          initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -30, filter: 'blur(8px)' }}
          transition={{
            duration: animationDuration,
            ease: [0.4, 0, 0.2, 1]
          }}
          className={cn('inline-block whitespace-nowrap', textClassName)}
        >
          {words[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
