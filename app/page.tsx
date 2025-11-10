import Script from 'next/script'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { BetaBanner } from '@/components/BetaBanner'
import { Footer } from '@/components/Footer'
import { SectionRenderer } from '@/lib/homepage-sections/SectionRenderer'
import { createClient } from '@/lib/supabase/server'
import { HeroSection } from '@/components/HeroSection'
import { FeaturesSection } from '@/components/FeaturesSection'
import { CTASection } from '@/components/CTASection'
import { AnimatedSection } from '@/components/AnimatedSection'

// Revalidate cache co 1 godzinę (3600 sekund) dla lepszej wydajności
// Next.js automatycznie wyłącza caching w development mode
export const revalidate = 3600

export default async function Home() {
  const supabase = await createClient()

  // Fetch user and sections in parallel for better performance
  const [
    { data: { user } },
    { data: sections }
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('homepage_sections')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
  ])

  // Collect all PostsSection configs for batch processing
  const postsSectionConfigs = sections?.filter(section =>
    ['seeking_help', 'offering_help', 'newest_posts'].includes(section.type)
  ) || []

  // Fetch user favorites and pre-cache posts data for PostsSections in parallel
  const fetchPostsSectionData = async () => {
    const postsDataMap = new Map<string, any[]>()

    for (const section of postsSectionConfigs) {
      const config = section.config as any
      const limit = config.limit || 8
      const categoryFilter = config.category_filter as string[] | undefined
      const postTypeFilter = config.post_type_filter || config.post_type
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
        query = query.order('price', { ascending: sortOrder === 'asc', nullsFirst: false })
      } else if (sortBy === 'views') {
        query = query.order('view_count', { ascending: sortOrder === 'asc' })
      } else {
        query = query.order('created_at', { ascending: sortOrder === 'asc' })
      }

      // Apply filters
      if (postTypeFilter && postTypeFilter !== 'all') {
        query = query.eq('type', postTypeFilter)
      }

      if (categoryFilter && categoryFilter.length > 0) {
        query = query.in('category_id', categoryFilter)
      }

      const { data: posts } = await query
      if (posts && posts.length > 0) {
        postsDataMap.set(section.id, posts)
      }
    }

    return postsDataMap
  }

  const [postsDataMap, favoritesData] = await Promise.all([
    fetchPostsSectionData(),
    user ? supabase.from('favorites').select('post_id').eq('user_id', user.id) : Promise.resolve({ data: null })
  ])

  let userFavorites: string[] = []
  if (favoritesData?.data) {
    userFavorites = favoritesData.data.map(f => f.post_id) || []
  }

  // JSON-LD structured data for homepage
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://findsomeone.app'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'FindSomeone',
    description: 'Platforma łącząca ludzi w Twoim mieście. Lokalna pomoc - zakupy, remont, sprzątanie. Znajdź pomocnika lub oferuj swoją pomoc innym za darmo.',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/posts?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'FindSomeone',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: 'Darmowa platforma lokalnej pomocy łącząca ludzi w mieście. Pomoc przy zakupach, remoncie, sprzątaniu i inne drobne usługi.',
    areaServed: {
      '@type': 'Country',
      name: 'Polska',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'Polish',
    },
  }

  return (
    <>
      {/* JSON-LD structured data */}
      <Script
        id="json-ld-website"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Script
        id="json-ld-organization"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />

      <div className="min-h-screen bg-background">
        <NavbarWithHide user={user} />
        <BetaBanner />

          <main>
            <HeroSection user={user} />

        {/* Features Section - Only show for non-authenticated users */}
        {!user && (
          <AnimatedSection>
            <FeaturesSection />
          </AnimatedSection>
        )}

        {/* Dynamic Sections from Database */}
        {sections && sections.map((section) => (
          <SectionRenderer
            key={section.id}
            section={section}
            userFavorites={userFavorites}
            userId={user?.id}
            preloadedPostsData={postsDataMap.get(section.id)}
          />
        ))}

        {/* CTA Section - Only show for non-authenticated users - at bottom */}
        {!user && (
          <AnimatedSection>
            <CTASection />
          </AnimatedSection>
        )}
        </main>

        <Footer />
      </div>
    </>
  )
}
