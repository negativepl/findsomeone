import { createClient } from '@/lib/supabase/server'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { Footer } from '@/components/Footer'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Polityka prywatności | FindSomeone - RODO",
  description: "Polityka prywatności FindSomeone. Dowiedz się jak chronimy Twoje dane osobowe, cookies, RODO. Transparentne zasady przetwarzania danych użytkowników platformy.",
  openGraph: {
    title: "Polityka prywatności | FindSomeone",
    description: "Poznaj jak FindSomeone dba o bezpieczeństwo Twoich danych osobowych zgodnie z RODO.",
    type: "website",
    locale: "pl_PL",
  },
}

export default async function PrivacyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      <NavbarWithHide user={user} pageTitle="Prywatność" />

      <main className="container mx-auto px-4 md:px-6 pt-20 md:pt-24 pb-8">
        {/* Header - Desktop only */}
        <div className="mb-8 hidden md:block">
          <h1 className="text-4xl font-bold text-black mb-3">Polityka prywatności</h1>
          <p className="text-lg text-black/60">
            Jak przetwarzamy i chronimy Twoje dane osobowe
          </p>
        </div>

        {/* Mobile flat, Desktop card */}
        <div className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-8 mb-8">
            <p className="text-black/60 mb-8">
              Ostatnia aktualizacja: 1.11.2025
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-black mb-4">1. Administrator danych</h2>
                <p className="text-black/70 leading-relaxed mb-4">
                  Administratorem danych osobowych zbieranych za pośrednictwem platformy FindSomeone jest Marcin Baszewski.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-black mb-4">2. Jakie dane zbieramy</h2>
                <p className="text-black/70 leading-relaxed mb-4">
                  Zbieramy następujące kategorie danych:
                </p>
                <ul className="space-y-3 text-black/70 list-disc list-inside">
                  <li>Dane identyfikacyjne (imię, nazwisko, adres email)</li>
                  <li>Dane kontaktowe (numer telefonu, miasto)</li>
                  <li>Dane dotyczące aktywności na platformie (ogłoszenia, wiadomości)</li>
                  <li>Dane techniczne (adres IP, typ urządzenia, przeglądarka)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-black mb-4">3. Cel przetwarzania danych</h2>
                <p className="text-black/70 leading-relaxed mb-4">
                  Twoje dane przetwarzamy w następujących celach:
                </p>
                <ul className="space-y-3 text-black/70 list-disc list-inside">
                  <li>Świadczenie usług platformy</li>
                  <li>Komunikacja z użytkownikami</li>
                  <li>Zapewnienie bezpieczeństwa platformy</li>
                  <li>Doskonalenie naszych usług</li>
                  <li>Spełnienie obowiązków prawnych</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-black mb-4">4. Podstawa prawna</h2>
                <p className="text-black/70 leading-relaxed mb-4">
                  Przetwarzanie danych odbywa się na podstawie:
                </p>
                <ul className="space-y-3 text-black/70 list-disc list-inside">
                  <li>Zgody użytkownika (Art. 6 ust. 1 lit. a RODO)</li>
                  <li>Niezbędności do wykonania umowy (Art. 6 ust. 1 lit. b RODO)</li>
                  <li>Prawnie uzasadnionego interesu administratora (Art. 6 ust. 1 lit. f RODO)</li>
                  <li>Obowiązku prawnego (Art. 6 ust. 1 lit. c RODO)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-black mb-4">5. Udostępnianie danych</h2>
                <p className="text-black/70 leading-relaxed mb-4">
                  Twoje dane możemy udostępniać:
                </p>
                <ul className="space-y-3 text-black/70 list-disc list-inside">
                  <li>Innym użytkownikom platformy (w zakresie informacji z ogłoszeń)</li>
                  <li>Dostawcom usług IT wspierającym naszą platformę</li>
                  <li>Organom państwowym na żądanie (gdy wymaga tego prawo)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-black mb-4">6. Twoje prawa</h2>
                <p className="text-black/70 leading-relaxed mb-4">
                  Masz prawo do:
                </p>
                <ul className="space-y-3 text-black/70 list-disc list-inside">
                  <li>Dostępu do swoich danych</li>
                  <li>Sprostowania danych</li>
                  <li>Usunięcia danych ("prawo do bycia zapomnianym")</li>
                  <li>Ograniczenia przetwarzania</li>
                  <li>Przenoszenia danych</li>
                  <li>Wniesienia sprzeciwu wobec przetwarzania</li>
                  <li>Cofnięcia zgody w dowolnym momencie</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-black mb-4">7. Pliki cookies</h2>

                <h3 className="text-xl font-semibold text-black mb-3 mt-6">7.1 Czym są pliki cookies?</h3>
                <p className="text-black/70 leading-relaxed mb-4">
                  Pliki cookies to małe pliki tekstowe zapisywane na Twoim urządzeniu przez przeglądarkę internetową.
                  Pozwalają nam zapamiętać Twoje preferencje i zapewnić lepsze działanie strony.
                </p>

                <h3 className="text-xl font-semibold text-black mb-3 mt-6">7.2 Jakie pliki cookies używamy?</h3>
                <p className="text-black/70 leading-relaxed mb-4">
                  Na naszej stronie wykorzystujemy następujące rodzaje plików cookies:
                </p>
                <ul className="space-y-3 text-black/70 list-disc list-inside mb-4">
                  <li>
                    <strong>Niezbędne (essential cookies)</strong> - wymagane do prawidłowego działania platformy,
                    w tym uwierzytelniania, sesji użytkownika i zabezpieczeń. Te pliki cookies nie wymagają zgody.
                  </li>
                  <li>
                    <strong>Funkcjonalne</strong> - zapamiętują Twoje preferencje (np. język, motyw ciemny/jasny),
                    umożliwiają zapamiętanie zgody na pliki cookies.
                  </li>
                  <li>
                    <strong>Analityczne</strong> - pomagają nam zrozumieć, jak użytkownicy korzystają ze strony
                    (np. Vercel Analytics, Google Analytics), abyśmy mogli ulepszać platformę.
                  </li>
                  <li>
                    <strong>Wydajnościowe</strong> - optymalizują wydajność strony i zbierają anonimowe dane
                    dotyczące szybkości ładowania (np. Vercel Speed Insights).
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-black mb-3 mt-6">7.3 Cele wykorzystania plików cookies</h3>
                <p className="text-black/70 leading-relaxed mb-4">
                  Pliki cookies wykorzystujemy w następujących celach:
                </p>
                <ul className="space-y-3 text-black/70 list-disc list-inside mb-4">
                  <li>Utrzymanie sesji zalogowanego użytkownika</li>
                  <li>Zapamiętywanie preferencji użytkownika (język, ustawienia wyświetlania)</li>
                  <li>Zapewnienie bezpieczeństwa platformy i ochrona przed atakami</li>
                  <li>Analiza ruchu i zachowań użytkowników w celu ulepszania platformy</li>
                  <li>Optymalizacja wydajności strony</li>
                  <li>Zapisywanie zgody na wykorzystanie plików cookies</li>
                </ul>

                <h3 className="text-xl font-semibold text-black mb-3 mt-6">7.4 Zarządzanie plikami cookies</h3>
                <p className="text-black/70 leading-relaxed mb-4">
                  Masz pełną kontrolę nad plikami cookies. Możesz:
                </p>
                <ul className="space-y-3 text-black/70 list-disc list-inside mb-4">
                  <li>Zaakceptować wszystkie pliki cookies klikając "Rozumiem" w banerze</li>
                  <li>Zablokować lub usunąć pliki cookies w ustawieniach swojej przeglądarki</li>
                  <li>Ustawić przeglądarkę tak, aby informowała Cię o każdym pliku cookie</li>
                </ul>
                <p className="text-black/70 leading-relaxed mb-4 italic">
                  <strong>Uwaga:</strong> Wyłączenie niezbędnych plików cookies może spowodować,
                  że niektóre funkcje platformy nie będą działać prawidłowo (np. logowanie, sesja użytkownika).
                </p>

                <h3 className="text-xl font-semibold text-black mb-3 mt-6">7.5 Pliki cookies osób trzecich</h3>
                <p className="text-black/70 leading-relaxed mb-4">
                  Nasza strona korzysta z usług osób trzecich, które mogą ustawiać własne pliki cookies:
                </p>
                <ul className="space-y-3 text-black/70 list-disc list-inside mb-4">
                  <li><strong>Vercel Analytics</strong> - analiza ruchu na stronie (anonimowa)</li>
                  <li><strong>Vercel Speed Insights</strong> - monitorowanie wydajności strony</li>
                  <li><strong>Supabase</strong> - uwierzytelnianie i sesje użytkowników</li>
                </ul>
                <p className="text-black/70 leading-relaxed mb-4">
                  Te usługi mają własne polityki prywatności, z którymi możesz się zapoznać na ich stronach internetowych.
                </p>

                <h3 className="text-xl font-semibold text-black mb-3 mt-6">7.6 Czas przechowywania cookies</h3>
                <p className="text-black/70 leading-relaxed mb-4">
                  Czas przechowywania plików cookies zależy od ich typu:
                </p>
                <ul className="space-y-3 text-black/70 list-disc list-inside">
                  <li><strong>Cookies sesyjne</strong> - usuwane po zamknięciu przeglądarki</li>
                  <li><strong>Cookies trwałe</strong> - pozostają na urządzeniu przez określony czas (od kilku dni do roku)</li>
                  <li><strong>Zgoda na cookies</strong> - zapamiętywana przez 12 miesięcy</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-black mb-4">8. Wiadomości prywatne i moderacja</h2>

                <h3 className="text-xl font-semibold text-black mb-3 mt-6">8.1 Prywatność wiadomości</h3>
                <p className="text-black/70 leading-relaxed mb-4">
                  Twoje wiadomości prywatne są chronione i <strong>nie są rutynowo przeglądane</strong> przez administratorów.
                  Stosujemy zabezpieczenia Row Level Security (RLS), które zapewniają, że tylko nadawca i odbiorca mają dostęp do treści wiadomości.
                </p>

                <h3 className="text-xl font-semibold text-black mb-3 mt-6">8.2 Kiedy możemy przejrzeć wiadomości</h3>
                <p className="text-black/70 leading-relaxed mb-4">
                  Dostęp do wiadomości może nastąpić <strong>wyłącznie</strong> w następujących przypadkach:
                </p>
                <ul className="space-y-3 text-black/70 list-disc list-inside mb-4">
                  <li><strong>Zgłoszenie przez użytkownika</strong> - gdy zgłosisz wiadomość jako spam, molestowanie lub treść niestosowną</li>
                  <li><strong>Nakaz sądowy</strong> - na podstawie prawomocnego nakazu sądu lub żądania organów ścigania</li>
                  <li><strong>Podejrzenie przestępstwa</strong> - gdy istnieje uzasadnione podejrzenie działalności przestępczej (oszustwa, handel nielegalnymi towarami)</li>
                </ul>

                <p className="text-black/70 leading-relaxed mb-4 italic">
                  <strong>Ważne:</strong> Nigdy nie przeglądamy wiadomości z ciekawości, do celów marketingowych,
                  analiz użytkowników lub na żądanie osób trzecich (bez nakazu sądowego).
                </p>

                <h3 className="text-xl font-semibold text-black mb-3 mt-6">8.3 System zgłaszania</h3>
                <p className="text-black/70 leading-relaxed mb-4">
                  Możesz zgłosić niewłaściwą wiadomość za pomocą przycisku <strong>"Zgłoś"</strong> w oknie czatu.
                  Dostępne kategorie zgłoszeń:
                </p>
                <ul className="space-y-2 text-black/70 list-disc list-inside mb-4">
                  <li>Spam</li>
                  <li>Molestowanie</li>
                  <li>Treść niestosowna</li>
                  <li>Oszustwo</li>
                  <li>Inne</li>
                </ul>
                <p className="text-black/70 leading-relaxed mb-4">
                  Zgłoszenia są weryfikowane przez zespół moderacji w ciągu <strong>24-48 godzin</strong>.
                  Fałszywe zgłoszenia mogą skutkować ostrzeżeniem lub zawieszeniem konta.
                </p>

                <h3 className="text-xl font-semibold text-black mb-3 mt-6">8.4 Audit Logs (Dziennik dostępów)</h3>
                <p className="text-black/70 leading-relaxed mb-4">
                  Każdy dostęp administratora do Twoich wiadomości jest <strong>automatycznie logowany</strong> w systemie audytu zgodnie z wymogami RODO.
                  Logi zawierają:
                </p>
                <ul className="space-y-2 text-black/70 list-disc list-inside mb-4">
                  <li>Kto (ID administratora i imię)</li>
                  <li>Kiedy (data i godzina dostępu)</li>
                  <li>Do jakiej wiadomości (ID wiadomości)</li>
                  <li>Dlaczego (powód dostępu, np. "Zgłoszenie użytkownika #123")</li>
                </ul>

                <p className="text-black/70 leading-relaxed mb-4 italic">
                  <strong>Twoje prawo:</strong> Masz prawo zażądać pełnej informacji o tym, kto i kiedy miał dostęp do Twoich wiadomości.
                  Wystarczy wysłać wniosek poprzez formularz kontaktowy na stronie (kategoria: Sprawy RODO), a w ciągu 30 dni otrzymasz pełny raport.
                </p>

                <h3 className="text-xl font-semibold text-black mb-3 mt-6">8.5 Przechowywanie logów</h3>
                <p className="text-black/70 leading-relaxed mb-4">
                  Logi dostępu administratorów (audit logs) są przechowywane przez <strong>2 lata</strong> zgodnie z wymogami RODO,
                  po czym są <strong>automatycznie usuwane</strong> (co niedzielę o godzinie 2:00).
                </p>
                <p className="text-black/70 leading-relaxed mb-4">
                  Przechowywanie logów przez 2 lata pozwala na:
                </p>
                <ul className="space-y-2 text-black/70 list-disc list-inside mb-4">
                  <li>Rozpatrywanie skarg użytkowników</li>
                  <li>Prowadzenie postępowań wyjaśniających</li>
                  <li>Wykazanie zgodności z RODO w razie kontroli</li>
                  <li>Ochronę praw użytkowników i administratorów</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-black mb-4">9. Czas przechowywania danych</h2>
                <p className="text-black/70 leading-relaxed mb-4">
                  Twoje dane przechowujemy przez następujące okresy:
                </p>
                <ul className="space-y-3 text-black/70 list-disc list-inside">
                  <li><strong>Wiadomości aktywne:</strong> Przez czas korzystania z platformy</li>
                  <li><strong>Dane konta po usunięciu:</strong> 30 dni (backup), następnie trwałe usunięcie</li>
                  <li><strong>Logi dostępu administratorów:</strong> 2 lata (wymóg RODO)</li>
                  <li><strong>Zgłoszenia moderacyjne:</strong> 2 lata od rozstrzygnięcia</li>
                  <li><strong>Dane księgowe:</strong> 5 lat (wymóg prawa podatkowego)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-black mb-4">10. Bezpieczeństwo danych</h2>
                <p className="text-black/70 leading-relaxed mb-4">
                  Stosujemy odpowiednie środki techniczne i organizacyjne w celu ochrony
                  Twoich danych osobowych przed nieuprawnionym dostępem, utratą lub zniszczeniem, w tym:
                </p>
                <ul className="space-y-3 text-black/70 list-disc list-inside">
                  <li>Szyfrowanie danych podczas transmisji (HTTPS/TLS)</li>
                  <li>Row Level Security (RLS) w bazie danych</li>
                  <li>Regularne audyty bezpieczeństwa</li>
                  <li>Ograniczony dostęp do danych osobowych</li>
                  <li>Automatyczne logowanie dostępów administracyjnych</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-black mb-4">11. Kontakt</h2>
                <p className="text-black/70 leading-relaxed mb-4">
                  W sprawach dotyczących przetwarzania danych osobowych oraz realizacji swoich praw wynikających z RODO,
                  możesz skontaktować się z nami:
                </p>
                <ul className="space-y-3 text-black/70 mb-4">
                  <li className="flex items-start gap-2">
                    <strong className="min-w-[180px]">Ogólne zapytania:</strong>
                    <span>poprzez <a href="/contact" className="text-[#C44E35] hover:underline">formularz kontaktowy</a> na stronie</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <strong className="min-w-[180px]">Sprawy RODO:</strong>
                    <span>poprzez <a href="/contact" className="text-[#C44E35] hover:underline">formularz kontaktowy</a> (wybierz kategorię "Kontakt ogólny")</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <strong className="min-w-[180px]">Zgłoszenia moderacji:</strong>
                    <span>poprzez przycisk "Zgłoś" w czacie lub panel użytkownika</span>
                  </li>
                </ul>
                <p className="text-black/70 leading-relaxed italic">
                  <strong>Czas odpowiedzi:</strong> Na wszystkie zapytania dotyczące RODO odpowiadamy w ciągu 30 dni
                  (zgodnie z wymogiem prawnym). W większości przypadków odpowiadamy znacznie szybciej.
                </p>
              </section>
            </div>
          </div>
      </main>

      <Footer />
    </div>
  )
}
