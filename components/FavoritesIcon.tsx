'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import { LottieIcon } from './LottieIcon'
import { motion, AnimatePresence } from 'framer-motion'
import { useFavoritesCount } from '@/lib/hooks/useFavorites'

interface FavoritesIconProps {
  user: User | null
}

export function FavoritesIcon({ user }: FavoritesIconProps) {
  const { data: favoritesCount = 0 } = useFavoritesCount(user?.id)
  const [isHovered, setIsHovered] = useState(false)
  const [hasChanged, setHasChanged] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const prevCountRef = useRef(0)

  // Fix hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Trigger animation when count changes
  useEffect(() => {
    if (isMounted && prevCountRef.current !== favoritesCount && prevCountRef.current !== 0) {
      setHasChanged(true)
      const timer = setTimeout(() => setHasChanged(false), 600)
      return () => clearTimeout(timer)
    }
    prevCountRef.current = favoritesCount
  }, [favoritesCount, isMounted])

  if (!user) {
    return null
  }

  const displayCount = isMounted ? favoritesCount : 0

  return (
    <Link
      href="/dashboard/favorites"
      className="relative inline-flex items-center justify-center h-10 w-10 rounded-full bg-[#C44E35] hover:bg-[#B33D2A] transition-colors"
      aria-label={`Ulubione${displayCount > 0 ? ` (${displayCount})` : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <LottieIcon
        animationPath="/animations/heart-hover.json"
        fallbackSvg={<img src="/icons/heart.svg" alt="Favorites" className="w-full h-full" />}
        className="h-5 w-5"
        isHovered={isHovered}
      />
      <AnimatePresence mode="wait">
        {isMounted && displayCount > 0 && (
          <motion.span
            key={displayCount}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: hasChanged ? [1, 1.3, 1] : 1,
              opacity: 1
            }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{
              duration: hasChanged ? 0.4 : 0.2,
              ease: [0.34, 1.56, 0.64, 1]
            }}
            className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-white text-[#C44E35] text-xs font-bold rounded-full border-2 border-[#C44E35]"
          >
            {displayCount > 99 ? '99+' : displayCount}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  )
}
