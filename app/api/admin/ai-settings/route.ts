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

    return NextResponse.json({ success: true, settings: data })
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
      category_seo_prompt,
      category_seo_system_message,
      category_seo_model,
      category_seo_max_length,
      category_seo_min_length,
      chat_assistant_enabled,
      chat_assistant_system_prompt,
      chat_assistant_model,
      chat_assistant_welcome_message,
      chat_assistant_suggestions,
      chat_assistant_max_results,
      chat_assistant_require_city,
      query_expansion_enabled,
      query_expansion_prompt,
      semantic_search_enabled,
      semantic_search_model,
      content_bot_system_message,
      content_bot_prompt,
      content_bot_model,
      content_bot_posts_per_category,
      content_bot_offering_ratio,
      content_bot_description_min_length,
      content_bot_description_max_length,
      content_bot_title_min_length,
      content_bot_title_max_length,
      content_bot_images_count
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
        category_seo_prompt,
        category_seo_system_message,
        category_seo_model,
        category_seo_max_length,
        category_seo_min_length,
        chat_assistant_enabled,
        chat_assistant_system_prompt,
        chat_assistant_model,
        chat_assistant_welcome_message,
        chat_assistant_suggestions,
        chat_assistant_max_results,
        chat_assistant_require_city,
        query_expansion_enabled,
        query_expansion_prompt,
        semantic_search_enabled,
        semantic_search_model,
        content_bot_system_message,
        content_bot_prompt,
        content_bot_model,
        content_bot_posts_per_category,
        content_bot_offering_ratio,
        content_bot_description_min_length,
        content_bot_description_max_length,
        content_bot_title_min_length,
        content_bot_title_max_length,
        content_bot_images_count
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
