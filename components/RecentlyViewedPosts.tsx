'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FavoriteButtonWrapper } from '@/components/FavoriteButtonWrapper'
import { RatingDisplay } from '@/components/RatingDisplay'
import { ScrollArrows } from '@/components/ScrollArrows'
import { ScrollGradients } from '@/components/ScrollGradients'
import { ScrollIndicator } from '@/components/ScrollIndicator'
import { PostCard } from '@/components/PostCard'
import { createClient } from '@/lib/supabase/client'

interface RecentlyViewedPostsProps {
  userFavorites: string[]
  userId?: string
}

export function RecentlyViewedPosts({ userFavorites, userId }: RecentlyViewedPostsProps) {
  const [posts, setPosts] = useState<any[]>([])

  useEffect(() => {
    const fetchRecentlyViewedPosts = async () => {
      // Get recently viewed post IDs from localStorage
      const recentlyViewedKey = 'recently_viewed_posts'
      const recentlyViewed = JSON.parse(localStorage.getItem(recentlyViewedKey) || '[]')

      if (recentlyViewed.length === 0) {
        return
      }

      const supabase = createClient()

      // Fetch posts data
      const { data: postsData } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url,
            rating,
            total_reviews
          ),
          categories (
            name
          )
        `)
        .in('id', recentlyViewed)
        .eq('status', 'active')
        .eq('is_deleted', false)

      if (postsData) {
        // Sort posts by the order they appear in recentlyViewed array
        const sortedPosts = recentlyViewed
          .map((id: string) => postsData.find((post: any) => post.id === id))
          .filter((post: any) => post !== undefined)

        setPosts(sortedPosts)
      }
    }

    fetchRecentlyViewedPosts()
  }, [])

  // Don't show anything if there are no posts
  if (posts.length === 0) {
    return null
  }

  return (
    <section className="container mx-auto px-6 py-6 md:py-14">
      {/* Mobile: flat design */}
      <div className="md:hidden">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-foreground mb-2">Ostatnio wyświetlane</h3>
          <p className="text-sm text-muted-foreground">Ostatnio przeglądane ogłoszenia</p>
        </div>

        <div className="relative -mx-6">
          {posts.length > 1 && (
            <ScrollGradients containerId="recently-viewed-scroll-mobile" />
          )}

          <div id="recently-viewed-scroll-mobile" className="overflow-x-auto overflow-y-visible scrollbar-hide snap-x snap-mandatory w-full">
            <div className="horizontal-scroll-padding-mobile flex gap-4 pb-2">
              {posts.map((post: any) => (
                <PostCard
                  key={post.id}
                  post={post}
                  isFavorite={userFavorites.includes(post.id)}
                />
              ))}
            </div>
          </div>
          {posts.length > 1 && (
            <ScrollIndicator containerId="recently-viewed-scroll-mobile" />
          )}
        </div>
      </div>

      {/* Desktop: card design */}
      <div className="hidden md:block bg-card border border-border rounded-3xl p-8 group/section overflow-visible">
        <div className="mb-12">
          <h3 className="text-4xl font-bold text-foreground mb-2">Ostatnio wyświetlane</h3>
          <p className="text-lg text-muted-foreground">Ostatnio przeglądane ogłoszenia</p>
        </div>

        <div className="relative -mx-8">
          {posts.length > 1 && (
            <>
              <ScrollArrows containerId="recently-viewed-scroll-desktop" />
              <ScrollGradients containerId="recently-viewed-scroll-desktop" />
            </>
          )}

          <div id="recently-viewed-scroll-desktop" className="overflow-x-auto overflow-y-visible scrollbar-hide snap-x snap-mandatory w-full">
            <div className="horizontal-scroll-padding-mobile flex gap-4 pb-2">
              {posts.map((post: any) => (
                <PostCard
                  key={post.id}
                  post={post}
                  isFavorite={userFavorites.includes(post.id)}
                />
              ))}
            </div>
          </div>
          {posts.length > 1 && (
            <ScrollIndicator containerId="recently-viewed-scroll-desktop" />
          )}
        </div>
      </div>
    </section>
  )
}
