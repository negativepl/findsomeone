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
      .order('display_order')

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

    // Build 3-level hierarchy
    const level1 = categoriesWithCounts.filter(c => !c.parent_id)
    const level2 = categoriesWithCounts.filter(c => c.parent_id)

    // Helper function to recursively sum stats
    const sumChildStats = (category: any, allCategories: any[]): { totalPosts: number, aiPosts: number, humanPosts: number } => {
      const children = allCategories.filter(c => c.parent_id === category.id)

      let total = category.totalPosts
      let ai = category.aiPosts
      let human = category.humanPosts

      children.forEach(child => {
        const childStats = sumChildStats(child, allCategories)
        total += childStats.totalPosts
        ai += childStats.aiPosts
        human += childStats.humanPosts
      })

      return { totalPosts: total, aiPosts: ai, humanPosts: human }
    }

    // Build hierarchy with recursive subcategories
    const buildHierarchy = (parentId: string | null, allCategories: any[]): any[] => {
      return allCategories
        .filter(c => c.parent_id === parentId)
        .map(cat => {
          const subcats = buildHierarchy(cat.id, allCategories)
          const stats = sumChildStats(cat, allCategories)

          return {
            ...cat,
            totalPosts: stats.totalPosts,
            aiPosts: stats.aiPosts,
            humanPosts: stats.humanPosts,
            subcategories: subcats.length > 0 ? subcats : undefined
          }
        })
    }

    const grouped = buildHierarchy(null, categoriesWithCounts)

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
