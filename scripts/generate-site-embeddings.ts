/**
 * Script to generate embeddings for site content (FAQ, Privacy, Terms, etc.)
 * Run with: tsx scripts/generate-site-embeddings.ts
 */

import { createClient } from '@/lib/supabase/server-admin'
import { generateEmbeddingsBatch } from '@/lib/embeddings'
import crypto from 'crypto'

// Define the content structure for each page
interface PageSection {
  pageSlug: string
  pageTitle: string
  sectionTitle: string
  content: string
}

// Helper function to create content hash
function createHash(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex')
}

// Extract FAQ content
const faqContent: PageSection[] = [
  {
    pageSlug: 'faq',
    pageTitle: 'FAQ - Często zadawane pytania',
    sectionTitle: 'Czym jest FindSomeone?',
    content: 'FindSomeone to platforma łącząca ludzi w Twoim mieście i okolicy. Możesz tu znaleźć kogoś, kto zrobi zakupy dla starszej osoby, pomoże przy remoncie, posprzata czy wyprowadzi psa. To miejsce zarówno dla osób szukających pomocy, jak i tych, którzy chcą pomóc innym - w tym również firm oferujących profesjonalne usługi.'
  },
  {
    pageSlug: 'faq',
    pageTitle: 'FAQ - Często zadawane pytania',
    sectionTitle: 'Czy korzystanie z FindSomeone jest darmowe?',
    content: 'Tak! Przeglądanie ogłoszeń, tworzenie konta i dodawanie ogłoszeń jest całkowicie darmowe. Nie pobieramy żadnych prowizji od transakcji między użytkownikami.'
  },
  {
    pageSlug: 'faq',
    pageTitle: 'FAQ - Często zadawane pytania',
    sectionTitle: 'Czy muszę się rejestrować?',
    content: 'Nie, możesz przeglądać ogłoszenia bez konta. Jednak aby skontaktować się z osobami oferującymi usługi lub samemu dodać ogłoszenie, musisz założyć darmowe konto.'
  },
  {
    pageSlug: 'faq',
    pageTitle: 'FAQ - Często zadawane pytania',
    sectionTitle: 'Jak znaleźć pomoc w mojej okolicy?',
    content: 'Wejdź na stronę główną lub sekcję "Przeglądaj ogłoszenia". Możesz wybrać kategorię pomocy z menu (zakupy, sprzątanie, remont, itp.), wprowadzić swoją lokalizację aby zobaczyć osoby w pobliżu, filtrować wyniki po cenie, ocenach i odległości, oraz użyć wyszukiwarki do znalezienia konkretnej pomocy.'
  },
  {
    pageSlug: 'faq',
    pageTitle: 'FAQ - Często zadawane pytania',
    sectionTitle: 'Jak skontaktować się z osobą oferującą usługę?',
    content: 'Po zalogowaniu kliknij przycisk "Wyślij wiadomość" na profilu wybranej osoby. Możesz wysłać wiadomość przez nasz wbudowany system wiadomości, który pozwala na bezpieczną komunikację bez ujawniania danych osobowych.'
  },
  {
    pageSlug: 'faq',
    pageTitle: 'FAQ - Często zadawane pytania',
    sectionTitle: 'Czy mogę zostawić opinię?',
    content: 'Tak! Po zakończonej współpracy możesz wystawić ocenę i napisać opinię. To pomaga innym użytkownikom w wyborze oraz buduje reputację osób świadczących usługi.'
  },
  {
    pageSlug: 'faq',
    pageTitle: 'FAQ - Często zadawane pytania',
    sectionTitle: 'Jak dodać ogłoszenie?',
    content: 'Po zalogowaniu kliknij przycisk "Dodaj ogłoszenie" w prawym górnym rogu. Następnie wybierz kategorię swojej usługi, wypełnij tytuł i opis, ustaw cenę lub przedział cenowy, dodaj zdjęcia (opcjonalnie, ale zalecane), wskaż lokalizację, w której świadczysz usługi, i opublikuj ogłoszenie.'
  },
  {
    pageSlug: 'faq',
    pageTitle: 'FAQ - Często zadawane pytania',
    sectionTitle: 'Ile mogę mieć aktywnych ogłoszeń?',
    content: 'Obecnie nie ma limitu liczby ogłoszeń. Możesz dodać tyle ogłoszeń, ile chcesz, aby zaprezentować pełen zakres swoich usług.'
  },
  {
    pageSlug: 'faq',
    pageTitle: 'FAQ - Często zadawane pytania',
    sectionTitle: 'Czy FindSomeone weryfikuje użytkowników?',
    content: 'Wszystkie konta są weryfikowane przez adres email. Dodatkowo system ocen i opinii pomaga identyfikować godnych zaufania użytkowników. Zawsze sprawdzaj opinie przed skorzystaniem z usługi.'
  },
  {
    pageSlug: 'faq',
    pageTitle: 'FAQ - Często zadawane pytania',
    sectionTitle: 'Co zrobić jeśli napotkam nieodpowiednie treści?',
    content: 'Każde ogłoszenie i profil można zgłosić klikając przycisk "Zgłoś". Nasz zespół przeanalizuje zgłoszenie i podejmie odpowiednie działania. Nie tolerujemy spamu, oszustw ani niewłaściwych treści.'
  },
  {
    pageSlug: 'faq',
    pageTitle: 'FAQ - Często zadawane pytania',
    sectionTitle: 'Czy płatności odbywają się przez FindSomeone?',
    content: 'Nie, FindSomeone to platforma kontaktowa. Płatności za usługi odbywają się bezpośrednio między klientem a wykonawcą, w formie ustalonej przez obie strony (gotówka, przelew, itp.).'
  },
  {
    pageSlug: 'faq',
    pageTitle: 'FAQ - Często zadawane pytania',
    sectionTitle: 'Czy FindSomeone pobiera prowizję?',
    content: 'Nie, nie pobieramy żadnych prowizji ani opłat od transakcji. Cała kwota za usługę trafia bezpośrednio do wykonawcy.'
  },
  {
    pageSlug: 'faq',
    pageTitle: 'FAQ - Często zadawane pytania',
    sectionTitle: 'Czy FindSomeone ma aplikację mobilną?',
    content: 'Tak! FindSomeone to aplikacja PWA (Progressive Web App), którą możesz zainstalować na swoim telefonie lub komputerze. Przejdź do instrukcji instalacji aby dowiedzieć się więcej.'
  },
  {
    pageSlug: 'faq',
    pageTitle: 'FAQ - Często zadawane pytania',
    sectionTitle: 'Jak usunąć konto?',
    content: 'Aby usunąć konto, przejdź do ustawień profilu i kliknij "Usuń konto". Pamiętaj, że ta operacja jest nieodwracalna i spowoduje usunięcie wszystkich Twoich danych i ogłoszeń.'
  }
]

