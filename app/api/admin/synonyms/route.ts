import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getUserRole } from '@/lib/admin'

// Add new synonym
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
    const { term, synonym } = body

    if (!term || !synonym) {
      return NextResponse.json({ error: 'Term and synonym required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('search_synonyms')
      .insert({ term: term.trim(), synonym: synonym.trim() })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ synonym: data })
  } catch (error) {
    console.error('Failed to add synonym:', error)
    return NextResponse.json({ error: 'Failed to add synonym' }, { status: 500 })
  }
}

// Delete synonym
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
      .from('search_synonyms')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete synonym:', error)
    return NextResponse.json({ error: 'Failed to delete synonym' }, { status: 500 })
  }
}
