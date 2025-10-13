'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
}

export function PostsList({ initialPosts, totalCount, userFavorites, searchParams }: PostsListProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialPosts.length < totalCount)
  const observerTarget = useRef<HTMLDivElement>(null)

  const itemsPerPage = parseInt(searchParams.limit || '12', 10)

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
      <div className={`grid gap-6 ${
        itemsPerPage >= 24 ? 'md:grid-cols-2 lg:grid-cols-4' :
        itemsPerPage >= 12 ? 'md:grid-cols-2 lg:grid-cols-3' :
        'md:grid-cols-1 lg:grid-cols-2'
      }`}>
        {posts.map((post: Post) => (
          <Link key={post.id} href={`/posts/${post.id}`} className="block h-full">
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
                  <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-all">
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
