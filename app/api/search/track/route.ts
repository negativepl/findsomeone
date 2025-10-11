import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Track a search query for analytics
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, clickedResult } = body

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ error: 'Query too short' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Insert search query
    const { error } = await supabase
      .from('search_queries')
      .insert({
        query: query.trim(),
        user_id: user?.id || null,
        clicked_result: clickedResult || null,
      })

    if (error) {
      console.error('Failed to track search:', error)
      // Don't fail the request if tracking fails
      return NextResponse.json({ success: false })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Search tracking error:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
