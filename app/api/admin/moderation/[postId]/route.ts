import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin'

// PATCH /api/admin/moderation/[postId] - Approve/reject/delete post
export async function PATCH(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, reason } = body

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const postId = params.postId

    // Get current post status
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('moderation_status, status')
      .eq('id', postId)
      .single()

    if (fetchError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const newModerationStatus = action === 'approve' ? 'approved' : 'rejected'
    const newStatus = action === 'approve' ? 'active' : 'pending'

    // Update post
    const { error: updateError } = await supabase
      .from('posts')
      .update({
        moderation_status: newModerationStatus,
        status: newStatus,
        moderated_at: new Date().toISOString(),
        moderated_by: user.id,
        moderation_reason: reason || null,
      })
      .eq('id', postId)

    if (updateError) {
      console.error('Error updating post:', updateError)
      return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
    }

    // Log moderation action
    await supabase.from('moderation_logs').insert({
      post_id: postId,
      admin_id: user.id,
      action: action === 'approve' ? 'manual_approved' : 'manual_rejected',
      previous_status: post.moderation_status,
      new_status: newModerationStatus,
      reason: reason || null,
    })

    return NextResponse.json({
      success: true,
      action,
      newStatus: newModerationStatus,
    })
  } catch (error) {
    console.error('Error in moderation action:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/moderation/[postId] - Delete post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const postId = params.postId

    // Get current post for logging
    const { data: post } = await supabase
      .from('posts')
      .select('moderation_status')
      .eq('id', postId)
      .single()

    // Log before deletion
    if (post) {
      await supabase.from('moderation_logs').insert({
        post_id: postId,
        admin_id: user.id,
        action: 'deleted',
        previous_status: post.moderation_status,
        new_status: 'deleted',
      })
    }

    // Delete post (will cascade to moderation_logs via foreign key)
    const { error: deleteError } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)

    if (deleteError) {
      console.error('Error deleting post:', deleteError)
      return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      action: 'deleted',
    })
  } catch (error) {
    console.error('Error in post deletion:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
