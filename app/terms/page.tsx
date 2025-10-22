import { createClient } from '@/lib/supabase/server'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { Footer } from '@/components/Footer'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Regulamin serwisu | FindSomeone",
  description: "Regulamin korzystania z platformy FindSomeone. Zasady publikowania ogłoszeń, bezpieczeństwo, prawa i obowiązki użytkowników. Aktualna wersja obowiązująca od 2024.",
  openGraph: {
    title: "Regulamin serwisu | FindSomeone",
    description: "Poznaj zasady korzystania z FindSomeone - platformy lokalnej pomocy.",
    type: "website",
    locale: "pl_PL",
  },
}

export default async function TermsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      <NavbarWithHide user={user} pageTitle="Regulamin" />

      <main className="container mx-auto px-4 md:px-6 py-6 md:py-16">
        <div className="mb-8 hidden md:block">
          <h1 className="text-2xl md:text-4xl font-bold text-black mb-3">Regulamin</h1>
          <p className="text-base md:text-lg text-black/60">
            Zasady korzystania z platformy FindSomeone
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 mb-8">
            <p className="text-black/60 mb-8">
              Ostatnia aktualizacja: 15.10.2025
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-black mb-4">1. Postanowienia ogólne</h2>
                <p className="text-black/70 leading-relaxed mb-4">
                  1.1. Niniejszy regulamin (dalej: <strong>Regulamin</strong>) określa zasady korzystania z platformy FindSomeone,
                  dostępnej pod adresem findsomeone.app (dalej: <strong>Platforma</strong>).
                </p>
                <p className="text-black/70 leading-relaxed mb-4">
                  1.2. Platforma umożliwia użytkownikom publikowanie ogłoszeń związanych z poszukiwaniem lub oferowaniem pomocy i usług,
                  a także nawiązywanie bezpośrednich kontaktów między użytkownikami.
                </p>
                <p className="text-black/70 leading-relaxed mb-4">
                  1.3. Korzystanie z Platformy jest równoznaczne z akceptacją postanowień niniejszego Regulaminu.
                </p>
                <p className="text-black/70 leading-relaxed mb-4">
                  1.4. Regulamin dostępny jest nieodpłatnie na stronie internetowej Platformy w formie umożliwiającej jego pobranie,
                  utrwalenie i wydrukowanie.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-black mb-4">2. Definicje</h2>
                <p className="text-black/70 leading-relaxed mb-4">
                  Użyte w Regulaminie pojęcia oznaczają:
                </p>
                <ul className="space-y-3 text-black/70">
                  <li><strong>Administrator</strong> - Marcin Baszewski, prowadzący działalność gospodarczą, właściciel i operator Platformy</li>
                  <li><strong>Platforma / Serwis</strong> - serwis internetowy FindSomeone dostępny pod adresem findsomeone.app</li>
                  <li><strong>Użytkownik</strong> - osoba fizyczna, osoba prawna lub jednostka organizacyjna nieposiadająca osobowości prawnej, korzystająca z Platformy</li>
                  <li><strong>Konto</strong> - indywidualne konto Użytkownika w Platformie, umożliwiające korzystanie z pełnej funkcjonalności Serwisu</li>
                  <li><strong>Ogłoszenie</strong> - publikacja Użytkownika dotycząca poszukiwania lub oferowania pomocy, usług lub towarów</li>
                  <li><strong>Treść</strong> - wszelkie materiały publikowane przez Użytkowników, w tym ogłoszenia, opisy, zdjęcia, komentarze i wiadomości</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-black mb-4">3. Warunki korzystania z Platformy</h2>
                <p className="text-black/70 leading-relaxed mb-4">
                  3.1. Z Platformy mogą korzystać osoby, które ukończyły 18 lat i posiadają pełną zdolność do czynności prawnych.
                </p>
                <p className="text-black/70 leading-relaxed mb-4">
                  3.2. Osoby w wieku 13-18 lat mogą korzystać z Platformy wyłącznie za zgodą przedstawiciela ustawowego.
                </p>
                <p className="text-black/70 leading-relaxed mb-4">
                  3.3. Korzystanie z podstawowych funkcji Platformy (przeglądanie ogłoszeń) nie wymaga rejestracji.
                </p>
                <p className="text-black/70 leading-relaxed mb-4">
                  3.4. Publikowanie ogłoszeń, kontaktowanie się z innymi Użytkownikami oraz korzystanie z zaawansowanych funkcji
                  wymaga utworzenia Konta.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-black mb-4">4. Rejestracja i konto użytkownika</h2>
                <p className="text-black/70 leading-relaxed mb-4">
                  4.1. Rejestracja Konta jest bezpłatna i następuje poprzez formularz rejestracyjny lub logowanie za pomocą konta Google.
                </p>
                <p className="text-black/70 leading-relaxed mb-4">
                  4.2. Użytkownik zobowiązany jest do:
                </p>
                <ul className="space-y-2 text-black/70 list-disc list-inside mb-4 ml-4">
                  <li>Podania prawdziwych, aktualnych i kompletnych danych</li>
                  <li>Aktualizowania danych w przypadku ich zmiany</li>
                  <li>Zachowania poufności hasła i danych logowania</li>
                  <li>Niezwłocznego poinformowania Administratora o nieautoryzowanym dostępie do Konta</li>
                  <li>Nieprzekazywania dostępu do Konta osobom trzecim</li>
                </ul>
                <p className="text-black/70 leading-relaxed mb-4">
                  4.3. Użytkownik ponosi pełną odpowiedzialność za działania podejmowane przy użyciu swojego Konta.
                </p>
                <p className="text-black/70 leading-relaxed mb-4">
                  4.4. Administrator może odmówić rejestracji lub usunąć Konto w przypadku naruszenia Regulaminu.
                </p>
                <p className="text-black/70 leading-relaxed mb-4">
                  4.5. Użytkownik może w każdej chwili usunąć swoje Konto z Platformy poprzez panel ustawień lub kontakt z Administratorem.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-black mb-4">5. Zasady publikowania ogłoszeń</h2>
                <p className="text-black/70 leading-relaxed mb-4">
                  5.1. Użytkownik może publikować ogłoszenia po zalogowaniu się na swoje Konto.
                </p>
                <p className="text-black/70 leading-relaxed mb-4">
                  5.2. Ogłoszenia muszą:
                </p>
                <ul className="space-y-2 text-black/70 list-disc list-inside mb-4 ml-4">
                  <li>Być zgodne z prawem polskim i międzynarodowym</li>
                  <li>Zawierać prawdziwe i aktualne informacje</li>
                  <li>Być umieszczone w odpowiedniej kategorii</li>
                  <li>Nie naruszać praw osób trzecich</li>
                  <li>Być sformułowane w sposób zrozumiały i czytelny</li>
                </ul>
                <p className="text-black/70 leading-relaxed mb-4">
                  5.3. <strong>Zabronione jest publikowanie ogłoszeń:</strong>
                </p>
                <ul className="space-y-2 text-black/70 list-disc list-inside mb-4 ml-4">
                  <li>Dotyczących towarów lub usług nielegalnych</li>
                  <li>Zawierających treści obraźliwe, wulgarne, obsceniczne lub pornograficzne</li>
                  <li>Dyskryminujących ze względu na rasę, płeć, religię, narodowość, niepełnosprawność, orientację seksualną lub wiek</li>
                  <li>Naruszających prawa autorskie, znaki towarowe lub inne prawa własności intelektualnej</li>
                  <li>Zawierających spam, treści reklamowe niezwiązane z przedmiotem ogłoszenia</li>
                  <li>Zawierających złośliwe oprogramowanie, wirusy lub szkodliwe linki</li>
                  <li>Fałszywych, wprowadzających w błąd lub oszukańczych</li>
                  <li>Duplikujących inne ogłoszenia tego samego Użytkownika</li>
                  <li>Dotyczących usług seksualnych lub treści dla dorosłych</li>
                  <li>Związanych z hazardem, narkotykami, bronią lub materiałami wybuchowymi</li>
                </ul>
                <p className="text-black/70 leading-relaxed mb-4">
                  5.4. Administrator zastrzega sobie prawo do moderacji, edycji lub usunięcia ogłoszeń naruszających Regulamin
                  bez uprzedzenia i wyjaśnienia.
                </p>
                <p className="text-black/70 leading-relaxed mb-4">
                  5.5. Użytkownik ponosi pełną odpowiedzialność za treść publikowanych przez siebie ogłoszeń.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-black mb-4">6. Zasady komunikacji między użytkownikami</h2>
                <p className="text-black/70 leading-relaxed mb-4">
                  6.1. Platforma udostępnia system wiadomości prywatnych umożliwiający bezpośrednią komunikację między Użytkownikami.
                </p>
                <p className="text-black/70 leading-relaxed mb-4">
                  6.2. Użytkownicy zobowiązani są do kulturalnego i szanującego traktowania innych Użytkowników.
                </p>
                <p className="text-black/70 leading-relaxed mb-4">
                  6.3. <strong>W ramach komunikacji zabronione jest:</strong>
                </p>
                <ul className="space-y-2 text-black/70 list-disc list-inside mb-4 ml-4">
                  <li>Molestowanie, nękanie lub zastraszanie innych Użytkowników</li>
                  <li>Wysyłanie spamu lub niechcianych wiadomości reklamowych</li>
                  <li>Używanie wulgarnego, obraźliwego lub dyskryminującego języka</li>
                  <li>Podszywanie się pod inne osoby lub instytucje</li>
                  <li>Próby wyłudzenia danych osobowych lub finansowych</li>
                  <li>Rozpowszechnianie złośliwego oprogramowania</li>
                </ul>
                <p className="text-black/70 leading-relaxed mb-4">
                  6.4. Użytkownicy mogą zgłaszać niewłaściwe wiadomości za pomocą funkcji "Zgłoś" dostępnej w czacie.
                </p>
                <p className="text-black/70 leading-relaxed mb-4">
                  6.5. Szczegółowe zasady dotyczące prywatności wiadomości określa Polityka Prywatności.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-black mb-4">7. Płatności i rozliczenia</h2>
                <p className="text-black/70 leading-relaxed mb-4">
                  7.1. Korzystanie z podstawowych funkcji Platformy jest bezpłatne.
                </p>
                <p className="text-black/70 leading-relaxed mb-4">
                  7.2. <strong>Platforma nie pośredniczy w płatnościach między Użytkownikami.</strong> Wszelkie płatności za usługi
                  lub towary odbywają się bezpośrednio między Użytkownikami, poza Platformą.
                </p>
                <p className="text-black/70 leading-relaxed mb-4">
                  7.3. Administrator nie ponosi odpowiedzialności za rozliczenia między Użytkownikami, w tym za nieterminowe
                  lub nierealizowane płatności.
                </p>
                <p className="text-black/70 leading-relaxed mb-4">
                  7.4. W przyszłości Platforma może wprowadzić płatne funkcje premium. Użytkownicy zostaną o tym poinformowani
                  z odpowiednim wyprzedzeniem.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-black mb-4">8. Odpowiedzialność</h2>
                <p className="text-black/70 leading-relaxed mb-4">
                  8.1. <strong>Platforma pełni wyłącznie rolę pośrednika</strong> umożliwiającego kontakt między Użytkownikami.
                </p>
                <p className="text-black/70 leading-relaxed mb-4">
                  8.2. Administrator nie ponosi odpowiedzialności za:
                </p>
                <ul className="space-y-2 text-black/70 list-disc list-inside mb-4 ml-4">
                  <li>Jakość, bezpieczeństwo, legalność lub zgodność z opisem oferowanych usług lub towarów</li>
                  <li>Wiarygodność, uczciwość lub kompetencje Użytkowników</li>
                  <li>Treść ogłoszeń, wiadomości i innych materiałów publikowanych przez Użytkowników</li>
                  <li>Wykonanie lub niewykonanie umów zawartych między Użytkownikami</li>
                  <li>Szkody powstałe w wyniku korzystania z usług innych Użytkowników</li>
                  <li>Utratę danych spowodowaną awarią techniczną lub siłą wyższą</li>
                  <li>Działania osób trzecich, w tym ataki hakerskie</li>
                </ul>
                <p className="text-black/70 leading-relaxed mb-4">
                  8.3. Użytkownicy ponoszą pełną odpowiedzialność za treści przez siebie publikowane oraz za działania
                  podejmowane za pośrednictwem Platformy.
                </p>
                <p className="text-black/70 leading-relaxed mb-4">
                  8.4. Administrator nie weryfikuje tożsamości Użytkowników ani prawdziwości publikowanych ogłoszeń.
                  Użytkownicy działają na własną odpowiedzialność.
                </p>
                <p className="text-black/70 leading-relaxed mb-4">
                  8.5. Administrator zastrzega sobie prawo do czasowego zawieszenia działania Platformy w celu przeprowadzenia
                  prac konserwacyjnych lub aktualizacji.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-black mb-4">9. Naruszenia i sankcje</h2>
                <p className="text-black/70 leading-relaxed mb-4">
                  9.1. W przypadku naruszenia Regulaminu, Administrator może zastosować następujące sankcje:
                </p>
                <ul className="space-y-2 text-black/70 list-disc list-inside mb-4 ml-4">
                  <li><strong>Ostrzeżenie</strong> - w przypadku drobnych naruszeń lub pierwszego wykroczenia</li>
                  <li><strong>Usunięcie treści</strong> - usunięcie ogłoszenia, wiadomości lub innych materiałów naruszających Regulamin</li>
                  <li><strong>Czasowe zawieszenie Konta</strong> - od 7 do 90 dni, w zależności od wagi naruszenia</li>
                  <li><strong>Trwałe usunięcie Konta</strong> - w przypadku poważnych lub powtarzających się naruszeń</li>
                  <li><strong>Ban IP</strong> - blokada dostępu z danego adresu IP w przypadku drastycznych naruszeń</li>
                </ul>
                <p className="text-black/70 leading-relaxed mb-4">
                  9.2. Poważne naruszenia obejmują w szczególności:
                </p>
                <ul className="space-y-2 text-black/70 list-disc list-inside mb-4 ml-4">
                  <li>Działalność przestępczą (oszustwa, wyłudzenia, groźby)</li>
                  <li>Wielokrotne publikowanie zabronionych treści</li>
                  <li>Molestowanie lub nękanie innych Użytkowników</li>
                  <li>Próby obejścia blokad lub zawieszenia</li>
                  <li>Utworzenie wielu kont w celu obejścia sankcji</li>
                </ul>
                <p className="text-black/70 leading-relaxed mb-4">
                  9.3. Decyzje dotyczące sankcji podejmowane są przez Administratora i są ostateczne, z zastrzeżeniem pkt 9.4.
                </p>
                <p className="text-black/70 leading-relaxed mb-4">
                  9.4. Użytkownik ma prawo do odwołania się od decyzji o zablokowaniu Konta w ciągu 14 dni od daty otrzymania
                  informacji o sankcji, poprzez kontakt z Administratorem.
                </p>
                <p className="text-black/70 leading-relaxed mb-4">
                  9.5. Administrator może przekazać informacje o nielegalnej działalności właściwym organom ścigania.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-black mb-4">10. System zgłoszeń i moderacja</h2>
                <p className="text-black/70 leading-relaxed mb-4">
                  10.1. Użytkownicy mogą zgłaszać niewłaściwe treści lub zachowania za pomocą funkcji "Zgłoś".
                </p>
                <p className="text-black/70 leading-relaxed mb-4">
                  10.2. Zgłoszenia są rozpatrywane przez zespół moderacji w ciągu 24-48 godzin roboczych.
                </p>
                <p className="text-black/70 leading-relaxed mb-4">
                  10.3. Fałszywe lub celowo mylące zgłoszenia mogą skutkować sankcjami wobec zgłaszającego.
                </p>
                <p className="text-black/70 leading-relaxed mb-4">
                  10.4. Administrator może stosować automatyczne systemy moderacji treści, w tym sztuczną inteligencję,
                  w celu wykrywania naruszeń Regulaminu.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-black mb-4">11. Prawa własności intelektualnej</h2>
                <p className="text-black/70 leading-relaxed mb-4">
                  11.1. Wszelkie prawa do Platformy, w tym prawa autorskie, znaki towarowe, layout, grafika i kod źródłowy,
                  należą do Administratora.
                </p>
                <p className="text-black/70 leading-relaxed mb-4">
                  11.2. Zabrania się kopiowania, modyfikowania, rozpowszechniania lub wykorzystywania elementów Platformy
                  bez pisemnej zgody Administratora.
                </p>
                <p className="text-black/70 leading-relaxed mb-4">
                  11.3. Użytkownik publikując treści na Platformie, udziela Administratorowi niewyłącznej, nieodpłatnej licencji
                  na wykorzystanie tych treści w celach związanych z funkcjonowaniem Platformy.
                </p>
                <p className="text-black/70 leading-relaxed mb-4">
                  11.4. Użytkownik oświadcza, że publikowane przez niego treści nie naruszają praw osób trzecich.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-black mb-4">12. Ochrona danych osobowych</h2>
                <p className="text-black/70 leading-relaxed mb-4">
                  12.1. Zasady przetwarzania danych osobowych określa <a href="/privacy" className="text-[#C44E35] hover:underline">Polityka Prywatności</a>,
                  stanowiąca integralną część niniejszego Regulaminu.
                </p>
                <p className="text-black/70 leading-relaxed mb-4">
                  12.2. Korzystając z Platformy, Użytkownik wyraża zgodę na przetwarzanie swoich danych osobowych zgodnie
                  z Polityką Prywatności.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-black mb-4">13. Prawo odstąpienia od umowy</h2>
                <p className="text-black/70 leading-relaxed mb-4">
                  13.1. Użytkownik będący konsumentem ma prawo odstąpić od umowy zawartej z Administratorem (np. zakup usług premium)
                  w terminie 14 dni bez podania przyczyny.
                </p>
                <p className="text-black/70 leading-relaxed mb-4">
                  13.2. Termin do odstąpienia od umowy wygasa po upływie 14 dni od dnia zawarcia umowy.
                </p>
                <p className="text-black/70 leading-relaxed mb-4">
                  13.3. Aby skorzystać z prawa odstąpienia, Użytkownik musi poinformować Administratora o swojej decyzji
                  poprzez jednoznaczne oświadczenie (np. email).
                </p>
                <p className="text-black/70 leading-relaxed mb-4">
                  13.4. W przypadku odstąpienia od umowy, Administrator zwróci wszystkie otrzymane płatności niezwłocznie,
                  nie później niż w ciągu 14 dni.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-black mb-4">14. Reklamacje</h2>
                <p className="text-black/70 leading-relaxed mb-4">
                  14.1. Reklamacje dotyczące funkcjonowania Platformy można składać:
                </p>
                <ul className="space-y-2 text-black/70 mb-4 ml-4">
                  <li>- Poprzez formularz kontaktowy na stronie</li>
                  <li>- Mailowo na adres podany w sekcji Kontakt</li>
                </ul>
                <p className="text-black/70 leading-relaxed mb-4">
                  14.2. Reklamacja powinna zawierać:
                </p>
                <ul className="space-y-2 text-black/70 list-disc list-inside mb-4 ml-4">
                  <li>Imię i nazwisko oraz adres email Użytkownika</li>
                  <li>Opis problemu oraz okoliczności jego powstania</li>
                  <li>Żądanie Użytkownika</li>
                </ul>
                <p className="text-black/70 leading-relaxed mb-4">
                  14.3. Administrator rozpatrzy reklamację w ciągu 14 dni roboczych od jej otrzymania.
                </p>
                <p className="text-black/70 leading-relaxed mb-4">
                  14.4. Odpowiedź na reklamację zostanie wysłana na adres email podany w reklamacji.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-black mb-4">15. Pozasądowe rozwiązywanie sporów</h2>
                <p className="text-black/70 leading-relaxed mb-4">
                  15.1. Konsument ma prawo do skorzystania z pozasądowych sposobów rozpatrywania reklamacji i dochodzenia roszczeń.
                </p>
                <p className="text-black/70 leading-relaxed mb-4">
                  15.2. Informacje o pozasądowych sposobach rozwiązywania sporów dostępne są na stronie internetowej
                  Urzędu Ochrony Konkurencji i Konsumentów: <a href="https://www.uokik.gov.pl" target="_blank" rel="noopener noreferrer" className="text-[#C44E35] hover:underline">www.uokik.gov.pl</a>
                </p>
                <p className="text-black/70 leading-relaxed mb-4">
                  15.3. Konsument może skorzystać również z platformy ODR dostępnej pod adresem:
                  <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-[#C44E35] hover:underline ml-1">ec.europa.eu/consumers/odr</a>
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-black mb-4">16. Zmiany regulaminu</h2>
                <p className="text-black/70 leading-relaxed mb-4">
                  16.1. Administrator zastrzega sobie prawo do zmiany Regulaminu.
                </p>
                <p className="text-black/70 leading-relaxed mb-4">
                  16.2. O zmianach w Regulaminie Użytkownicy zostaną poinformowani co najmniej na 7 dni przed wejściem w życie zmian,
                  poprzez:
                </p>
                <ul className="space-y-2 text-black/70 list-disc list-inside mb-4 ml-4">
                  <li>Powiadomienie na stronie głównej Platformy</li>
                  <li>Wiadomość email na adres przypisany do Konta</li>
                </ul>
                <p className="text-black/70 leading-relaxed mb-4">
                  16.3. Użytkownik, który nie akceptuje zmian w Regulaminie, może usunąć swoje Konto przed datą wejścia w życie zmian.
                </p>
                <p className="text-black/70 leading-relaxed mb-4">
                  16.4. Kontynuowanie korzystania z Platformy po wejściu w życie zmian oznacza akceptację nowego Regulaminu.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-black mb-4">17. Postanowienia końcowe</h2>
                <p className="text-black/70 leading-relaxed mb-4">
                  17.1. W sprawach nieuregulowanych niniejszym Regulaminem mają zastosowanie przepisy prawa polskiego,
                  w szczególności:
                </p>
                <ul className="space-y-2 text-black/70 list-disc list-inside mb-4 ml-4">
                  <li>Ustawa z dnia 18 lipca 2002 r. o świadczeniu usług drogą elektroniczną</li>
                  <li>Ustawa z dnia 23 kwietnia 1964 r. Kodeks cywilny</li>
                  <li>Ustawa z dnia 30 maja 2014 r. o prawach konsumenta</li>
                  <li>Rozporządzenie Parlamentu Europejskiego i Rady (UE) 2016/679 (RODO)</li>
                </ul>
                <p className="text-black/70 leading-relaxed mb-4">
                  17.2. Wszelkie spory wynikłe z korzystania z Platformy będą rozstrzygane przez właściwy sąd polski.
                </p>
                <p className="text-black/70 leading-relaxed mb-4">
                  17.3. W przypadku gdy którekolwiek postanowienie Regulaminu zostanie uznane za nieważne lub nieskuteczne,
                  pozostałe postanowienia zachowują pełną moc.
                </p>
                <p className="text-black/70 leading-relaxed mb-4">
                  17.4. Regulamin wchodzi w życie z dniem publikacji na stronie Platformy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-black mb-4">18. Kontakt</h2>
                <p className="text-black/70 leading-relaxed mb-4">
                  W przypadku pytań dotyczących Regulaminu lub funkcjonowania Platformy, prosimy o kontakt:
                </p>
                <ul className="space-y-3 text-black/70 mb-4">
                  <li className="flex items-start gap-2">
                    <strong className="min-w-[180px]">Formularz kontaktowy:</strong>
                    <a href="/contact" className="text-[#C44E35] hover:underline">findsomeone.app/contact</a>
                  </li>
                  <li className="flex items-start gap-2">
                    <strong className="min-w-[180px]">Administrator:</strong>
                    <span>Marcin Baszewski</span>
                  </li>
                </ul>
              </section>
            </div>
          </div>
      </main>

      <Footer />
    </div>
  )
}
