'use client'

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import {
  postsQueryOptions,
  postQueryOptions,
  postsInfiniteQueryOptions,
  type Post,
} from './query-options/posts'

// Re-export types for convenience
export type { Post }

interface PostsFilters {
  search?: string
  city?: string
  category?: string
  type?: string
  userId?: string
  status?: string
}

// Nowoczesne podejście: używamy query options factory pattern
// Korzyści:
// 1. Reusable - możemy użyć tych samych options w różnych miejscach
// 2. Type-safe - TypeScript wie dokładnie jaki typ zwraca query
// 3. Testowalne - łatwiejsze testowanie
// 4. Cacheable - queryKey i queryFn są spójne

export function usePosts(filters: PostsFilters = {}) {
  return useQuery(postsQueryOptions(filters))
}

export function usePost(postId: string | null) {
  return useQuery(postQueryOptions(postId))
}

// Nowy hook: Infinite Query dla paginacji/infinite scroll
// Zastępuje stare podejście z useEffect i manual pagination
export function usePostsInfinite(filters: Omit<PostsFilters, 'status'> = {}) {
  return useInfiniteQuery(postsInfiniteQueryOptions(filters))
}

// Delete post mutation z optimistic updates
export function useDeletePost() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)

      if (error) throw error
      return postId
    },
    // Optimistic update - natychmiast usuwa post z UI przed response z serwera
    onMutate: async (postId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['posts'] })
      await queryClient.cancelQueries({ queryKey: ['post', postId] })

      // Snapshot poprzedniego stanu (na wypadek rollback)
      const previousPosts = queryClient.getQueriesData({ queryKey: ['posts'] })
      const previousPost = queryClient.getQueryData(['post', postId])

      // Optimistically update cache - usuń post
      queryClient.setQueriesData<Post[]>(
        { queryKey: ['posts'] },
        (old) => old?.filter((post) => post.id !== postId)
      )

      // Return context dla rollback
      return { previousPosts, previousPost }
    },
    // Jeśli mutacja się nie powiedzie, rollback
    onError: (err, postId, context) => {
      if (context?.previousPosts) {
        context.previousPosts.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      if (context?.previousPost) {
        queryClient.setQueryData(['post', postId], context.previousPost)
      }
    },
    // Zawsze refetch po zakończeniu (success lub error)
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}

// Update post status mutation z optimistic updates
export function useUpdatePostStatus() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ postId, status }: { postId: string; status: string }) => {
      const { data, error } = await supabase
        .from('posts')
        .update({ status })
        .eq('id', postId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    // Optimistic update
    onMutate: async ({ postId, status }) => {
      await queryClient.cancelQueries({ queryKey: ['posts'] })
      await queryClient.cancelQueries({ queryKey: ['post', postId] })

      const previousPosts = queryClient.getQueriesData({ queryKey: ['posts'] })
      const previousPost = queryClient.getQueryData(['post', postId])

      // Optimistically update status
      queryClient.setQueriesData<Post[]>(
        { queryKey: ['posts'] },
        (old) =>
          old?.map((post) =>
            post.id === postId ? { ...post, status } : post
          )
      )

      queryClient.setQueryData<Post>(
        ['post', postId],
        (old) => old ? { ...old, status } : old
      )

      return { previousPosts, previousPost }
    },
    onError: (err, { postId }, context) => {
      if (context?.previousPosts) {
        context.previousPosts.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      if (context?.previousPost) {
        queryClient.setQueryData(['post', postId], context.previousPost)
      }
    },
    onSettled: (_, __, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] })
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}
