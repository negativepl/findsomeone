import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MobileDock } from '@/components/MobileDock'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { Footer } from '@/components/Footer'
import { SearchFilters } from '@/components/SearchFilters'
import { FavoriteButton } from '@/components/FavoriteButton'
import { DashboardTabs } from '@/components/DashboardTabs'
import { LiveSearchBar } from '@/components/LiveSearchBar'
import { DashboardFilters } from '@/components/DashboardFilters'
import { Pagination } from '@/components/Pagination'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Dashboard - Przeglądaj ogłoszenia",
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

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string
    city?: string
    category?: string
    type?: string
    sortBy?: string
    order?: string
    page?: string
    limit?: string
  }>
}) {
  const supabase = await createClient()
  const params = await searchParams

  const { data: { user } } = await supabase.auth.getUser()

  const searchQuery = params.search || ''
  const cityQuery = params.city || ''
  const categoryQuery = params.category || ''
  const typeQuery = params.type || ''
  const sortBy = params.sortBy || 'created_at'
  const order = params.order || 'desc'
  const currentPage = parseInt(params.page || '1', 10)
  const itemsPerPage = parseInt(params.limit || '12', 10)

  // Fetch all categories for filters
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, icon, parent_id')
    .order('name')

  // Use FULL-TEXT SEARCH if there's a search query
  let posts: Post[] = []
  let totalCount = 0

  if (searchQuery && searchQuery.trim().length >= 2) {
    // Use our smart full-text search function with higher limit
    const { data: searchResults } = await supabase
      .rpc('search_posts', {
        search_query: searchQuery.trim(),
        limit_count: 500  // Get more results for filtering and pagination
      })

    // Now apply additional filters on the results
    let filteredResults = searchResults || []

    if (cityQuery) {
      filteredResults = filteredResults.filter((post: any) =>
        post.city?.toLowerCase().includes(cityQuery.toLowerCase()) ||
        post.district?.toLowerCase().includes(cityQuery.toLowerCase())
      )
    }

    if (categoryQuery) {
      filteredResults = filteredResults.filter((post: any) =>
        post.category_name?.toLowerCase().includes(categoryQuery.toLowerCase())
      )
    }

    if (typeQuery) {
      filteredResults = filteredResults.filter((post: any) =>
        post.type === typeQuery
      )
    }

    // Map search results to Post format
    let mappedPosts = filteredResults.map((result: any) => ({
      id: result.id,
      title: result.title,
      description: result.description,
      type: result.type,
      city: result.city,
      district: result.district,
      price_min: result.price_min,
      price_max: result.price_max,
      price_type: result.price_type,
      images: result.images,
      created_at: result.created_at,
      profiles: {
        full_name: result.user_full_name,
        avatar_url: result.user_avatar_url,
        rating: result.user_rating,
      },
      categories: result.category_name ? {
        name: result.category_name,
      } : null,
    }))

    // Apply sorting
    mappedPosts.sort((a: any, b: any) => {
      let aVal, bVal

      switch (sortBy) {
        case 'price_min':
          aVal = a.price_min || 0
          bVal = b.price_min || 0
          break
        case 'price_max':
          aVal = a.price_max || 0
          bVal = b.price_max || 0
          break
        case 'title':
          aVal = a.title.toLowerCase()
          bVal = b.title.toLowerCase()
          break
        case 'created_at':
        default:
          aVal = new Date(a.created_at || 0).getTime()
          bVal = new Date(b.created_at || 0).getTime()
          break
      }

      if (order === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    totalCount = mappedPosts.length

    // Apply pagination
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    posts = mappedPosts.slice(startIndex, endIndex)
  } else {
    // No search query - use regular filtering
    // First get total count
    let countQuery = supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    // Apply city filter
    if (cityQuery) {
      countQuery = countQuery.or(`city.ilike.%${cityQuery}%,district.ilike.%${cityQuery}%`)
    }

    // Apply category filter
    let categoryId: string | undefined
    if (categoryQuery) {
      // First try to find category by name
      const { data: category } = await supabase
        .from('categories')
        .select('id')
        .ilike('name', categoryQuery)
        .single()

      categoryId = category?.id

      // If not found by name, try to find by synonym
      if (!categoryId) {
        const { data: categorySynonym } = await supabase
          .from('category_synonyms')
          .select('category_id')
          .ilike('synonym', categoryQuery)
          .limit(1)
          .single()

        categoryId = categorySynonym?.category_id
      }

      if (categoryId) {
        countQuery = countQuery.eq('category_id', categoryId)
      }
    }

    // Apply type filter
    if (typeQuery) {
      countQuery = countQuery.eq('type', typeQuery)
    }

    const { count } = await countQuery
    totalCount = count || 0

    // Now get the actual posts with pagination
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
      .eq('status', 'active')

    // Apply city filter
    if (cityQuery) {
      query = query.or(`city.ilike.%${cityQuery}%,district.ilike.%${cityQuery}%`)
    }

    // Apply category filter
    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    // Apply type filter
    if (typeQuery) {
      query = query.eq('type', typeQuery)
    }

    // Apply sorting
    const ascending = order === 'asc'

    // Handle sorting by different fields
    if (sortBy === 'price_min' || sortBy === 'price_max') {
      query = query.order(sortBy, { ascending, nullsFirst: false })
    } else if (sortBy === 'title') {
      query = query.order('title', { ascending })
    } else {
      query = query.order('created_at', { ascending })
    }

    // Apply pagination
    const startIndex = (currentPage - 1) * itemsPerPage
    query = query.range(startIndex, startIndex + itemsPerPage - 1)

    const { data: fetchedPosts } = await query

    posts = fetchedPosts || []
  }

  // Calculate counts for tabs from ALL active posts (not just current page)
  const { count: seekingCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
    .eq('type', 'seeking')

  const { count: offeringCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
    .eq('type', 'offering')

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / itemsPerPage)

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

      {/* Main Content */}
      <main className="container mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-3 text-black">
            {searchQuery || cityQuery || categoryQuery ? 'Wyniki wyszukiwania' : 'Najnowsze ogłoszenia'}
          </h2>
          <p className="text-lg text-black/60">
            {searchQuery || cityQuery || categoryQuery ? (
              <>
                Znaleziono {posts?.length || 0} {posts?.length === 1 ? 'ogłoszenie' : 'ogłoszeń'}
                {searchQuery && <> dla "{searchQuery}"</>}
                {cityQuery && <> w "{cityQuery}"</>}
                {categoryQuery && <> w kategorii "{categoryQuery}"</>}
              </>
            ) : (
              'Przeglądaj aktualne oferty i zapytania w Twojej okolicy'
            )}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <DashboardTabs
            seekingCount={seekingCount}
            offeringCount={offeringCount}
            totalCount={totalCount}
          />
        </div>

        {/* Search Bar */}
        <div className="w-full mx-auto mb-8">
          <LiveSearchBar initialSearch={searchQuery} initialCity={cityQuery} />
        </div>

        {/* Two Column Layout: Sidebar + Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          {/* Left Sidebar - Filters */}
          <aside className="lg:sticky lg:top-6 lg:self-start z-40">
            <SearchFilters categories={categories} />
          </aside>

          {/* Right Content - Posts */}
          <div className="space-y-6">
            {/* Compact Filters with Range Display and Controls */}
            {totalCount > 0 && (
              <DashboardFilters
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                totalCount={totalCount}
              />
            )}

            {/* Posts Grid */}
            <div className={`grid gap-6 ${
              itemsPerPage >= 24 ? 'md:grid-cols-2 lg:grid-cols-4' :
              itemsPerPage >= 12 ? 'md:grid-cols-2 lg:grid-cols-3' :
              'md:grid-cols-1 lg:grid-cols-2'
            }`}>
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
            ))
          ) : (
            <div className="col-span-full text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-black/5 flex items-center justify-center">
                  <svg className="w-10 h-10 text-black/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {searchQuery || cityQuery || categoryQuery || typeQuery ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    )}
                  </svg>
                </div>
                <p className="text-xl font-semibold text-black mb-2">
                  {searchQuery || cityQuery || categoryQuery ? 'Nie znaleziono wyników' : 'Brak ogłoszeń'}
                </p>
                <p className="text-black/60 mb-6">
                  {searchQuery || cityQuery || categoryQuery ? (
                    <>Spróbuj zmienić kryteria wyszukiwania lub wyczyść filtry</>
                  ) : (
                    <>Bądź pierwszy i dodaj swoje ogłoszenie!</>
                  )}
                </p>
                {searchQuery || cityQuery || categoryQuery ? (
                  <Link href="/dashboard">
                    <Button className="rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0 px-8">
                      Wyczyść filtry
                    </Button>
                  </Link>
                ) : (
                  user && (
                    <Link href="/dashboard/posts/new">
                      <Button className="rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0 px-8">
                        Dodaj ogłoszenie
                      </Button>
                    </Link>
                  )
                )}
              </div>
            </div>
          )}
        </div>

            {/* Pagination */}
            {posts && posts.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalCount}
              />
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Mobile Dock */}
      <MobileDock />
    </div>
  )
}
