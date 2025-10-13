'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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

  revalidatePath('/dashboard/posts')
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
    .select('user_id')
    .eq('id', postId)
    .single()

  if (!post || post.user_id !== user.id) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('posts')
    .update({ status })
    .eq('id', postId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/posts')
  revalidatePath(`/dashboard/posts/${postId}`)
  return { success: true }
}
