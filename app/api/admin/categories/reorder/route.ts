import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get the reorder data
    const body = await request.json()
    const { categoryId, newOrder } = body

    if (!categoryId || typeof newOrder !== 'number') {
      return NextResponse.json(
        { error: 'Missing categoryId or newOrder' },
        { status: 400 }
      )
    }

    // Update the display_order for the category
    const { error } = await supabase
      .from('categories')
      .update({ display_order: newOrder })
      .eq('id', categoryId)

    if (error) {
      console.error('Error updating category order:', error)
      return NextResponse.json(
        { error: 'Failed to update category order' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in reorder API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Batch update multiple categories at once
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get the batch update data
    const body = await request.json()
    const { updates } = body as { updates: Array<{ id: string; display_order: number }> }

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: 'Invalid updates array' },
        { status: 400 }
      )
    }

    // Update all categories in a transaction
    const promises = updates.map(({ id, display_order }) =>
      supabase
        .from('categories')
        .update({ display_order })
        .eq('id', id)
    )

    const results = await Promise.all(promises)

    const errors = results.filter(r => r.error)
    if (errors.length > 0) {
      console.error('Errors updating categories:', errors)
      return NextResponse.json(
        { error: 'Failed to update some categories' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, updated: updates.length })
  } catch (error) {
    console.error('Error in batch reorder API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
