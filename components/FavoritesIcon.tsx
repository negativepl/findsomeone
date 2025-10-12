'use client'

import { Heart } from 'lucide-react'
import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import { useFavoriteIds } from '@/lib/hooks/useFavorites'

interface FavoritesIconProps {
  user: User | null
}

export function FavoritesIcon({ user }: FavoritesIconProps) {
  const { data: favoriteIds = [] } = useFavoriteIds(user?.id)
  const favoritesCount = favoriteIds.length

  if (!user) {
    return null
  }

  return (
    <Link
      href="/dashboard/favorites"
      className="relative inline-flex items-center justify-center h-10 w-10 rounded-full bg-[#C44E35] hover:bg-[#B33D2A] transition-colors"
      aria-label={`Ulubione${favoritesCount > 0 ? ` (${favoritesCount})` : ''}`}
    >
      <Heart className="h-5 w-5 text-white" />
      {favoritesCount > 0 && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-white text-[#C44E35] text-xs font-bold rounded-full border-2 border-[#C44E35]">
          {favoritesCount > 99 ? '99+' : favoritesCount}
        </span>
      )}
    </Link>
  )
}
