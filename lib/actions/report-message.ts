'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function reportMessage(
  messageId: string,
  reason: string,
  description?: string
) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Musisz być zalogowany, aby zgłosić wiadomość')
  }

  // Validate reason
  const validReasons = ['spam', 'harassment', 'inappropriate', 'scam', 'other']
  if (!validReasons.includes(reason)) {
    throw new Error('Nieprawidłowy powód zgłoszenia')
  }

  // Check if user already reported this message
  const { data: existingReport } = await supabase
    .from('message_reports')
    .select('id')
    .eq('message_id', messageId)
    .eq('reporter_id', user.id)
    .single()

  if (existingReport) {
    throw new Error('Już zgłosiłeś tę wiadomość')
  }

  // Verify that the message exists and user is involved in the conversation
  const { data: message, error: messageError } = await supabase
    .from('messages')
    .select('sender_id, receiver_id')
    .eq('id', messageId)
    .single()

  if (messageError || !message) {
    throw new Error('Wiadomość nie istnieje')
  }

  // User must be either sender or receiver to report
  if (message.sender_id !== user.id && message.receiver_id !== user.id) {
    throw new Error('Nie masz uprawnień do zgłoszenia tej wiadomości')
  }

  // Create the report
  const { error: insertError } = await supabase
    .from('message_reports')
    .insert({
      message_id: messageId,
      reporter_id: user.id,
      reason,
      description: description?.trim() || null,
      status: 'pending'
    })

  if (insertError) {
    console.error('Error creating report:', insertError)
    throw new Error('Nie udało się wysłać zgłoszenia. Spróbuj ponownie.')
  }

  // Revalidate any relevant paths
  revalidatePath('/dashboard/messages')

  return { success: true }
}
