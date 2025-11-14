import { createClient } from '@/lib/supabase/server'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { AnimatedSection } from '@/components/AnimatedSection'
import { AnimatedHeroText } from '@/components/AnimatedHeroText'
import { FullInteractiveBackground } from '@/components/FullInteractiveBackground'
import { SpotlightCard } from '@/components/SpotlightCard'
import { ScrollProgressIndicator } from '@/components/ScrollProgressIndicator'
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: "O nas | FindSomeone - Lokalna tablica ogłoszeń",
  description: "Poznaj historię FindSomeone - platformy łączącej ludzi lokalnie. Nasza misja to tworzenie pięknego i funkcjonalnego UX dla społeczności.",
  openGraph: {
    title: "O nas | FindSomeone",
    description: "Poznaj historię i misję FindSomeone - platformy łączącej ludzi lokalnie.",
    type: "website",
    locale: "pl_PL",
  },
}

export default async function AboutPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-background">
      <NavbarWithHide user={user} pageTitle="O nas" />
      <ScrollProgressIndicator />

      <main className="relative pt-20">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center">
          {/* Interactive Background with mouse tracking */}
          <FullInteractiveBackground />

          <div className="container mx-auto px-6 py-32 md:py-48 relative z-10">
            <AnimatedSection className="w-full">
              <AnimatedHeroText />
            </AnimatedSection>
          </div>
        </section>

        {/* Co nas wyróżnia */}
        <section className="container mx-auto px-6 py-32 md:py-48 -mt-32">
          <div className="max-w-5xl mx-auto">
            <AnimatedSection>
              <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-24 text-center">
                FindSomeone to:
              </h2>
            </AnimatedSection>

            <div className="grid md:grid-cols-2 gap-12 md:gap-16">
              <AnimatedSection delay={100}>
                <div className="bg-card border border-border rounded-3xl p-10 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                  <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center mb-8">
                    <svg className="w-8 h-8 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground mb-5">Darmowa platforma ogłoszeń</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Publikuj nieograniczoną liczbę ogłoszeń bez żadnych opłat. Brak ukrytych kosztów, brak limitów. Wszystko za darmo, zawsze.
                  </p>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={200}>
                <div className="bg-card border border-border rounded-3xl p-10 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                  <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center mb-8">
                    <svg className="w-8 h-8 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground mb-5">Bezpieczny sposób kontaktu</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Wbudowany system czatu w aplikacji. Negocjuj warunki i ustalaj szczegóły bez podawania numeru telefonu czy emaila.
                  </p>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={300}>
                <div className="bg-card border border-border rounded-3xl p-10 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                  <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center mb-8">
                    <svg className="w-8 h-8 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground mb-5">Inteligentny asystent AI</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Nawigatorek - Twój osobisty pomocnik AI. Zadaj pytanie w naturalnym języku, a Nawigatorek pomoże Ci znaleźć idealne ogłoszenia.
                  </p>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={400}>
                <div className="bg-card border border-border rounded-3xl p-10 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                  <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center mb-8">
                    <svg className="w-8 h-8 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground mb-5">Aplikacja na każde urządzenie</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Perfekcyjne działanie na każdym urządzeniu. Telefon, tablet czy komputer - zawsze płynne i intuicyjne doświadczenie.
                  </p>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Nasza misja */}
        <section className="relative bg-card border-y border-border overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand/15 rounded-full blur-[120px]" />
          </div>

          <div className="container mx-auto px-6 py-32 md:py-48 relative z-10">
            <AnimatedSection>
              <div className="text-center mb-20">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand/10 text-brand font-semibold text-sm mb-8">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                  Nasza wizja
                </div>
                <h2 className="text-5xl md:text-7xl font-bold text-foreground mb-6">
                  Misja, która nas <span className="bg-gradient-to-r from-brand to-brand/70 bg-clip-text text-transparent">inspiruje</span>
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  Budujemy przyszłość lokalnych społeczności
                </p>
              </div>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-6 max-w-7xl mx-auto">
              <SpotlightCard delay={0.1} className="h-full">
                <div className="group relative bg-background/50 backdrop-blur-sm border border-border rounded-3xl p-8 hover:border-brand/50 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] h-full flex flex-col">
                  <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex-1 flex flex-col">
                    <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-8 h-8 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-4">Innowacja i technologia</h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      Sztuczna inteligencja <span className="text-foreground font-medium">rysuje nowe horyzonty</span>. Śnimy o niemożliwym i tworzymy przyszłość, która wczoraj była jedynie marzeniem.
                    </p>
                  </div>
                </div>
              </SpotlightCard>

              <SpotlightCard delay={0.2} className="h-full">
                <div className="group relative bg-background/50 backdrop-blur-sm border border-border rounded-3xl p-8 hover:border-brand/50 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] h-full flex flex-col">
                  <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex-1 flex flex-col">
                    <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-8 h-8 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-4">Design z duszą</h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      Każdy piksel, każda animacja - <span className="text-foreground font-medium">opowiada swoją historię</span>. Projektujemy z pasją doświadczenia, które poruszają serca i inspirują umysły.
                    </p>
                  </div>
                </div>
              </SpotlightCard>

              <SpotlightCard delay={0.3} className="h-full">
                <div className="group relative bg-background/50 backdrop-blur-sm border border-border rounded-3xl p-8 hover:border-brand/50 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] h-full flex flex-col">
                  <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex-1 flex flex-col">
                    <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-8 h-8 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-4">Lokalność ma sens</h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      Gdy świat ucieka w globalność, <span className="text-foreground font-medium">my wracamy do korzeni</span>. Łączymy sąsiadów, budujemy społeczności, przywracamy bliskość lokalnych relacji.
                    </p>
                  </div>
                </div>
              </SpotlightCard>
            </div>
          </div>
        </section>

        {/* Wartości */}
        <section className="container mx-auto px-6 py-32 md:py-48">
          <div className="max-w-5xl mx-auto">
            <AnimatedSection>
              <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-24 text-center">
                Nasze wartości
              </h2>
            </AnimatedSection>

            <div className="space-y-16">
              <AnimatedSection delay={100}>
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="w-20 h-20 rounded-2xl bg-brand/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-10 h-10 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-semibold text-foreground mb-3">Prostota</h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      Wierzymy, że najlepsze rozwiązania są proste. Usuwamy zbędne komplikacje i koncentrujemy się na tym, co naprawdę ważne.
                    </p>
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={200}>
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="w-20 h-20 rounded-2xl bg-brand/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-10 h-10 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-semibold text-foreground mb-3">Innowacyjność</h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      Wykorzystujemy najnowsze technologie i narzędzia AI, aby tworzyć rozwiązania, które wyprzedzają oczekiwania użytkowników.
                    </p>
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={300}>
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="w-20 h-20 rounded-2xl bg-brand/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-10 h-10 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-semibold text-foreground mb-3">Ciągły rozwój</h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      Aktualizacje kilka razy w tygodniu, nowe funkcje i ulepszenia. Słuchamy Waszego feedbacku i nieustannie podnosimy poprzeczkę.
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* O twórcy */}
        <section className="bg-card border-y border-border">
          <div className="container mx-auto px-6 py-32 md:py-48">
            <div className="max-w-5xl mx-auto">
              <AnimatedSection>
                <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-24 text-center">
                  Parę słów od twórcy
                </h2>
              </AnimatedSection>

              <AnimatedSection delay={200}>
                <div className="bg-background border border-border rounded-3xl p-10 md:p-16">
                  <div className="flex flex-col md:flex-row gap-12 items-center md:items-start">
                    <div className="w-40 h-40 rounded-3xl flex-shrink-0 overflow-hidden shadow-xl ring-2 ring-brand/20">
                      <Image
                        src="/images/mbaszewski.webp"
                        alt="Marcin Baszewski"
                        width={160}
                        height={160}
                        className="w-full h-full object-cover"
                        priority
                      />
                    </div>

                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-3xl font-bold text-foreground mb-2">Marcin Baszewski</h3>
                      <p className="text-xl text-brand mb-8">Founder & Designer</p>

                      <blockquote className="relative pl-8 pr-4 py-6">
                        <div className="absolute -left-2 -top-4 text-6xl text-brand/20 font-serif">"</div>
                        <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                          <p>
                            Mam 29 lat i pasjonuję się tworzeniem wyjątkowych doświadczeń cyfrowych.
                            Od lat łączę programowanie z <strong className="text-foreground">projektowaniem UI</strong> -
                            miejscem, gdzie technologia spotyka się z estetyką.
                          </p>
                          <p>
                            Tworzę własne narzędzia AI - od inteligentnych chatbotów po systemy automatycznego generowania treści,
                            wykorzystując przy tym najnowsze technologie. Jednak to, co sprawia mi <strong className="text-foreground">najwięcej radości</strong>,
                            to projektowanie pięknych interfejsów. Choć nie uważam się za mistrza w tej dziedzinie, cały czas się uczę i rozwijam.
                          </p>
                          <p>
                            FindSomeone to efekt połączenia mojej pasji do designu, technologii i chęci stworzenia czegoś wartościowego dla lokalnych społeczności.
                            Każdy element został starannie przemyślany, aby zapewnić najlepsze możliwe wrażenia użytkownika.
                          </p>
                        </div>
                        <div className="absolute -right-2 -bottom-4 text-6xl text-brand/20 font-serif">"</div>
                      </blockquote>

                      <div className="mt-10">
                        <a
                          href="mailto:mbaszewski@findsomeone.app"
                          className="inline-flex items-center gap-3 text-brand hover:text-brand/80 transition-colors font-semibold text-lg"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          mbaszewski@findsomeone.app
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-brand/10 via-background to-brand/5 border-b border-border">
          <div className="container mx-auto px-6 py-32 md:py-48">
            <AnimatedSection>
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-8">
                  Dołącz do społeczności
                </h2>
                <p className="text-xl md:text-2xl text-muted-foreground mb-16 leading-relaxed max-w-2xl mx-auto">
                  Znajdź to, czego szukasz lub zaproponuj swoje usługi.
                  Wszystko zaczyna się od pierwszego ogłoszenia.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Link
                    href="/posts/create"
                    className="inline-flex items-center justify-center px-10 py-5 rounded-full bg-brand hover:bg-brand/90 text-brand-foreground font-semibold transition-all hover:scale-105 text-lg shadow-lg"
                  >
                    Dodaj ogłoszenie
                  </Link>
                  <Link
                    href="/posts"
                    className="inline-flex items-center justify-center px-10 py-5 rounded-full bg-card hover:bg-accent border-2 border-border text-foreground font-semibold transition-all hover:scale-105 text-lg"
                  >
                    Przeglądaj ogłoszenia
                  </Link>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </main>
    </div>
  )
}
