import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin'

// GET /api/admin/moderation - Get posts pending moderation
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'flagged'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Get posts with specific moderation status or appeals
    let query = supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (
          full_name,
          avatar_url
        ),
        categories (
          name,
          slug
        )
      `, { count: 'exact' })

    // Special handling for appeals tab
    if (status === 'appeals') {
      query = query
        .eq('moderation_status', 'rejected')
        .in('appeal_status', ['pending', 'reviewing'])
    } else {
      query = query.eq('moderation_status', status)
    }

    const { data: posts, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching posts:', error)
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
    }

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Error in moderation API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
