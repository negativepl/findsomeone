import Link from 'next/link'
import { Button } from '@/components/ui/card'
import { ScrollArrows } from '@/components/ScrollArrows'
import { PostCard } from '@/components/PostCard'
import { createClient } from '@/lib/supabase/server'
import { HomepageSection } from '@/lib/homepage-sections/types'

interface SeekingHelpSectionProps {
  section: HomepageSection
  userFavorites: string[]
}

export async function SeekingHelpSection({ section, userFavorites }: SeekingHelpSectionProps) {
  const supabase = await createClient()
  const config = section.config as any

  const limit = config.limit || 8
  const categoryFilter = config.category_filter as string[] | undefined
  const showButton = config.show_see_all_button !== false

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
    .order('created_at', { ascending: false })
    .limit(limit)

  if (categoryFilter && categoryFilter.length > 0) {
    query = query.in('category_id', categoryFilter)
  }

  const { data: posts } = await query

  if (!posts || posts.length === 0) {
    return null
  }

  const title = section.title || 'Szukają pomocy'
  const subtitle = section.subtitle || 'Sprawdź kto potrzebuje Twoich usług'

  return (
    <section className="container mx-auto px-6 py-12 md:py-14">
      <div className="bg-card rounded-3xl p-6 md:p-8 group/section">
        <div className="flex items-center justify-between mb-8 md:mb-12">
          <div>
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{title}</h3>
            <p className="text-lg text-muted-foreground">{subtitle}</p>
          </div>
          {showButton && (
            <div className="hidden md:block">
              <Link href="/posts">
                <button className="rounded-full bg-brand hover:bg-brand/90 text-brand-foreground px-6 py-3 font-medium transition-colors">
                  Zobacz wszystkie
                </button>
              </Link>
            </div>
          )}
        </div>

        <div className="relative">
          <div className="hidden md:block">
            <ScrollArrows containerId={`section-${section.id}-scroll`} />
          </div>
          <div id={`section-${section.id}-scroll`} className="overflow-x-auto scrollbar-hide -mx-6 md:-mx-8 snap-x snap-mandatory">
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
