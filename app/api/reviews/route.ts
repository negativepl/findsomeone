import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Musisz być zalogowany aby wystawić opinię' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { reviewedId, postId, bookingId, rating, comment } = body

    // Validation
    if (!reviewedId) {
      return NextResponse.json(
        { error: 'Brak ID użytkownika do oceny' },
        { status: 400 }
      )
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Ocena musi być w zakresie 1-5' },
        { status: 400 }
      )
    }

    // Can't review yourself
    if (user.id === reviewedId) {
      return NextResponse.json(
        { error: 'Nie możesz wystawić opinii samemu sobie' },
        { status: 400 }
      )
    }

    // If bookingId is provided, verify the booking exists and user is the client
    if (bookingId) {
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('id, client_id, provider_id, status')
        .eq('id', bookingId)
        .single()

      if (bookingError || !booking) {
        return NextResponse.json(
          { error: 'Rezerwacja nie została znaleziona' },
          { status: 404 }
        )
      }

      if (booking.client_id !== user.id) {
        return NextResponse.json(
          { error: 'Nie możesz wystawić opinii dla tej rezerwacji' },
          { status: 403 }
        )
      }

      if (booking.status !== 'completed' && booking.status !== 'reviewed') {
        return NextResponse.json(
          { error: 'Możesz wystawić opinię tylko dla zakończonych rezerwacji' },
          { status: 400 }
        )
      }

      // Check if review already exists for this booking
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('booking_id', bookingId)
        .single()

      if (existingReview) {
        return NextResponse.json(
          { error: 'Już wystawiłeś opinię dla tej rezerwacji' },
          { status: 400 }
        )
      }
    }

    // Insert review
    const { data: review, error: insertError } = await supabase
      .from('reviews')
      .insert({
        reviewer_id: user.id,
        reviewed_id: reviewedId,
        post_id: postId || null,
        booking_id: bookingId || null,
        rating,
        comment: comment || null,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting review:', insertError)
      return NextResponse.json(
        { error: 'Nie udało się dodać opinii' },
        { status: 500 }
      )
    }

    // Get reviewer name for notification
    const { data: reviewer } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    // Create notification for reviewed user
    await supabase.from('activity_logs').insert({
      user_id: reviewedId,
      activity_type: 'review_received',
      post_id: postId || null,
      metadata: {
        reviewer_name: reviewer?.full_name || 'Użytkownik',
        rating: rating,
        booking_id: bookingId || null
      }
    })

    return NextResponse.json({ success: true, review })
  } catch (error) {
    console.error('Error in POST /api/reviews:', error)
    return NextResponse.json(
      { error: 'Wystąpił błąd serwera' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json(
        { error: 'Brak ID użytkownika' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Fetch reviews for user
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(`
        *,
        reviewer:reviewer_id (
          id,
          full_name,
          avatar_url
        ),
        post:post_id (
          id,
          title
        )
      `)
      .eq('reviewed_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching reviews:', error)
      return NextResponse.json(
        { error: 'Nie udało się pobrać opinii' },
        { status: 500 }
      )
    }

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error('Error in GET /api/reviews:', error)
    return NextResponse.json(
      { error: 'Wystąpił błąd serwera' },
      { status: 500 }
    )
  }
}
