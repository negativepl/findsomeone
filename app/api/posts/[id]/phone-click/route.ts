import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Increment phone_clicks counter
    const { error } = await supabase
      .rpc('increment_phone_clicks', { post_id: id })

    if (error) {
      console.error('Error incrementing phone clicks:', error)
      return NextResponse.json(
        { error: 'Failed to track phone click' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in phone-click API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
