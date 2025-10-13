import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const offset = parseInt(searchParams.get('offset') || '0')
    const limit = parseInt(searchParams.get('limit') || '12')
    const searchQuery = searchParams.get('search') || ''
    const cityQuery = searchParams.get('city') || ''
    const categoryQuery = searchParams.get('category') || ''
    const typeQuery = searchParams.get('type') || ''
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const order = searchParams.get('order') || 'desc'

    const supabase = await createClient()

    let posts: any[] = []

    if (searchQuery && searchQuery.trim().length >= 2) {
      // Use full-text search
      const { data: searchResults } = await supabase
        .rpc('search_posts', {
          search_query: searchQuery.trim(),
          limit_count: 500
        })

      let filteredResults = searchResults || []

      if (cityQuery) {
        filteredResults = filteredResults.filter((post: any) =>
          post.city?.toLowerCase().includes(cityQuery.toLowerCase()) ||
          post.district?.toLowerCase().includes(cityQuery.toLowerCase())
        )
      }

      if (categoryQuery) {
        filteredResults = filteredResults.filter((post: any) =>
          post.category_name?.toLowerCase().includes(categoryQuery.toLowerCase())
        )
      }

      if (typeQuery) {
        filteredResults = filteredResults.filter((post: any) =>
          post.type === typeQuery
        )
      }

      // Map and sort results
      let mappedPosts = filteredResults.map((result: any) => ({
        id: result.id,
        title: result.title,
        description: result.description,
        type: result.type,
        city: result.city,
        district: result.district,
        price_min: result.price_min,
        price_max: result.price_max,
        price_type: result.price_type,
        images: result.images,
        created_at: result.created_at,
        profiles: {
          full_name: result.user_full_name,
          avatar_url: result.user_avatar_url,
          rating: result.user_rating,
        },
        categories: result.category_name ? {
          name: result.category_name,
        } : null,
      }))

      mappedPosts.sort((a: any, b: any) => {
        let aVal, bVal

        switch (sortBy) {
          case 'price_min':
            aVal = a.price_min || 0
            bVal = b.price_min || 0
            break
          case 'price_max':
            aVal = a.price_max || 0
            bVal = b.price_max || 0
            break
          case 'title':
            aVal = a.title.toLowerCase()
            bVal = b.title.toLowerCase()
            break
          case 'created_at':
          default:
            aVal = new Date(a.created_at || 0).getTime()
            bVal = new Date(b.created_at || 0).getTime()
            break
        }

        if (order === 'asc') {
          return aVal > bVal ? 1 : -1
        } else {
          return aVal < bVal ? 1 : -1
        }
      })

      posts = mappedPosts.slice(offset, offset + limit)
    } else {
      // Regular filtering
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url,
            rating
          ),
          categories (
            name,
            slug
          )
        `)
        .eq('status', 'active')

      if (cityQuery) {
        query = query.or(`city.ilike.%${cityQuery}%,district.ilike.%${cityQuery}%`)
      }

      if (categoryQuery) {
        const { data: category } = await supabase
          .from('categories')
          .select('id')
          .ilike('name', categoryQuery)
          .single()

        let categoryId = category?.id

        if (!categoryId) {
          const { data: categorySynonym } = await supabase
            .from('category_synonyms')
            .select('category_id')
            .ilike('synonym', categoryQuery)
            .limit(1)
            .single()

          categoryId = categorySynonym?.category_id
        }

        if (categoryId) {
          query = query.eq('category_id', categoryId)
        }
      }

      if (typeQuery) {
        query = query.eq('type', typeQuery)
      }

      const ascending = order === 'asc'

      if (sortBy === 'price_min' || sortBy === 'price_max') {
        query = query.order(sortBy, { ascending, nullsFirst: false })
      } else if (sortBy === 'title') {
        query = query.order('title', { ascending })
      } else {
        query = query.order('created_at', { ascending })
      }

      query = query.range(offset, offset + limit - 1)

      const { data: fetchedPosts } = await query
      posts = fetchedPosts || []
    }

    return NextResponse.json({ posts, hasMore: posts.length === limit })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}
