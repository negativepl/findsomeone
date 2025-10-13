import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const offset = parseInt(searchParams.get('offset') || '0', 10)
  const limit = parseInt(searchParams.get('limit') || '12', 10)
  const search = searchParams.get('search') || ''
  const city = searchParams.get('city') || ''
  const category = searchParams.get('category') || ''
  const type = searchParams.get('type') || ''
  const sort = searchParams.get('sort') || 'newest'

  const supabase = await createClient()

  try {
    // Use FULL-TEXT SEARCH if there's a search query
    if (search && search.trim().length >= 2) {
      // Use our smart full-text search function
      const { data: searchResults } = await supabase
        .rpc('search_posts', {
          search_query: search.trim(),
          limit_count: 1000 // Get more results for filtering
        })

      // Apply additional filters on the results
      let filteredResults = searchResults || []

      if (city) {
        filteredResults = filteredResults.filter((post: any) =>
          post.city?.toLowerCase().includes(city.toLowerCase()) ||
          post.district?.toLowerCase().includes(city.toLowerCase())
        )
      }

      if (category) {
        filteredResults = filteredResults.filter((post: any) =>
          post.category_name?.toLowerCase().includes(category.toLowerCase())
        )
      }

      if (type) {
        filteredResults = filteredResults.filter((post: any) =>
          post.type === type
        )
      }

      // Apply sorting
      filteredResults.sort((a: any, b: any) => {
        switch (sort) {
          case 'oldest':
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          case 'price_asc':
            return (a.price_min || 0) - (b.price_min || 0)
          case 'price_desc':
            return (b.price_min || 0) - (a.price_min || 0)
          case 'newest':
          default:
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        }
      })

      // Apply pagination
      const paginatedResults = filteredResults.slice(offset, offset + limit)

      // Map search results to Post format
      const posts = paginatedResults.map((result: any) => ({
        id: result.id,
        user_id: result.user_id,
        title: result.title,
        description: result.description,
        type: result.type,
        city: result.city,
        district: result.district,
        price_min: result.price_min,
        price_max: result.price_max,
        price_type: result.price_type,
        images: result.images,
        profiles: {
          full_name: result.user_full_name,
          avatar_url: result.user_avatar_url,
          rating: result.user_rating,
          total_reviews: result.user_total_reviews || 0,
        },
        categories: result.category_name ? {
          name: result.category_name,
        } : null,
      }))

      return NextResponse.json({
        posts,
        hasMore: offset + limit < filteredResults.length,
        total: filteredResults.length
      })
    } else {
      // No search query - use regular filtering
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url,
            rating,
            total_reviews
          ),
          categories (
            name,
            slug
          )
        `, { count: 'exact' })
        .eq('status', 'active')

      // Apply city filter
      if (city) {
        query = query.or(`city.ilike.%${city}%,district.ilike.%${city}%`)
      }

      // Apply category filter
      if (category) {
        // First try to find category by name
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id')
          .ilike('name', category)
          .single()

        let categoryId = categoryData?.id

        // If not found by name, try to find by synonym
        if (!categoryId) {
          const { data: categorySynonym } = await supabase
            .from('category_synonyms')
            .select('category_id')
            .ilike('synonym', category)
            .limit(1)
            .single()

          categoryId = categorySynonym?.category_id
        }

        if (categoryId) {
          query = query.eq('category_id', categoryId)
        }
      }

      // Apply type filter
      if (type) {
        query = query.eq('type', type)
      }

      // Apply sorting
      const sortOrder = sort === 'oldest' ? { ascending: true } : { ascending: false }
      switch (sort) {
        case 'price_asc':
          query = query.order('price_min', { ascending: true, nullsFirst: false })
          break
        case 'price_desc':
          query = query.order('price_min', { ascending: false, nullsFirst: false })
          break
        case 'oldest':
        case 'newest':
        default:
          query = query.order('created_at', sortOrder)
          break
      }

      // Apply pagination
      const { data: posts, count } = await query
        .range(offset, offset + limit - 1)

      return NextResponse.json({
        posts: posts || [],
        hasMore: offset + limit < (count || 0),
        total: count || 0
      })
    }
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}
