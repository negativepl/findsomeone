'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FavoriteButton } from '@/components/FavoriteButton'
import { useFavorites } from '@/lib/hooks/useFavorites'
import { Loader2 } from 'lucide-react'

interface FavoritesClientProps {
  userId: string
}

export function FavoritesClient({ userId }: FavoritesClientProps) {
  const { data: favorites, isLoading, error } = useFavorites(userId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#C44E35]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600">Wystąpił błąd podczas ładowania ulubionych.</p>
      </div>
    )
  }

  const posts = favorites?.map(fav => fav.posts).filter(Boolean) || []

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {posts && posts.length > 0 ? (
        posts.map((post) => (
          <Link key={post.id} href={`/posts/${post.id}`} className="block h-full">
            <Card className="border border-border rounded-3xl bg-card hover:bg-muted transition-all group overflow-hidden gap-0 py-0 cursor-pointer h-full flex flex-col">
              {/* Image */}
              {post.images && post.images.length > 0 && (
                <div className="relative w-full h-48 bg-muted overflow-hidden">
                  <Image
                    src={post.images[0]}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 z-10" data-no-loader="true">
                    <div className="bg-card/80 backdrop-blur-md rounded-full p-2 hover:bg-card transition-all border border-white/60 shadow-sm">
                      <FavoriteButton
                        postId={post.id}
                        initialIsFavorite={true}
                      />
                    </div>
                  </div>
                </div>
              )}

              <CardHeader className="pb-4 pt-6">
                {post.categories && (
                  <div className="mb-3">
                    <Badge variant="outline" className="rounded-full border-border text-muted-foreground">
                      {post.categories.name}
                    </Badge>
                  </div>
                )}
                <CardTitle className="text-base md:text-base font-bold text-foreground">{post.title}</CardTitle>
              </CardHeader>

              <CardContent className="pb-6 mt-auto space-y-3">
                {/* Location */}
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {post.city}{post.district && `, ${post.district}`}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {post.profiles?.avatar_url ? (
                      <Image
                        src={post.profiles.avatar_url}
                        alt={post.profiles.full_name || 'User'}
                        width={36}
                        height={36}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-black/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-foreground">
                          {post.profiles?.full_name?.charAt(0) || 'U'}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {post.profiles?.full_name || 'Anonymous'}
                      </p>
                      {post.profiles?.rating && post.profiles.rating > 0 ? (
                        <p className="text-xs text-muted-foreground">
                          ★ {post.profiles.rating.toFixed(1)} ({post.profiles.total_reviews || 0} {post.profiles.total_reviews === 1 ? 'opinia' : 'opinii'})
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">Brak opinii</p>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  {post.price ? (
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">
                        {post.price} zł{post.price_negotiable ? '*' : ''}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {post.price_negotiable
                          ? 'do negocjacji'
                          : post.price_type === 'hourly'
                          ? 'za godzinę'
                          : 'cena stała'}
                      </p>
                    </div>
                  ) : post.price_type === 'free' ? (
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">Za darmo</p>
                    </div>
                  ) : null}
                </div>
              </CardContent>
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
            <Link href="/posts">
              <Button className="rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0 px-8">
                Przeglądaj ogłoszenia
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
