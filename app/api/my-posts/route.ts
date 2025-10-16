import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const offset = parseInt(searchParams.get('offset') || '0', 10)
    const limit = parseInt(searchParams.get('limit') || '12', 10)

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch user's posts with pagination
    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        *,
        categories (
          name
        ),
        phone_clicks
      `)
      .eq('user_id', user.id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching posts:', error)
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
    }

    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Error in my-posts API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
