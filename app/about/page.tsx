import { createClient } from '@/lib/supabase/server'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { Footer } from '@/components/Footer'
import { MobileDock } from '@/components/MobileDock'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "O nas - FindSomeone",
}

export default async function AboutPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-[#FAF8F3] pb-20 md:pb-0">
      <NavbarWithHide user={user} />

      <main className="container mx-auto px-6 py-10">
        <h1 className="text-4xl font-bold text-black mb-3">O nas</h1>
        <p className="text-lg text-black/60 mb-10">
          Poznaj naszą platformę łączącą ludzi lokalnie
        </p>

        <div className="prose prose-lg max-w-none">
            <p className="text-xl text-black/80 mb-8 leading-relaxed">
              FindSomeone to platforma łącząca ludzi lokalnie - zarówno tych, którzy szukają specjalistów,
              jak i tych, którzy oferują swoje usługi.
            </p>

            <div className="bg-white rounded-3xl p-8 mb-8">
              <h2 className="text-3xl font-bold text-black mb-4">Nasza misja</h2>
              <p className="text-black/70 leading-relaxed">
                Wierzymy, że każdy zasługuje na łatwy dostęp do lokalnych usług i możliwość oferowania
                swoich umiejętności. Nasza platforma umożliwia szybkie i bezpieczne nawiązywanie kontaktów
                między osobami poszukującymi pomocy a specjalistami w ich okolicy.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 mb-8">
              <h2 className="text-3xl font-bold text-black mb-4">Jak to się zaczęło</h2>
              <p className="text-black/70 leading-relaxed">
                FindSomeone powstał z potrzeby uproszczenia procesu znajdowania lokalnych specjalistów.
                Zauważyliśmy, że wiele osób ma trudności ze znalezieniem zaufanych fachowców w swojej okolicy,
                a z drugiej strony wielu utalentowanych specjalistów nie ma łatwego sposobu na dotarcie do
                potencjalnych klientów.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8">
              <h2 className="text-3xl font-bold text-black mb-4">Dlaczego warto nam zaufać</h2>
              <ul className="space-y-4 text-black/70">
                <li className="flex items-start gap-3">
                  <span className="text-[#C44E35] text-2xl">✓</span>
                  <span>Weryfikacja użytkowników i system ocen</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#C44E35] text-2xl">✓</span>
                  <span>Bezpieczna komunikacja przez wbudowany system wiadomości</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#C44E35] text-2xl">✓</span>
                  <span>Lokalne ogłoszenia - szybka pomoc w twojej okolicy</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#C44E35] text-2xl">✓</span>
                  <span>Darmowe przeglądanie ogłoszeń</span>
                </li>
              </ul>
            </div>
          </div>
      </main>

      <Footer />
      <MobileDock />
    </div>
  )
}