// Extract Privacy Policy content (key sections)
const privacyContent: PageSection[] = [
  {
    pageSlug: 'privacy',
    pageTitle: 'Polityka prywatności',
    sectionTitle: 'Administrator danych',
    content: 'Administratorem danych osobowych zbieranych za pośrednictwem platformy FindSomeone jest Marcin Baszewski.'
  },
  {
    pageSlug: 'privacy',
    pageTitle: 'Polityka prywatności',
    sectionTitle: 'Jakie dane zbieramy',
    content: 'Zbieramy następujące kategorie danych: dane identyfikacyjne (imię, nazwisko, adres email), dane kontaktowe (numer telefonu, miasto), dane dotyczące aktywności na platformie (ogłoszenia, wiadomości), dane techniczne (adres IP, typ urządzenia, przeglądarka).'
  },
  {
    pageSlug: 'privacy',
    pageTitle: 'Polityka prywatności',
    sectionTitle: 'Cel przetwarzania danych',
    content: 'Twoje dane przetwarzamy w następujących celach: świadczenie usług platformy, komunikacja z użytkownikami, zapewnienie bezpieczeństwa platformy, doskonalenie naszych usług, spełnienie obowiązków prawnych.'
  },
  {
    pageSlug: 'privacy',
    pageTitle: 'Polityka prywatności',
    sectionTitle: 'Twoje prawa RODO',
    content: 'Masz prawo do: dostępu do swoich danych, sprostowania danych, usunięcia danych (prawo do bycia zapomnianym), ograniczenia przetwarzania, przenoszenia danych, wniesienia sprzeciwu wobec przetwarzania, cofnięcia zgody w dowolnym momencie.'
  },
  {
    pageSlug: 'privacy',
    pageTitle: 'Polityka prywatności',
    sectionTitle: 'Pliki cookies',
    content: 'Pliki cookies to małe pliki tekstowe zapisywane na Twoim urządzeniu przez przeglądarkę internetową. Używamy cookies niezbędnych (wymaganych do działania platformy), funkcjonalnych (zapamiętują preferencje), analitycznych (Vercel Analytics, Google Analytics) oraz wydajnościowych (optymalizacja strony).'
  },
  {
    pageSlug: 'privacy',
    pageTitle: 'Polityka prywatności',
    sectionTitle: 'Prywatność wiadomości',
    content: 'Twoje wiadomości prywatne są chronione i nie są rutynowo przeglądane przez administratorów. Stosujemy zabezpieczenia Row Level Security (RLS). Dostęp do wiadomości może nastąpić wyłącznie w przypadku zgłoszenia przez użytkownika, nakazu sądowego lub podejrzenia przestępstwa. Każdy dostęp jest logowany w systemie audytu.'
  },
  {
    pageSlug: 'privacy',
    pageTitle: 'Polityka prywatności',
    sectionTitle: 'Czas przechowywania danych',
    content: 'Dane przechowujemy: wiadomości aktywne przez czas korzystania z platformy, dane konta po usunięciu przez 30 dni (backup), logi dostępu administratorów przez 2 lata (wymóg RODO), zgłoszenia moderacyjne przez 2 lata od rozstrzygnięcia, dane księgowe przez 5 lat (wymóg prawa podatkowego).'
  },
  {
    pageSlug: 'privacy',
    pageTitle: 'Polityka prywatności',
    sectionTitle: 'Bezpieczeństwo danych',
    content: 'Stosujemy środki techniczne i organizacyjne w celu ochrony danych: szyfrowanie danych podczas transmisji (HTTPS/TLS), Row Level Security (RLS) w bazie danych, regularne audyty bezpieczeństwa, ograniczony dostęp do danych osobowych, automatyczne logowanie dostępów administracyjnych.'
  },
  {
    pageSlug: 'privacy',
    pageTitle: 'Polityka prywatności',
    sectionTitle: 'Kontakt w sprawie RODO',
    content: 'W sprawach dotyczących przetwarzania danych osobowych możesz skontaktować się poprzez formularz kontaktowy na stronie (wybierz kategorię "Kontakt ogólny" dla spraw RODO). Na zapytania dotyczące RODO odpowiadamy w ciągu 30 dni zgodnie z wymogiem prawnym.'
  }
]

