import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Smart Suggestions API
 * Returns personalized search suggestions based on:
 * 1. User's search history (behavioral)
 * 2. Semantic similarity to user's preferences (AI-powered)
 * 3. Trending searches in user's preferred categories
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const limit = parseInt(searchParams.get('limit') || '10')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // For anonymous users, return trending/popular only
  if (!user) {
    const { data: trendingSearches } = await supabase
      .rpc('get_trending_searches', { result_limit: 5 })

    const { data: popularSearches } = await supabase
      .rpc('get_popular_searches', { days_back: 7, result_limit: 5 })

    return NextResponse.json({
      suggestions: [
        ...(trendingSearches || []).map((item: any) => ({
          text: item.query,
          type: 'trending',
          score: 75,
        })),
        ...(popularSearches || []).map((item: any) => ({
          text: item.query,
          type: 'popular',
          score: 50,
        })),
      ].slice(0, limit),
      personalized: false,
    })
  }

  // For logged-in users, get smart personalized suggestions
  try {
    const { data: smartSuggestions, error } = await supabase.rpc(
      'get_smart_suggestions',
      {
        target_user_id: user.id,
        limit_count: limit,
      }
    )

    if (error) {
      console.error('Smart suggestions error:', error)
      // Fallback to basic suggestions
      const { data: recentSearches } = await supabase
        .from('search_queries')
        .select('query')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit)

      return NextResponse.json({
        suggestions: (recentSearches || []).map((item: any) => ({
          text: item.query,
          type: 'recent',
          score: 60,
        })),
        personalized: true,
        fallback: true,
      })
    }

    // Format suggestions
    const suggestions = (smartSuggestions || []).map((item: any) => ({
      text: item.suggestion_text,
      type: item.suggestion_type,
      score: Math.round(item.relevance_score),
    }))

    // Get user preferences for additional context
    const { data: preferences } = await supabase
      .from('user_search_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({
      suggestions,
      personalized: true,
      preferences: preferences
        ? {
            categories: preferences.preferred_categories,
            cities: preferences.preferred_cities,
            type: preferences.preferred_type,
            searchFrequency: preferences.search_frequency,
          }
        : null,
    })
  } catch (error) {
    console.error('Failed to get smart suggestions:', error)
    return NextResponse.json(
      {
        error: 'Failed to get suggestions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * Update user preferences manually
 * Called periodically or after significant user activity
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Trigger preference update
    const { error } = await supabase.rpc('update_user_search_preferences', {
      target_user_id: user.id,
    })

    if (error) throw error

    // Get updated preferences
    const { data: preferences } = await supabase
      .from('user_search_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({
      success: true,
      preferences,
    })
  } catch (error) {
    console.error('Failed to update preferences:', error)
    return NextResponse.json(
      {
        error: 'Failed to update preferences',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
