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
        <div className="relative">
          <div className="hidden md:block">
            <ScrollArrows containerId="recently-viewed-scroll" />
          </div>
          <div id="recently-viewed-scroll" className="overflow-x-auto scrollbar-hide -mx-6 md:-mx-8 snap-x snap-mandatory">
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
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className="flex-shrink-0 snap-center"
                  style={{ width: '320px' }}
                >
                  <Card className="border-0 rounded-3xl bg-white hover:bg-[#F5F1E8] transition-all group overflow-hidden gap-0 py-0 cursor-pointer h-full flex flex-col">
                    {/* Image */}
                    {post.images && post.images.length > 0 && (
                      <div className="relative w-full h-48 bg-black/5">
                        <Image
                          src={post.images[0]}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 right-3 z-10">
                          <FavoriteButtonWrapper
                            postId={post.id}
                            initialIsFavorite={userFavorites.includes(post.id)}
                          />
                        </div>
                      </div>
                    )}

                    <CardHeader className="pb-4 pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <Badge
                          className={`rounded-full px-3 py-1 ${
                            post.type === 'seeking'
                              ? 'bg-[#C44E35] text-white border-0'
                              : 'bg-black text-white border-0'
                          }`}
                        >
                          {post.type === 'seeking' ? 'Szukam' : 'Oferuję'}
                        </Badge>
                        {post.categories && (
                          <Badge variant="outline" className="rounded-full border-black/10 text-black/60">
                            {post.categories.name}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl font-bold text-black">{post.title}</CardTitle>
                    </CardHeader>

                    <CardContent className="pb-6 mt-auto space-y-3">
                      {/* Location */}
                      <div className="flex items-center gap-1 text-sm text-black/60">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {post.city}{post.district && `, ${post.district}`}
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {post.profiles?.avatar_url ? (
                            <Image
                              src={post.profiles.avatar_url}
                              alt={post.profiles.full_name || 'User'}
                              width={32}
                              height={32}
                              className="rounded-full flex-shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-semibold text-black">
                                {post.profiles?.full_name?.charAt(0) || 'U'}
                              </span>
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-black truncate">
                              {post.profiles?.full_name || 'Anonymous'}
                            </p>
                            {post.profiles?.rating && post.profiles.rating > 0 && (
                              <RatingDisplay
                                userId={post.user_id}
                                rating={post.profiles.rating}
                                reviewCount={post.profiles.total_reviews || 0}
                                className="text-xs"
                                clickable={false}
                              />
                            )}
                          </div>
                        </div>

                        {/* Price */}
                        {(post.price_min || post.price_max) ? (
                          <div className="text-right flex-shrink-0">
                            <p className="text-base font-bold text-black whitespace-nowrap">
                              {post.price_min && post.price_max
                                ? `${post.price_min}-${post.price_max} zł`
                                : post.price_min
                                ? `${post.price_min} zł`
                                : `${post.price_max} zł`}
                            </p>
                            {post.price_type && (
                              <p className="text-xs text-black/60 whitespace-nowrap">
                                {post.price_type === 'hourly'
                                  ? 'za godzinę'
                                  : post.price_type === 'fixed'
                                  ? 'cena stała'
                                  : 'do negocjacji'}
                              </p>
                            )}
                          </div>
                        ) : (
                          post.price_type === 'negotiable' && (
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm text-black/60 whitespace-nowrap">Do negocjacji</p>
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
