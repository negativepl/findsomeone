'use server'

import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/admin'
import { revalidatePath } from 'next/cache'

export async function updatePostReportStatus(
  reportId: string,
  status: 'reviewed' | 'resolved' | 'dismissed',
  notes?: string
) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Musisz być zalogowany')
  }

  // Check if user is admin
  const userRole = await getUserRole()
  if (userRole !== 'admin') {
    throw new Error('Brak uprawnień. Tylko administratorzy mogą rozpatrywać zgłoszenia.')
  }

  // Get report details to log admin access
  const { data: report } = await supabase
    .from('post_reports')
    .select('post_id')
    .eq('id', reportId)
    .single()

  if (!report) {
    throw new Error('Zgłoszenie nie istnieje')
  }

  // Log admin access
  await supabase.rpc('log_admin_post_access', {
    p_admin_id: user.id,
    p_post_id: report.post_id,
    p_report_id: reportId,
    p_action: `Rozpatrywanie zgłoszenia - status: ${status}`,
    p_reason: notes ? notes.substring(0, 100) : null
  })

  // Update report status
  const { error: updateError } = await supabase
    .from('post_reports')
    .update({
      status,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      notes: notes || null
    })
    .eq('id', reportId)

  if (updateError) {
    console.error('Error updating post report:', updateError)
    throw new Error('Nie udało się zaktualizować zgłoszenia')
  }

  // Revalidate the reports page
  revalidatePath('/admin/post-reports')

  return { success: true }
}

export async function deletePost(postId: string, reportId: string, reason: string) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Musisz być zalogowany')
  }

  // Check if user is admin
  const userRole = await getUserRole()
  if (userRole !== 'admin') {
    throw new Error('Brak uprawnień')
  }

  // Log admin access before deletion
  await supabase.rpc('log_admin_post_access', {
    p_admin_id: user.id,
    p_post_id: postId,
    p_report_id: reportId,
    p_action: 'Usunięcie ogłoszenia',
    p_reason: reason
  })

  // Soft delete the post by setting is_deleted flag
  const { error: deleteError } = await supabase
    .from('posts')
    .update({
      is_deleted: true,
      status: 'closed'
    })
    .eq('id', postId)

  if (deleteError) {
    console.error('Error deleting post:', deleteError)
    throw new Error('Nie udało się usunąć ogłoszenia')
  }

  // Update report status
  await supabase
    .from('post_reports')
    .update({
      status: 'resolved',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      notes: `Ogłoszenie usunięte. Powód: ${reason}`
    })
    .eq('id', reportId)

  // Revalidate
  revalidatePath('/admin/post-reports')
  revalidatePath('/posts')

  return { success: true }
}

export async function deactivatePost(postId: string, reportId: string, reason: string) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Musisz być zalogowany')
  }

  // Check if user is admin
  const userRole = await getUserRole()
  if (userRole !== 'admin') {
    throw new Error('Brak uprawnień')
  }

  // Log admin access
  await supabase.rpc('log_admin_post_access', {
    p_admin_id: user.id,
    p_post_id: postId,
    p_report_id: reportId,
    p_action: 'Dezaktywacja ogłoszenia',
    p_reason: reason
  })

  // Deactivate the post
  const { error: updateError } = await supabase
    .from('posts')
    .update({
      status: 'closed'
    })
    .eq('id', postId)

  if (updateError) {
    console.error('Error deactivating post:', updateError)
    throw new Error('Nie udało się dezaktywować ogłoszenia')
  }

  // Update report status
  await supabase
    .from('post_reports')
    .update({
      status: 'resolved',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      notes: `Ogłoszenie dezaktywowane. Powód: ${reason}`
    })
    .eq('id', reportId)

  // Revalidate
  revalidatePath('/admin/post-reports')
  revalidatePath('/posts')

  return { success: true }
}

export async function warnPostAuthor(userId: string, postId: string, reportId: string, reason: string) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Musisz być zalogowany')
  }

  // Check if user is admin
  const userRole = await getUserRole()
  if (userRole !== 'admin') {
    throw new Error('Brak uprawnień')
  }

  // Log admin access
  await supabase.rpc('log_admin_post_access', {
    p_admin_id: user.id,
    p_post_id: postId,
    p_report_id: reportId,
    p_action: 'Ostrzeżenie dla autora',
    p_reason: reason
  })

  // Here you would typically send a notification/email to the user
  // For now, we just update the report status

  // Update report status
  await supabase
    .from('post_reports')
    .update({
      status: 'resolved',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      notes: `Ostrzeżenie wysłane do autora. Powód: ${reason}`
    })
    .eq('id', reportId)

  // Revalidate
  revalidatePath('/admin/post-reports')

  return { success: true }
}
