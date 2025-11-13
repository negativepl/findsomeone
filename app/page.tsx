import Script from 'next/script'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { BetaBanner } from '@/components/BetaBanner'
import { Footer } from '@/components/Footer'
import { SectionRenderer } from '@/lib/homepage-sections/SectionRenderer'
import { createClient } from '@/lib/supabase/server'
import { HeroSection } from '@/components/HeroSection'
import { BentoFeatures } from '@/components/BentoFeatures'
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
        .eq('moderation_status', 'approved')
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
    description: 'Platforma łącząca ludzi w Twoim mieście. Lokalne ogłoszenia - kupno, sprzedaż, wynajem, usługi. Znajdź to czego szukasz lub dodaj własne ogłoszenie za darmo.',
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
    description: 'Darmowa platforma lokalnych ogłoszeń łącząca ludzi w mieście. Kupno, sprzedaż, wynajem, usługi i inne ogłoszenia drobne.',
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

  // FAQ JSON-LD for AI search engines (Perplexity, ChatGPT, etc.)
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Co to jest FindSomeone?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'FindSomeone to darmowa platforma lokalnych ogłoszeń łącząca ludzi w Twoim mieście. Możesz sprzedawać, kupować, wynajmować rzeczy, oferować usługi lub znajdować to czego szukasz - wszystko lokalnie i za darmo.'
        }
      },
      {
        '@type': 'Question',
        name: 'Jak dodać ogłoszenie na FindSomeone?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Aby dodać ogłoszenie, zarejestruj się lub zaloguj, kliknij "Dodaj ogłoszenie", wybierz kategorię, wypełnij formularz z opisem, dodaj zdjęcia i opublikuj. Wszystko jest całkowicie darmowe bez żadnych limitów.'
        }
      },
      {
        '@type': 'Question',
        name: 'Czy FindSomeone jest darmowe?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Tak, FindSomeone jest w 100% darmowe. Możesz dodawać nieograniczoną liczbę ogłoszeń bez żadnych opłat, ukrytych kosztów czy limitów czasowych.'
        }
      },
      {
        '@type': 'Question',
        name: 'Jakie kategorie ogłoszeń są dostępne?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'FindSomeone oferuje szeroki wybór kategorii: sprzedaż i kupno rzeczy, wynajem mieszkań i nieruchomości, usługi fachowców (budowlane, remontowe, sprzątanie), praca i zlecenia, pomoc sąsiedzka, ogłoszenia drobne i wiele innych lokalnych kategorii.'
        }
      },
      {
        '@type': 'Question',
        name: 'Jak skontaktować się z osobą z ogłoszenia?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Możesz wysłać wiadomość przez wbudowany system czatu na FindSomeone, co chroni Twoją prywatność. Po uzgodnieniu szczegółów możesz wymienić się numerami telefonów bezpośrednio.'
        }
      },
      {
        '@type': 'Question',
        name: 'Gdzie działa FindSomeone?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'FindSomeone działa w całej Polsce. Możesz przeglądać i dodawać ogłoszenia w swojej okolicy - platforma automatycznie sortuje ogłoszenia według odległości od Ciebie, pokazując najbliższe oferty.'
        }
      },
      {
        '@type': 'Question',
        name: 'Czy mogę używać FindSomeone jako aplikacji mobilnej?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Tak! FindSomeone działa jako Progressive Web App (PWA). Możesz zainstalować ją na swoim telefonie jak zwykłą aplikację i korzystać offline. Działa na iOS i Android.'
        }
      },
      {
        '@type': 'Question',
        name: 'Jak FindSomeone różni się od OLX czy innych platform?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'FindSomeone to w 100% darmowa platforma bez opłat za promowanie ogłoszeń, bez limitów i reklam. Skupiamy się na lokalnych społecznościach, prostym interfejsie i bezpieczeństwie użytkowników. Dodatkowo oferujemy AI czat pomocniczy i zaawansowane wyszukiwanie lokalne.'
        }
      }
    ]
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
      <Script
        id="json-ld-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="min-h-screen bg-background">
        <NavbarWithHide user={user} />
        <BetaBanner />

          <main>
            <HeroSection user={user} />

        {/* Features Section - Only show for non-authenticated users */}
        {!user && (
          <AnimatedSection>
            <BentoFeatures />
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
