'use server'

import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/admin'
import { revalidatePath } from 'next/cache'

export async function updateReportStatus(
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
    .from('message_reports')
    .select('message_id')
    .eq('id', reportId)
    .single()

  if (!report) {
    throw new Error('Zgłoszenie nie istnieje')
  }

  // Log admin access
  await supabase.rpc('log_admin_message_access', {
    p_admin_id: user.id,
    p_message_id: report.message_id,
    p_report_id: reportId,
    p_reason: `Rozpatrywanie zgłoszenia - status: ${status}${notes ? `, notatki: ${notes.substring(0, 50)}...` : ''}`
  })

  // Update report status
  const { error: updateError } = await supabase
    .from('message_reports')
    .update({
      status,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      notes: notes || null
    })
    .eq('id', reportId)

  if (updateError) {
    console.error('Error updating report:', updateError)
    throw new Error('Nie udało się zaktualizować zgłoszenia')
  }

  // Revalidate the reports page
  revalidatePath('/admin/reports')

  return { success: true }
}

export async function banUser(userId: string, reason: string, reportId?: string, notes?: string) {
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

  // Prevent admin from banning themselves
  if (userId === user.id) {
    throw new Error('Nie możesz zbanować sam siebie!')
  }

  // Check if user is already banned
  const { data: profile } = await supabase
    .from('profiles')
    .select('banned, full_name')
    .eq('id', userId)
    .single()

  if (profile?.banned) {
    throw new Error('Ten użytkownik jest już zbanowany')
  }

  // Update profile - set banned status
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      banned: true,
      ban_reason: reason,
      banned_at: new Date().toISOString(),
      banned_by: user.id
    })
    .eq('id', userId)

  if (updateError) {
    console.error('Error banning user:', updateError)
    throw new Error(`Nie udało się zbanować użytkownika: ${updateError.message}`)
  }

  // Add to ban history
  const { error: banHistoryError } = await supabase
    .from('user_bans')
    .insert({
      user_id: userId,
      banned_by: user.id,
      reason,
      report_id: reportId || null,
      notes: notes || null
    })

  if (banHistoryError) {
    console.error('Error adding to ban history:', banHistoryError)
    // Don't fail the whole operation if history logging fails
  }

  // If this was from a report, update report status
  if (reportId) {
    await supabase
      .from('message_reports')
      .update({
        status: 'resolved',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        notes: `Użytkownik zbanowany. Powód: ${reason}`
      })
      .eq('id', reportId)
  }

  // Revalidate
  revalidatePath('/admin/reports')

  return { success: true, message: `Użytkownik ${profile?.full_name || 'został'} zbanowany` }
}

export async function unbanUser(userId: string, reason: string) {
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

  // Check if user is actually banned
  const { data: profile } = await supabase
    .from('profiles')
    .select('banned, full_name')
    .eq('id', userId)
    .single()

  if (!profile?.banned) {
    throw new Error('Ten użytkownik nie jest zbanowany')
  }

  // Update profile - remove banned status
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      banned: false,
      ban_reason: null,
      banned_at: null,
      banned_by: null
    })
    .eq('id', userId)

  if (updateError) {
    console.error('Error unbanning user:', updateError)
    throw new Error(`Nie udało się odbanować użytkownika: ${updateError.message}`)
  }

  // Add to ban history as unban record
  const { error: unbanHistoryError } = await supabase
    .from('user_bans')
    .insert({
      user_id: userId,
      banned_by: user.id,
      reason: `ODBANOWANIE: ${reason}`,
      notes: 'Użytkownik został odbanowany przez administratora'
    })

  if (unbanHistoryError) {
    console.error('Error adding to unban history:', unbanHistoryError)
    // Don't fail the whole operation if history logging fails
  }

  // Revalidate
  revalidatePath('/admin/banned-users')

  return { success: true, message: `Użytkownik ${profile?.full_name || 'został'} odbanowany` }
}

export async function deleteMessage(messageId: string, reportId: string, reason: string) {
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
  await supabase.rpc('log_admin_message_access', {
    p_admin_id: user.id,
    p_message_id: messageId,
    p_report_id: reportId,
    p_reason: `Usunięcie wiadomości - powód: ${reason}`
  })

  // Delete the message
  const { error: deleteError } = await supabase
    .from('messages')
    .delete()
    .eq('id', messageId)

  if (deleteError) {
    console.error('Error deleting message:', deleteError)
    throw new Error('Nie udało się usunąć wiadomości')
  }

  // Update report status
  await supabase
    .from('message_reports')
    .update({
      status: 'resolved',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      notes: `Wiadomość usunięta. Powód: ${reason}`
    })
    .eq('id', reportId)

  // Revalidate
  revalidatePath('/admin/reports')

  return { success: true }
}
