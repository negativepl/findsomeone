import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { Footer } from '@/components/Footer'
import { AnimatedCounter } from '@/components/AnimatedCounter'
import { FavoriteButtonWrapper } from '@/components/FavoriteButtonWrapper'
import { ScrollArrows } from '@/components/ScrollArrows'
import { createClient } from '@/lib/supabase/server'
import { CategoryIcon } from '@/lib/category-icons'

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch all main categories from database
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, icon')
    .is('parent_id', null) // Only main categories
    .order('name')

  // Fetch latest seeking posts
  const { data: seekingPosts } = await supabase
    .from('posts')
    .select(`
      *,
      profiles:user_id (
        full_name,
        avatar_url,
        rating
      ),
      categories (
        name
      )
    `)
    .eq('status', 'active')
    .eq('type', 'seeking')
    .order('created_at', { ascending: false })
    .limit(6)

  // Fetch latest offering posts
  const { data: offeringPosts } = await supabase
    .from('posts')
    .select(`
      *,
      profiles:user_id (
        full_name,
        avatar_url,
        rating
      ),
      categories (
        name
      )
    `)
    .eq('status', 'active')
    .eq('type', 'offering')
    .order('created_at', { ascending: false })
    .limit(6)

  // Fetch user favorites if logged in
  let userFavorites: string[] = []
  if (user) {
    const { data: favoritesData } = await supabase
      .from('favorites')
      .select('post_id')
      .eq('user_id', user.id)

    userFavorites = favoritesData?.map(f => f.post_id) || []
  }

  return (
    <div className="min-h-screen bg-[#FAF8F3] pb-20 md:pb-0">
      <NavbarWithHide user={user} />

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-12 md:py-16 text-center">
        <h2 className="text-6xl md:text-7xl font-bold mb-6 text-black leading-tight">
          Znajdź lokalnych<br />specjalistów
        </h2>
        <p className="text-xl text-black/60 mb-10 max-w-2xl mx-auto leading-relaxed">
          Szukasz hydraulika, elektryka czy pomocy w sprzątaniu?
          A może sam oferujesz usługi?{' '}
          <span className="font-semibold bg-gradient-to-r from-[#1A1A1A] to-[#C44E35] bg-clip-text text-transparent">
            W FindSomeone łączymy ludzi lokalnie.
          </span>
        </p>

        <div className="flex flex-col md:flex-row gap-4 md:gap-6 justify-center items-stretch md:items-center w-full md:w-auto px-4 md:px-0">
          <Link href="/posts" className="w-full md:w-auto">
            <Button size="lg" variant="outline" className="w-full md:w-auto text-lg px-12 py-8 rounded-full border-2 border-black/10 hover:border-black/30 hover:bg-black/5 transition-all min-h-[56px] md:min-w-[200px]">
              Przeglądaj wszystkie
            </Button>
          </Link>
          <Link href={user ? "/dashboard/posts/new" : "/signup"} className="w-full md:w-auto">
            <Button size="lg" className="w-full md:w-auto text-lg px-12 py-8 rounded-full bg-black hover:bg-black/80 text-white border-0 transition-all min-h-[56px] md:min-w-[200px]">
              Dodaj ogłoszenie
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats Section - Only show for non-authenticated users */}
      {!user && (
        <section className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-3xl p-8 text-center">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[#C44E35]/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="text-sm font-semibold text-black/80">Szybko rosnąca społeczność</div>
            </div>
            <div className="bg-white rounded-3xl p-8 text-center">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[#C44E35]/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div className="text-sm font-semibold text-black/80">Nowe ogłoszenia codziennie</div>
            </div>
            <div className="bg-white rounded-3xl p-8 text-center">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[#C44E35]/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="text-sm font-semibold text-black/80">Lokalne usługi w Polsce</div>
            </div>
            <div className="bg-white rounded-3xl p-8 text-center">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[#C44E35]/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-sm font-semibold text-black/80">Zaufani specjaliści</div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section - Only show for non-authenticated users */}
      {!user && (
        <section className="container mx-auto px-6 py-12 md:py-14">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-0 rounded-3xl bg-white">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center mb-5">
                  <svg className="w-7 h-7 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-black">Łatwe wyszukiwanie</h3>
                <p className="text-black/60 leading-relaxed">
                  Filtruj po kategorii, lokalizacji i cenie. Znajdź dokładnie to, czego potrzebujesz.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 rounded-3xl bg-white">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center mb-5">
                  <svg className="w-7 h-7 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-black">Bezpośredni kontakt</h3>
                <p className="text-black/60 leading-relaxed">
                  Wbudowany system wiadomości pozwala na szybki kontakt i negocjację warunków.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 rounded-3xl bg-white">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center mb-5">
                  <svg className="w-7 h-7 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-black">System ocen</h3>
                <p className="text-black/60 leading-relaxed">
                  Sprawdź opinie innych użytkowników i buduj swoją reputację poprzez pozytywne recenzje.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Categories Section */}
      {categories && categories.length > 0 && (
        <section className="container mx-auto px-6 py-12 md:py-14">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm group/section">
            <div className="flex items-center justify-between mb-8 md:mb-12">
              <div>
                <h3 className="text-3xl md:text-4xl font-bold text-black mb-2">Wszystkie kategorie</h3>
                <p className="text-lg text-black/60">Przeglądaj oferty według kategorii usług</p>
              </div>
            </div>

            {/* Horizontal Scroll for all devices */}
            <div className="relative">
              <div className="hidden md:block">
                <ScrollArrows containerId="categories-scroll" />
              </div>
              <div id="categories-scroll" className="overflow-x-auto scrollbar-hide -mx-6 md:-mx-8 snap-x snap-mandatory">
                <div className="horizontal-scroll-padding-mobile flex gap-4 pb-2">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/posts?category=${encodeURIComponent(cat.name.toLowerCase())}`}
                      className="flex-shrink-0 snap-center"
                      style={{ width: '200px' }}
                    >
                      <Card className="border-0 rounded-3xl bg-[#FAF8F3] hover:bg-[#F5F1E8] transition-all cursor-pointer h-full flex flex-col shadow-sm">
                        <CardContent className="text-center flex flex-col items-center justify-center flex-1 py-8 px-5">
                          <div className="mx-auto rounded-2xl bg-[#C44E35]/10 flex items-center justify-center text-[#C44E35]" style={{ width: '80px', height: '80px' }}>
                            <CategoryIcon iconName={cat.icon} className="w-8 h-8" />
                          </div>
                          <div className="h-5"></div>
                          <p className="font-semibold text-black text-lg leading-tight">{cat.name}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Seeking Posts Section */}
      {seekingPosts && seekingPosts.length > 0 && (
        <section className="container mx-auto px-6 py-12 md:py-14">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm group/section">
            <div className="flex items-center justify-between mb-8 md:mb-12">
              <div>
                <h3 className="text-3xl md:text-4xl font-bold text-black mb-2">Szukają pomocy</h3>
                <p className="text-lg text-black/60">Sprawdź kto potrzebuje Twoich usług</p>
              </div>
              <div className="hidden md:block">
                <Link href="/posts?type=seeking">
                  <Button className="rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0">
                    Zobacz wszystkie
                  </Button>
                </Link>
              </div>
            </div>

            {/* Horizontal Scroll for all devices */}
            <div className="relative">
              <div className="hidden md:block">
                <ScrollArrows containerId="seeking-posts-scroll" />
              </div>
              <div id="seeking-posts-scroll" className="overflow-x-auto scrollbar-hide -mx-6 md:-mx-8 snap-x snap-mandatory">
              <div className="horizontal-scroll-padding-mobile flex gap-4 pb-2">
              {seekingPosts.map((post: any) => (
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
                              <p className="text-xs text-black/60">
                                ★ {post.profiles.rating.toFixed(1)}
                              </p>
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
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Offering Posts Section */}
      {offeringPosts && offeringPosts.length > 0 && (
        <section className="container mx-auto px-6 py-12 md:py-14">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm group/section">
            <div className="flex items-center justify-between mb-8 md:mb-12">
              <div>
                <h3 className="text-3xl md:text-4xl font-bold text-black mb-2">Oferują usługi</h3>
                <p className="text-lg text-black/60">Znajdź specjalistów w Twojej okolicy</p>
              </div>
              <div className="hidden md:block">
                <Link href="/posts?type=offering">
                  <Button className="rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0">
                    Zobacz wszystkie
                  </Button>
                </Link>
              </div>
            </div>

            {/* Horizontal Scroll for all devices */}
            <div className="relative">
              <div className="hidden md:block">
                <ScrollArrows containerId="offering-posts-scroll" />
              </div>
              <div id="offering-posts-scroll" className="overflow-x-auto scrollbar-hide -mx-6 md:-mx-8 snap-x snap-mandatory">
              <div className="horizontal-scroll-padding-mobile flex gap-4 pb-2">
              {offeringPosts.map((post: any) => (
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
                              <p className="text-xs text-black/60">
                                ★ {post.profiles.rating.toFixed(1)}
                              </p>
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
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - Only show for non-authenticated users */}
      {!user && (
        <section className="container mx-auto px-6 py-24 text-center">
          <div className="bg-[#1A1A1A] rounded-[3rem] p-16 text-white relative overflow-hidden">
            {/* Dekoracyjny gradient w tle */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#F4A261]/10 to-transparent pointer-events-none" />

            <div className="relative z-10">
              <h3 className="text-5xl font-bold mb-6">Gotowy do rozpoczęcia?</h3>
              <p className="text-xl mb-10 text-white/70 max-w-2xl mx-auto">
                Dołącz do tysięcy użytkowników, którzy znajdują i oferują lokalne usługi
              </p>
              <Link href="/signup">
                <Button size="lg" className="text-lg px-10 py-6 rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0 transition-all">
                  Utwórz darmowe konto
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}