// Extract Terms of Service content (key sections)
const termsContent: PageSection[] = [
  {
    pageSlug: 'terms',
    pageTitle: 'Regulamin serwisu',
    sectionTitle: 'Postanowienia ogólne',
    content: 'Regulamin określa zasady korzystania z platformy FindSomeone dostępnej pod adresem findsomeone.app. Platforma umożliwia użytkownikom publikowanie ogłoszeń związanych z poszukiwaniem lub oferowaniem pomocy i usług. Korzystanie z Platformy jest równoznaczne z akceptacją postanowień regulaminu.'
  },
  {
    pageSlug: 'terms',
    pageTitle: 'Regulamin serwisu',
    sectionTitle: 'Warunki korzystania',
    content: 'Z Platformy mogą korzystać osoby, które ukończyły 18 lat i posiadają pełną zdolność do czynności prawnych. Osoby w wieku 13-18 lat mogą korzystać wyłącznie za zgodą przedstawiciela ustawowego. Przeglądanie ogłoszeń nie wymaga rejestracji, ale publikowanie ogłoszeń i kontakt z użytkownikami wymaga utworzenia konta.'
  },
  {
    pageSlug: 'terms',
    pageTitle: 'Regulamin serwisu',
    sectionTitle: 'Rejestracja i konto',
    content: 'Rejestracja jest bezpłatna i następuje przez formularz lub Google. Użytkownik zobowiązany jest podać prawdziwe dane, aktualizować je, zachować poufność hasła, informować o nieautoryzowanym dostępie, nie przekazywać dostępu osobom trzecim. Administrator może odmówić rejestracji lub usunąć konto w przypadku naruszenia regulaminu.'
  },
  {
    pageSlug: 'terms',
    pageTitle: 'Regulamin serwisu',
    sectionTitle: 'Zasady publikowania ogłoszeń',
    content: 'Ogłoszenia muszą być zgodne z prawem, zawierać prawdziwe informacje, być w odpowiedniej kategorii, nie naruszać praw osób trzecich. Zabronione są ogłoszenia dotyczące towarów nielegalnych, zawierające treści obraźliwe, dyskryminujące, naruszające prawa autorskie, spam, fałszywe, duplikaty, dotyczące usług seksualnych, hazardu, narkotyków, broni.'
  },
  {
    pageSlug: 'terms',
    pageTitle: 'Regulamin serwisu',
    sectionTitle: 'Zasady komunikacji',
    content: 'Platforma udostępnia system wiadomości prywatnych. Użytkownicy zobowiązani są do kulturalnego traktowania. Zabronione jest: molestowanie, spam, wulgarny język, podszywanie się, wyłudzenie danych, rozpowszechnianie złośliwego oprogramowania. Można zgłaszać niewłaściwe wiadomości funkcją "Zgłoś".'
  },
  {
    pageSlug: 'terms',
    pageTitle: 'Regulamin serwisu',
    sectionTitle: 'Płatności i prowizje',
    content: 'Korzystanie z podstawowych funkcji jest bezpłatne. Platforma nie pośredniczy w płatnościach między użytkownikami - płatności odbywają się bezpośrednio poza platformą. Administrator nie ponosi odpowiedzialności za rozliczenia między użytkownikami.'
  },
  {
    pageSlug: 'terms',
    pageTitle: 'Regulamin serwisu',
    sectionTitle: 'Odpowiedzialność platformy',
    content: 'Platforma pełni rolę pośrednika. Administrator nie ponosi odpowiedzialności za: jakość oferowanych usług, wiarygodność użytkowników, treść publikowanych materiałów, wykonanie umów między użytkownikami, szkody z korzystania z usług, utratę danych, działania osób trzecich. Administrator nie weryfikuje tożsamości ani prawdziwości ogłoszeń.'
  },
  {
    pageSlug: 'terms',
    pageTitle: 'Regulamin serwisu',
    sectionTitle: 'Naruszenia i sankcje',
    content: 'W przypadku naruszenia regulaminu można zastosować: ostrzeżenie, usunięcie treści, czasowe zawieszenie konta (7-90 dni), trwałe usunięcie konta, ban IP. Poważne naruszenia to: działalność przestępcza, wielokrotne publikowanie zabronionych treści, molestowanie, obejście blokad, wielokrotne konta. Użytkownik może odwołać się od decyzji w ciągu 14 dni.'
  },
  {
    pageSlug: 'terms',
    pageTitle: 'Regulamin serwisu',
    sectionTitle: 'System zgłoszeń',
    content: 'Użytkownicy mogą zgłaszać niewłaściwe treści funkcją "Zgłoś". Zgłoszenia rozpatrywane są w ciągu 24-48 godzin. Fałszywe zgłoszenia mogą skutkować sankcjami. Administrator może stosować automatyczne systemy moderacji w tym AI.'
  },
  {
    pageSlug: 'terms',
    pageTitle: 'Regulamin serwisu',
    sectionTitle: 'Reklamacje',
    content: 'Reklamacje można składać przez formularz kontaktowy lub email. Reklamacja powinna zawierać: imię, nazwisko, email, opis problemu, żądanie. Administrator rozpatrzy reklamację w ciągu 14 dni roboczych.'
  }
]

