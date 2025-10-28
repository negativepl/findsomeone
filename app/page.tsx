import Script from 'next/script'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { Footer } from '@/components/Footer'
import { SectionRenderer } from '@/lib/homepage-sections/SectionRenderer'
import { createClient } from '@/lib/supabase/server'
import { HeroSection } from '@/components/HeroSection'
import { FeatureCard } from '@/components/FeatureCard'
import { CTASection } from '@/components/CTASection'

// Revalidate cache co 5 minut (300 sekund)
// Można zmienić na 3600 (1h) dla większego trafficu
export const revalidate = 300

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch active homepage sections
  const { data: sections } = await supabase
    .from('homepage_sections')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  // Fetch user favorites if logged in
  let userFavorites: string[] = []
  if (user) {
    const { data: favoritesData } = await supabase
      .from('favorites')
      .select('post_id')
      .eq('user_id', user.id)

    userFavorites = favoritesData?.map(f => f.post_id) || []
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

      <div className="min-h-screen bg-[#FAF8F3] relative">
        {/* Gradient overlay - covers entire viewport from top */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 120% 60% at 50% 0%, rgba(196, 78, 53, 0.15) 0%, rgba(196, 78, 53, 0.08) 30%, transparent 70%)',
            zIndex: 0
          }}
        />

        <div className="relative z-10">
          <NavbarWithHide user={user} />

          <HeroSection user={user} />

        {/* Features Section - Only show for non-authenticated users */}
        {!user && (
          <section className="container mx-auto px-6 py-12 md:py-14">
            <div className="grid md:grid-cols-3 gap-6">
              <FeatureCard
                animationPath="/animations/coins.json"
                title="Darmowe ogłoszenia"
                description="Dodawanie ogłoszeń jest całkowicie darmowe. Bez ukrytych opłat, bez limitów. Publikuj ile chcesz!"
              />

              <FeatureCard
                animationPath="/animations/conversation.json"
                title="Szybki kontakt"
                description="Wbudowany system wiadomości umożliwia bezpieczną komunikację. Negocjuj warunki i ustalaj szczegóły bez podawania telefonu."
              />

              <FeatureCard
                animationPath="/animations/heart.json"
                title="Bezpieczeństwo"
                description="System ocen i opinii pomaga budować zaufanie. Moderacja AI i zgłoszenia zapewniają bezpieczeństwo platformy."
              />
            </div>
          </section>
        )}

        {/* Dynamic Sections from Database */}
        {sections && sections.map((section) => (
          <SectionRenderer
            key={section.id}
            section={section}
            userFavorites={userFavorites}
            userId={user?.id}
          />
        ))}

        {/* CTA Section - Only show for non-authenticated users - at bottom */}
        {!user && <CTASection />}

        <Footer />
        </div>
      </div>
    </>
  )
}
