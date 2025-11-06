import { createClient } from '@/lib/supabase/server'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { AnimatedSection } from '@/components/AnimatedSection'
import { AnimatedHeroText } from '@/components/AnimatedHeroText'
import { Metadata } from 'next'
import Link from 'next/link'

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

      <main className="relative pt-20">
        {/* Hero Section */}
        <section className="container mx-auto px-6 py-32 md:py-48 min-h-[80vh] flex items-center">
          <AnimatedSection className="w-full">
            <AnimatedHeroText />
          </AnimatedSection>
        </section>

        {/* Co nas wyróżnia */}
        <section className="container mx-auto px-6 py-32 md:py-48">
          <div className="max-w-5xl mx-auto">
            <AnimatedSection>
              <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-24 text-center">
                Czym jest FindSomeone?
              </h2>
            </AnimatedSection>

            <div className="grid md:grid-cols-2 gap-12 md:gap-16">
              <AnimatedSection delay={100}>
                <div className="bg-card border border-border rounded-3xl p-10 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                  <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center mb-8">
                    <svg className="w-8 h-8 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground mb-5">Lokalna społeczność</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Platforma stworzona z myślą o łączeniu ludzi w okolicy. Znajdź to, czego szukasz lub zaproponuj swoje usługi - wszystko blisko Ciebie.
                  </p>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={200}>
                <div className="bg-card border border-border rounded-3xl p-10 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                  <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center mb-8">
                    <svg className="w-8 h-8 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground mb-5">Wyjątkowy design</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Piękno i funkcjonalność w jednym. Każdy piksel został zaprojektowany z myślą o intuicyjnym i przyjemnym doświadczeniu użytkownika.
                  </p>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={300}>
                <div className="bg-card border border-border rounded-3xl p-10 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                  <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center mb-8">
                    <svg className="w-8 h-8 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground mb-5">Szybkie i proste</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Bez zbędnych komplikacji. Dodaj ogłoszenie w kilka sekund, przeglądaj oferty w swojej okolicy i nawiązuj bezpośredni kontakt.
                  </p>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={400}>
                <div className="bg-card border border-border rounded-3xl p-10 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                  <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center mb-8">
                    <svg className="w-8 h-8 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground mb-5">Bezpieczeństwo</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Twoje dane są chronione. Kontrolujesz, co udostępniasz i z kim się kontaktujesz. Prywatność przede wszystkim.
                  </p>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Nasza misja */}
        <section className="bg-card border-y border-border">
          <div className="container mx-auto px-6 py-32 md:py-48">
            <AnimatedSection>
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-12">
                  Nasza misja
                </h2>
                <div className="space-y-8">
                  <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                    Wierzymy, że najlepsze rzeczy dzieją się lokalnie. Naszym celem jest <strong className="text-foreground">połączenie ludzi w okolicy</strong>,
                    ułatwienie wymiany usług i budowanie silniejszych społeczności.
                  </p>
                  <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                    Projektujemy <strong className="text-foreground">wyjątkowe doświadczenia użytkownika</strong>, które są nie tylko piękne,
                    ale przede wszystkim funkcjonalne i intuicyjne. Każda funkcja, każda animacja, każdy kolor ma swoje znaczenie.
                  </p>
                  <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                    W świecie pełnym globalnych platform, chcemy przywrócić znaczenie <strong className="text-foreground">lokalności</strong>.
                    Poznaj swoich sąsiadów, wspieraj lokalny biznes, twórz autentyczne relacje.
                  </p>
                </div>
              </div>
            </AnimatedSection>
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-semibold text-foreground mb-3">Społeczność</h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      Stawiamy na relacje między ludźmi. Każda funkcja jest projektowana z myślą o budowaniu autentycznych połączeń lokalnych.
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
                  O twórcy
                </h2>
              </AnimatedSection>

              <AnimatedSection delay={200}>
                <div className="bg-background border border-border rounded-3xl p-10 md:p-16">
                  <div className="flex flex-col md:flex-row gap-12 items-center md:items-start">
                    <div className="w-40 h-40 rounded-3xl bg-gradient-to-br from-brand to-brand/60 flex-shrink-0 flex items-center justify-center shadow-xl">
                      <span className="text-5xl font-bold text-white">MB</span>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-3xl font-bold text-foreground mb-2">Marcin Baszewski</h3>
                      <p className="text-xl text-brand mb-8">Founder & Designer</p>

                      <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                        <p>
                          Mam 29 lat i pasjonuję się tworzeniem wyjątkowych doświadczeń cyfrowych.
                          Z dużym doświadczeniem w programowaniu, szczególnie kocham <strong className="text-foreground">projektowanie UI</strong> -
                          miejsce, gdzie technologia spotyka się z estetyką.
                        </p>
                        <p>
                          Wykorzystuję najnowsze narzędzia AI takie jak <strong className="text-foreground">Claude Code</strong> i <strong className="text-foreground">Cursor</strong>,
                          a nawet projektuję własne rozwiązania AI, które pomagają mi w codziennej pracy.
                          Jednak to, co sprawia mi najwięcej radości, to tworzenie pięknych, funkcjonalnych interfejsów.
                        </p>
                        <p>
                          FindSomeone to efekt połączenia mojej pasji do designu, technologii i chęci stworzenia czegoś wartościowego dla lokalnych społeczności.
                          Każdy element został starannie przemyślany, aby zapewnić najlepsze możliwe wrażenia użytkownika.
                        </p>
                      </div>

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
