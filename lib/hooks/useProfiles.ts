'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

interface Profile {
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

// Fetch user profile
export function useProfile(userId: string | null | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['profile', userId],
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

// Fetch current user profile
export function useCurrentUserProfile() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['profile', 'current'],
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

// Update profile mutation
export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({
      userId,
      updates,
    }: {
      userId: string
      updates: Partial<Profile>
    }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error

      return data
    },
    onSuccess: (data, variables) => {
      // Update cache immediately
      queryClient.setQueryData(['profile', variables.userId], data)
      queryClient.invalidateQueries({ queryKey: ['profile', 'current'] })
    },
  })
}

// Upload avatar mutation
export function useUploadAvatar() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({
      userId,
      file,
    }: {
      userId: string
      file: File
    }) => {
      // Upload file to storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update profile with new avatar URL
      const { data, error } = await supabase
        .from('profiles')
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error

      return data
    },
    onSuccess: (data, variables) => {
      // Update cache
      queryClient.setQueryData(['profile', variables.userId], data)
      queryClient.invalidateQueries({ queryKey: ['profile', 'current'] })
    },
  })
}

// Fetch user's posts count
export function useUserPostsCount(userId: string | null | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['user', userId, 'posts-count'],
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

// Fetch user's stats (posts, favorites, etc.)
export function useUserStats(userId: string | null | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['user', userId, 'stats'],
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
      }
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}
