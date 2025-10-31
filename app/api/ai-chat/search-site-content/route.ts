import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateQueryEmbedding } from '@/lib/embeddings'

/**
 * Search site content (FAQ, Privacy, Terms, etc.) by semantic similarity
 * Used by the AI chatbot to answer questions about the site
 */
export async function POST(request: NextRequest) {
  try {
    const { query, limit = 3, threshold = 0.5 } = await request.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    // Generate embedding for the query
    const queryEmbedding = await generateQueryEmbedding(query)

    if (!queryEmbedding) {
      console.error('[Site Content Search] Failed to generate embedding for query:', query)
      return NextResponse.json(
        { error: 'Failed to generate query embedding' },
        { status: 500 }
      )
    }

    console.log('[Site Content Search] Query:', query, 'Threshold:', threshold, 'Limit:', limit)

    // Search for similar content
    const supabase = await createClient()

    // Format embedding as string for Supabase RPC
    // Supabase automatically converts string '[0.1,0.2,...]' to vector type
    const embeddingString = `[${queryEmbedding.join(',')}]`

    console.log('[Site Content Search] Calling match_site_content RPC')
    console.log('[Site Content Search] Embedding length:', queryEmbedding.length)

    const { data, error } = await supabase.rpc('match_site_content', {
      query_embedding: embeddingString,
      match_threshold: threshold,
      match_count: limit
    })

    if (error) {
      console.error('[Site Content Search] RPC error:', error)
      return NextResponse.json(
        { error: 'Search failed', details: error.message },
        { status: 500 }
      )
    }

    console.log('[Site Content Search] Found', data?.length || 0, 'results')
    if (data && data.length > 0) {
      console.log('[Site Content Search] Top result:', data[0].section_title, 'similarity:', data[0].similarity.toFixed(3))
    }

    return NextResponse.json({
      results: data || [],
      count: data?.length || 0
    })

  } catch (error) {
    console.error('Site content search error:', error)
    return NextResponse.json(
      {
        error: 'Search failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
