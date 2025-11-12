import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin'

// PATCH /api/admin/moderation/[postId] - Approve/reject/delete post
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    const supabase = await createClient()

    const { data:{ user } } = await supabase.auth.getUser()
    if (!user || !(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, reason, appealResponse } = body

    if (!['approve', 'reject', 'approve_appeal', 'reject_appeal'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Get current post status
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('moderation_status, status, appeal_status')
      .eq('id', postId)
      .single()

    if (fetchError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Handle appeal actions
    if (action === 'approve_appeal') {
      const { error: updateError } = await supabase
        .from('posts')
        .update({
          moderation_status: 'approved',
          status: 'active',
          appeal_status: 'approved',
          appeal_reviewed_at: new Date().toISOString(),
          appeal_reviewed_by: user.id,
          appeal_response: appealResponse || 'Odwołanie zaakceptowane',
          moderated_at: new Date().toISOString(),
          moderated_by: user.id,
        })
        .eq('id', postId)

      if (updateError) {
        console.error('Error updating post:', updateError)
        return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
      }

      await supabase.from('moderation_logs').insert({
        post_id: postId,
        admin_id: user.id,
        action: 'appeal_approved',
        previous_status: 'rejected',
        new_status: 'approved',
        reason: appealResponse || null,
      })

      return NextResponse.json({
        success: true,
        action: 'approve_appeal',
        newStatus: 'approved',
      })
    }

    if (action === 'reject_appeal') {
      const { error: updateError } = await supabase
        .from('posts')
        .update({
          appeal_status: 'rejected',
          appeal_reviewed_at: new Date().toISOString(),
          appeal_reviewed_by: user.id,
          appeal_response: appealResponse || 'Odwołanie odrzucone',
        })
        .eq('id', postId)

      if (updateError) {
        console.error('Error updating post:', updateError)
        return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
      }

      await supabase.from('moderation_logs').insert({
        post_id: postId,
        admin_id: user.id,
        action: 'appeal_rejected',
        previous_status: 'rejected',
        new_status: 'rejected',
        reason: appealResponse || null,
      })

      return NextResponse.json({
        success: true,
        action: 'reject_appeal',
        newStatus: 'rejected',
      })
    }

    // Handle regular moderation actions
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
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
