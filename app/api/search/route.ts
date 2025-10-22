import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'
import {
  getCachedAutocomplete,
  setCachedAutocomplete,
  getCachedTrending,
  setCachedTrending,
  getCachedPopular,
  setCachedPopular,
} from '@/lib/search-cache'

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
    // OPTIMIZED: Use unified autocomplete function
    const { data: unifiedData } = await supabase
      .rpc('get_unified_autocomplete', {
        search_query: '',
        user_id: user?.id || null,
        include_smart: !!user
      })

    if (unifiedData) {
      // Parse the JSON response
      const parsed = unifiedData as any

      // Format and add types
      const popular = (parsed.popular || []).map((item: any) => ({
        text: item.text,
        type: 'popular' as const,
      }))

      const trending = (parsed.trending || []).map((item: any) => ({
        text: item.text,
        type: 'trending' as const,
      }))

      const smart = (parsed.smart || []).map((item: any) => ({
        text: item.text,
        type: 'smart' as const,
        score: item.score,
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
          smart,
          categories: [],
          suggestions: [],
        },
        {
          headers: rateLimitResult.headers,
        }
      )
    }

    // Fallback if unified function fails
    return NextResponse.json(
      {
        trending: [],
        popular: POPULAR_SEARCHES.slice(0, 8).map(text => ({ text, type: 'popular' as const })),
        smart: [],
        categories: [],
        suggestions: [],
      },
      {
        headers: rateLimitResult.headers,
      }
    )
  }

  // Allow searches from 1 character onwards for better UX
  // (Database function handles minimum length internally)
  if (query.length < 1) {
    return NextResponse.json({
      trending: [],
      popular: [],
      categories: [],
      suggestions: [],
      queryCorrection: null,
    })
  }

  // Query correction disabled for performance - was adding 1-2s delay
  // Can be re-enabled later as separate async endpoint
  const queryCorrection = null

  // CACHE CHECK: Try to get cached results first
  const cachedResults = await getCachedAutocomplete(query, null)

  if (cachedResults) {
    console.log('[Cache HIT] Returning cached results for:', query)
    return NextResponse.json(
      {
        ...cachedResults,
        cached: true,
      },
      {
        headers: rateLimitResult.headers,
      }
    )
  }

  // CACHE MISS: Fetch from database
  console.log('[Cache MISS] Fetching from database for:', query)

  // OPTIMIZED: Use unified autocomplete function (1 query instead of multiple)
  const { data: unifiedData, error: autocompleteError } = await supabase
    .rpc('get_unified_autocomplete', {
      search_query: query,
      user_id: null, // Don't include smart suggestions during typing (performance)
      include_smart: false
    })

  // Debug logging
  if (autocompleteError) {
    console.error('Unified autocomplete error:', autocompleteError)
  }

  if (!unifiedData) {
    // Fallback if function fails
    return NextResponse.json(
      {
        trending: [],
        popular: [],
        categories: [],
        suggestions: [],
        queryCorrection: null,
      },
      {
        headers: rateLimitResult.headers,
      }
    )
  }

  // Parse unified response
  const parsed = unifiedData as any
  const categories = parsed.categories || []
  const autocompleteSuggestions = parsed.suggestions || []

  console.log('Autocomplete results for:', query, '→', autocompleteSuggestions.length, 'suggestions')

  // Build intelligent suggestions from unified data
  const suggestions: Array<{
    text: string
    type: 'category' | 'combo' | 'pattern' | 'popular' | 'trending' | 'post'
  }> = []

  // 1. FIRST: Add categories (HIGHEST PRIORITY - always at top)
  if (categories && categories.length > 0) {
    categories.forEach((cat: any) => {
      suggestions.push({
        text: cat.name,
        type: 'category',
      })
    })
  }

  // 2. THEN: Add autocomplete suggestions with smart type detection
  if (autocompleteSuggestions && autocompleteSuggestions.length > 0) {
    autocompleteSuggestions.forEach((item: any) => {
      const suggestionText = item.text || item.suggestion
      if (suggestionText && suggestionText.length >= 2) {
        // Skip if already added as category
        if (categories?.some((cat: any) => cat.name.toLowerCase() === suggestionText.toLowerCase())) {
          return
        }

        // Detect suggestion type from content
        let type: 'category' | 'combo' | 'pattern' | 'post' = 'post'

        // Check if it's formatted as "query w kategorii Category"
        if (suggestionText.includes(' w kategorii ')) {
          type = 'category'
        }
        // Check if it's a category path (includes "Parent > Child")
        else if (suggestionText.includes(' > ')) {
          type = 'category'
        }
        // Check if it contains pattern words
        else if (SEARCH_PATTERNS.some(pattern => suggestionText.toLowerCase().includes(pattern))) {
          type = 'pattern'
        }
        // Check if it looks like category + city or common phrase
        else if (suggestionText.split(' ').length >= 2 && suggestionText.split(' ').length <= 3) {
          type = 'combo'
        }

        suggestions.push({
          text: suggestionText,
          type,
        })
      }
    })
  }

  // Remove duplicates and limit results
  const uniqueSuggestions = suggestions
    .filter((suggestion, index, self) =>
      index === self.findIndex(s => s.text.toLowerCase() === suggestion.text.toLowerCase())
    )
    .filter(s => s.text.length >= 3 && s.text.length <= 100)
    .slice(0, 12)

  // Build response object
  const response = {
    trending: [],
    popular: [],
    categories: categories || [],
    suggestions: uniqueSuggestions,
    queryCorrection,
  }

  // CACHE SET: Store results in cache for next request (fire and forget)
  setCachedAutocomplete(query, response, null).catch(err => {
    console.error('[Cache] Failed to cache results:', err)
  })

  return NextResponse.json(response, {
    headers: rateLimitResult.headers,
  })
}
