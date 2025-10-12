'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

// Add to favorites via API
export function useAddFavoriteAPI() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId }),
      })

      if (response.status === 401) {
        throw new Error('UNAUTHORIZED')
      }

      if (!response.ok) {
        throw new Error('Failed to add favorite')
      }

      return response.json()
    },
    onMutate: async (postId) => {
      // Optimistic update - add immediately to UI
      await queryClient.cancelQueries({ queryKey: ['favorites'] })

      // We don't know the userId here, so we'll just invalidate after success
      return { postId }
    },
    onSuccess: () => {
      // Invalidate all favorites queries to refetch
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
  })
}

// Remove from favorites via API
export function useRemoveFavoriteAPI() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await fetch('/api/favorites', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId }),
      })

      if (response.status === 401) {
        throw new Error('UNAUTHORIZED')
      }

      if (!response.ok) {
        throw new Error('Failed to remove favorite')
      }

      return response.json()
    },
    onMutate: async (postId) => {
      // Optimistic update - remove immediately from UI
      await queryClient.cancelQueries({ queryKey: ['favorites'] })

      return { postId }
    },
    onSuccess: () => {
      // Invalidate all favorites queries to refetch
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
  })
}

// Toggle favorite via API
export function useToggleFavoriteAPI() {
  const addFavorite = useAddFavoriteAPI()
  const removeFavorite = useRemoveFavoriteAPI()

  return {
    toggleFavorite: async (postId: string, isFavorite: boolean) => {
      if (isFavorite) {
        return removeFavorite.mutateAsync(postId)
      } else {
        return addFavorite.mutateAsync(postId)
      }
    },
    isLoading: addFavorite.isPending || removeFavorite.isPending,
    error: addFavorite.error || removeFavorite.error,
  }
}
