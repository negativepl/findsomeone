import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete all AI-generated posts
    const { error, count } = await supabase
      .from('posts')
      .delete({ count: 'exact' })
      .eq('is_ai_generated', true)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: `Deleted ${count || 0} AI-generated posts`,
      deleted: count || 0,
    })
  } catch (error: any) {
    console.error('Error deleting AI posts:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete AI posts' },
      { status: 500 }
    )
  }
}

// Also provide a GET endpoint to count AI posts
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Count AI-generated posts
    const { count, error } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('is_ai_generated', true)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      count: count || 0,
    })
  } catch (error: any) {
    console.error('Error counting AI posts:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to count AI posts' },
      { status: 500 }
    )
  }
}
