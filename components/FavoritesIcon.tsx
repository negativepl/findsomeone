'use client'

import { Heart } from 'lucide-react'
import Link from 'next/link'
import { User } from '@supabase/supabase-js'

interface FavoritesIconProps {
  user: User | null
}

export function FavoritesIcon({ user }: FavoritesIconProps) {
  if (!user) {
    return null
  }

  return (
    <Link
      href="/dashboard/favorites"
      className="relative inline-flex items-center justify-center h-10 w-10 rounded-full bg-[#C44E35] hover:bg-[#B33D2A] transition-colors"
      aria-label="Ulubione"
    >
      <Heart className="h-5 w-5 text-white" />
    </Link>
  )
}
