import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getUserRole } from '@/lib/admin'

// Get AI settings
export async function GET(request: NextRequest) {
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
    const { data, error } = await supabase
      .from('ai_settings')
      .select('*')
      .single()

    if (error) throw error

    return NextResponse.json({ settings: data })
  } catch (error) {
    console.error('Failed to fetch AI settings:', error)
    return NextResponse.json({
      error: 'Failed to fetch AI settings',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Update AI settings
export async function PUT(request: NextRequest) {
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
    const {
      synonym_prompt,
      synonym_system_message,
      synonym_model,
      synonym_max_synonyms,
      synonym_min_synonyms,
      category_synonym_prompt,
      category_synonym_system_message,
      category_synonym_model,
      category_synonym_max_synonyms,
      category_synonym_min_synonyms,
      query_expansion_enabled,
      query_expansion_prompt,
      semantic_search_enabled,
      semantic_search_model
    } = body

    const { data, error } = await supabase
      .from('ai_settings')
      .update({
        synonym_prompt,
        synonym_system_message,
        synonym_model,
        synonym_max_synonyms,
        synonym_min_synonyms,
        category_synonym_prompt,
        category_synonym_system_message,
        category_synonym_model,
        category_synonym_max_synonyms,
        category_synonym_min_synonyms,
        query_expansion_enabled,
        query_expansion_prompt,
        semantic_search_enabled,
        semantic_search_model
      })
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      settings: data
    })
  } catch (error) {
    console.error('Failed to update AI settings:', error)
    return NextResponse.json({
      error: 'Failed to update AI settings',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Reset to defaults
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
    // Delete and recreate to reset to defaults
    await supabase
      .from('ai_settings')
      .delete()
      .eq('id', '00000000-0000-0000-0000-000000000001')

    await supabase
      .from('ai_settings')
      .insert({ id: '00000000-0000-0000-0000-000000000001' })

    const { data, error } = await supabase
      .from('ai_settings')
      .select('*')
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      settings: data
    })
  } catch (error) {
    console.error('Failed to reset AI settings:', error)
    return NextResponse.json({
      error: 'Failed to reset AI settings',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
