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

    // Get parent_id from request body (null for main categories)
    const body = await request.json()
    const { parent_id } = body

    // Fetch categories for this parent level
    let query = supabase
      .from('categories')
      .select('id, name, parent_id')

    if (parent_id === null || parent_id === undefined) {
      query = query.is('parent_id', null)
    } else {
      query = query.eq('parent_id', parent_id)
    }

    const { data: categories, error: fetchError } = await query

    if (fetchError || !categories) {
      console.error('Error fetching categories:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: 500 }
      )
    }

    // Sort alphabetically and assign display_order
    const sorted = [...categories].sort((a, b) => {
      return a.name.localeCompare(b.name, 'pl')
    })

    const updates: Array<{ id: string; display_order: number }> = []
    sorted.forEach((cat, index) => {
      updates.push({
        id: cat.id,
        display_order: (index + 1) * 10
      })
    })

    // Update all categories
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

    return NextResponse.json({
      success: true,
      updated: updates.length,
      message: 'Wszystkie kategorie posortowane alfabetycznie'
    })
  } catch (error) {
    console.error('Error in sort alphabetically API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
