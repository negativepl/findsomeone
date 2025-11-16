'use client'

import { queryOptions, infiniteQueryOptions } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export interface Post {
  id: string
  title: string
  description: string

  city: string
  district: string | null
  price: number | null
  price_type: 'hourly' | 'fixed' | 'negotiable' | null
  images: string[] | null
  status: string
  created_at: string
  user_id: string
  category_id: string | null
  profiles: {
    full_name: string | null
    avatar_url: string | null
    rating: number
  } | null
  categories: {
    name: string
    slug: string
  } | null
}

interface PostsFilters {
  search?: string
  city?: string
  category?: string
  type?: string
  userId?: string
  status?: string
}

// Query options factory pattern - reusable i type-safe
export const postsQueryOptions = (filters: PostsFilters = {}) => {
  const supabase = createClient()

  return queryOptions({
    queryKey: ['posts', filters] as const,
    queryFn: async () => {
      const { search, city, category, type, userId, status = 'active' } = filters

      // Use full-text search if search query exists
      if (search && search.trim().length >= 2) {
        const { data: searchResults, error } = await supabase
          .rpc('search_posts', {
            search_query: search.trim(),
            limit_count: 50
          })

        if (error) throw error

        // Apply additional filters
        let filteredResults = searchResults || []

        if (city) {
          filteredResults = filteredResults.filter((post: any) =>
            post.city?.toLowerCase().includes(city.toLowerCase()) ||
            post.district?.toLowerCase().includes(city.toLowerCase())
          )
        }

        if (category) {
          filteredResults = filteredResults.filter((post: any) =>
            post.category_name?.toLowerCase().includes(category.toLowerCase())
          )
        }

        if (type) {
          filteredResults = filteredResults.filter((post: any) => post.type === type)
        }

        // Map search results to Post format
        return filteredResults.map((result: any) => ({
          id: result.id,
          title: result.title,
          description: result.description,
          type: result.type,
          city: result.city,
          district: result.district,
          price: result.price,
          price_type: result.price_type,
          images: result.images,
          status: result.status,
          created_at: result.created_at,
          user_id: result.user_id,
          category_id: result.category_id,
          profiles: {
            full_name: result.user_full_name,
            avatar_url: result.user_avatar_url,
            rating: result.user_rating,
          },
          categories: result.category_name ? {
            name: result.category_name,
            slug: result.category_slug || '',
          } : null,
        }))
      }

      // Regular query without search
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url,
            rating
          ),
          categories (
            name,
            slug
          )
        `)
        .eq('status', status)

      if (city) {
        query = query.or(`city.ilike.%${city}%,district.ilike.%${city}%`)
      }

      if (category) {
        // Try to find category by name
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id')
          .ilike('name', category)
          .single()

        let categoryId = categoryData?.id

        // If not found by name, try synonym
        if (!categoryId) {
          const { data: categorySynonym } = await supabase
            .from('category_synonyms')
            .select('category_id')
            .ilike('synonym', category)
            .limit(1)
            .single()

          categoryId = categorySynonym?.category_id
        }

        if (categoryId) {
          query = query.eq('category_id', categoryId)
        }
      }

      if (type) {
        query = query.eq('type', type)
      }

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      return data as Post[]
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Single post query options
export const postQueryOptions = (postId: string | null) => {
  const supabase = createClient()

  return queryOptions({
    queryKey: ['post', postId] as const,
    queryFn: async () => {
      if (!postId) throw new Error('Post ID is required')

      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            avatar_url,
            rating,
            created_at
          ),
          categories (
            name,
            slug
          )
        `)
        .eq('id', postId)
        .single()

      if (error) throw error

      return data as Post & {
        profiles: {
          id: string
          full_name: string | null
          avatar_url: string | null
          rating: number
          created_at: string
        } | null
      }
    },
    enabled: !!postId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Infinite query dla paginacji - nowoczesne podejście do infinite scroll
export const postsInfiniteQueryOptions = (filters: Omit<PostsFilters, 'status'> = {}) => {
  const supabase = createClient()

  return infiniteQueryOptions({
    queryKey: ['posts', 'infinite', filters] as const,
    queryFn: async ({ pageParam = 0 }) => {
      const { search, city, category, type, userId } = filters
      const pageSize = 20

      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url,
            rating
          ),
          categories (
            name,
            slug
          )
        `, { count: 'exact' })
        .eq('status', 'active')

      if (city) {
        query = query.or(`city.ilike.%${city}%,district.ilike.%${city}%`)
      }

      if (category) {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id')
          .ilike('name', category)
          .single()

        let categoryId = categoryData?.id

        if (!categoryId) {
          const { data: categorySynonym } = await supabase
            .from('category_synonyms')
            .select('category_id')
            .ilike('synonym', category)
            .limit(1)
            .single()

          categoryId = categorySynonym?.category_id
        }

        if (categoryId) {
          query = query.eq('category_id', categoryId)
        }
      }

      if (type) {
        query = query.eq('type', type)
      }

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(pageParam * pageSize, (pageParam + 1) * pageSize - 1)

      if (error) throw error

      return {
        posts: data as Post[],
        nextPage: data.length === pageSize ? pageParam + 1 : undefined,
        totalCount: count || 0,
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}
