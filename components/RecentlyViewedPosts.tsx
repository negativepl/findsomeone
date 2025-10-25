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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecentlyViewedPosts = async () => {
      // Get recently viewed post IDs from localStorage
      const recentlyViewedKey = 'recently_viewed_posts'
      const recentlyViewed = JSON.parse(localStorage.getItem(recentlyViewedKey) || '[]')

      if (recentlyViewed.length === 0) {
        setLoading(false)
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

      setLoading(false)
    }

    fetchRecentlyViewedPosts()
  }, [])

  // Don't show anything if there are no posts and not loading
  if (!loading && posts.length === 0) {
    return null
  }

  return (
    <section className="container mx-auto px-6 py-12 md:py-14">
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm group/section">
        <div className="flex items-center justify-between mb-8 md:mb-12">
          <div>
            <h3 className="text-3xl md:text-4xl font-bold text-black mb-2">Ostatnio wyświetlane</h3>
            <p className="text-lg text-black/60">Ostatnio przeglądane ogłoszenia</p>
          </div>
        </div>

        {/* Horizontal Scroll for all devices */}
        <div className="relative -mx-6 md:-mx-8">
          <div className="hidden md:block">
            <ScrollArrows containerId="recently-viewed-scroll" />
          </div>
          <ScrollGradients containerId="recently-viewed-scroll" />

          <div id="recently-viewed-scroll" className="overflow-x-auto overflow-y-visible scrollbar-hide snap-x snap-mandatory">
            <div className="horizontal-scroll-padding-mobile flex gap-4 pb-2">
              {loading ? (
                // Skeleton loader - show 6 placeholder cards
                <>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex-shrink-0 snap-center" style={{ width: '320px' }}>
                      <Card className="border-0 rounded-3xl bg-white h-full flex flex-col animate-pulse">
                        {/* Image skeleton */}
                        <div className="w-full h-48 bg-black/5 rounded-t-3xl" />

                        <CardHeader className="pb-4 pt-6">
                          <div className="flex items-start justify-between mb-3">
                            <div className="h-6 w-20 bg-black/5 rounded-full" />
                            <div className="h-6 w-24 bg-black/5 rounded-full" />
                          </div>
                          <div className="h-6 w-3/4 bg-black/5 rounded" />
                        </CardHeader>

                        <CardContent className="pb-6 mt-auto space-y-3">
                          <div className="h-4 w-1/2 bg-black/5 rounded" />
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-black/5" />
                              <div className="h-4 w-24 bg-black/5 rounded" />
                            </div>
                            <div className="h-6 w-20 bg-black/5 rounded" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </>
              ) : (
                posts.map((post: any) => (
                <PostCard
                  key={post.id}
                  post={post}
                  isFavorite={userFavorites.includes(post.id)}
                />
              ))
              )}
            </div>
          </div>
          <ScrollIndicator containerId="recently-viewed-scroll" />
        </div>
      </div>
    </section>
  )
}
