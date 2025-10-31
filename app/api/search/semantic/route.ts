import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { generateQueryEmbedding } from '@/lib/embeddings'
import { rateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  // Apply rate limiting (stricter for AI endpoints)
  const clientIp = getClientIp(request)
  const rateLimitResult = await rateLimit(
    `semantic:${clientIp}`,
    RATE_LIMITS.semantic.limit,
    RATE_LIMITS.semantic.window
  )

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: 'Too many requests',
        message: 'Przekroczono limit wyszukiwań semantycznych. Spróbuj ponownie za chwilę.',
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
  const mode = searchParams.get('mode') || 'hybrid' // 'semantic', 'hybrid'
  const limit = parseInt(searchParams.get('limit') || '20')
  const threshold = parseFloat(searchParams.get('threshold') || '0.7')

  if (!query || query.length < 2) {
    return NextResponse.json({
      results: [],
      mode,
      message: 'Query too short',
    })
  }

  const supabase = await createClient()

  try {
    // Generate embedding for the search query
    const queryEmbedding = await generateQueryEmbedding(query)

    if (!queryEmbedding) {
      return NextResponse.json(
        {
          error: 'Failed to generate embedding. OpenAI might not be configured.',
          fallback: true,
        },
        { status: 500 }
      )
    }

    // Format embedding for PostgreSQL
    const embeddingString = `[${queryEmbedding.join(',')}]`

    let results

    if (mode === 'hybrid') {
      // Hybrid search: 60% semantic + 40% full-text
      const { data, error } = await supabase.rpc('search_posts_hybrid', {
        search_query: query,
        query_embedding: embeddingString,
        limit_count: limit,
      })

      if (error) throw error
      results = data || []
    } else {
      // Pure semantic search
      const { data, error } = await supabase.rpc('search_posts_semantic', {
        query_embedding: embeddingString,
        similarity_threshold: threshold,
        limit_count: limit,
      })

      if (error) throw error
      results = data || []
    }

    // Track the search with embedding
    try {
      const { data: { user } } = await supabase.auth.getUser()

      await supabase.from('search_queries').insert({
        query,
        user_id: user?.id || null,
        result_count: results.length,
        query_embedding: embeddingString,
      })

      // Update user preferences if logged in
      if (user?.id) {
        // Call async - don't wait for it
        supabase.rpc('update_user_search_preferences', {
          target_user_id: user.id,
        }).then()
      }
    } catch (trackError) {
      // Silent fail - don't disrupt search
      console.error('Failed to track search:', trackError)
    }

    return NextResponse.json({
      results,
      mode,
      count: results.length,
      query,
      hasEmbedding: true,
    })
  } catch (error) {
    console.error('Semantic search error:', error)
    return NextResponse.json(
      {
        error: 'Search failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        fallback: true,
      },
      { status: 500 }
    )
  }
}

// POST endpoint to generate and store embeddings for posts
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Check if user is admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    const { postIds } = await request.json()

    // If no specific posts, regenerate for all posts without embeddings
    let query = supabase
      .from('posts')
      .select(`
        id,
        title,
        description,
        city,
        categories!inner(name)
      `)
      .eq('status', 'active')

    if (postIds && postIds.length > 0) {
      query = query.in('id', postIds)
    } else {
      // Only process posts without embeddings
      query = query.is('embedding', null)
    }

    const { data: posts, error } = await query.limit(100)

    if (error) throw error

    if (!posts || posts.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        message: 'No posts to process',
      })
    }

    // Import here to avoid circular dependency
    const { generatePostEmbedding } = await import('@/lib/embeddings')

    let processed = 0
    let failed = 0

    // Process in batches of 10
    for (let i = 0; i < posts.length; i += 10) {
      const batch = posts.slice(i, i + 10)

      await Promise.all(
        batch.map(async (post) => {
          try {
            const embedding = await generatePostEmbedding({
              title: post.title,
              description: post.description,
              category: (post.categories as any)?.name,
              city: post.city,
            })

            if (embedding) {
              const embeddingString = `[${embedding.join(',')}]`

              await supabase
                .from('posts')
                .update({
                  embedding: embeddingString,
                  embedding_model: 'text-embedding-3-small',
                  embedding_updated_at: new Date().toISOString(),
                })
                .eq('id', post.id)

              processed++
            } else {
              failed++
            }
          } catch (err) {
            console.error(`Failed to process post ${post.id}:`, err)
            failed++
          }
        })
      )
    }

    return NextResponse.json({
      success: true,
      processed,
      failed,
      total: posts.length,
    })
  } catch (error) {
    console.error('Embedding generation error:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate embeddings',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
