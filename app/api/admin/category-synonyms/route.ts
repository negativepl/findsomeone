import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getUserRole } from '@/lib/admin'

// Add category synonym
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userRole = await getUserRole()
  if (userRole !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { categoryId, synonym } = body

    if (!categoryId || !synonym) {
      return NextResponse.json({ error: 'Category ID and synonym required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('category_synonyms')
      .insert({
        category_id: categoryId,
        synonym: synonym.trim()
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ synonym: data })
  } catch (error) {
    console.error('Failed to add category synonym:', error)
    return NextResponse.json({
      error: 'Failed to add category synonym',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Delete category synonym
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userRole = await getUserRole()
  if (userRole !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('category_synonyms')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete category synonym:', error)
    return NextResponse.json({
      error: 'Failed to delete category synonym',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
