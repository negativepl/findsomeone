import { createClient } from '@/lib/supabase/server'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { Footer } from '@/components/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Metadata } from 'next'
import { Zap, Smartphone, Wifi, Apple, Chrome, Monitor } from 'lucide-react'

export const metadata: Metadata = {
  title: "Zainstaluj aplikację - FindSomeone",
  description: "Zainstaluj FindSomeone jako aplikację PWA na swoim urządzeniu - telefonie lub komputerze",
}

export default async function InstallPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      <NavbarWithHide user={user} pageTitle="Zainstaluj aplikację" />

      <main className="container mx-auto px-4 md:px-6 py-2 md:py-4">
        <div className="mb-4 hidden md:block">
          <h1 className="text-2xl md:text-4xl font-bold text-black mb-3">Zainstaluj aplikację</h1>
          <p className="text-base md:text-lg text-black/60">
            Korzystaj z FindSomeone jak z natywnej aplikacji mobilnej
          </p>
        </div>

        {/* Korzyści z instalacji */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-black mb-8 text-center">
            Dlaczego warto zainstalować?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-0 rounded-3xl bg-white">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-[#C44E35] text-white flex items-center justify-center mx-auto mb-6">
                  <Zap className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-black mb-3">Szybszy dostęp</h3>
                <p className="text-black/60">
                  Aplikacja uruchamia się błyskawicznie z ekranu głównego, bez potrzeby otwierania przeglądarki
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 rounded-3xl bg-white">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-[#C44E35] text-white flex items-center justify-center mx-auto mb-6">
                  <Smartphone className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-black mb-3">Natywne wrażenia</h3>
                <p className="text-black/60">
                  Pełnoekranowy interfejs bez elementów przeglądarki dla lepszej wygody użytkowania
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 rounded-3xl bg-white">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-[#C44E35] text-white flex items-center justify-center mx-auto mb-6">
                  <Wifi className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-black mb-3">Działa offline</h3>
                <p className="text-black/60">
                  Przeglądaj zapisane treści nawet bez połączenia z internetem
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Instrukcje dla telefonu */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-black mb-8">
            Instalacja na telefonie
          </h2>

          {/* iPhone / Safari */}
          <Card className="border-0 rounded-3xl bg-white mb-6">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-black mb-4 flex items-center gap-3">
                <Apple className="w-6 h-6" /> iPhone / iPad (Safari)
              </h3>
              <ol className="space-y-3 text-black/70">
                <li className="flex gap-3">
                  <span className="font-bold text-[#C44E35] min-w-[24px]">1.</span>
                  <span>Otwórz stronę FindSomeone.pl w przeglądarce Safari</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-[#C44E35] min-w-[24px]">2.</span>
                  <span>Kliknij przycisk &quot;Udostępnij&quot; (ikona kwadratu ze strzałką w górę) na dole ekranu</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-[#C44E35] min-w-[24px]">3.</span>
                  <span>Przewiń w dół i wybierz opcję &quot;Dodaj do ekranu początkowego&quot;</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-[#C44E35] min-w-[24px]">4.</span>
                  <span>Możesz zmienić nazwę aplikacji, a następnie kliknij &quot;Dodaj&quot;</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-[#C44E35] min-w-[24px]">5.</span>
                  <span>Gotowe! Ikona FindSomeone pojawi się na ekranie głównym</span>
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Android / Chrome */}
          <Card className="border-0 rounded-3xl bg-white">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-black mb-4 flex items-center gap-3">
                <Chrome className="w-6 h-6" /> Android (Chrome)
              </h3>
              <ol className="space-y-3 text-black/70">
                <li className="flex gap-3">
                  <span className="font-bold text-[#C44E35] min-w-[24px]">1.</span>
                  <span>Otwórz stronę FindSomeone.pl w przeglądarce Chrome</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-[#C44E35] min-w-[24px]">2.</span>
                  <span>Kliknij ikonę menu (trzy kropki) w prawym górnym rogu</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-[#C44E35] min-w-[24px]">3.</span>
                  <span>Wybierz &quot;Dodaj do ekranu głównego&quot; lub &quot;Zainstaluj aplikację&quot;</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-[#C44E35] min-w-[24px]">4.</span>
                  <span>Potwierdź instalację klikając &quot;Zainstaluj&quot;</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-[#C44E35] min-w-[24px]">5.</span>
                  <span>Aplikacja pojawi się na ekranie głównym i w szufladzie aplikacji</span>
                </li>
              </ol>
            </CardContent>
          </Card>
        </section>

        {/* Instrukcje dla komputera */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-black mb-8">
            Instalacja na komputerze
          </h2>

          {/* Chrome */}
          <Card className="border-0 rounded-3xl bg-white mb-6">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-black mb-4 flex items-center gap-3">
                <Chrome className="w-6 h-6" /> Google Chrome
              </h3>
              <ol className="space-y-3 text-black/70">
                <li className="flex gap-3">
                  <span className="font-bold text-[#C44E35] min-w-[24px]">1.</span>
                  <span>Otwórz stronę FindSomeone.pl w przeglądarce Chrome</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-[#C44E35] min-w-[24px]">2.</span>
                  <span>Kliknij ikonę instalacji (ikona komputera/plus) w prawej części paska adresu</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-[#C44E35] min-w-[24px]">3.</span>
                  <span>Kliknij przycisk &quot;Zainstaluj&quot; w wyświetlonym okienku</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-[#C44E35] min-w-[24px]">4.</span>
                  <span>Aplikacja otworzy się w osobnym oknie i pojawi się w menu Start</span>
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Edge */}
          <Card className="border-0 rounded-3xl bg-white mb-6">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-black mb-4 flex items-center gap-3">
                <Monitor className="w-6 h-6" /> Microsoft Edge
              </h3>
              <ol className="space-y-3 text-black/70">
                <li className="flex gap-3">
                  <span className="font-bold text-[#C44E35] min-w-[24px]">1.</span>
                  <span>Otwórz stronę FindSomeone.pl w przeglądarce Edge</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-[#C44E35] min-w-[24px]">2.</span>
                  <span>Kliknij ikonę menu (trzy kropki) w prawym górnym rogu</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-[#C44E35] min-w-[24px]">3.</span>
                  <span>Wybierz &quot;Aplikacje&quot; → &quot;Zainstaluj tę witrynę jako aplikację&quot;</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-[#C44E35] min-w-[24px]">4.</span>
                  <span>Potwierdź instalację klikając &quot;Zainstaluj&quot;</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-[#C44E35] min-w-[24px]">5.</span>
                  <span>Aplikacja otworzy się w osobnym oknie i będzie dostępna z paska zadań</span>
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Safari (Mac) */}
          <Card className="border-0 rounded-3xl bg-white">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-black mb-4 flex items-center gap-3">
                <Apple className="w-6 h-6" /> Safari (macOS)
              </h3>
              <p className="text-black/60 mb-4">
                Safari na macOS nie wspiera natywnej instalacji PWA. Zalecamy użycie Chrome lub Edge dla pełnej funkcjonalności aplikacji.
              </p>
              <p className="text-black/60">
                Alternatywnie możesz dodać zakładkę do Docka lub paska narzędzi dla szybkiego dostępu.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* FAQ */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-black mb-8">
            Często zadawane pytania
          </h2>

          <Card className="border-0 rounded-3xl bg-white">
            <CardContent className="p-8 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-black mb-2">Czy instalacja aplikacji jest bezpieczna?</h3>
                <p className="text-black/60">
                  Tak, jest całkowicie bezpieczna. Instalujesz oficjalną wersję strony FindSomeone jako aplikację Progressive Web App (PWA). Nie pobierasz żadnych zewnętrznych plików.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-black mb-2">Czy aplikacja zajmuje dużo miejsca?</h3>
                <p className="text-black/60">
                  Nie, PWA są bardzo lekkie i zajmują znacznie mniej miejsca niż tradycyjne aplikacje mobilne - zazwyczaj tylko kilka megabajtów.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-black mb-2">Czy mogę odinstalować aplikację?</h3>
                <p className="text-black/60">
                  Tak, aplikację możesz odinstalować w każdej chwili tak samo jak każdą inną aplikację na swoim urządzeniu - przytrzymaj ikonę i wybierz &quot;Odinstaluj&quot; lub &quot;Usuń&quot;.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-black mb-2">Czy aplikacja aktualizuje się automatycznie?</h3>
                <p className="text-black/60">
                  Tak, aplikacja PWA aktualizuje się automatycznie przy każdym uruchomieniu, gdy jest połączenie z internetem. Zawsze masz najnowszą wersję.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  )
}
