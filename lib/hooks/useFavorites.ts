'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

interface Favorite {
  id: string
  user_id: string
  post_id: string
  created_at: string
}

interface FavoritePost {
  id: string
  post_id: string
  created_at: string
  posts: {
    id: string
    title: string
    description: string
    city: string
    district: string | null
    price: number | null
    price_negotiable: boolean
    price_type: 'hourly' | 'fixed' | 'free' | null
    images: string[] | null
    status: string
    user_id: string
    profiles: {
      full_name: string | null
      avatar_url: string | null
      rating: number
      total_reviews: number
    } | null
    categories: {
      name: string
      slug: string
    } | null
  }
}

// Fetch user's favorite post IDs
export function useFavoriteIds(userId: string | null | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['favorites', 'ids', userId],
    queryFn: async () => {
      if (!userId) return []

      const { data, error } = await supabase
        .from('favorites')
        .select('post_id')
        .eq('user_id', userId)

      if (error) throw error

      return (data || []).map(f => f.post_id)
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Get favorites count
export function useFavoritesCount(userId: string | null | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['favorites', 'count', userId],
    queryFn: async () => {
      if (!userId) return 0

      const { count, error } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      if (error) throw error

      return count || 0
    },
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute
  })
}

// Fetch user's favorite posts with full details
export function useFavorites(userId: string | null | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['favorites', userId],
    queryFn: async () => {
      if (!userId) return []

      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          post_id,
          created_at,
          posts (
            id,
            title,
            description,
            city,
            district,
            price,
            price_negotiable,
            price_type,
            images,
            status,
            user_id,
            profiles:user_id (
              full_name,
              avatar_url,
              rating,
              total_reviews
            ),
            categories (
              name,
              slug
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data as any as FavoritePost[]
    },
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute
  })
}

// Check if post is favorited
export function useIsFavorite(userId: string | null | undefined, postId: string | null) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['favorite', 'check', userId, postId],
    queryFn: async () => {
      if (!userId || !postId) return false

      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('post_id', postId)
        .maybeSingle()

      if (error) throw error

      return !!data
    },
    enabled: !!userId && !!postId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Add to favorites mutation
export function useAddFavorite() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ userId, postId }: { userId: string; postId: string }) => {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: userId, post_id: postId })

      if (error) throw error
    },
    onMutate: async ({ userId, postId }) => {
      // Optimistic update - add to favorites immediately
      await queryClient.cancelQueries({ queryKey: ['favorites', 'ids', userId] })

      const previousIds = queryClient.getQueryData<string[]>(['favorites', 'ids', userId])

      queryClient.setQueryData<string[]>(['favorites', 'ids', userId], (old = []) => {
        return old.includes(postId) ? old : [...old, postId]
      })

      return { previousIds }
    },
    onError: (err, { userId }, context) => {
      // Rollback on error
      if (context?.previousIds) {
        queryClient.setQueryData(['favorites', 'ids', userId], context.previousIds)
      }
    },
    onSuccess: (_, { userId }) => {
      // Invalidate to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['favorites', userId] })
      queryClient.invalidateQueries({ queryKey: ['favorites', 'ids', userId] })
      queryClient.invalidateQueries({ queryKey: ['favorites', 'count', userId] })
    },
  })
}

// Remove from favorites mutation
export function useRemoveFavorite() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ userId, postId }: { userId: string; postId: string }) => {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('post_id', postId)

      if (error) throw error
    },
    onMutate: async ({ userId, postId }) => {
      // Optimistic update - remove from favorites immediately
      await queryClient.cancelQueries({ queryKey: ['favorites', 'ids', userId] })

      const previousIds = queryClient.getQueryData<string[]>(['favorites', 'ids', userId])

      queryClient.setQueryData<string[]>(['favorites', 'ids', userId], (old = []) => {
        return old.filter(id => id !== postId)
      })

      return { previousIds }
    },
    onError: (err, { userId }, context) => {
      // Rollback on error
      if (context?.previousIds) {
        queryClient.setQueryData(['favorites', 'ids', userId], context.previousIds)
      }
    },
    onSuccess: (_, { userId }) => {
      // Invalidate to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['favorites', userId] })
      queryClient.invalidateQueries({ queryKey: ['favorites', 'ids', userId] })
      queryClient.invalidateQueries({ queryKey: ['favorites', 'count', userId] })
    },
  })
}

// Toggle favorite (add or remove)
export function useToggleFavorite() {
  const addFavorite = useAddFavorite()
  const removeFavorite = useRemoveFavorite()

  return {
    toggleFavorite: async (userId: string, postId: string, isFavorite: boolean) => {
      if (isFavorite) {
        return removeFavorite.mutateAsync({ userId, postId })
      } else {
        return addFavorite.mutateAsync({ userId, postId })
      }
    },
    isLoading: addFavorite.isPending || removeFavorite.isPending,
  }
}
