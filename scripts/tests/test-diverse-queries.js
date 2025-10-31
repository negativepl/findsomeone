// Test różnorodnych, nietypowych zapytań użytkowników
const testQueries = [
  // Pytania o ogłoszenia (z bazy)
  { query: "masz jakiegoś malarza w warszawie?", expected: "SEARCH_INTENT, miasto: Warszawa" },
  { query: "potrzebuje kogoś do wymiany gier w poznaniu", expected: "SEARCH_INTENT, wymiana gier" },
  { query: "szukam serwisu rowerowego gdzieś na podlasiu", expected: "SEARCH_INTENT, może Białystok?" },
  { query: "ktoś programuje w react? mam zlecenie", expected: "SEARCH_INTENT, programista React" },
  { query: "kierowca z autem do przeprowadzki, szczecin albo olsztyn", expected: "SEARCH_INTENT, transport" },

  // Pytania z kolokwialnym językiem
  { query: "hej, masz jakąś sprzątaczkę w koszalinie?", expected: "SEARCH_INTENT, sprzątanie" },
  { query: "yo, gdzieś jest mechanik do forda? jestem w katowicach", expected: "SEARCH_INTENT, mechanik" },
  { query: "cześć, szukam kogoś kto wyprowadzi psa w zabrzu", expected: "SEARCH_INTENT, wyprowadzanie psa" },

  // Pytania o funkcje platformy (INFO_INTENT)
  { query: "jak to działa?", expected: "INFO_INTENT, pytanie o platformę" },
  { query: "co to jest findsomeone?", expected: "INFO_INTENT" },
  { query: "ile kosztuje dodanie ogłoszenia?", expected: "INFO_INTENT, ceny" },
  { query: "czy mogę dodać ogłoszenie za darmo?", expected: "INFO_INTENT" },
  { query: "jak się zarejestrować?", expected: "INFO_INTENT" },

  // Pytania wieloznaczne / edge cases
  { query: "szukam pracy", expected: "SEARCH_INTENT + CITY: ASK" },
  { query: "potrzebuję pomocy", expected: "Może pytać o co chodzi?" },
  { query: "masz coś?", expected: "Może pytać czego szuka?" },
  { query: "nic nie znalazłem", expected: "Odpowiedź współczująca" },

  // Pytania z błędami ortograficznymi
  { query: "szukam kucharza w gliwicah", expected: "SEARCH_INTENT, Gliwice (poprawić błąd)" },
  { query: "potrzebuję malarza w tychach pilnie", expected: "SEARCH_INTENT, Tychy" },

  // Pytania z wieloma miastami
  { query: "szukam mieszkania w warszawie lub gdańsku", expected: "SEARCH_INTENT, wybór miasta?" },
  { query: "kucharz w białymstoku albo częstochowie", expected: "SEARCH_INTENT" },

  // Pytania z ceną
  { query: "szukam malarza za max 100 zł w warszawie", expected: "SEARCH_INTENT, PRICE: 100" },
  { query: "mieszkanie do 2000 zł w gdańsku", expected: "SEARCH_INTENT, wynajm" },

  // Pytania negatywne / skargi
  { query: "dlaczego nic nie znalazłem?", expected: "Wyjaśnienie lub pomoc" },
  { query: "nie działa wyszukiwarka", expected: "INFO_INTENT, pomoc techniczna" },

  // Pozdrowienia / small talk
  { query: "cześć!", expected: "Powitanie + pytanie czym może pomóc" },
  { query: "dzień dobry", expected: "Powitanie" },
  { query: "dzięki, to wszystko", expected: "Pożegnanie" },
]

async function testDiverseQueries() {
  console.log('🧪 Testowanie różnorodnych zapytań użytkowników...\\n')
  console.log('=' .repeat(100))

  const results = {
    total: 0,
    search_intent: 0,
    info_intent: 0,
    city_ask: 0,
    city_detected: 0,
    errors: 0,
    no_structure: 0
  }

  for (let i = 0; i < testQueries.length; i++) {
    const test = testQueries[i]
    console.log(`\\n📝 Test ${i + 1}/${testQueries.length}`)
    console.log(`Query: "${test.query}"`)
    console.log(`Oczekiwane: ${test.expected}`)
    console.log('-'.repeat(100))

    try {
      const response = await fetch('http://localhost:3000/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: test.query }
          ]
        })
      })

      if (!response.ok) {
        if (response.status === 429) {
          console.log(`⏳ Rate limit - czekam 3 sekundy...`)
          await new Promise(resolve => setTimeout(resolve, 3000))
          i-- // Retry
          continue
        }
        console.log(`❌ Error: ${response.status} ${response.statusText}`)
        results.errors++
        continue
      }

      const data = await response.json()
      results.total++

      console.log(`\\n📨 Odpowiedź AI:`)
      console.log(`   Message: "${data.message}"`)

      // Detect intent type
      if (data.posts && data.posts.length > 0) {
        console.log(`   ✅ SEARCH_INTENT - Znaleziono ${data.posts.length} ogłoszeń`)
        console.log(`   Przykład: "${data.posts[0].title}"`)
        results.search_intent++
      } else if (data.posts && data.posts.length === 0) {
        console.log(`   ⚠️  SEARCH_INTENT - Brak ogłoszeń (0 wyników)`)
        results.search_intent++
      } else if (data.message.includes('W jakim mieście')) {
        console.log(`   🏙️  CITY: ASK - Pyta o miasto`)
        results.city_ask++
      } else if (data.message.includes('Oto') || data.message.includes('specjaliści') || data.message.includes('oferty')) {
        console.log(`   ⚠️  Może SEARCH_INTENT ale bez postów?`)
        results.no_structure++
      } else if (data.message.match(/jak|czym|ile|co to|kosztu|zarejestr|dodać|działa/i)) {
        console.log(`   ℹ️  Prawdopodobnie INFO_INTENT (pytanie o platformę)`)
        results.info_intent++
      } else {
        console.log(`   💬 Odpowiedź konwersacyjna`)
      }

      if (data.searchCity) {
        console.log(`   🏙️  Wykryte miasto: ${data.searchCity}`)
        results.city_detected++
      }

      // Wait between requests to avoid rate limit
      await new Promise(resolve => setTimeout(resolve, 2500))

    } catch (error) {
      console.log(`❌ Error: ${error.message}`)
      results.errors++
    }

    console.log('=' .repeat(100))
  }

  // Summary
  console.log('\\n\\n📊 PODSUMOWANIE TESTÓW:\\n')
  console.log(`Total pytań: ${results.total}`)
  console.log(`SEARCH_INTENT: ${results.search_intent} (${((results.search_intent/results.total)*100).toFixed(1)}%)`)
  console.log(`INFO_INTENT: ${results.info_intent} (${((results.info_intent/results.total)*100).toFixed(1)}%)`)
  console.log(`CITY: ASK: ${results.city_ask}`)
  console.log(`Wykryte miasta: ${results.city_detected}`)
  console.log(`Bez struktury (może błąd): ${results.no_structure}`)
  console.log(`Errors: ${results.errors}`)

  console.log('\\n✅ Testy zakończone!\\n')
}

testDiverseQueries()
