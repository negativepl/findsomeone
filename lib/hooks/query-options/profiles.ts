'use client'

import { queryOptions } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  bio: string | null
  city: string | null
  rating: number
  created_at: string
  updated_at: string
}

export interface UserStats {
  postsCount: number
  favoritesCount: number
  messagesCount: number
}

// Query options dla user profile
export const profileQueryOptions = (userId: string | null | undefined) => {
  const supabase = createClient()

  return queryOptions({
    queryKey: ['profile', userId] as const,
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required')

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error

      return data as Profile
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Query options dla current user profile
export const currentUserProfileQueryOptions = () => {
  const supabase = createClient()

  return queryOptions({
    queryKey: ['profile', 'current'] as const,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return null

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      return data as Profile
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Query options dla user posts count
export const userPostsCountQueryOptions = (userId: string | null | undefined) => {
  const supabase = createClient()

  return queryOptions({
    queryKey: ['user', userId, 'posts-count'] as const,
    queryFn: async () => {
      if (!userId) return 0

      const { count, error } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'active')

      if (error) throw error

      return count || 0
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Query options dla user stats
export const userStatsQueryOptions = (userId: string | null | undefined) => {
  const supabase = createClient()

  return queryOptions({
    queryKey: ['user', userId, 'stats'] as const,
    queryFn: async () => {
      if (!userId) {
        return { postsCount: 0, favoritesCount: 0, messagesCount: 0 }
      }

      const [postsResult, favoritesResult, messagesResult] = await Promise.all([
        supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('status', 'active'),
        supabase
          .from('favorites')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId),
        supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`),
      ])

      return {
        postsCount: postsResult.count || 0,
        favoritesCount: favoritesResult.count || 0,
        messagesCount: messagesResult.count || 0,
      } as UserStats
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}
