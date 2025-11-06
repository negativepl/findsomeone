import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { moderatePost, getModerationStatus } from '@/lib/moderation'

// POST /api/moderate - Check moderation for a post
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { postId } = body

    if (!postId) {
      return NextResponse.json({ error: 'Post ID required' }, { status: 400 })
    }

    // Get the post
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single()

    if (fetchError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Only post owner can trigger moderation (or it should be automatic)
    if (post.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Run moderation
    const result = await moderatePost({
      title: post.title,
      description: post.description,
      type: post.type,
      city: post.city,
      price: post.price,
      price: post.price,
    })

    const status = getModerationStatus(result)

    // Update post with moderation result
    // Only approved posts become active, everything else stays pending
    const { error: updateError } = await supabase
      .from('posts')
      .update({
        moderation_status: status,
        moderation_score: result.score,
        moderation_reason: result.reasons.join(', '),
        moderation_details: result.details,
        moderated_at: new Date().toISOString(),
        status: status === 'approved' ? 'active' : 'pending',
      })
      .eq('id', postId)

    if (updateError) {
      console.error('Error updating post:', updateError)
      return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
    }

    // Log moderation action
    const logAction = status === 'approved' ? 'auto_approved' :
                      status === 'rejected' ? 'auto_rejected' : 'flagged'

    await supabase.from('moderation_logs').insert({
      post_id: postId,
      action: logAction,
      new_status: status,
      reason: result.reasons.join(', '),
      details: result.details,
    })

    return NextResponse.json({
      success: true,
      status,
      score: result.score,
      reasons: result.reasons,
    })
  } catch (error) {
    console.error('Moderation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
