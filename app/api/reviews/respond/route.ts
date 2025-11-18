import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { reviewId, response } = await request.json()

    if (!reviewId || !response?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify that the review belongs to the user
    const { data: review } = await supabase
      .from('reviews')
      .select('reviewee_id')
      .eq('id', reviewId)
      .single()

    if (!review || review.reviewee_id !== user.id) {
      return NextResponse.json({ error: 'Review not found or unauthorized' }, { status: 404 })
    }

    // Update the review with the response
    const { error: updateError } = await supabase
      .from('reviews')
      .update({
        response: response.trim(),
        responded_at: new Date().toISOString()
      })
      .eq('id', reviewId)

    if (updateError) {
      console.error('Error updating review:', updateError)
      return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in /api/reviews/respond:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
