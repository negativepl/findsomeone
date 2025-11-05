import { createClient } from '@/lib/supabase/server'
import { NavbarWithHide } from '@/components/NavbarWithHide'
import { Footer } from '@/components/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: "FAQ - Często zadawane pytania | FindSomeone",
  description: "Odpowiedzi na najczęstsze pytania o FindSomeone. Jak znaleźć pomoc? Jak dodać ogłoszenie? Czy FindSomeone jest darmowe? Bezpieczeństwo, płatności i więcej.",
  openGraph: {
    title: "FAQ - Często zadawane pytania | FindSomeone",
    description: "Znajdź odpowiedzi na pytania o platformę lokalnej pomocy FindSomeone. Dowiedz się jak działa serwis, ile kosztuje i jak zacząć.",
    type: "website",
    locale: "pl_PL",
  },
}

export default async function FAQPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-background">
      <NavbarWithHide user={user} pageTitle="FAQ" />

      <main className="container mx-auto px-4 md:px-6 pt-20 md:pt-24 pb-8">
        <div className="hidden md:block md:mb-4">
          <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-3">Często zadawane pytania</h1>
          <p className="text-base md:text-lg text-muted-foreground">
            Znajdź odpowiedzi na najczęściej pojawiające się pytania
          </p>
        </div>

        {/* Ogólne */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">Ogólne</h2>
          <div className="space-y-4">
            <Card className="border border-border rounded-3xl bg-card">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-lg md:text-xl font-bold text-foreground mb-3">Czym jest FindSomeone?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  FindSomeone to platforma łącząca ludzi w Twoim mieście i okolicy.
                  Możesz tu znaleźć kogoś, kto zrobi zakupy dla starszej osoby, pomoże przy remoncie, posprzata czy wyprowadzi psa.
                  To miejsce zarówno dla osób szukających pomocy, jak i tych, którzy chcą pomóc innym - w tym również firm oferujących profesjonalne usługi.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border rounded-3xl bg-card">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-lg md:text-xl font-bold text-foreground mb-3">Czy korzystanie z FindSomeone jest darmowe?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Tak! Przeglądanie ogłoszeń, tworzenie konta i dodawanie ogłoszeń jest całkowicie darmowe.
                  Nie pobieramy żadnych prowizji od transakcji między użytkownikami.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border rounded-3xl bg-card">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-lg md:text-xl font-bold text-foreground mb-3">Czy muszę się rejestrować, żeby przeglądać ogłoszenia?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Nie, możesz przeglądać ogłoszenia bez konta. Jednak aby skontaktować się z osobami oferującymi usługi
                  lub samemu dodać ogłoszenie, musisz założyć darmowe konto.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Ogłoszenia */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">Ogłoszenia</h2>
          <div className="space-y-4">
            <Card className="border border-border rounded-3xl bg-card">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-lg md:text-xl font-bold text-foreground mb-3">Jak przeglądać ogłoszenia?</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  Wejdź na stronę główną lub sekcję &quot;Przeglądaj ogłoszenia&quot;. Możesz:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Wybrać kategorię z menu (zakupy, sprzątanie, remont, itp.)</li>
                  <li>Wprowadzić swoją lokalizację aby zobaczyć ogłoszenia w pobliżu</li>
                  <li>Filtrować wyniki po cenie, ocenach i odległości</li>
                  <li>Użyć wyszukiwarki do znalezienia konkretnych ogłoszeń</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border border-border rounded-3xl bg-card">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-lg md:text-xl font-bold text-foreground mb-3">Jak dodać ogłoszenie?</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  Po zalogowaniu kliknij przycisk &quot;Dodaj ogłoszenie&quot; w prawym górnym rogu. Następnie:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Wybierz odpowiednią kategorię</li>
                  <li>Wypełnij tytuł i opis ogłoszenia</li>
                  <li>Ustaw cenę lub przedział cenowy (opcjonalnie)</li>
                  <li>Dodaj zdjęcia (opcjonalnie, ale zalecane)</li>
                  <li>Wskaż lokalizację</li>
                  <li>Opublikuj ogłoszenie!</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border border-border rounded-3xl bg-card">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-lg md:text-xl font-bold text-foreground mb-3">Ile mogę mieć aktywnych ogłoszeń?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Obecnie nie ma limitu liczby ogłoszeń. Możesz dodać tyle ogłoszeń, ile potrzebujesz.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border rounded-3xl bg-card">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-lg md:text-xl font-bold text-foreground mb-3">Czy mogę edytować lub usunąć swoje ogłoszenie?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Tak, możesz w każdej chwili edytować lub usunąć swoje ogłoszenia.
                  Przejdź do swojego panelu, wybierz ogłoszenie i kliknij &quot;Edytuj&quot; lub &quot;Usuń&quot;.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Komunikacja */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">Komunikacja</h2>
          <div className="space-y-4">
            <Card className="border border-border rounded-3xl bg-card">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-lg md:text-xl font-bold text-foreground mb-3">Jak skontaktować się z autorem ogłoszenia?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Po zalogowaniu kliknij przycisk &quot;Wyślij wiadomość&quot; na wybranym ogłoszeniu.
                  Możesz wysłać wiadomość przez nasz wbudowany system wiadomości, który pozwala na bezpieczną komunikację
                  bez ujawniania danych osobowych.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border rounded-3xl bg-card">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-lg md:text-xl font-bold text-foreground mb-3">Jak zbudować dobrą reputację na platformie?</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  Aby zbudować zaufanie:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Dodaj dokładny i szczegółowy opis w ogłoszeniach</li>
                  <li>Zamieść zdjęcia</li>
                  <li>Odpowiadaj szybko na wiadomości</li>
                  <li>Uzupełnij swój profil wszystkimi informacjami</li>
                  <li>Buduj pozytywne relacje z innymi użytkownikami</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border border-border rounded-3xl bg-card">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-lg md:text-xl font-bold text-foreground mb-3">Czy mogę zostawić opinię?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Tak! Po zakończonej współpracy możesz wystawić ocenę i napisać opinię.
                  To pomaga innym użytkownikom oraz buduje reputację na platformie.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Bezpieczeństwo */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">Bezpieczeństwo</h2>
          <div className="space-y-4">
            <Card className="border border-border rounded-3xl bg-card">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-lg md:text-xl font-bold text-foreground mb-3">Czy FindSomeone weryfikuje użytkowników?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Wszystkie konta są weryfikowane przez adres email.
                  Dodatkowo system ocen i opinii pomaga identyfikować godnych zaufania użytkowników.
                  Zawsze sprawdzaj opinie przed skorzystaniem z usługi.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border rounded-3xl bg-card">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-lg md:text-xl font-bold text-foreground mb-3">Co zrobić jeśli napotkam nieodpowiednie treści?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Każde ogłoszenie i profil można zgłosić klikając przycisk &quot;Zgłoś&quot;.
                  Nasz zespół przeanalizuje zgłoszenie i podejmie odpowiednie działania.
                  Nie tolerujemy spamu, oszustw ani niewłaściwych treści.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border rounded-3xl bg-card">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-lg md:text-xl font-bold text-foreground mb-3">Jak FindSomeone chroni moje dane osobowe?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Twoje dane są chronione zgodnie z RODO. Nie udostępniamy danych osobowych osobom trzecim.
                  Szczegóły znajdziesz w naszej{' '}
                  <Link href="/privacy" className="text-brand hover:underline">
                    Polityce prywatności
                  </Link>
                  .
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Płatności */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">Płatności</h2>
          <div className="space-y-4">
            <Card className="border border-border rounded-3xl bg-card">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-lg md:text-xl font-bold text-foreground mb-3">Czy płatności odbywają się przez FindSomeone?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Nie, FindSomeone to platforma kontaktowa. Płatności za usługi odbywają się bezpośrednio między klientem a wykonawcą,
                  w formie ustalonej przez obie strony (gotówka, przelew, itp.).
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border rounded-3xl bg-card">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-lg md:text-xl font-bold text-foreground mb-3">Czy FindSomeone pobiera prowizję?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Nie, nie pobieramy żadnych prowizji ani opłat od transakcji.
                  Cała kwota za usługę trafia bezpośrednio do wykonawcy.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Pomoc techniczna */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">Pomoc techniczna</h2>
          <div className="space-y-4">
            <Card className="border border-border rounded-3xl bg-card">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-lg md:text-xl font-bold text-foreground mb-3">Nie mogę się zalogować. Co robić?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Jeśli masz problem z logowaniem, spróbuj zresetować hasło klikając &quot;Zapomniałeś hasła?&quot;
                  na stronie logowania. Jeśli problem się powtarza, skontaktuj się z nami przez formularz kontaktowy.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border rounded-3xl bg-card">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-lg md:text-xl font-bold text-foreground mb-3">Czy FindSomeone ma aplikację mobilną?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Tak! FindSomeone to aplikacja PWA (Progressive Web App), którą możesz zainstalować na swoim telefonie lub komputerze.
                  Przejdź do{' '}
                  <Link href="/install" className="text-brand hover:underline">
                    instrukcji instalacji
                  </Link>
                  {' '}aby dowiedzieć się więcej.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border rounded-3xl bg-card">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-lg md:text-xl font-bold text-foreground mb-3">Jak usunąć konto?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Aby usunąć konto, przejdź do ustawień profilu i kliknij &quot;Usuń konto&quot;.
                  Pamiętaj, że ta operacja jest nieodwracalna i spowoduje usunięcie wszystkich Twoich danych i ogłoszeń.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <div className="bg-card border border-border rounded-3xl p-12 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Nie znalazłeś odpowiedzi na swoje pytanie?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Skontaktuj się z nami - chętnie pomożemy!
          </p>
          <Link href="/contact">
            <Button className="rounded-full bg-brand hover:bg-brand/90 text-white border border-border px-10 py-6 text-base font-semibold">
              Skontaktuj się z nami
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
