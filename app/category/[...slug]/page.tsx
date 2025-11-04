import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { Footer } from '@/components/Footer'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { ChevronRight } from 'lucide-react'
import { PostsListWrapper } from '@/app/posts/PostsListWrapper'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  parent_id: string | null
  display_order: number
  description?: string | null
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

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  // Get the last slug (current category)
  const currentSlug = slug[slug.length - 1]

  const { data: category } = await supabase
    .from('categories')
    .select('name, description')
    .eq('slug', currentSlug)
    .single()

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://findsomeone.app'
  const title = category ? `${category.name} | FindSomeone` : 'Kategoria | FindSomeone'
  const description = category?.description || `Przeglądaj ${category?.name || 'kategorie'} w FindSomeone`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/category/${slug.join('/')}`,
      siteName: 'FindSomeone',
      locale: 'pl_PL',
      type: 'website',
    },
    alternates: {
      canonical: `${baseUrl}/category/${slug.join('/')}`,
    },
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string[] }>
  searchParams: Promise<{ sort?: string; page?: string; limit?: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const params_data = await searchParams

  // Get the last slug (current category)
  const currentSlug = slug[slug.length - 1]

  // Fetch current category
  const { data: currentCategory } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', currentSlug)
    .single()

  if (!currentCategory) {
    notFound()
  }

  // Build breadcrumb trail
  const breadcrumbs: Category[] = []

  for (const slugPart of slug) {
    const { data: cat } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slugPart)
      .single()

    if (cat) {
      breadcrumbs.push(cat)
    }
  }

  // Fetch posts for this category (including subcategories)
  const sortQuery = params_data.sort || 'newest'
  const currentPage = parseInt(params_data.page || '1', 10)
  const itemsPerPage = parseInt(params_data.limit || '12', 10)

  // Get all subcategories recursively
  const getAllSubcategoryIds = async (categoryId: string): Promise<string[]> => {
    const { data: subs } = await supabase
      .from('categories')
      .select('id')
      .eq('parent_id', categoryId)

    if (!subs || subs.length === 0) return []

    const subIds = subs.map(s => s.id)
    const nestedIds = await Promise.all(subIds.map(id => getAllSubcategoryIds(id)))
    return [...subIds, ...nestedIds.flat()]
  }

  const subcategoryIds = await getAllSubcategoryIds(currentCategory.id)
  const allCategoryIds = [currentCategory.id, ...subcategoryIds]

  // Count query
  const { count: totalCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
    .in('category_id', allCategoryIds)

  // Fetch posts
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
    .in('category_id', allCategoryIds)

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

  // Apply pagination
  const startIndex = (currentPage - 1) * itemsPerPage
  const { data: posts } = await query.range(startIndex, startIndex + itemsPerPage - 1)

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
    <div className="min-h-screen bg-background">
      <NavbarWithHide user={user} pageTitle={currentCategory.name} />

      <main className="container mx-auto px-4 md:px-6 pt-20 md:pt-24 pb-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm mb-6 flex-wrap">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Start
          </Link>
          {breadcrumbs.map((crumb, index) => {
            const crumbPath = `/category/${slug.slice(0, index + 1).join('/')}`
            const isLast = index === breadcrumbs.length - 1

            return (
              <div key={crumb.id} className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                {isLast ? (
                  <span className="font-medium text-foreground">{crumb.name}</span>
                ) : (
                  <Link
                    href={crumbPath}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {crumb.name}
                  </Link>
                )}
              </div>
            )
          })}
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-foreground">
            {currentCategory.name}
          </h1>
          {totalCount !== null && (
            <p className="text-base md:text-lg text-muted-foreground">
              Znaleziono {totalCount} {totalCount === 1 ? 'ogłoszenie' : 'ogłoszeń'}
            </p>
          )}
        </div>

        {/* Two Column Layout: Sidebar + Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Left Sidebar - Filters Placeholder */}
          <aside className="lg:sticky lg:top-24 lg:self-start h-fit max-h-[calc(100vh-120px)] overflow-y-auto">
            <div className="bg-card border border-border rounded-2xl p-6 opacity-60 pointer-events-none relative">
              {/* Coming Soon Overlay */}
              <div className="absolute inset-0 flex items-start justify-center pt-8 z-10 pointer-events-none">
                <div className="bg-background/95 border border-border rounded-xl px-4 py-3 shadow-lg">
                  <p className="text-sm font-medium text-foreground text-center">
                    Filtry dostępne wkrótce
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Filtry</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-foreground"
                  disabled
                >
                  Wyczyść
                </Button>
              </div>

              <div className="space-y-6">
                {/* Location */}
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-3">Lokalizacja</h4>
                  <input
                    type="text"
                    placeholder="Wpisz miasto..."
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm mb-2"
                    disabled
                  />
                  <Select disabled>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Zasięg" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">+ 10 km</SelectItem>
                      <SelectItem value="25">+ 25 km</SelectItem>
                      <SelectItem value="50">+ 50 km</SelectItem>
                      <SelectItem value="100">+ 100 km</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-3">Budżet</h4>
                  <div className="space-y-2">
                    <input
                      type="number"
                      placeholder="Od (zł)"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                      disabled
                    />
                    <input
                      type="number"
                      placeholder="Do (zł)"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                      disabled
                    />
                  </div>
                </div>

                {/* Condition */}
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-3">Stan</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                      <input type="checkbox" className="rounded border-border" disabled />
                      <span>Nowy</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                      <input type="checkbox" className="rounded border-border" disabled />
                      <span>Używany</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                      <input type="checkbox" className="rounded border-border" disabled />
                      <span>Uszkodzony</span>
                    </label>
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-3">Dostępność</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                      <input type="checkbox" className="rounded border-border" disabled />
                      <span>Od zaraz</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                      <input type="checkbox" className="rounded border-border" disabled />
                      <span>W tym tygodniu</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                      <input type="checkbox" className="rounded border-border" disabled />
                      <span>W tym miesiącu</span>
                    </label>
                  </div>
                </div>

                {/* Additional Options */}
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-3">Dodatkowe</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                      <input type="checkbox" className="rounded border-border" disabled />
                      <span>Ze zdjęciami</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                      <input type="checkbox" className="rounded border-border" disabled />
                      <span>Z opiniami</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Content - Posts */}
          <div className="space-y-6">
            {posts && posts.length > 0 ? (
              <PostsListWrapper
                initialPosts={posts}
                totalCount={totalCount || 0}
                userFavorites={userFavorites}
                currentSort={sortQuery}
                searchParams={{
                  sort: sortQuery,
                  limit: String(itemsPerPage),
                }}
              />
            ) : (
              <div className="text-center py-20">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                    <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <p className="text-xl font-semibold text-foreground mb-2">
                    Brak ogłoszeń
                  </p>
                  <p className="text-muted-foreground mb-6">
                    W tej kategorii nie ma jeszcze żadnych ogłoszeń.
                  </p>
                  {user && (
                    <Link href="/dashboard/my-posts/new">
                      <Button className="rounded-full bg-brand hover:bg-brand/90 text-brand-foreground px-8">
                        Dodaj ogłoszenie
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
