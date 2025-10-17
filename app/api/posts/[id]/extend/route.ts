import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()

  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify the post belongs to the user
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('id, user_id, status, expires_at, extended_count')
      .eq('id', params.id)
      .single()

    if (fetchError || !post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    if (post.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    if (post.status !== 'active') {
      return NextResponse.json(
        { error: 'Only active posts can be extended' },
        { status: 400 }
      )
    }

    // Extend the post expiration by calling the database function
    const { error: extendError } = await supabase.rpc('extend_post_expiration', {
      post_id: params.id
    })

    if (extendError) {
      console.error('Error extending post:', extendError)
      return NextResponse.json(
        { error: 'Failed to extend post expiration' },
        { status: 500 }
      )
    }

    // Fetch updated post data
    const { data: updatedPost, error: updateFetchError } = await supabase
      .from('posts')
      .select('expires_at, extended_count, last_extended_at')
      .eq('id', params.id)
      .single()

    if (updateFetchError) {
      console.error('Error fetching updated post:', updateFetchError)
    }

    return NextResponse.json({
      success: true,
      message: 'Post expiration extended by 30 days',
      data: updatedPost
    })
  } catch (error) {
    console.error('Error in extend post API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