// Extract How It Works content
const howItWorksContent: PageSection[] = [
  {
    pageSlug: 'how-it-works',
    pageTitle: 'Jak to działa',
    sectionTitle: 'Dla szukających pomocy - krok 1',
    content: 'Przeglądaj ogłoszenia: Przeszukuj bazę ogłoszeń w swojej okolicy. Filtruj po kategorii, cenie i lokalizacji.'
  },
  {
    pageSlug: 'how-it-works',
    pageTitle: 'Jak to działa',
    sectionTitle: 'Dla szukających pomocy - krok 2',
    content: 'Sprawdź opinie: Zobacz oceny i komentarze innych użytkowników, którzy korzystali z usług danej osoby.'
  },
  {
    pageSlug: 'how-it-works',
    pageTitle: 'Jak to działa',
    sectionTitle: 'Dla szukających pomocy - krok 3',
    content: 'Nawiąż kontakt: Wyślij wiadomość przez naszą platformę i umów szczegóły współpracy.'
  },
  {
    pageSlug: 'how-it-works',
    pageTitle: 'Jak to działa',
    sectionTitle: 'Dla oferujących pomoc - krok 1',
    content: 'Utwórz konto: Zarejestruj się za darmo i uzupełnij swój profil informacjami o swoich umiejętnościach.'
  },
  {
    pageSlug: 'how-it-works',
    pageTitle: 'Jak to działa',
    sectionTitle: 'Dla oferujących pomoc - krok 2',
    content: 'Dodaj ogłoszenie: Opisz w czym możesz pomóc, ustaw cenę i wskaż obszar, w którym działasz.'
  },
  {
    pageSlug: 'how-it-works',
    pageTitle: 'Jak to działa',
    sectionTitle: 'Dla oferujących pomoc - krok 3',
    content: 'Zdobywaj klientów: Otrzymuj wiadomości od zainteresowanych i buduj swoją reputację przez pozytywne opinie.'
  }
]

