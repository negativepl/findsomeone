import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'
import { generateQueryEmbedding } from '@/lib/embeddings'

/**
 * AI Chat Search Posts API
 * Wyszukuje ogłoszenia na podstawie zapytania użytkownika dla AI assistenta
 *
 * UŻYWA HYBRYDOWEGO WYSZUKIWANIA:
 * - 60% semantic search (OpenAI embeddings)
 * - 40% full-text search (PostgreSQL)
 *
 * Fallback do prostego ILIKE jeśli embeddings nie są dostępne
 */
export async function POST(request: NextRequest) {
  // Apply rate limiting
  const clientIp = getClientIp(request)
  const rateLimitResult = await rateLimit(
    `ai-search:${clientIp}`,
    RATE_LIMITS.aiRewrite.limit,
    RATE_LIMITS.aiRewrite.window
  )

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: 'Too many requests',
        message: 'Przekroczono limit wyszukiwań. Spróbuj ponownie za chwilę.',
      },
      { status: 429 }
    )
  }

  try {
    const { query, city, priceMin, priceMax, sortBy, limit = 6 } = await request.json()

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ posts: [], suggestions: [] })
    }

    const supabase = await createClient()

    // SEMANTIC SEARCH: Generate embedding for query
    const searchTerm = query.trim()
    console.log('[AI Chat Search] Query:', searchTerm, 'City:', city || 'none')

    const queryEmbedding = await generateQueryEmbedding(searchTerm)

    let posts: any[] = []

    if (queryEmbedding) {
      console.log('[AI Chat Search] Using HYBRID search (embeddings enabled)')
      // Use hybrid search (60% semantic + 40% full-text)
      const embeddingString = `[${queryEmbedding.join(',')}]`

      const { data, error } = await supabase.rpc('search_posts_hybrid', {
        search_query: searchTerm,
        query_embedding: embeddingString,
        limit_count: Math.min(Math.max(limit, 1), 20),
      })

      if (error) {
        console.error('[AI Chat Search] Hybrid search error:', error)
        // Fallback to simple search if hybrid fails
      } else {
        posts = data || []
        console.log('[AI Chat Search] Hybrid search found:', posts.length, 'posts')
      }
    } else {
      console.log('[AI Chat Search] Embeddings not available, using fallback')
    }

    // Fallback: Use simple text search if embeddings failed
    if (!queryEmbedding || posts.length === 0) {
      console.log('Falling back to simple text search')

      let searchQuery = supabase
        .from('posts')
        .select(`
          id,
          title,
          description,
          price,
          price_type,
          city,
          images,
          created_at,
          profiles:user_id (
            full_name,
            avatar_url,
            rating,
            total_reviews
          ),
          categories:category_id (
            name
          )
        `)
        .eq('status', 'active')
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .limit(Math.min(Math.max(limit, 1), 20))
        .order('created_at', { ascending: false })

      const { data, error } = await searchQuery

      if (error) {
        console.error('Fallback search error:', error)
        return NextResponse.json(
          { error: 'Search failed', details: error.message },
          { status: 500 }
        )
      }

      posts = data || []
    }

    // Apply filters (city, price) in memory since hybrid search doesn't support them directly
    if (city && city.trim()) {
      posts = posts.filter((post: any) =>
        post.city?.toLowerCase().includes(city.trim().toLowerCase())
      )
    }

    if (priceMin && !isNaN(priceMin)) {
      posts = posts.filter((post: any) =>
        (post.price || 0) >= priceMin
      )
    }

    if (priceMax && !isNaN(priceMax)) {
      posts = posts.filter((post: any) =>
        (post.price || 0) <= priceMax
      )
    }

    // Sort by rating if requested
    if (sortBy === 'rating') {
      posts.sort((a: any, b: any) => {
        const ratingA = a.user_rating || a.profiles?.rating || 0
        const ratingB = a.user_rating || b.profiles?.rating || 0
        if (ratingB !== ratingA) {
          return ratingB - ratingA
        }
        return (b.profiles?.total_reviews || 0) - (a.profiles?.total_reviews || 0)
      })
    }

    // Format posts for display
    const formattedPosts = (posts || []).map((post: any) => {
      const price = post.price ?? 0
      return {
        id: post.id,
        title: post.title,
        description: post.description?.substring(0, 150) + (post.description?.length > 150 ? '...' : ''),
        price: post.price_type === 'free'
          ? 'Za darmo'
          : price > 0
            ? `${price} zł${post.price_type === 'negotiable' ? ' (do negocjacji)' : ''}`
            : 'Cena do ustalenia',
        city: post.city,
        url: `/posts/${post.id}`,
        // Hybrid search returns different field names
        authorName: post.user_full_name || post.profiles?.full_name || 'Użytkownik',
        authorAvatar: post.user_avatar_url || post.profiles?.avatar_url,
        categoryName: post.category_name || post.categories?.name,
        image: post.images?.[0] || null,
        rating: post.user_rating || post.profiles?.rating,
        totalReviews: post.profiles?.total_reviews,
        createdAt: post.created_at,
        // Include similarity score from hybrid search
        similarityScore: post.combined_score || post.similarity,
      }
    })

    // Generate suggestions if few or no results
    let suggestions: string[] = []
    if (formattedPosts.length < 3) {
      // Get related categories
      const { data: categories } = await supabase
        .from('categories')
        .select('name')
        .ilike('name', `%${searchTerm}%`)
        .limit(3)

      if (categories && categories.length > 0) {
        suggestions = categories.map(c => c.name)
      } else {
        // Fallback: suggest popular categories
        const { data: popularCategories } = await supabase
          .from('categories')
          .select('name')
          .is('parent_id', null)
          .limit(3)

        suggestions = popularCategories?.map(c => c.name) || []
      }
    }

    return NextResponse.json({
      posts: formattedPosts,
      count: formattedPosts.length,
      query: searchTerm,
      city: city || null,
      suggestions: suggestions,
    })
  } catch (error) {
    console.error('AI Search error:', error)
    return NextResponse.json(
      {
        error: 'Failed to search',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
