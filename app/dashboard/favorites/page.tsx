import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MobileDock } from '@/components/MobileDock'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { Footer } from '@/components/Footer'
import { FavoriteButton } from '@/components/FavoriteButton'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: "Ulubione - Twoje zapisane ogłoszenia",
}

interface Post {
  id: string
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
  } | null
  categories: {
    name: string
  } | null
}

export default async function FavoritesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user's favorite posts
  const { data: favorites } = await supabase
    .from('favorites')
    .select(`
      post_id,
      posts:post_id (
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
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Extract posts from favorites
  const posts = favorites?.map((fav: any) => fav.posts).filter(Boolean) || []

  return (
    <div className="min-h-screen bg-[#FAF8F3] pb-20 md:pb-0">
      <NavbarWithHide user={user} />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-10">
        <div className="mb-10">
          <h2 className="text-4xl font-bold mb-3 text-black">
            Ulubione ogłoszenia
          </h2>
          <p className="text-lg text-black/60">
            Twoje zapisane ogłoszenia ({posts.length})
          </p>
        </div>

        {/* Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {posts && posts.length > 0 ? (
            posts.map((post: Post) => (
              <Link key={post.id} href={`/dashboard/posts/${post.id}`} className="block h-full">
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
                        <FavoriteButton
                          postId={post.id}
                          initialIsFavorite={true}
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
                            <span className="text-sm font-semibold text-black">
                              {post.profiles?.full_name?.charAt(0) || 'U'}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-black">
                            {post.profiles?.full_name || 'Anonymous'}
                          </p>
                          {post.profiles?.rating && post.profiles.rating > 0 && (
                            <p className="text-xs text-black/60">
                              ★ {post.profiles.rating.toFixed(1)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Price */}
                      {(post.price_min || post.price_max) ? (
                        <div className="text-right">
                          <p className="text-lg font-bold text-black">
                            {post.price_min && post.price_max
                              ? `${post.price_min}-${post.price_max} zł`
                              : post.price_min
                              ? `${post.price_min} zł`
                              : `${post.price_max} zł`}
                          </p>
                          {post.price_type && (
                            <p className="text-xs text-black/60">
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
                          <div className="text-right">
                            <p className="text-sm text-black/60">Do negocjacji</p>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-black/5 flex items-center justify-center">
                  <svg className="w-10 h-10 text-black/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <p className="text-xl font-semibold text-black mb-2">
                  Brak ulubionych ogłoszeń
                </p>
                <p className="text-black/60 mb-6">
                  Kliknij serduszko na ogłoszeniu, aby dodać je do ulubionych
                </p>
                <Link href="/dashboard">
                  <Button className="rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0 px-8">
                    Przeglądaj ogłoszenia
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Mobile Dock */}
      <MobileDock />
    </div>
  )
}