// Extract About content (mission and values)
const aboutContent: PageSection[] = [
  {
    pageSlug: 'about',
    pageTitle: 'O nas',
    sectionTitle: 'Misja FindSomeone',
    content: 'FindSomeone łączy ludzi lokalnie. Platforma stworzona z pasją do wynajmu mieszkań i pokoi, lokalnych ogłoszeń, sprzedaży i zakupów, znajdowania usług, wynajmu sprzętu i poszukiwania pracy. Nasza misja to przystępność i perfekcyjny UX. Technologia powinna być prosta i przyjemna. Tworzymy platformę, która łączy ludzi w najbardziej intuicyjny sposób – bez zbędnych komplikacji.'
  },
  {
    pageSlug: 'about',
    pageTitle: 'O nas',
    sectionTitle: 'Historia projektu',
    content: 'Znalezienie pomocy w okolicy nie powinno być trudne – a często takie właśnie jest. Wielu utalentowanych ludzi gubi się w natłoku ogłoszeń i platform, które nie są zaprojektowane z myślą o społecznościach. Postanowiliśmy to zmienić.'
  },
  {
    pageSlug: 'about',
    pageTitle: 'O nas',
    sectionTitle: 'Twórca projektu',
    content: 'Marcin Baszewski, Założyciel & Developer, 29 lat. Tworzę aplikacje z pasją do doskonałego UX i dbałością o każdy detal. Wierzę, że najlepsze produkty to te, w których doświadczenie użytkownika i estetyka wizualna idą w parze z funkcjonalnością.'
  },
  {
    pageSlug: 'about',
    pageTitle: 'O nas',
    sectionTitle: 'Funkcje platformy',
    content: 'FindSomeone oferuje inteligentne wyszukiwanie - znajdź dokładnie to, czego potrzebujesz. Bezpośrednia komunikacja przez wiadomości z powiadomieniami real-time. Gotowy do rozpoczęcia? Dołącz do społeczności FindSomeone i zacznij łączyć się z ludźmi w Twojej okolicy.'
  }
]

// Combine all content
const allContent: PageSection[] = [
  ...faqContent,
  ...privacyContent,
  ...termsContent,
  ...howItWorksContent,
  ...aboutContent
]

async function generateAndStoreSiteEmbeddings() {
  console.log('🚀 Starting site content embeddings generation...')
  console.log(`📄 Total sections to process: ${allContent.length}`)

  const supabase = createClient()

  // Extract all content texts for batch embedding
  const contentTexts = allContent.map(section => section.content)

  console.log('\n⏳ Generating embeddings (this may take a few minutes)...')
  const embeddings = await generateEmbeddingsBatch(contentTexts)

  // Prepare data for insertion
  const records = allContent.map((section, index) => {
    const embeddingArray = embeddings[index]
    // Convert to string format like posts do: '[0.1,0.2,...]'
    const embeddingString = embeddingArray ? `[${embeddingArray.join(',')}]` : null

    return {
      page_slug: section.pageSlug,
      page_title: section.pageTitle,
      section_title: section.sectionTitle,
      content: section.content,
      content_hash: createHash(section.content),
      embedding: embeddingString
    }
  })

  // Filter out records with null embeddings
  const validRecords = records.filter(r => r.embedding !== null)
  console.log(`\n✅ Generated ${validRecords.length} embeddings successfully`)

  if (validRecords.length === 0) {
    console.error('❌ No valid embeddings generated. Aborting.')
    return
  }

  // Delete existing embeddings to avoid duplicates
  console.log('\n🗑️  Removing old embeddings...')
  const { error: deleteError } = await supabase
    .from('site_content_embeddings')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

  if (deleteError) {
    console.error('⚠️  Warning: Could not delete old embeddings:', deleteError.message)
  }

  // Insert new embeddings
  console.log('💾 Storing embeddings in database...')
  const { data, error } = await supabase
    .from('site_content_embeddings')
    .insert(validRecords)
    .select('id, page_slug, page_title, section_title')

  if (error) {
    console.error('❌ Error storing embeddings:', error)
    return
  }

  console.log(`\n✨ Successfully stored ${data?.length || 0} embeddings!`)
  console.log('\n📊 Breakdown by page:')

  const breakdown = data?.reduce((acc, item) => {
    acc[item.page_slug] = (acc[item.page_slug] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  Object.entries(breakdown || {}).forEach(([slug, count]) => {
    console.log(`   - ${slug}: ${count} sections`)
  })

  console.log('\n🎉 Site content embeddings generation complete!')
}

// Run the script
generateAndStoreSiteEmbeddings()
  .then(() => {
    console.log('\n👋 Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error)
    process.exit(1)
  })
