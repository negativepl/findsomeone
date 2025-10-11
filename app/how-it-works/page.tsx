import { createClient } from '@/lib/supabase/server'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { Footer } from '@/components/Footer'
import { MobileDock } from '@/components/MobileDock'
import { Card, CardContent } from '@/components/ui/card'
import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: "Jak to działa - FindSomeone",
}

export default async function HowItWorksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-[#FAF8F3] pb-20 md:pb-0">
      <NavbarWithHide user={user} />

      <main className="container mx-auto px-6 py-10">
        <h1 className="text-4xl font-bold text-black mb-3">Jak to działa?</h1>
        <p className="text-lg text-black/60 mb-10">
          Prosty sposób na znalezienie lokalnych specjalistów
        </p>

        {/* Dla poszukujących */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-black mb-8 text-center">
              Szukasz specjalisty?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-0 rounded-3xl bg-white">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#C44E35] text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6">
                    1
                  </div>
                  <h3 className="text-xl font-bold text-black mb-3">Przeglądaj ogłoszenia</h3>
                  <p className="text-black/60">
                    Przeszukuj bazę ogłoszeń w swojej okolicy. Filtruj po kategorii, cenie i lokalizacji.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 rounded-3xl bg-white">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#C44E35] text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6">
                    2
                  </div>
                  <h3 className="text-xl font-bold text-black mb-3">Sprawdź opinie</h3>
                  <p className="text-black/60">
                    Zobacz oceny i komentarze innych użytkowników, którzy korzystali z usług danej osoby.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 rounded-3xl bg-white">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#C44E35] text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6">
                    3
                  </div>
                  <h3 className="text-xl font-bold text-black mb-3">Nawiąż kontakt</h3>
                  <p className="text-black/60">
                    Wyślij wiadomość przez naszą platformę i umów szczegóły współpracy.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Dla oferujących */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-black mb-8 text-center">
              Oferujesz usługi?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-0 rounded-3xl bg-white">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-black text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6">
                    1
                  </div>
                  <h3 className="text-xl font-bold text-black mb-3">Utwórz konto</h3>
                  <p className="text-black/60">
                    Zarejestruj się za darmo i uzupełnij swój profil informacjami o swoich umiejętnościach.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 rounded-3xl bg-white">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-black text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6">
                    2
                  </div>
                  <h3 className="text-xl font-bold text-black mb-3">Dodaj ogłoszenie</h3>
                  <p className="text-black/60">
                    Opisz swoje usługi, ustaw cenę i wskaż obszar, w którym działasz.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 rounded-3xl bg-white">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-black text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6">
                    3
                  </div>
                  <h3 className="text-xl font-bold text-black mb-3">Zdobywaj klientów</h3>
                  <p className="text-black/60">
                    Otrzymuj wiadomości od zainteresowanych i buduj swoją reputację przez pozytywne opinie.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* CTA */}
          <div className="bg-white rounded-3xl p-12 text-center">
            <h2 className="text-3xl font-bold text-black mb-4">
              Gotowy, żeby zacząć?
            </h2>
            <p className="text-lg text-black/60 mb-8">
              Dołącz do FindSomeone już dziś - to nic nie kosztuje!
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/signup">
                <Button className="rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0 px-8">
                  Zarejestruj się
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="rounded-full border-2 border-black/10 hover:border-black/30 hover:bg-black/5 px-8">
                  Przeglądaj ogłoszenia
                </Button>
              </Link>
            </div>
          </div>
      </main>

      <Footer />
      <MobileDock />
    </div>
  )
}
