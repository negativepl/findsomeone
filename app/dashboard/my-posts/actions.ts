'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function appealRejectedPost(postId: string, appealMessage: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Verify the post belongs to the user and is rejected
  const { data: post } = await supabase
    .from('posts')
    .select('user_id, moderation_status, appeal_status')
    .eq('id', postId)
    .single()

  if (!post || post.user_id !== user.id) {
    return { error: 'Unauthorized' }
  }

  if (post.moderation_status !== 'rejected') {
    return { error: 'Tylko odrzucone ogłoszenia mogą być odwołane' }
  }

  if (post.appeal_status === 'pending' || post.appeal_status === 'reviewing') {
    return { error: 'Odwołanie już zostało wysłane' }
  }

  // Submit appeal
  const { error: updateError } = await supabase
    .from('posts')
    .update({
      appeal_status: 'pending',
      appeal_message: appealMessage,
      appealed_at: new Date().toISOString(),
    })
    .eq('id', postId)

  if (updateError) {
    return { error: updateError.message }
  }

  // Log the appeal
  await supabase
    .from('moderation_logs')
    .insert({
      post_id: postId,
      action: 'appeal_submitted',
      reason: appealMessage,
      previous_status: 'rejected',
      new_status: 'appeal_pending',
    })

  revalidatePath('/dashboard/my-posts')
  revalidatePath(`/dashboard/my-posts/${postId}`)
  return { success: true }
}

export async function deletePost(postId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Verify the post belongs to the user
  const { data: post } = await supabase
    .from('posts')
    .select('user_id')
    .eq('id', postId)
    .single()

  if (!post || post.user_id !== user.id) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/my-posts')
  return { success: true }
}

export async function updatePostStatus(postId: string, status: 'active' | 'closed' | 'completed') {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Verify the post belongs to the user
  const { data: post } = await supabase
    .from('posts')
    .select('user_id, title, description, type, city, price_min, price_max')
    .eq('id', postId)
    .single()

  if (!post || post.user_id !== user.id) {
    return { error: 'Unauthorized' }
  }

  // If reactivating a closed/completed post, require re-moderation
  if (status === 'active') {
    // Set status to pending and moderation_status to checking
    const { error: updateError } = await supabase
      .from('posts')
      .update({
        status: 'pending',
        moderation_status: 'checking'
      })
      .eq('id', postId)

    if (updateError) {
      return { error: updateError.message }
    }

    // Trigger moderation check
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      })
    } catch (err) {
      console.error('Failed to trigger moderation:', err)
      // Don't fail the entire operation if moderation call fails
    }
  } else {
    // For closing/completing, just update status
    const { error } = await supabase
      .from('posts')
      .update({ status })
      .eq('id', postId)

    if (error) {
      return { error: error.message }
    }
  }

  revalidatePath('/dashboard/my-posts')
  revalidatePath(`/dashboard/my-posts/${postId}`)
  return { success: true }
}
