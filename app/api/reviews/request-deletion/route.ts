import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { reviewId } = await request.json()

    if (!reviewId) {
      return NextResponse.json({ error: 'Review ID is required' }, { status: 400 })
    }

    // Fetch the review to verify ownership and get reviewer info
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .select('id, reviewer_id, reviewed_id, post_id')
      .eq('id', reviewId)
      .single()

    if (reviewError || !review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    // Verify that the current user is the one being reviewed
    if (review.reviewed_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get the name of the user requesting deletion
    const { data: requester } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    // Create activity log for the reviewer
    const activityData = {
      user_id: review.reviewer_id,
      activity_type: 'review_deletion_request',
      post_id: review.post_id || null,
      metadata: {
        requester_name: requester?.full_name || 'Użytkownik',
        review_id: reviewId
      }
    }

    console.log('Creating activity:', activityData)

    const { error: activityError } = await supabase
      .from('activity_logs')
      .insert(activityData)

    if (activityError) {
      console.error('Error creating activity:', activityError)
      return NextResponse.json({
        error: 'Failed to send notification',
        details: activityError.message
      }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error requesting review deletion:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
