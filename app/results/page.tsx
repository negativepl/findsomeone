import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { Footer } from '@/components/Footer'
import { PostsFilters } from '@/components/PostsFilters'
import { PostsListWrapper } from './PostsListWrapper'
import { PostsPageClient } from './PostsPageClient'
import { StructuredData } from '@/components/StructuredData'
import { Metadata } from 'next'

// Dynamic metadata based on filters
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; city?: string; category?: string }>
}): Promise<Metadata> {
  const params = await searchParams
  const { city, category, search } = params

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://findsomeone.app'

  // If category is provided, fetch the actual category name
  let categoryName = category
  if (category) {
    const supabase = await createClient()

    // Try to find category by slug first
    let { data: categoryData } = await supabase
      .from('categories')
      .select('name')
      .ilike('slug', category)
      .single()

    if (categoryData?.name) {
      categoryName = categoryData.name
    } else {
      // Try by name if slug didn't work
      const { data: categoryByName } = await supabase
        .from('categories')
        .select('name')
        .ilike('name', category)
        .single()

      if (categoryByName?.name) {
        categoryName = categoryByName.name
      }
    }
  }

  // Build dynamic title and description
  // Note: Layout template adds "| FindSomeone" automatically, so we don't include it here
  let title = 'Przeglądaj ogłoszenia'
  let description = 'Znajdź lokalną pomoc lub oferuj swoje usługi w FindSomeone'

  if (categoryName && city) {
    title = `${categoryName} ${city}`
    description = `Szukasz usług ${categoryName} w ${city}? Znajdź zaufanych specjalistów lub oferuj swoją pomoc. Lokalna platforma pomocy.`
  } else if (categoryName) {
    title = categoryName
    description = `Przeglądaj ogłoszenia w kategorii ${categoryName}. Znajdź specjalistów lub oferuj swoje usługi. Darmowa platforma lokalnej pomocy.`
  } else if (city) {
    title = `Ogłoszenia ${city}`
    description = `Lokalne usługi i pomoc w ${city}. Zakupy, remont, sprzątanie i więcej. Połącz się z ludźmi w okolicy.`
  } else if (search) {
    title = search
    description = `Wyniki wyszukiwania dla "${search}". Znajdź lokalną pomoc lub oferuj swoje usługi.`
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/posts`,
      siteName: 'FindSomeone',
      locale: 'pl_PL',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `${baseUrl}/posts`,
    },
  }
}

interface Post {
  id: string
  user_id: string
  title: string
  description: string
  city: string
  district: string | null
  price: number | null
  price_type: 'hourly' | 'fixed' | 'free' | null
  price_negotiable: boolean | null
  images: string[] | null
  created_at: string
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

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; city?: string; category?: string; sort?: string; page?: string; limit?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams

  const { data: { user } } = await supabase.auth.getUser()

  // Fetch categories for filters with 3 levels
  const { data: rawCategories } = await supabase
    .from('categories')
    .select('id, name, slug, icon, parent_id, display_order')
    .order('display_order')

  // Fetch post counts per category (only active posts)
  const { data: postCounts } = await supabase
    .from('posts')
    .select('category_id')
    .eq('status', 'active').eq('moderation_status', 'approved')

  // Create a map of category_id -> count
  const countMap = new Map<string, number>()
  postCounts?.forEach(post => {
    const count = countMap.get(post.category_id) || 0
    countMap.set(post.category_id, count + 1)
  })

  // Sort all categories by display_order and add post counts
  const sortedCategories = rawCategories?.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)) || []

  // Transform to include post_count
  const categoriesWithCounts = sortedCategories.map(cat => ({
    ...cat,
    post_count: countMap.get(cat.id) || 0,
  }))

  const categories = categoriesWithCounts

  const searchQuery = params.search || ''
  const cityQuery = params.city || ''
  const categoryQuery = params.category || ''
  const sortQuery = params.sort || 'newest'
  const currentPage = parseInt(params.page || '1', 10)
  const itemsPerPage = parseInt(params.limit || '12', 10)

  // Use FULL-TEXT SEARCH if there's a search query
  let posts: Post[] = []
  let totalCount = 0
  let categoryName = categoryQuery // Default to query, will be replaced with actual name if found

  if (searchQuery && searchQuery.trim().length >= 2) {
    // Use our smart full-text search function
    const { data: searchResults } = await supabase
      .rpc('search_posts', {
        search_query: searchQuery.trim(),
        limit_count: 1000 // Get more results for filtering and pagination
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

    // Apply sorting
    filteredResults.sort((a: any, b: any) => {
      switch (sortQuery) {
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'price_asc':
          return (a.price || 0) - (b.price || 0)
        case 'price_desc':
          return (b.price || 0) - (a.price || 0)
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

    totalCount = filteredResults.length

    // Apply pagination
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedResults = filteredResults.slice(startIndex, startIndex + itemsPerPage)

    // Map search results to Post format
    posts = paginatedResults.map((result: any) => ({
      id: result.id,
      user_id: result.user_id,
      title: result.title,
      description: result.description,
      city: result.city,
      district: result.district,
      price: result.price,
      price_type: result.price_type,
      images: result.images,
      created_at: result.created_at,
      profiles: {
        full_name: result.user_full_name,
        avatar_url: result.user_avatar_url,
        rating: result.user_rating,
        total_reviews: result.user_total_reviews || 0,
      },
      categories: result.category_name ? {
        name: result.category_name,
      } : null,
    }))
  } else {
    // No search query - use regular filtering
    let countQuery = supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .eq('moderation_status', 'approved')
      .eq('is_deleted', false)

    let query = supabase
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
          name,
          slug
        )
      `)
      .eq('status', 'active')
      .eq('moderation_status', 'approved')
      .eq('is_deleted', false)

    // Apply city filter
    if (cityQuery) {
      query = query.or(`city.ilike.%${cityQuery}%,district.ilike.%${cityQuery}%`)
      countQuery = countQuery.or(`city.ilike.%${cityQuery}%,district.ilike.%${cityQuery}%`)
    }

    // Apply category filter
    if (categoryQuery) {
      // First try to find category by slug
      let { data: category } = await supabase
        .from('categories')
        .select('id, name')
        .ilike('slug', categoryQuery)
        .single()

      let categoryId = category?.id
      if (category?.name) {
        categoryName = category.name
      }

      // If not found by slug, try by name
      if (!categoryId) {
        const { data: categoryByName } = await supabase
          .from('categories')
          .select('id, name')
          .ilike('name', categoryQuery)
          .single()

        categoryId = categoryByName?.id
        if (categoryByName?.name) {
          categoryName = categoryByName.name
        }
      }

      // If still not found, try to find by synonym
      if (!categoryId) {
        const { data: categorySynonym } = await supabase
          .from('category_synonyms')
          .select('category_id, categories(name)')
          .ilike('synonym', categoryQuery)
          .limit(1)
          .single()

        categoryId = categorySynonym?.category_id
        if (categorySynonym?.categories && 'name' in categorySynonym.categories) {
          categoryName = (categorySynonym.categories as { name: string }).name
        }
      }

      if (categoryId) {
        // Get all subcategories recursively (all levels)
        const { data: allSubcategories } = await supabase
          .rpc('get_all_subcategories', { parent_category_id: categoryId })

        if (allSubcategories && allSubcategories.length > 0) {
          // This is a parent category - include posts from all subcategories (recursively)
          const categoryIds = [categoryId, ...allSubcategories.map((sub: any) => sub.id)]
          query = query.in('category_id', categoryIds)
          countQuery = countQuery.in('category_id', categoryIds)
        } else {
          // This is a leaf category - just filter by this category
          query = query.eq('category_id', categoryId)
          countQuery = countQuery.eq('category_id', categoryId)
        }
      }
    }

    // Apply sorting
    const sortOrder = sortQuery === 'oldest' ? { ascending: true } : { ascending: false }
    switch (sortQuery) {
      case 'price_asc':
        query = query.order('price', { ascending: true, nullsFirst: false })
        break
      case 'price_desc':
        query = query.order('price', { ascending: false, nullsFirst: false })
        break
      case 'oldest':
      case 'newest':
      default:
        query = query.order('created_at', sortOrder)
        break
    }

    // Get total count
    const { count } = await countQuery
    totalCount = count || 0

    // Apply pagination
    const startIndex = (currentPage - 1) * itemsPerPage
    const { data: fetchedPosts } = await query
      .range(startIndex, startIndex + itemsPerPage - 1)

    posts = fetchedPosts || []
  }

  // Calculate pagination values
  const totalPages = Math.ceil(totalCount / itemsPerPage)
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalCount)

  // Fetch user favorites if logged in
  let userFavorites: string[] = []
  if (user) {
    const { data: favoritesData } = await supabase
      .from('favorites')
      .select('post_id')
      .eq('user_id', user.id)

    userFavorites = favoritesData?.map(f => f.post_id) || []
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://findsomeone.app'

  // Build breadcrumbs for structured data
  const breadcrumbs = [
    { name: 'Strona główna', url: baseUrl },
    { name: 'Ogłoszenia', url: `${baseUrl}/posts` },
  ]

  if (categoryQuery) {
    breadcrumbs.push({ name: categoryName, url: `${baseUrl}/posts?category=${encodeURIComponent(categoryQuery)}` })
  }
  if (cityQuery) {
    breadcrumbs.push({ name: cityQuery, url: `${baseUrl}/posts?city=${encodeURIComponent(cityQuery)}` })
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Structured Data for SEO */}
      <StructuredData
        type="breadcrumb"
        breadcrumbs={breadcrumbs}
      />
      {(categoryQuery || cityQuery) && (
        <StructuredData
          type="collection-page"
          category={categoryName}
          city={cityQuery}
          serviceDescription={`Przeglądaj lokalne usługi ${categoryQuery ? 'w kategorii ' + categoryName : ''} ${cityQuery ? 'w ' + cityQuery : ''}`}
        />
      )}

      <NavbarWithHide
        user={user}
        pageTitle={searchQuery || cityQuery || categoryQuery ? 'Wyniki' : 'Ogłoszenia'}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 md:px-6 pt-20 md:pt-24 pb-8 flex-1">
        <div className="hidden md:block md:mb-4">
          <h2 className="text-2xl md:text-4xl font-bold mb-3 text-foreground">
            {searchQuery || cityQuery || categoryQuery ? 'Wyniki wyszukiwania' : 'Wszystkie ogłoszenia'}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground">
            {searchQuery || cityQuery || categoryQuery ? (
              <>
                Znaleziono {totalCount} {totalCount === 1 ? 'ogłoszenie' : 'ogłoszeń'}
                {searchQuery && <> dla "{searchQuery}"</>}
                {cityQuery && <> w "{cityQuery}"</>}
                {categoryQuery && <> w kategorii "{categoryName}"</>}
              </>
            ) : (
              <>Przeglądaj oferty i zapytania od użytkowników z całej Polski</>
            )}
          </p>
        </div>

        {/* Client component wrapper for filters and layout */}
        <PostsPageClient categories={categories}>
          <div className="space-y-6">
            {/* Posts Grid/List with filters */}
            {posts && posts.length > 0 ? (
              <PostsListWrapper
                initialPosts={posts}
                totalCount={totalCount}
                userFavorites={userFavorites}
                currentSort={sortQuery}
                searchParams={{
                  search: searchQuery,
                  city: cityQuery,
                  category: categoryQuery,
                  sort: sortQuery,
                  limit: String(itemsPerPage),
                }}
              />
            ) : (
              <div className="col-span-full text-center py-20">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                    <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {searchQuery || cityQuery || categoryQuery ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      )}
                    </svg>
                  </div>
                  <p className="text-xl font-semibold text-foreground mb-2">
                    {searchQuery || cityQuery || categoryQuery ? 'Nie znaleziono wyników' : 'Brak ogłoszeń'}
                  </p>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery || cityQuery || categoryQuery ? (
                      <>Spróbuj zmienić kryteria wyszukiwania lub wyczyść filtry</>
                    ) : (
                      <>Bądź pierwszy i dodaj swoje ogłoszenie!</>
                    )}
                  </p>
                  {searchQuery || cityQuery || categoryQuery ? (
                    <Link href="/results">
                      <Button className="rounded-full bg-brand hover:bg-brand/90 text-primary-foreground border border-border px-8">
                        Wyczyść filtry
                      </Button>
                    </Link>
                  ) : (
                    user && (
                      <Link href="/dashboard/my-posts/new">
                        <Button className="rounded-full bg-brand hover:bg-brand/90 text-primary-foreground border border-border px-8">
                          Dodaj ogłoszenie
                        </Button>
                      </Link>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </PostsPageClient>
      </main>

      <Footer />

      {/* Mobile Dock */}
    </div>
  )
}
