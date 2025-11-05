import Script from 'next/script'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { Footer } from '@/components/Footer'
import { SectionRenderer } from '@/lib/homepage-sections/SectionRenderer'
import { createClient } from '@/lib/supabase/server'
import { HeroSection } from '@/components/HeroSection'
import { FeatureCard } from '@/components/FeatureCard'
import { CTASection } from '@/components/CTASection'

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

      <div className="min-h-screen bg-background">
        <NavbarWithHide user={user} />

          <main>
            <HeroSection user={user} />

        {/* Features Section - Only show for non-authenticated users */}
        {!user && (
          <section className="container mx-auto px-6 py-3 md:py-14">
            <div className="grid md:grid-cols-3 gap-6">
              <FeatureCard
                icon={
                  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
                      <path d="M20.25 3.75H3.75v10.5h16.5zm-16.5 16.5h16.5m-16.5-3h16.5"/>
                      <path d="M12 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5"/>
                      <path fill="currentColor" d="M5.25 3.75c0 .83-.67 1.5-1.5 1.5v-1.5zm-1.5 9h.2c.72 0 1.3.58 1.3 1.3v.2h-1.5zm16.5-7.5h-.2c-.72 0-1.3-.58-1.3-1.3v-.2h1.5zm-1.5 9v-.2c0-.72.58-1.3 1.3-1.3h.2v1.5z"/>
                    </g>
                  </svg>
                }
                title="Darmowe ogłoszenia"
                description="Dodawanie ogłoszeń jest całkowicie darmowe. Bez ukrytych opłat, bez limitów. Publikuj ogłoszenia gdzie i ile chcesz!"
              />

              <FeatureCard
                icon={
                  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20.25 14.93v3.3c0 1.23-1.09 2.17-2.31 2C10.6 19.21 4.79 13.4 3.77 6.06c-.17-1.22.77-2.31 2-2.31h3.3a1 1 0 0 1 .99.83l.39 2.19c.14.77-.18 1.55-.82 2l-.89.63c1.43 2.41 3.46 4.42 5.88 5.84l.61-.87c.45-.64 1.23-.96 2-.82l2.19.39c.48.09.83.5.83.99"/>
                  </svg>
                }
                title="Szybki kontakt"
                description="Wbudowany system wiadomości umożliwia bezpieczną komunikację. Negocjuj warunki i ustalaj szczegóły bez podawania telefonu."
              />

              <FeatureCard
                icon={
                  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" d="M3.75 6.25S10 5 12 3.75c2 1.25 8.251 2.5 8.251 2.5-.911 6.09-2.961 10.6-8.251 14-5.25-3.4-7.6-7.91-8.25-14Z"/>
                  </svg>
                }
                title="Bezpieczeństwo"
                description="Oceny i opinie pomagają Ci wybrać sprawdzone osoby. AI weryfikuje treści, a Ty możesz zgłosić podejrzane wiadomości i oferty."
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
        </main>

        <Footer />
      </div>
    </>
  )
}
