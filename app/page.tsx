import Link from 'next/link'
import Script from 'next/script'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { Footer } from '@/components/Footer'
import { SectionRenderer } from '@/lib/homepage-sections/SectionRenderer'
import { createClient } from '@/lib/supabase/server'
import { HeroSection } from '@/components/HeroSection'

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

      <div className="min-h-screen bg-[#FAF8F3]">
        <NavbarWithHide user={user} />

        <HeroSection user={user} />

        {/* Features Section - Only show for non-authenticated users */}
        {!user && (
          <section className="container mx-auto px-6 py-12 md:py-14">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-0 rounded-3xl bg-white shadow-sm">
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center mb-5">
                    <svg className="w-7 h-7 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-black">Darmowe ogłoszenia</h3>
                  <p className="text-black/60 leading-relaxed">
                    Dodawanie ogłoszeń jest całkowicie darmowe. Bez ukrytych opłat, bez limitów. Publikuj ile chcesz!
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 rounded-3xl bg-white shadow-sm">
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center mb-5">
                    <svg className="w-7 h-7 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-black">Szybki kontakt</h3>
                  <p className="text-black/60 leading-relaxed">
                    Wbudowany system wiadomości umożliwia bezpieczną komunikację. Negocjuj warunki i ustalaj szczegóły bez podawania telefonu.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 rounded-3xl bg-white shadow-sm">
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center mb-5">
                    <svg className="w-7 h-7 text-[#C44E35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-black">Bezpieczne i zaufane</h3>
                  <p className="text-black/60 leading-relaxed">
                    System ocen i opinii pomaga budować zaufanie. Moderacja AI i zgłoszenia zapewniają bezpieczeństwo platformy.
                  </p>
                </CardContent>
              </Card>
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
        {!user && (
          <section className="container mx-auto px-6 py-12 md:py-14 text-center">
            <div className="bg-[#1A1A1A] rounded-[3rem] p-16 text-white relative overflow-hidden">
              {/* Dekoracyjny gradient w tle */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#F4A261]/10 to-transparent pointer-events-none" />

              <div className="relative z-10">
                <h3 className="text-5xl font-bold mb-6">Czas zacząć!</h3>
                <p className="text-xl mb-10 text-white/70 max-w-2xl mx-auto">
                  Dołącz do tysięcy użytkowników, którzy znajdują i oferują lokalne usługi
                </p>
                <Link href="/signup">
                  <Button size="lg" className="text-lg px-10 py-6 rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0 transition-all">
                    Utwórz darmowe konto
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        )}

        <Footer />
      </div>
    </>
  )
}
