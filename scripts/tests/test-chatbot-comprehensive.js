const testQueries = [
  { id: 1, category: "Ogólne info", query: "Czym jest FindSomeone?" },
  { id: 2, category: "Szukanie specjalisty", query: "Szukam fizjoterapeuty w Warszawie" },
  { id: 3, category: "Ceny", query: "Ile kosztuje dodanie ogłoszenia?" },
  { id: 4, category: "Funkcjonalność", query: "Jak mogę dodać swoje ogłoszenie?" },
  { id: 5, category: "Lokalizacja", query: "Polecasz jakiegoś stomatologa w Krakowie?" },
  { id: 6, category: "Kategorie", query: "Jakie kategorie specjalistów są dostępne?" },
  { id: 7, category: "Off-topic", query: "Jaka jest pogoda jutro?" },
  { id: 8, category: "Opinie", query: "Jak działają opinie użytkowników?" },
  { id: 9, category: "Kontakt", query: "Jak mogę się skontaktować z supportem?" },
  { id: 10, category: "Konto", query: "Czy muszę się rejestrować żeby szukać specjalistów?" },
  { id: 11, category: "Biznes", query: "Czy mogę promować swoją firmę na platformie?" },
  { id: 12, category: "Złożone", query: "Szukam tłumacza języka japońskiego w Poznaniu, który ma doświadczenie w tłumaczeniach technicznych" },
  { id: 13, category: "Porównanie", query: "Jaka jest różnica między kontem darmowym a płatnym?" },
  { id: 14, category: "Bezpieczeństwo", query: "Czy moje dane są bezpieczne?" },
  { id: 15, category: "Edge case", query: "asdfghjkl" }
];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testChatbot() {
  console.log('🤖 COMPREHENSIVE CHATBOT TEST\n');
  console.log('='.repeat(80));

  const results = [];

  for (const test of testQueries) {
    console.log(`\n📋 Test ${test.id}/15 [${test.category}]`);
    console.log(`❓ Query: "${test.query}"`);
    console.log('-'.repeat(80));

    try {
      const response = await fetch('http://localhost:3000/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: test.query }
          ]
        })
      });

      // Add delay to avoid rate limiting
      await sleep(3000);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      const result = {
        testId: test.id,
        category: test.category,
        query: test.query,
        success: true,
        response: data.message,
        hasResults: data.posts?.length > 0,
        resultsCount: data.posts?.length || 0
      };

      results.push(result);

      console.log(`✅ Status: SUCCESS`);
      console.log(`📊 Results: ${result.resultsCount} posts found`);
      console.log(`💬 Response (first 200 chars): ${data.message?.substring(0, 200) || 'N/A'}...`);

    } catch (error) {
      const result = {
        testId: test.id,
        category: test.category,
        query: test.query,
        success: false,
        error: error.message
      };

      results.push(result);

      console.log(`❌ Status: FAILED`);
      console.log(`⚠️  Error: ${error.message}`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST SUMMARY\n');

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`Total tests: ${results.length}`);
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success rate: ${((successful / results.length) * 100).toFixed(1)}%`);

  // Category breakdown
  console.log('\n📈 BREAKDOWN BY CATEGORY:\n');
  const categories = [...new Set(results.map(r => r.category))];
  categories.forEach(cat => {
    const catResults = results.filter(r => r.category === cat);
    const catSuccess = catResults.filter(r => r.success).length;
    console.log(`  ${cat}: ${catSuccess}/${catResults.length} ✓`);
  });

  // Failed tests detail
  const failedTests = results.filter(r => !r.success);
  if (failedTests.length > 0) {
    console.log('\n⚠️  FAILED TESTS DETAIL:\n');
    failedTests.forEach(test => {
      console.log(`  Test ${test.testId} [${test.category}]: ${test.error}`);
    });
  }

  // Check for potential issues
  console.log('\n🔍 QUALITY CHECKS:\n');

  const testsWithResults = results.filter(r => r.success && r.hasResults);
  const testsWithoutResults = results.filter(r => r.success && !r.hasResults);

  console.log(`  Responses with posts: ${testsWithResults.length}`);
  console.log(`  Responses without posts: ${testsWithoutResults.length}`);

  // Check if off-topic was handled properly
  const offTopicTest = results.find(r => r.category === 'Off-topic');
  if (offTopicTest && offTopicTest.success) {
    console.log(`  ✓ Off-topic query handled: ${offTopicTest.response.includes('FindSomeone') ? 'Redirected properly' : 'May need review'}`);
  }

  // Check if edge case was handled
  const edgeTest = results.find(r => r.category === 'Edge case');
  if (edgeTest && edgeTest.success) {
    console.log(`  ✓ Edge case handled: ${edgeTest.response.length > 0 ? 'Response provided' : 'No response'}`);
  }

  console.log('\n' + '='.repeat(80));
  console.log('✨ Test completed!\n');
}

testChatbot().catch(console.error);
