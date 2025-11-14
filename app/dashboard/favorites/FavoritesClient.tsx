'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FavoriteButtonWrapper } from '@/components/FavoriteButtonWrapper'
import { RatingDisplay } from '@/components/RatingDisplay'
import { useFavorites, useFavoritesCount } from '@/lib/hooks/useFavorites'
import { Loader2 } from 'lucide-react'

interface FavoritesClientProps {
  userId: string
}

const PAGE_SIZE = 12

export function FavoritesClient({ userId }: FavoritesClientProps) {
  const [page, setPage] = useState(1)
  const [allFavorites, setAllFavorites] = useState<any[]>([])
  const { data: favorites, isLoading, error } = useFavorites(userId, page, PAGE_SIZE)
  const { data: totalCount } = useFavoritesCount(userId)

  // Accumulate favorites from all pages
  useEffect(() => {
    if (favorites && favorites.length > 0) {
      setAllFavorites(prev => {
        // Avoid duplicates by checking if items already exist
        const existingIds = new Set(prev.map(f => f.post_id))
        const newItems = favorites.filter(f => !existingIds.has(f.post_id))
        return [...prev, ...newItems]
      })
    }
  }, [favorites])

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600">Wystąpił błąd podczas ładowania ulubionych.</p>
      </div>
    )
  }

  const posts = allFavorites.map(fav => fav.posts).filter(Boolean) || []
  const hasMore = totalCount ? allFavorites.length < totalCount : false

  return (
    <div className="flex flex-col">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {posts && posts.length > 0 ? (
        posts.map((post) => (
          <Link key={post.id} href={`/search/${post.id}`} className="block h-full">
            <Card className="border border-border rounded-3xl bg-card hover:bg-muted transition-all group overflow-hidden gap-0 py-0 cursor-pointer h-full flex flex-col relative">
              {/* Image */}
              {post.images && post.images.length > 0 && (
                <div className="relative w-full h-40 md:h-48 bg-muted overflow-hidden rounded-t-3xl">
                  <Image
                    src={post.images[0]}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 z-10" data-no-loader="true">
                    <FavoriteButtonWrapper
                      postId={post.id}
                      initialIsFavorite={true}
                      withContainer={true}
                    />
                  </div>
                </div>
              )}

              <div className="flex-1 flex flex-col min-h-0">
                <CardHeader className="pb-4 pt-4 px-4 md:pt-6 md:px-6">
                  <CardTitle className="text-base md:text-xl font-bold text-foreground">
                    {post.title}
                  </CardTitle>
                  {/* Mobile - Location and date in header */}
                  <div className="flex md:hidden items-center justify-between gap-2 mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate">{post.city}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pb-4 px-4 md:pb-6 md:px-6 mt-auto space-y-0 md:space-y-3 flex-shrink-0">
                  {/* Mobile - Border separator */}
                  <div className="md:hidden mb-3">
                    <div className="border-t-2 border-border"></div>
                  </div>

                  {/* Desktop - Location above user info */}
                  <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground mb-3">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="truncate">{post.city}{post.district && `, ${post.district}`}</span>
                  </div>

                  {/* Desktop - Border separator */}
                  <div className="hidden md:block mb-3">
                    <div className="border-t-2 border-border"></div>
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
                          <span className="text-xs font-semibold text-foreground">
                            {post.profiles?.full_name?.charAt(0) || 'U'}
                          </span>
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs md:text-sm font-semibold text-foreground truncate">
                          {post.profiles?.full_name || 'Anonymous'}
                        </p>
                        <RatingDisplay
                          userId={post.user_id}
                          rating={post.profiles?.rating || 0}
                          reviewCount={post.profiles?.total_reviews || 0}
                          className="text-xs md:text-sm"
                          clickable={false}
                        />
                      </div>
                    </div>

                    {/* Price */}
                    {post.price ? (
                      <div className="text-right flex-shrink-0">
                        <p className="text-base md:text-xl font-bold text-foreground whitespace-nowrap">
                          {post.price} zł
                        </p>
                        <p className="text-xs md:text-sm text-muted-foreground whitespace-nowrap">
                          {post.price_negotiable
                            ? 'do negocjacji'
                            : post.price_type === 'hourly'
                            ? 'za godzinę'
                            : 'cena stała'}
                        </p>
                      </div>
                    ) : post.price_type === 'free' ? (
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm md:text-base font-bold text-green-600 whitespace-nowrap">Za darmo</p>
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </div>
            </Card>
          </Link>
        ))
      ) : (
        <div className="col-span-full text-center py-20">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <p className="text-xl font-semibold text-foreground mb-2">
              Brak ulubionych ogłoszeń
            </p>
            <p className="text-muted-foreground mb-6">
              Kliknij serduszko na ogłoszeniu, aby dodać je do ulubionych
            </p>
            <Link href="/search">
              <Button className="rounded-full bg-brand hover:bg-brand/90 text-white border-0 px-8">
                Przeglądaj ogłoszenia
              </Button>
            </Link>
          </div>
        </div>
      )}
      </div>

      {/* Loading indicator when fetching next page */}
      {isLoading && page > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Wczytywanie następnej strony...
          </div>
        </div>
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="mt-12 flex justify-center">
          <button
            onClick={() => setPage(page + 1)}
            disabled={isLoading}
            className="px-8 py-2.5 text-sm font-semibold text-brand hover:bg-brand/5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Wczytywanie...
              </>
            ) : (
              `Wczytaj więcej (${totalCount ? totalCount - allFavorites.length : 0})`
            )}
          </button>
        </div>
      )}

    </div>
  )
}
