import Link from 'next/link'
import { ScrollArrows } from '@/components/ScrollArrows'
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
    // Sort by price_min (or price_max if min is null)
    query = query.order('price_min', { ascending: sortOrder === 'asc', nullsFirst: false })
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

  // Determine button link based on section type
  let buttonLink = '/posts'
  if (section.type === 'seeking_help') {
    buttonLink = '/posts?type=seeking'
  } else if (section.type === 'offering_help') {
    buttonLink = '/posts?type=offering'
  }

  return (
    <section className="container mx-auto px-6 py-12 md:py-14">
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm group/section">
        <div className="flex items-center justify-between mb-8 md:mb-12">
          <div>
            <h3 className="text-3xl md:text-4xl font-bold text-black mb-2">{title}</h3>
            {subtitle && <p className="text-lg text-black/60">{subtitle}</p>}
          </div>
          {showButton && (
            <div className="hidden md:block">
              <Link href={buttonLink}>
                <button className="rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white px-6 py-2.5 text-sm font-medium transition-colors">
                  Zobacz wszystkie
                </button>
              </Link>
            </div>
          )}
        </div>

        <div className="relative">
          <div className="hidden md:block">
            <ScrollArrows containerId={`section-${section.id}`} />
          </div>
          <div id={`section-${section.id}`} className="overflow-x-auto scrollbar-hide -mx-6 md:-mx-8 snap-x snap-mandatory">
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
        </div>
      </div>
    </section>
  )
}
