import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { providerId, postId, scheduledAt, durationMinutes, clientNotes } = body

    // Validation
    if (!providerId || !postId || !scheduledAt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if trying to book own service
    if (user.id === providerId) {
      return NextResponse.json({ error: 'Cannot book your own service' }, { status: 400 })
    }

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        post_id: postId,
        provider_id: providerId,
        client_id: user.id,
        scheduled_at: scheduledAt,
        duration_minutes: durationMinutes || 60,
        client_notes: clientNotes,
        status: 'pending'
      })
      .select()
      .single()

    if (bookingError) {
      console.error('Booking error:', bookingError)
      return NextResponse.json({ error: bookingError.message }, { status: 500 })
    }

    // Get post details for notification
    const { data: post } = await supabase
      .from('posts')
      .select('title')
      .eq('id', postId)
      .single()

    // Get client details for notification
    const { data: client } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    // Create notification for provider
    const scheduledDate = new Date(scheduledAt)
    await supabase.from('activity_logs').insert({
      user_id: providerId,
      activity_type: 'booking_request',
      post_id: postId,
      metadata: {
        booking_id: booking.id,
        client_name: client?.full_name || 'Użytkownik',
        post_title: post?.title || 'Usługa',
        scheduled_date: scheduledDate.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' }),
        scheduled_time: scheduledDate.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
      }
    })

    return NextResponse.json({ success: true, booking })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
