import { createClient } from '@/lib/supabase/server'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { Footer } from '@/components/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: "Jak to działa | FindSomeone - Przewodnik krok po kroku",
  description: "Dowiedz się jak znaleźć lokalną pomoc w 4 prostych krokach. Rejestracja, przeglądanie ogłoszeń, kontakt i realizacja. Bezpłatna pomoc w zakupach, remoncie, sprzątaniu i więcej.",
  openGraph: {
    title: "Jak to działa | FindSomeone",
    description: "Poznaj prostą instrukcję korzystania z FindSomeone. Znajdź lub oferuj lokalną pomoc w kilka minut.",
    type: "website",
    locale: "pl_PL",
  },
}

export default async function HowItWorksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-background">
      <NavbarWithHide user={user} pageTitle="Jak to działa?" />

      <main className="container mx-auto px-4 md:px-6 pt-20 md:pt-24 pb-8">
        {/* Desktop header */}
        <div className="hidden md:block md:mb-4">
          <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-3">Jak to działa?</h1>
          <p className="text-base md:text-lg text-muted-foreground">
            Prosty sposób na znalezienie pomocy w okolicy
          </p>
        </div>

        {/* Dla poszukujących */}
          <section className="mb-6 md:mb-16">
            <div className="mb-4 md:mb-8">
              <h2 className="text-xl md:text-3xl font-bold text-foreground mb-1 text-left md:text-center">
                Szukasz pomocy?
              </h2>
              <p className="text-sm md:text-base text-muted-foreground text-left md:text-center">
                Znajdź odpowiednią osobę w kilku prostych krokach
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border border-border rounded-3xl bg-card">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-brand text-brand-foreground text-2xl font-bold flex items-center justify-center mx-auto mb-6">
                    1
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Przeglądaj ogłoszenia</h3>
                  <p className="text-muted-foreground">
                    Przeszukuj bazę ogłoszeń w swojej okolicy. Filtruj po kategorii, cenie i lokalizacji.
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-border rounded-3xl bg-card">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-brand text-brand-foreground text-2xl font-bold flex items-center justify-center mx-auto mb-6">
                    2
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Sprawdź opinie</h3>
                  <p className="text-muted-foreground">
                    Zobacz oceny i komentarze innych użytkowników, którzy korzystali z usług danej osoby.
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-border rounded-3xl bg-card">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-brand text-brand-foreground text-2xl font-bold flex items-center justify-center mx-auto mb-6">
                    3
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Nawiąż kontakt</h3>
                  <p className="text-muted-foreground">
                    Wyślij wiadomość przez naszą platformę i umów szczegóły współpracy.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Dla oferujących */}
          <section className="mb-6 md:mb-16">
            <div className="mb-4 md:mb-8">
              <h2 className="text-xl md:text-3xl font-bold text-foreground mb-1 text-left md:text-center">
                Chcesz pomóc innym?
              </h2>
              <p className="text-sm md:text-base text-muted-foreground text-left md:text-center">
                Zacznij oferować swoje usługi w okolicy
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border border-border rounded-3xl bg-card">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-brand text-brand-foreground text-2xl font-bold flex items-center justify-center mx-auto mb-6">
                    1
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Utwórz konto</h3>
                  <p className="text-muted-foreground">
                    Zarejestruj się za darmo i uzupełnij swój profil informacjami o swoich umiejętnościach.
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-border rounded-3xl bg-card">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-brand text-brand-foreground text-2xl font-bold flex items-center justify-center mx-auto mb-6">
                    2
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Dodaj ogłoszenie</h3>
                  <p className="text-muted-foreground">
                    Opisz w czym możesz pomóc, ustaw cenę i wskaż obszar, w którym działasz.
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-border rounded-3xl bg-card">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-brand text-brand-foreground text-2xl font-bold flex items-center justify-center mx-auto mb-6">
                    3
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Zdobywaj klientów</h3>
                  <p className="text-muted-foreground">
                    Otrzymuj wiadomości od zainteresowanych i buduj swoją reputację przez pozytywne opinie.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>
      </main>

      <Footer />
    </div>
  )
}
