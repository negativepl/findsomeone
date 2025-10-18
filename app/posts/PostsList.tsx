'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FavoriteButtonWrapper } from '@/components/FavoriteButtonWrapper'
import { RatingDisplay } from '@/components/RatingDisplay'

interface Post {
  id: string
  user_id: string
  title: string
  description: string
  type: 'seeking' | 'offering'
  city: string
  district: string | null
  price_min: number | null
  price_max: number | null
  price_type: 'hourly' | 'fixed' | 'negotiable' | null
  images: string[] | null
  created_at: string
  is_ai_generated?: boolean
  profiles: {
    full_name: string | null
    avatar_url: string | null
    rating: number
    total_reviews: number
  } | null
  categories: {
    name: string
  } | null
}

interface PostsListProps {
  initialPosts: Post[]
  totalCount: number
  userFavorites: string[]
  searchParams: {
    search?: string
    city?: string
    category?: string
    type?: string
    sort?: string
    limit?: string
  }
  viewMode?: 'grid' | 'list'
}

export function PostsList({ initialPosts, totalCount, userFavorites, searchParams, viewMode = 'grid' }: PostsListProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialPosts.length < totalCount)
  const observerTarget = useRef<HTMLDivElement>(null)

  const itemsPerPage = parseInt(searchParams.limit || '12', 10)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  useEffect(() => {
    // Reset posts when search params change
    setPosts(initialPosts)
    setHasMore(initialPosts.length < totalCount)
  }, [initialPosts, totalCount])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [hasMore, loading, posts.length])

  const loadMore = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        offset: String(posts.length),
        limit: String(itemsPerPage),
        ...(searchParams.search && { search: searchParams.search }),
        ...(searchParams.city && { city: searchParams.city }),
        ...(searchParams.category && { category: searchParams.category }),
        ...(searchParams.type && { type: searchParams.type }),
        ...(searchParams.sort && { sort: searchParams.sort }),
      })

      const response = await fetch(`/api/posts?${params.toString()}`)
      const data = await response.json()

      if (data.posts && data.posts.length > 0) {
        setPosts((prev) => [...prev, ...data.posts])
        setHasMore(data.hasMore)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Error loading more posts:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className={viewMode === 'list' ? 'flex flex-col gap-4' : `grid gap-4 md:gap-6 ${
        itemsPerPage >= 24 ? 'md:grid-cols-2 lg:grid-cols-4' :
        itemsPerPage >= 12 ? 'md:grid-cols-2 lg:grid-cols-3' :
        'md:grid-cols-1 lg:grid-cols-2'
      }`}>
        {posts.map((post: Post) => (
          <Link key={post.id} href={`/posts/${post.id}`} className="block h-full">
            <Card className={`border-0 rounded-3xl bg-white hover:bg-[#F5F1E8] transition-all group overflow-hidden gap-0 py-0 cursor-pointer relative ${
              viewMode === 'list' ? 'flex flex-col' : 'flex flex-col h-full'
            }`}>
              {viewMode === 'list' ? (
                /* List view: mobile - vertical layout, desktop - horizontal with image on left */
                <>
                  {/* Mobile layout */}
                  <div className="md:hidden flex flex-col">
                    {/* Favorite button - top left corner */}
                    <div className="absolute top-2 left-2 z-10" data-no-loader="true">
                      <FavoriteButtonWrapper
                        postId={post.id}
                        initialIsFavorite={userFavorites.includes(post.id)}
                        withContainer={true}
                      />
                    </div>

                    <div className="flex gap-3 p-4 pb-0 items-center">
                      {/* Image */}
                      {post.images && post.images.length > 0 && (
                        <div className="relative bg-black/5 overflow-hidden w-20 h-20 rounded-xl flex-shrink-0">
                          <Image
                            src={post.images[0]}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 flex flex-col justify-between min-w-0 min-h-[80px]">
                        <h3 className="text-base font-bold text-black mb-2">
                          {post.title}
                        </h3>

                        {/* Location and Date */}
                        <div className="flex items-center justify-between gap-2 text-xs text-black/60">
                          <div className="flex items-center gap-1 min-w-0">
                            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="truncate">{post.city}{post.district && `, ${post.district}`}</span>
                          </div>
                          <span className="flex-shrink-0">{formatDate(post.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer - full width */}
                    <div className="pb-4 mt-3 px-4">
                      <div className="pt-3 border-t-2 border-black/5">
                        <div className="flex items-center justify-between gap-2">
                        {/* User info */}
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {post.profiles?.avatar_url ? (
                            <Image
                              src={post.profiles.avatar_url}
                              alt={post.profiles.full_name || 'User'}
                              width={36}
                              height={36}
                              className="rounded-full flex-shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-black/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-semibold text-black">
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
                      </div>
                    </div>
                  </div>

                  {/* Desktop layout */}
                  <div className="hidden md:flex h-full">
                    {/* Image container - left side, full height */}
                    {post.images && post.images.length > 0 && (
                      <div className="relative bg-black/5 overflow-hidden w-64 flex-shrink-0 rounded-l-3xl">
                        <Image
                          src={post.images[0]}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Favorite button - top left corner */}
                        <div className="absolute top-4 left-4 z-10" data-no-loader="true">
                          <FavoriteButtonWrapper
                            postId={post.id}
                            initialIsFavorite={userFavorites.includes(post.id)}
                            withContainer={true}
                          />
                        </div>
                      </div>
                    )}

                    {/* Content container - right side */}
                    <div className="flex-1 flex flex-col p-6">
                      {/* Main content area - tylko tytuł */}
                      <div className="flex-1 pb-6">
                        <h3 className="text-xl font-bold text-black">
                          {post.title}
                        </h3>
                      </div>

                      {/* Footer - bottom of content */}
                      <div className="space-y-3">
                        {/* Location and Date */}
                        <div className="flex items-center justify-between gap-4 text-sm text-black/60">
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="truncate">{post.city}{post.district && `, ${post.district}`}</span>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <span>{formatDate(post.created_at)}</span>
                          </div>
                        </div>

                        {/* Border separator */}
                        <div>
                          <div className="border-t-2 border-black/5"></div>
                        </div>

                        {/* User info and Price */}
                        <div className="flex items-center justify-between gap-6">
                          {/* User info - left side */}
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {post.profiles?.avatar_url ? (
                              <Image
                                src={post.profiles.avatar_url}
                                alt={post.profiles.full_name || 'User'}
                                width={40}
                                height={40}
                                className="rounded-full flex-shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-semibold text-black">
                                  {post.profiles?.full_name?.charAt(0) || 'U'}
                                </span>
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-base font-semibold text-black truncate">
                                {post.profiles?.full_name || 'Anonymous'}
                              </p>
                              {post.profiles?.rating && post.profiles.rating > 0 && (
                                <RatingDisplay
                                  userId={post.user_id}
                                  rating={post.profiles.rating}
                                  reviewCount={post.profiles.total_reviews || 0}
                                  className="text-sm"
                                  clickable={false}
                                />
                              )}
                            </div>
                          </div>

                          {/* Price - right side */}
                          {(post.price_min || post.price_max) ? (
                            <div className="text-right flex-shrink-0">
                              <p className="text-xl font-bold text-black whitespace-nowrap">
                                {post.price_min && post.price_max
                                  ? `${post.price_min}-${post.price_max} zł`
                                  : post.price_min
                                  ? `${post.price_min} zł`
                                  : `${post.price_max} zł`}
                              </p>
                              {post.price_type && (
                                <p className="text-sm text-black/60 whitespace-nowrap">
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
                                <p className="text-base text-black/60 whitespace-nowrap">Do negocjacji</p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Grid view: image above, content below */
                <>
                  {/* Image */}
                  {post.images && post.images.length > 0 && (
                    <div className="relative bg-black/5 overflow-hidden w-full h-40 md:h-48 rounded-t-3xl">
                      <Image
                        src={post.images[0]}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 z-10" data-no-loader="true">
                        <FavoriteButtonWrapper
                          postId={post.id}
                          initialIsFavorite={userFavorites.includes(post.id)}
                          withContainer={true}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex-1 flex flex-col min-h-0">
                    <CardHeader className="pb-4 pt-4 px-4 md:pt-6 md:px-6">
                      <CardTitle className="text-base md:text-xl font-bold text-black">
                        {post.title}
                      </CardTitle>
                      {/* Mobile - Location and date in header */}
                      <div className="flex md:hidden items-center justify-between gap-2 mt-2 text-xs text-black/60">
                        <div className="flex items-center gap-1">
                          <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="truncate">{post.city}</span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span>{formatDate(post.created_at)}</span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pb-4 px-4 md:pb-6 md:px-6 mt-auto space-y-0 md:space-y-3 flex-shrink-0">
                      {/* Mobile - Border separator */}
                      <div className="md:hidden mb-3">
                        <div className="border-t-2 border-black/5"></div>
                      </div>

                      {/* Desktop - Location and date above user info */}
                      <div className="hidden md:flex items-center justify-between gap-4 text-sm text-black/60 mb-3">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="truncate">{post.city}{post.district && `, ${post.district}`}</span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span>{formatDate(post.created_at)}</span>
                        </div>
                      </div>

                      {/* Desktop - Border separator */}
                      <div className="hidden md:block mb-3">
                        <div className="border-t-2 border-black/5"></div>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {post.profiles?.avatar_url ? (
                            <Image
                              src={post.profiles.avatar_url}
                              alt={post.profiles.full_name || 'User'}
                              width={28}
                              height={28}
                              className="rounded-full flex-shrink-0 md:w-8 md:h-8"
                            />
                          ) : (
                            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-black/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-semibold text-black">
                                {post.profiles?.full_name?.charAt(0) || 'U'}
                              </span>
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs md:text-sm font-semibold text-black truncate">
                              {post.profiles?.full_name || 'Anonymous'}
                            </p>
                            {/* Rating - all devices */}
                            {post.profiles?.rating && post.profiles.rating > 0 && (
                              <RatingDisplay
                                userId={post.user_id}
                                rating={post.profiles.rating}
                                reviewCount={post.profiles.total_reviews || 0}
                                className="text-xs md:text-sm"
                                clickable={false}
                              />
                            )}
                          </div>
                        </div>

                        {/* Price */}
                        {(post.price_min || post.price_max) ? (
                          <div className="text-right flex-shrink-0">
                            <p className="text-base md:text-xl font-bold text-black whitespace-nowrap">
                              {post.price_min && post.price_max
                                ? `${post.price_min}-${post.price_max} zł`
                                : post.price_min
                                ? `${post.price_min} zł`
                                : `${post.price_max} zł`}
                            </p>
                            {post.price_type && (
                              <p className="text-xs md:text-sm text-black/60 whitespace-nowrap">
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
                              <p className="text-sm md:text-base text-black/60 whitespace-nowrap">Do negocjacji</p>
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </div>
                </>
              )}
            </Card>
          </Link>
        ))}
      </div>

      {/* Observer target for infinite scroll */}
      {hasMore && (
        <div ref={observerTarget} className="py-8 text-center">
          {loading && (
            <div className="flex items-center justify-center gap-2 text-black/60">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Ładowanie...</span>
            </div>
          )}
        </div>
      )}
    </>
  )
}
