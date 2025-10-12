import { createClient } from '@/lib/supabase/server'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { Footer } from '@/components/Footer'
import { MobileDockWrapper } from '@/components/MobileDockWrapper'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Regulamin - FindSomeone",
}

export default async function TermsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-[#FAF8F3] pb-20 md:pb-0">
      <NavbarWithHide user={user} />

      <main className="container mx-auto px-6 py-10">
        <h1 className="text-4xl font-bold text-black mb-3">Regulamin</h1>
        <p className="text-lg text-black/60 mb-10">
          Zasady korzystania z platformy FindSomeone
        </p>

        <div className="bg-white rounded-3xl p-8 mb-8">
            <p className="text-black/60 mb-8">
              Ostatnia aktualizacja: {new Date().toLocaleDateString('pl-PL')}
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-black mb-4">1. Postanowienia ogólne</h2>
                <p className="text-black/70 leading-relaxed mb-4">
                  Niniejszy regulamin określa zasady korzystania z platformy FindSomeone,
                  dostępnej pod adresem [adres strony]. Korzystając z serwisu, akceptujesz
                  postanowienia niniejszego regulaminu.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-black mb-4">2. Definicje</h2>
                <ul className="space-y-3 text-black/70">
                  <li><strong>Platforma</strong> - serwis FindSomeone</li>
                  <li><strong>Użytkownik</strong> - osoba korzystająca z platformy</li>
                  <li><strong>Ogłoszenie</strong> - publikacja dotycząca poszukiwania lub oferowania usług</li>
                  <li><strong>Usługodawca</strong> - użytkownik oferujący usługi</li>
                  <li><strong>Usługobiorca</strong> - użytkownik poszukujący usług</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-black mb-4">3. Rejestracja i konto użytkownika</h2>
                <p className="text-black/70 leading-relaxed mb-4">
                  Aby w pełni korzystać z funkcji platformy, należy założyć konto użytkownika.
                  Użytkownik zobowiązany jest do podania prawdziwych danych oraz zachowania
                  poufności hasła dostępu.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-black mb-4">4. Zasady publikowania ogłoszeń</h2>
                <ul className="space-y-3 text-black/70 list-disc list-inside">
                  <li>Ogłoszenia muszą być zgodne z prawem polskim</li>
                  <li>Zabronione jest publikowanie treści obraźliwych lub dyskryminujących</li>
                  <li>Ogłoszenia muszą zawierać prawdziwe informacje</li>
                  <li>Zabronione jest spamowanie i duplikowanie ogłoszeń</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-black mb-4">5. Odpowiedzialność</h2>
                <p className="text-black/70 leading-relaxed mb-4">
                  Platforma FindSomeone pełni wyłącznie rolę pośrednika w kontaktach między
                  użytkownikami. Nie ponosimy odpowiedzialności za jakość świadczonych usług,
                  terminowość płatności ani inne aspekty transakcji między użytkownikami.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-black mb-4">6. Prywatność</h2>
                <p className="text-black/70 leading-relaxed mb-4">
                  Zasady przetwarzania danych osobowych określa nasza Polityka Prywatności.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-black mb-4">7. Kontakt</h2>
                <p className="text-black/70 leading-relaxed">
                  W przypadku pytań dotyczących regulaminu, prosimy o kontakt przez
                  formularz kontaktowy dostępny na stronie.
                </p>
              </section>
            </div>
          </div>
      </main>

      <Footer />
      <MobileDockWrapper user={user} />
    </div>
  )
}
