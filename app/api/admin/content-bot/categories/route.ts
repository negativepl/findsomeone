import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all categories with their post counts
    const { data: categories, error } = await supabase
      .from('categories')
      .select('id, name, parent_id')
      .order('parent_id', { nullsFirst: true })
      .order('name')

    if (error) throw error

    // Get post counts for each category (all posts and AI posts)
    const categoriesWithCounts = await Promise.all(
      (categories || []).map(async (category) => {
        // Total posts in category
        const { count: totalPosts } = await supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', category.id)
          .eq('status', 'active')

        // AI posts in category
        const { count: aiPosts } = await supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', category.id)
          .eq('status', 'active')
          .eq('is_ai_generated', true)

        return {
          ...category,
          totalPosts: totalPosts || 0,
          aiPosts: aiPosts || 0,
          humanPosts: (totalPosts || 0) - (aiPosts || 0),
        }
      })
    )

    // Group by parent categories
    const parentCategories = categoriesWithCounts.filter(c => !c.parent_id)
    const subcategories = categoriesWithCounts.filter(c => c.parent_id)

    const grouped = parentCategories.map(parent => ({
      ...parent,
      subcategories: subcategories.filter(sub => sub.parent_id === parent.id),
    }))

    return NextResponse.json({
      success: true,
      categories: grouped,
      total: categoriesWithCounts.length,
    })
  } catch (error: any) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
