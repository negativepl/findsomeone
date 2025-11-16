'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import { motion, AnimatePresence } from 'framer-motion'
import { useFavoritesCount } from '@/lib/hooks/useFavorites'

interface FavoritesIconProps {
  user: User | null
}

export function FavoritesIcon({ user }: FavoritesIconProps) {
  const { data: favoritesCount = 0 } = useFavoritesCount(user?.id)
  const [hasChanged, setHasChanged] = useState(false)
  const [isFirstRender, setIsFirstRender] = useState(true)
  const prevCountRef = useRef(0)

  // Mark first render as complete
  useEffect(() => {
    setIsFirstRender(false)
  }, [])

  // Trigger animation when count changes
  useEffect(() => {
    if (prevCountRef.current !== favoritesCount && prevCountRef.current !== 0) {
      setHasChanged(true)
      const timer = setTimeout(() => setHasChanged(false), 600)
      return () => clearTimeout(timer)
    }
    prevCountRef.current = favoritesCount
  }, [favoritesCount])

  if (!user) {
    return null
  }

  const displayCount = favoritesCount

  return (
    <Link
      href="/dashboard/favorites"
      className="relative inline-flex items-center justify-center h-10 w-10 rounded-full bg-brand hover:bg-brand/90 transition-colors text-brand-foreground"
    >
      <span className="sr-only">Ulubione{displayCount > 0 ? ` (${displayCount})` : ''}</span>
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill="currentColor" d="M12.595 5.094a5.877 5.877 0 0 1 8.433 8.184l-7.79 7.795a1.75 1.75 0 0 1-2.475 0L2.97 13.28a1 1 0 0 1-.06-.068A5.877 5.877 0 1 1 12 5.789q.265-.366.595-.695m7.25 1.06a4.376 4.376 0 0 0-7.15 1.446.75.75 0 0 1-1.39 0 4.377 4.377 0 1 0-7.23 4.663l7.748 7.75.02.017a.25.25 0 0 0 .334-.017l7.779-7.784a4.376 4.376 0 0 0-.111-6.074"/>
      </svg>
      <AnimatePresence mode="wait">
        {displayCount > 0 && (
          <motion.span
            key={displayCount}
            initial={isFirstRender ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
            animate={{
              scale: hasChanged ? [1, 1.3, 1] : 1,
              opacity: 1
            }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{
              duration: hasChanged ? 0.4 : 0.2,
              ease: [0.34, 1.56, 0.64, 1]
            }}
            className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-background text-brand text-xs font-bold rounded-full border border-brand"
          >
            {displayCount > 99 ? '99+' : displayCount}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  )
}
