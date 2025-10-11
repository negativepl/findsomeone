import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q') || ''

  if (!query || query.length < 2) {
    // Return popular cities if no query
    const supabase = await createClient()
    const { data: cities } = await supabase
      .from('cities')
      .select('name, slug, voivodeship')
      .eq('popular', true)
      .order('population', { ascending: false })
      .limit(10)

    return NextResponse.json({ cities: cities || [] })
  }

  const supabase = await createClient()

  // Search cities by name (fuzzy matching with pg_trgm)
  const { data: cities } = await supabase
    .from('cities')
    .select('name, slug, voivodeship, popular')
    .or(`name.ilike.%${query}%,slug.ilike.%${query}%`)
    .order('popular', { ascending: false })
    .order('population', { ascending: false })
    .limit(10)

  return NextResponse.json({
    cities: cities || [],
  })
}
