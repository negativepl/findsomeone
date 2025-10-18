import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { categoryIds } = await request.json()

    if (!categoryIds || categoryIds.length === 0) {
      return NextResponse.json({ error: 'No categories selected' }, { status: 400 })
    }

    // Use service role to delete (bypasses RLS)
    const supabaseServiceRole = createServiceRoleClient()

    // Delete all AI-generated posts in selected categories
    const { error, count } = await supabaseServiceRole
      .from('posts')
      .delete({ count: 'exact' })
      .eq('is_ai_generated', true)
      .in('category_id', categoryIds)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: `Deleted ${count || 0} AI-generated posts from ${categoryIds.length} categories`,
      deleted: count || 0,
    })
  } catch (error: any) {
    console.error('Error deleting AI posts by category:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete AI posts' },
      { status: 500 }
    )
  }
}
