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
    const { reviewed_id, post_id, rating, comment } = body

    // Validation
    if (!reviewed_id) {
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
    if (user.id === reviewed_id) {
      return NextResponse.json(
        { error: 'Nie możesz wystawić opinii samemu sobie' },
        { status: 400 }
      )
    }

    // Check if review already exists
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('reviewer_id', user.id)
      .eq('reviewed_id', reviewed_id)
      .eq('post_id', post_id || null)
      .single()

    if (existingReview) {
      return NextResponse.json(
        { error: 'Już wystawiłeś opinię dla tego użytkownika w tym ogłoszeniu' },
        { status: 400 }
      )
    }

    // Insert review
    const { data: review, error: insertError } = await supabase
      .from('reviews')
      .insert({
        reviewer_id: user.id,
        reviewed_id,
        post_id: post_id || null,
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
