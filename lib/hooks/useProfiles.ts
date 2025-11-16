'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import {
  profileQueryOptions,
  currentUserProfileQueryOptions,
  userPostsCountQueryOptions,
  userStatsQueryOptions,
  type Profile,
  type UserStats,
} from './query-options/profiles'

// Re-export types
export type { Profile, UserStats }

// Nowoczesne hooki używające query options factory pattern
export function useProfile(userId: string | null | undefined) {
  return useQuery(profileQueryOptions(userId))
}

export function useCurrentUserProfile() {
  return useQuery(currentUserProfileQueryOptions())
}

// Update profile mutation z optimistic updates
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

      return data as Profile
    },
    // Optimistic update - natychmiast aktualizuje UI
    onMutate: async ({ userId, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['profile', userId] })
      await queryClient.cancelQueries({ queryKey: ['profile', 'current'] })

      const previousProfile = queryClient.getQueryData(['profile', userId])
      const previousCurrentProfile = queryClient.getQueryData(['profile', 'current'])

      // Optimistically update
      queryClient.setQueryData<Profile>(
        ['profile', userId],
        (old) => old ? { ...old, ...updates } : old
      )

      // Jeśli to current user, update też current profile
      const currentUser = queryClient.getQueryData<Profile>(['profile', 'current'])
      if (currentUser?.id === userId) {
        queryClient.setQueryData<Profile>(
          ['profile', 'current'],
          (old) => old ? { ...old, ...updates } : old
        )
      }

      return { previousProfile, previousCurrentProfile, userId }
    },
    onError: (err, variables, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(['profile', context.userId], context.previousProfile)
      }
      if (context?.previousCurrentProfile) {
        queryClient.setQueryData(['profile', 'current'], context.previousCurrentProfile)
      }
    },
    onSuccess: (data, variables) => {
      // Set final data from server
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

// Nowoczesne hooki używające query options
export function useUserPostsCount(userId: string | null | undefined) {
  return useQuery(userPostsCountQueryOptions(userId))
}

export function useUserStats(userId: string | null | undefined) {
  return useQuery(userStatsQueryOptions(userId))
}
