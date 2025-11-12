'use server'

import { createClient } from '@/lib/supabase/server'

export async function reportPost(
  postId: string,
  reason: string,
  description?: string
) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Musisz być zalogowany, aby zgłosić ogłoszenie')
  }

  // Check if post exists
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('id, user_id')
    .eq('id', postId)
    .single()

  if (postError || !post) {
    throw new Error('Ogłoszenie nie istnieje')
  }

  // Prevent user from reporting their own post
  if (post.user_id === user.id) {
    throw new Error('Nie możesz zgłosić własnego ogłoszenia')
  }

  // Check if user already reported this post
  const { data: existingReport } = await supabase
    .from('post_reports')
    .select('id')
    .eq('post_id', postId)
    .eq('reporter_id', user.id)
    .single()

  if (existingReport) {
    throw new Error('Już zgłosiłeś to ogłoszenie')
  }

  // Create report
  const { error: insertError } = await supabase
    .from('post_reports')
    .insert({
      post_id: postId,
      reporter_id: user.id,
      reason,
      description: description || null,
      status: 'pending'
    })

  if (insertError) {
    console.error('Error creating post report:', insertError)
    throw new Error('Nie udało się wysłać zgłoszenia')
  }
}
