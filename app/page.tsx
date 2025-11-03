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
                animationPathLight="/animations/coins.json"
                animationPathDark="/animations/coins-dark.json"
                fallbackSvgLight={
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 430 430">
                    <mask id="ExaLEMaqGFa" width="330" height="268" x="20" y="57" maskUnits="userSpaceOnUse" style={{ maskType: 'alpha' }}>
                      <path fill="#D9D9D9" d="M350 57.513H20V325h162.407c-17.058-20.647-27.307-47.126-27.307-76 0-65.943 53.457-119.4 119.4-119.4 28.641 0 54.927 10.084 75.5 26.896z"/>
                    </mask>
                    <g stroke="#121331" strokeLinejoin="round" strokeWidth="12" mask="url(#ExaLEMaqGFa)">
                      <rect width="237" height="56" x="88" y="81" rx="28"/>
                      <rect width="237" height="56" x="34" y="137" rx="28"/>
                      <rect width="237" height="56" x="87" y="193" rx="28"/>
                      <rect width="237" height="56" x="62" y="249" rx="28"/>
                    </g>
                    <path stroke="#121331" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="12" d="M274.5 368.4c65.943 0 119.4-53.457 119.4-119.4s-53.457-119.4-119.4-119.4S155.1 183.057 155.1 249s53.457 119.4 119.4 119.4"/>
                    <path stroke="#c44e35" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="12" d="M274.5 333.2c46.502 0 84.2-37.698 84.2-84.2s-37.698-84.2-84.2-84.2-84.2 37.698-84.2 84.2 37.698 84.2 84.2 84.2"/>
                  </svg>
                }
                fallbackSvgDark={
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 430 430">
                    <mask id="ExaLEMaqGFa2" width="330" height="268" x="20" y="57" maskUnits="userSpaceOnUse" style={{ maskType: 'alpha' }}>
                      <path fill="#D9D9D9" d="M350 57.513H20V325h162.407c-17.058-20.647-27.307-47.126-27.307-76 0-65.943 53.457-119.4 119.4-119.4 28.641 0 54.927 10.084 75.5 26.896z"/>
                    </mask>
                    <g stroke="#fff" strokeLinejoin="round" strokeWidth="12" mask="url(#ExaLEMaqGFa2)">
                      <rect width="237" height="56" x="88" y="81" rx="28"/>
                      <rect width="237" height="56" x="34" y="137" rx="28"/>
                      <rect width="237" height="56" x="87" y="193" rx="28"/>
                      <rect width="237" height="56" x="62" y="249" rx="28"/>
                    </g>
                    <path stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="12" d="M274.5 368.4c65.943 0 119.4-53.457 119.4-119.4s-53.457-119.4-119.4-119.4S155.1 183.057 155.1 249s53.457 119.4 119.4 119.4"/>
                    <path stroke="#c44e35" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="12" d="M274.5 333.2c46.502 0 84.2-37.698 84.2-84.2s-37.698-84.2-84.2-84.2-84.2 37.698-84.2 84.2 37.698 84.2 84.2 84.2"/>
                  </svg>
                }
                title="Darmowe ogłoszenia"
                description="Dodawanie ogłoszeń jest całkowicie darmowe. Bez ukrytych opłat, bez limitów. Publikuj ogłoszenia gdzie i ile chcesz!"
              />

              <FeatureCard
                animationPathLight="/animations/conversation.json"
                animationPathDark="/animations/conversation-dark.json"
                fallbackSvgLight={
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 430 430">
                    <path stroke="#121331" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="12" d="M130 290c16.569 0 30-13.431 30-30s-13.431-30-30-30-30 13.431-30 30 13.431 30 30 30"/>
                    <path stroke="#121331" strokeLinejoin="round" strokeWidth="12" d="M65 360c0-24.853 20.147-45 45-45h40c24.853 0 45 20.147 45 45v15H65z"/>
                    <path stroke="#121331" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="12" d="M300 290c16.569 0 30-13.431 30-30s-13.431-30-30-30-30 13.431-30 30 13.431 30 30 30"/>
                    <path stroke="#121331" strokeLinejoin="round" strokeWidth="12" d="M235 360c0-24.853 20.147-45 45-45h40c24.853 0 45 20.147 45 45v15H235z"/>
                    <mask id="htZOXkXU4Ia" width="215" height="173" x="41" y="27" maskUnits="userSpaceOnUse" style={{ maskType: 'alpha' }}>
                      <path fill="#D9D9D9" d="M255.158 27.934H41.376v171.492h213.782v-30.987L250 165h-45c-11.046 0-20-8.954-20-20V90c0-11.046 8.954-20 20-20h50.158z"/>
                    </mask>
                    <g mask="url(#htZOXkXU4Ia)">
                      <path stroke="#c44e35" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="12" d="M75 45c-11.046 0-20 8.954-20 20v60c0 11.046 8.954 20 20 20h45v40l60-40h45c11.046 0 20-8.954 20-20V65c0-11.046-8.954-20-20-20z"/>
                    </g>
                    <path stroke="#c44e35" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="12" d="M205 70c-11.046 0-20 8.954-20 20v55c0 11.046 8.954 20 20 20h45l60 40v-40h45c11.046 0 20-8.954 20-20V90c0-11.046-8.954-20-20-20z"/>
                  </svg>
                }
                fallbackSvgDark={
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 430 430">
                    <path stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="12" d="M130 290c16.569 0 30-13.431 30-30s-13.431-30-30-30-30 13.431-30 30 13.431 30 30 30"/>
                    <path stroke="#fff" strokeLinejoin="round" strokeWidth="12" d="M65 360c0-24.853 20.147-45 45-45h40c24.853 0 45 20.147 45 45v15H65z"/>
                    <path stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="12" d="M300 290c16.569 0 30-13.431 30-30s-13.431-30-30-30-30 13.431-30 30 13.431 30 30 30"/>
                    <path stroke="#fff" strokeLinejoin="round" strokeWidth="12" d="M235 360c0-24.853 20.147-45 45-45h40c24.853 0 45 20.147 45 45v15H235z"/>
                    <mask id="htZOXkXU4Ia2" width="215" height="173" x="41" y="27" maskUnits="userSpaceOnUse" style={{ maskType: 'alpha' }}>
                      <path fill="#D9D9D9" d="M255.158 27.934H41.376v171.492h213.782v-30.987L250 165h-45c-11.046 0-20-8.954-20-20V90c0-11.046 8.954-20 20-20h50.158z"/>
                    </mask>
                    <g mask="url(#htZOXkXU4Ia2)">
                      <path stroke="#c44e35" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="12" d="M75 45c-11.046 0-20 8.954-20 20v60c0 11.046 8.954 20 20 20h45v40l60-40h45c11.046 0 20-8.954 20-20V65c0-11.046-8.954-20-20-20z"/>
                    </g>
                    <path stroke="#c44e35" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="12" d="M205 70c-11.046 0-20 8.954-20 20v55c0 11.046 8.954 20 20 20h45l60 40v-40h45c11.046 0 20-8.954 20-20V90c0-11.046-8.954-20-20-20z"/>
                  </svg>
                }
                title="Szybki kontakt"
                description="Wbudowany system wiadomości umożliwia bezpieczną komunikację. Negocjuj warunki i ustalaj szczegóły bez podawania telefonu."
              />

              <FeatureCard
                animationPathLight="/animations/heart.json"
                animationPathDark="/animations/heart-dark.json"
                fallbackSvgLight={
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 430 430">
                    <g strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="12">
                      <path stroke="#c44e35" d="m215.067 105 21.518 43.842L285 155.835l-34.966 34.159 8.203 48.145-43.17-22.727-43.304 22.727 8.338-48.145L145 155.835l48.415-6.993z"/>
                      <path stroke="#121331" d="m215 30-12.835 9.167A85 85 0 0 1 152.76 55H100l-35 55 11.661 11.662A53 53 0 0 1 89.35 176.24l-25.375 74.432c-19.853 58.235 20.044 119.693 81.318 125.264l9.496.863A97.65 97.65 0 0 1 215 405m0-375 12.834 9.167A85 85 0 0 0 277.24 55H330l35 55-11.662 11.662a53 53 0 0 0-12.688 54.578l25.374 74.432c19.854 58.235-20.043 119.693-81.317 125.264l-9.497.863A97.65 97.65 0 0 0 215 405m-55-120h110m-90 35h70"/>
                    </g>
                  </svg>
                }
                fallbackSvgDark={
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 430 430">
                    <g strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="12">
                      <path stroke="#c44e35" d="m215.067 105 21.518 43.842L285 155.835l-34.966 34.159 8.203 48.145-43.17-22.727-43.304 22.727 8.338-48.145L145 155.835l48.415-6.993z"/>
                      <path stroke="#fff" d="m215 30-12.835 9.167A85 85 0 0 1 152.76 55H100l-35 55 11.661 11.662A53 53 0 0 1 89.35 176.24l-25.375 74.432c-19.853 58.235 20.044 119.693 81.318 125.264l9.496.863A97.65 97.65 0 0 1 215 405m0-375 12.834 9.167A85 85 0 0 0 277.24 55H330l35 55-11.662 11.662a53 53 0 0 0-12.688 54.578l25.374 74.432c19.854 58.235-20.043 119.693-81.317 125.264l-9.497.863A97.65 97.65 0 0 0 215 405m-55-120h110m-90 35h70"/>
                    </g>
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
