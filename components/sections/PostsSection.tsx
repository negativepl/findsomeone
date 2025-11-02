import Link from 'next/link'
import { ScrollArrows } from '@/components/ScrollArrows'
import { ScrollGradients } from '@/components/ScrollGradients'
import { ScrollIndicator } from '@/components/ScrollIndicator'
import { PostCard } from '@/components/PostCard'
import { createClient } from '@/lib/supabase/server'
import { HomepageSection } from '@/lib/homepage-sections/types'

interface PostsSectionProps {
  section: HomepageSection
  userFavorites: string[]
}

export async function PostsSection({ section, userFavorites }: PostsSectionProps) {
  const supabase = await createClient()
  const config = section.config as any

  const limit = config.limit || 8
  const categoryFilter = config.category_filter as string[] | undefined
  const postTypeFilter = config.post_type_filter || config.post_type
  const showButton = config.show_see_all_button !== false
  const sortBy = config.sort_by || 'created_at'
  const sortOrder = config.sort_order || 'desc'

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
        name
      )
    `)
    .eq('status', 'active')
    .eq('is_deleted', false)
    .limit(limit)

  // Apply sorting
  if (sortBy === 'price') {
    // Sort by price
    query = query.order('price', { ascending: sortOrder === 'asc', nullsFirst: false })
  } else if (sortBy === 'views') {
    query = query.order('view_count', { ascending: sortOrder === 'asc' })
  } else {
    // Default: created_at
    query = query.order('created_at', { ascending: sortOrder === 'asc' })
  }

  // Apply post type filter if specified
  if (postTypeFilter && postTypeFilter !== 'all') {
    query = query.eq('type', postTypeFilter)
  }

  // Apply category filter if specified
  if (categoryFilter && categoryFilter.length > 0) {
    query = query.in('category_id', categoryFilter)
  }

  const { data: posts } = await query

  if (!posts || posts.length === 0) {
    return null
  }

  const title = section.title
  const subtitle = section.subtitle

  // All posts now redirect to the same page without type filter
  const buttonLink = '/posts'

  return (
    <section className="container mx-auto px-6 py-6 md:py-14">
      {/* Mobile: flat design */}
      <div className="md:hidden">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-black mb-2">{title}</h3>
          {subtitle && <p className="text-sm text-black/60">{subtitle}</p>}
        </div>

        <div className="relative -mx-6">
          <ScrollGradients containerId={`section-${section.id}-scroll-mobile`} />

          <div id={`section-${section.id}-scroll-mobile`} className="overflow-x-auto overflow-y-visible scrollbar-hide snap-x snap-mandatory w-full">
            <div className="horizontal-scroll-padding-mobile flex gap-4 pb-2">
              {posts.map((post: any, index: number) => (
                <PostCard
                  key={post.id}
                  post={post}
                  isFavorite={userFavorites.includes(post.id)}
                  priority={index < 3}
                />
              ))}
            </div>
          </div>
          <ScrollIndicator containerId={`section-${section.id}-scroll-mobile`} />
        </div>
      </div>

      {/* Desktop: card design */}
      <div className="hidden md:block bg-white rounded-3xl p-8 shadow-sm group/section overflow-visible">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h3 className="text-4xl font-bold text-black mb-2">{title}</h3>
            {subtitle && <p className="text-lg text-black/60">{subtitle}</p>}
          </div>
          {showButton && (
            <Link href={buttonLink} className="rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white px-6 py-2.5 text-sm font-medium transition-colors inline-block">
              Zobacz wszystkie
            </Link>
          )}
        </div>

        <div className="relative -mx-8">
          <ScrollArrows containerId={`section-${section.id}-scroll-desktop`} />
          <ScrollGradients containerId={`section-${section.id}-scroll-desktop`} />

          <div id={`section-${section.id}-scroll-desktop`} className="overflow-x-auto overflow-y-visible scrollbar-hide snap-x snap-mandatory w-full">
            <div className="horizontal-scroll-padding-mobile flex gap-4 pb-2">
              {posts.map((post: any, index: number) => (
                <PostCard
                  key={post.id}
                  post={post}
                  isFavorite={userFavorites.includes(post.id)}
                  priority={index < 3}
                />
              ))}
            </div>
          </div>
          <ScrollIndicator containerId={`section-${section.id}-scroll-desktop`} />
        </div>
      </div>
    </section>
  )
}
