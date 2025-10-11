import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'

// Popular search phrases (would be from analytics in production)
const POPULAR_SEARCHES = [
  'hydraulik',
  'sprzątanie',
  'elektryk',
  'transport',
  'nauka angielskiego',
  'opieka nad dziećmi',
  'pomoc w przeprowadzce',
  'montaż mebli',
  'malowanie',
  'naprawa komputera',
]

// Common search patterns
const SEARCH_PATTERNS = [
  'szukam',
  'potrzebuję',
  'pilnie szukam',
  'tanio',
  'sprawdzony',
]

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const clientIp = getClientIp(request)
  const rateLimitResult = await rateLimit(
    `search:${clientIp}`,
    RATE_LIMITS.search.limit,
    RATE_LIMITS.search.window
  )

  // If rate limit exceeded, return 429 Too Many Requests
  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: 'Too many requests',
        message: 'Przekroczono limit wyszukiwań. Spróbuj ponownie za chwilę.',
        retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          ...rateLimitResult.headers,
          'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
        },
      }
    )
  }

  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')?.trim() || ''

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If no query, return popular searches, trending, and smart suggestions
  if (!query || query.length === 0) {
    // Get REAL popular searches from database
    const { data: popularSearches } = await supabase
      .rpc('get_popular_searches', { days_back: 7, result_limit: 8 })

    // Get trending searches (growing in popularity)
    const { data: trendingSearches } = await supabase
      .rpc('get_trending_searches', { result_limit: 5 })

    // Get smart suggestions for logged-in users
    let smartSuggestions: any[] = []
    if (user) {
      const { data: suggestions } = await supabase
        .rpc('get_smart_suggestions', {
          target_user_id: user.id,
          limit_count: 5,
        })
        .limit(5)

      smartSuggestions = (suggestions || []).map((item: any) => ({
        text: item.suggestion_text,
        type: 'smart' as const,
        score: item.relevance_score,
      }))
    }

    // Format popular searches
    const popular = (popularSearches || []).map((item: any) => ({
      text: item.query,
      type: 'popular' as const,
    }))

    // Format trending searches
    const trending = (trendingSearches || []).map((item: any) => ({
      text: item.query,
      type: 'trending' as const,
    }))

    // Fallback to hardcoded if no data yet
    const finalPopular = popular.length > 0 ? popular : POPULAR_SEARCHES.slice(0, 8).map(text => ({
      text,
      type: 'popular' as const,
    }))

    return NextResponse.json(
      {
        trending,
        popular: finalPopular,
        smart: smartSuggestions,
        categories: [],
        suggestions: [],
      },
      {
        headers: rateLimitResult.headers,
      }
    )
  }

  // If query is less than 2 chars, don't search
  if (query.length < 2) {
    return NextResponse.json({
      trending: [],
      popular: [],
      categories: [],
      suggestions: [],
      queryCorrection: null,
    })
  }

  // Try to correct the query if it might have typos
  let queryCorrection = null
  if (query.length >= 3) {
    try {
      const rewriteResponse = await fetch(
        `${request.nextUrl.origin}/api/search/rewrite`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        }
      )
      if (rewriteResponse.ok) {
        const rewriteData = await rewriteResponse.json()
        if (rewriteData.needsCorrection) {
          queryCorrection = {
            original: rewriteData.original,
            corrected: rewriteData.corrected,
            confidence: rewriteData.confidence,
          }
        }
      }
    } catch (error) {
      // Silent fail - don't break search if rewriting fails
      console.error('Query rewriting failed:', error)
    }
  }

  const lowerQuery = query.toLowerCase()

  // 1. Get REAL autocomplete suggestions from actual post content
  const { data: autocompleteSuggestions } = await supabase
    .rpc('get_autocomplete_suggestions', {
      search_prefix: query,
      limit_count: 8
    })

  // 2. Search categories by name
  const { data: categoriesByName } = await supabase
    .from('categories')
    .select('id, name, slug')
    .ilike('name', `%${query}%`)
    .limit(3)

  // 3. Search categories by synonyms
  const { data: categorySynonyms } = await supabase
    .from('category_synonyms')
    .select('category_id, categories(id, name, slug)')
    .ilike('synonym', `%${query}%`)
    .limit(3)

  // Combine and deduplicate categories
  const categoryMap = new Map<string, { id: string; name: string; slug: string }>()

  // Add categories found by name
  categoriesByName?.forEach(cat => {
    categoryMap.set(cat.id, cat)
  })

  // Add categories found by synonyms
  categorySynonyms?.forEach((syn: any) => {
    if (syn.categories) {
      categoryMap.set(syn.categories.id, syn.categories)
    }
  })

  const categories = Array.from(categoryMap.values()).slice(0, 3)

  // 3. Search through actual posts for relevant phrases
  const { data: posts } = await supabase
    .from('posts')
    .select('title, description')
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .eq('status', 'active')
    .limit(10)

  // Build intelligent suggestions from REAL data
  const suggestions: Array<{
    text: string
    type: 'category' | 'combo' | 'pattern' | 'popular' | 'trending' | 'post'
  }> = []

  // 1. Add autocomplete from actual post content (MOST IMPORTANT!)
  if (autocompleteSuggestions && autocompleteSuggestions.length > 0) {
    autocompleteSuggestions.forEach((item: any) => {
      if (item.suggestion && item.suggestion.length >= 3) {
        suggestions.push({
          text: item.suggestion,
          type: 'post',
        })
      }
    })
  }

  // 2. Extract common phrases from post titles
  if (posts && posts.length > 0) {
    const phrases = new Set<string>()
    posts.forEach((post: any) => {
      // Extract relevant phrases from title
      const titleWords = post.title.toLowerCase().split(' ')
      const descWords = post.description.toLowerCase().split(' ')

      // Find phrases containing the query
      for (let i = 0; i < titleWords.length - 1; i++) {
        const phrase = titleWords.slice(i, i + 3).join(' ')
        if (phrase.includes(lowerQuery) && phrase.length <= 50) {
          phrases.add(phrase)
        }
      }
    })

    // Add unique phrases as suggestions
    Array.from(phrases).slice(0, 5).forEach(phrase => {
      suggestions.push({
        text: phrase,
        type: 'post',
      })
    })
  }

  // 3. Add matching categories
  categories?.forEach(cat => {
    suggestions.push({
      text: cat.name,
      type: 'category',
    })
  })

  // 4. Add category-based suggestions if we have categories
  if (categories && categories.length > 0 && query.length >= 3) {
    const mainCat = categories[0].name
    const topCities = ['Warszawa', 'Kraków', 'Wrocław']

    // Add category + city combos
    topCities.slice(0, 2).forEach(city => {
      suggestions.push({
        text: `${mainCat} ${city}`,
        type: 'combo',
      })
    })

    // Add search patterns
    SEARCH_PATTERNS.slice(0, 2).forEach(pattern => {
      suggestions.push({
        text: `${pattern} ${mainCat.toLowerCase()}`,
        type: 'pattern',
      })
    })
  }

  // 5. Add matching popular searches from database
  const { data: dbPopularSearches } = await supabase
    .from('search_queries')
    .select('query')
    .ilike('query', `%${query}%`)
    .limit(5)

  if (dbPopularSearches && dbPopularSearches.length > 0) {
    const queryCounts: Record<string, number> = {}
    dbPopularSearches.forEach((item: any) => {
      queryCounts[item.query] = (queryCounts[item.query] || 0) + 1
    })

    Object.entries(queryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .forEach(([searchQuery]) => {
        suggestions.push({
          text: searchQuery,
          type: 'popular',
        })
      })
  }

  // Remove duplicates and limit results
  const uniqueSuggestions = suggestions
    .filter((suggestion, index, self) =>
      index === self.findIndex(s => s.text.toLowerCase() === suggestion.text.toLowerCase())
    )
    .filter(s => s.text.length >= 3 && s.text.length <= 100)
    .slice(0, 12)

  return NextResponse.json(
    {
      trending: [],
      popular: [],
      categories: categories || [],
      suggestions: uniqueSuggestions,
      queryCorrection,
    },
    {
      headers: rateLimitResult.headers,
    }
  )
}
