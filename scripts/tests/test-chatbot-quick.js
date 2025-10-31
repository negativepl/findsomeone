// Quick test with 5 most diverse questions
const testQueries = [
  { id: 1, category: "Ogólne info", query: "Czym jest FindSomeone?" },
  { id: 2, category: "Szukanie specjalisty", query: "Szukam fizjoterapeuty w Warszawie" },
  { id: 3, category: "Off-topic", query: "Jaka jest pogoda jutro?" },
  { id: 4, category: "Złożone", query: "Szukam tłumacza języka japońskiego w Poznaniu, który ma doświadczenie w tłumaczeniach technicznych" },
  { id: 5, category: "Edge case", query: "asdfghjkl" }
];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testChatbot() {
  console.log('🤖 QUICK CHATBOT TEST (5 diverse queries)\n');
  console.log('='.repeat(80));

  const results = [];

  for (const test of testQueries) {
    console.log(`\n📋 Test ${test.id}/5 [${test.category}]`);
    console.log(`❓ Query: "${test.query}"`);
    console.log('-'.repeat(80));

    try {
      const startTime = Date.now();
      const response = await fetch('http://localhost:3000/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: test.query }
          ]
        })
      });

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();

      const result = {
        testId: test.id,
        category: test.category,
        query: test.query,
        success: true,
        response: data.message,
        hasResults: data.posts?.length > 0,
        resultsCount: data.posts?.length || 0,
        responseTime,
        posts: data.posts || [],
        suggestions: data.suggestions || []
      };

      results.push(result);

      console.log(`✅ Status: SUCCESS (${responseTime}ms)`);
      console.log(`📊 Results: ${result.resultsCount} posts found`);
      if (result.suggestions.length > 0) {
        console.log(`💡 Suggestions: ${result.suggestions.join(', ')}`);
      }
      console.log(`💬 Response:\n"${data.message}"`);

      // Wait 4 seconds between requests to avoid rate limiting
      if (test.id < testQueries.length) {
        console.log('\n⏳ Waiting 4 seconds before next test...');
        await sleep(4000);
      }

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

      // Still wait before next request
      if (test.id < testQueries.length) {
        console.log('\n⏳ Waiting 4 seconds before next test...');
        await sleep(4000);
      }
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

  // Detailed analysis
  if (successful > 0) {
    console.log('\n📈 DETAILED ANALYSIS:\n');

    results.filter(r => r.success).forEach(result => {
      console.log(`\n[${result.category}] "${result.query}"`);
      console.log(`  ├─ Response time: ${result.responseTime}ms`);
      console.log(`  ├─ Posts found: ${result.resultsCount}`);
      console.log(`  └─ Response: ${result.response?.substring(0, 150)}...`);
    });
  }

  // Failed tests detail
  const failedTests = results.filter(r => !r.success);
  if (failedTests.length > 0) {
    console.log('\n⚠️  FAILED TESTS:\n');
    failedTests.forEach(test => {
      console.log(`  [${test.category}] "${test.query}"`);
      console.log(`    └─ Error: ${test.error}\n`);
    });
  }

  // Quality checks
  console.log('\n🔍 QUALITY CHECKS:\n');

  const offTopicTest = results.find(r => r.category === 'Off-topic' && r.success);
  if (offTopicTest) {
    const redirectedProperly = offTopicTest.response?.toLowerCase().includes('findsomeone') ||
                                offTopicTest.response?.toLowerCase().includes('specjalist');
    console.log(`  Off-topic handling: ${redirectedProperly ? '✅ Redirected properly' : '⚠️  May need review'}`);
    console.log(`    └─ "${offTopicTest.response?.substring(0, 100)}..."`);
  }

  const edgeTest = results.find(r => r.category === 'Edge case' && r.success);
  if (edgeTest) {
    const hasResponse = edgeTest.response && edgeTest.response.length > 0;
    console.log(`  Edge case handling: ${hasResponse ? '✅ Graceful response' : '⚠️  No response'}`);
    console.log(`    └─ "${edgeTest.response?.substring(0, 100)}..."`);
  }

  const searchTest = results.find(r => r.category === 'Szukanie specjalisty' && r.success);
  if (searchTest) {
    console.log(`  Search functionality: ${searchTest.hasResults ? '✅ Found results' : '⚠️  No results'}`);
    if (searchTest.hasResults) {
      console.log(`    └─ Found ${searchTest.resultsCount} relevant posts`);
    }
  }

  const complexTest = results.find(r => r.category === 'Złożone' && r.success);
  if (complexTest) {
    console.log(`  Complex query handling: ${complexTest.hasResults ? '✅ Parsed correctly' : '⚠️  No results'}`);
    console.log(`    └─ "${complexTest.response?.substring(0, 100)}..."`);
  }

  console.log('\n' + '='.repeat(80));
  console.log('✨ Test completed!\n');

  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

testChatbot().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
