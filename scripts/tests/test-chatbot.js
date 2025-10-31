const testQueries = [
  // Test 1: Proste wyszukiwanie z miastem
  {
    query: "szukam hydraulika w Warszawie",
    expected: "SEARCH_INTENT: tak, CITY: Warszawa, dynamiczny nagłówek"
  },

  // Test 2: Pytanie z miastem w środku
  {
    query: "czy ktoś szuka elektryka w Krakowie?",
    expected: "SEARCH_INTENT: tak, CITY: Kraków, wykrycie miasta"
  },

  // Test 3: Bez miasta - powinno zapytać
  {
    query: "szukam mechanika",
    expected: "CITY: ASK, pytanie o miasto"
  },

  // Test 4: Ogólne pytanie z kontekstem
  {
    query: "masz coś w Gdańsku?",
    expected: "SEARCH_INTENT: tak, CITY: Gdańsk"
  },

  // Test 5: Złożona usługa
  {
    query: "potrzebuję kogoś do transportu mebli w Poznaniu",
    expected: "SEARCH_INTENT: tak, dynamiczny nagłówek dla transportu"
  },

  // Test 6: Pytanie o platformę
  {
    query: "jak dodać ogłoszenie?",
    expected: "INFO_INTENT: tak, odpowiedź o platformie"
  },

  // Test 7: Serwis/naprawa
  {
    query: "szukam serwisu rowerowego w Białymstoku",
    expected: "SEARCH_INTENT: tak, CITY: Białystok, serwisy rowerowe"
  },

  // Test 8: Oferta pracy
  {
    query: "szukam pracy w Szczecinie",
    expected: "SEARCH_INTENT: tak, 'oferty pracy' nie 'specjaliści'"
  },
]

async function testChatbot() {
  console.log('🧪 Testowanie chatbota AI...\n')
  console.log('=' .repeat(80))

  for (let i = 0; i < testQueries.length; i++) {
    const test = testQueries[i]
    console.log(`\n📝 Test ${i + 1}/${testQueries.length}`)
    console.log(`Query: "${test.query}"`)
    console.log(`Oczekiwane: ${test.expected}`)
    console.log('-'.repeat(80))

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
        console.log(`❌ Error: ${response.status} ${response.statusText}`)
        continue
      }

      const data = await response.json()

      console.log(`\n📨 Odpowiedź AI:`)
      console.log(`   Message: "${data.message}"`)
      if (data.posts && data.posts.length > 0) {
        console.log(`   ✅ Znaleziono ${data.posts.length} ogłoszeń`)
        console.log(`   Przykład: "${data.posts[0].title}"`)
      } else if (data.posts && data.posts.length === 0) {
        console.log(`   ⚠️  Brak ogłoszeń`)
      }
      if (data.searchCity) {
        console.log(`   🏙️  Miasto: ${data.searchCity}`)
      }

      // Analiza
      console.log(`\n🔍 Analiza:`)

      // Sprawdź czy AI wykryło miasto
      if (test.query.includes(' w ')) {
        const cities = ['Warszawie', 'Krakowie', 'Gdańsku', 'Poznaniu', 'Białymstoku', 'Szczecinie', 'Warszawy', 'Krakowa', 'Gdańska', 'Poznania', 'Białegostoku', 'Szczecina']
        const hasCity = cities.some(city => test.query.toLowerCase().includes(city.toLowerCase()))

        if (hasCity) {
          if (data.searchCity) {
            console.log(`   ✅ Poprawnie wykryto miasto`)
          } else if (data.message.includes('W jakim mieście')) {
            console.log(`   ❌ BŁĄD: AI pyta o miasto pomimo że było w zapytaniu!`)
          }
        }
      }

      // Sprawdź dynamiczny nagłówek
      if (data.message) {
        const msg = data.message.toLowerCase()

        // Sprawdź czy nagłówek jest dynamiczny
        if (test.query.includes('pracy') || test.query.includes('pracę')) {
          if (msg.includes('oferty pracy') || msg.includes('ogłoszenia o pracę')) {
            console.log(`   ✅ Dynamiczny nagłówek - używa "oferty pracy"`)
          } else if (msg.includes('specjaliści')) {
            console.log(`   ❌ BŁĄD: Używa "specjaliści" zamiast "oferty pracy"!`)
          }
        }

        if (test.query.includes('serwis')) {
          if (msg.includes('serwis')) {
            console.log(`   ✅ Dynamiczny nagłówek - zawiera "serwis"`)
          }
        }

        if (test.query.includes('transport')) {
          if (msg.includes('transport') || msg.includes('kierowcy')) {
            console.log(`   ✅ Dynamiczny nagłówek - kontekst transportu`)
          }
        }
      }

      // Sprawdź czy zwrócono ogłoszenia gdy powinno
      if (!data.message.includes('W jakim mieście') && !data.message.includes('jak') && !data.message.includes('Jak')) {
        if (data.posts && data.posts.length > 0) {
          console.log(`   ✅ Zwrócono ogłoszenia`)
        } else {
          console.log(`   ⚠️  Brak ogłoszeń (może nie ma w bazie)`)
        }
      }

      console.log('=' .repeat(80))

      // Wait a bit between requests
      await new Promise(resolve => setTimeout(resolve, 2000))

    } catch (error) {
      console.log(`❌ Error: ${error.message}`)
      console.log('=' .repeat(80))
    }
  }

  console.log('\n✅ Testy zakończone!\n')
}

testChatbot()
