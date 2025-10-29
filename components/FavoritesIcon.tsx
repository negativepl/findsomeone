'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { LottieIcon } from './LottieIcon'

interface FavoritesIconProps {
  user: User | null
}

export function FavoritesIcon({ user }: FavoritesIconProps) {
  const [favoritesCount, setFavoritesCount] = useState(0)
  const [isHydrated, setIsHydrated] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    // Load cached count after hydration
    if (user && typeof window !== 'undefined') {
      const cached = localStorage.getItem(`favorites_count_${user.id}`)
      if (cached) {
        setFavoritesCount(parseInt(cached, 10))
      }
      setIsHydrated(true)
    }
  }, [user])

  useEffect(() => {
    if (!user || !isHydrated) return

    const supabase = createClient()

    // Fetch initial count
    const fetchFavoritesCount = async () => {
      const { count } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      const newCount = count || 0
      setFavoritesCount(newCount)
      // Cache the count in localStorage
      localStorage.setItem(`favorites_count_${user.id}`, newCount.toString())
    }

    fetchFavoritesCount()

    // Subscribe to real-time changes
    const channel = supabase
      .channel('favorites-count')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'favorites',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchFavoritesCount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id, isHydrated])

  if (!user) {
    return null
  }

  return (
    <Link
      href="/dashboard/favorites"
      className="relative inline-flex items-center justify-center h-10 w-10 rounded-full bg-[#C44E35] hover:bg-[#B33D2A] transition-colors"
      aria-label={`Ulubione${favoritesCount > 0 ? ` (${favoritesCount})` : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <LottieIcon
        animationPath="/animations/heart-hover.json"
        fallbackSvg={<img src="/icons/heart.svg" alt="Favorites" className="w-full h-full" />}
        className="h-5 w-5"
        isHovered={isHovered}
      />
      {favoritesCount > 0 && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-white text-[#C44E35] text-xs font-bold rounded-full border-2 border-[#C44E35]">
          {favoritesCount > 99 ? '99+' : favoritesCount}
        </span>
      )}
    </Link>
  )
}
