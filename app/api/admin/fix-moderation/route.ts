import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fix active posts without proper moderation_status
    const { data: activeFixed, error: error1 } = await supabase
      .from('posts')
      .update({ moderation_status: 'approved' })
      .eq('status', 'active')
      .in('moderation_status', ['pending', 'checking'])
      .select('id')

    // Fix AI-generated active posts
    const { data: aiFixed, error: error2 } = await supabase
      .from('posts')
      .update({ moderation_status: 'approved' })
      .eq('status', 'active')
      .eq('is_ai_generated', true)
      .is('moderation_status', null)
      .select('id')

    // Fix pending posts without moderation_status
    const { data: pendingFixed, error: error3 } = await supabase
      .from('posts')
      .update({ moderation_status: 'pending' })
      .eq('status', 'pending')
      .is('moderation_status', null)
      .select('id')

    if (error1 || error2 || error3) {
      console.error('Errors:', { error1, error2, error3 })
      return NextResponse.json({ error: 'Failed to fix some posts' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      fixed: {
        activeFixed: activeFixed?.length || 0,
        aiFixed: aiFixed?.length || 0,
        pendingFixed: pendingFixed?.length || 0,
        total: (activeFixed?.length || 0) + (aiFixed?.length || 0) + (pendingFixed?.length || 0)
      }
    })
  } catch (error) {
    console.error('Error fixing moderation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
