import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const providerId = searchParams.get('providerId')
    const date = searchParams.get('date')

    if (!providerId || !date) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get bookings for the provider on the specified date
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('scheduled_at, status, duration_minutes')
      .eq('provider_id', providerId)
      .gte('scheduled_at', startOfDay.toISOString())
      .lte('scheduled_at', endOfDay.toISOString())
      .in('status', ['pending', 'confirmed'])

    if (error) {
      console.error('Error fetching bookings:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ bookings: bookings || [] })
  } catch (error) {
    console.error('Error in GET /api/bookings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { bookingId, status } = body

    if (!bookingId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Get the booking to check permissions
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('provider_id, client_id, status, post_id')
      .eq('id', bookingId)
      .single()

    if (fetchError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check if user is provider or client
    const isProvider = booking.provider_id === user.id
    const isClient = booking.client_id === user.id

    if (!isProvider && !isClient) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Update booking status
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', bookingId)

    if (updateError) {
      console.error('Error updating booking:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Send notification to the other party
    const recipientId = isProvider ? booking.client_id : booking.provider_id
    const activityType = 'booking_status_changed'

    // Get booking details for notification
    const { data: bookingDetails } = await supabase
      .from('bookings')
      .select(`
        scheduled_at,
        post:post_id (title),
        provider:provider_id (full_name),
        client:client_id (full_name)
      `)
      .eq('id', bookingId)
      .single()

    const statusLabels = {
      confirmed: 'potwierdzona',
      cancelled: 'anulowana',
      completed: 'zakończona',
      pending: 'oczekująca'
    }

    await supabase.from('activity_logs').insert({
      user_id: recipientId,
      activity_type: 'message_received', // Using existing type for now
      post_id: booking.post_id,
      metadata: {
        booking_id: bookingId,
        status: statusLabels[status as keyof typeof statusLabels],
        post_title: bookingDetails?.post?.title,
        actor_name: isProvider ? bookingDetails?.provider?.full_name : bookingDetails?.client?.full_name
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in PATCH /api/bookings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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
