import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://findsomeone.app'
  const supabase = await createClient()

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/posts`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/how-it-works`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/install`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  // Fetch all active posts
  const { data: posts } = await supabase
    .from('posts')
    .select('id, updated_at, created_at')
    .eq('status', 'active')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })

  const postRoutes: MetadataRoute.Sitemap = posts?.map((post) => ({
    url: `${baseUrl}/posts/${post.id}`,
    lastModified: new Date(post.updated_at || post.created_at),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  })) || []

  // Fetch ALL categories (main + subcategories) - 150+ kategorii!
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, parent_id, is_active')
    .eq('is_active', true)
    .order('display_order')

  const categoryRoutes: MetadataRoute.Sitemap = categories?.map((category) => {
    // Priorytet wyższy dla głównych kategorii, niższy dla podkategorii
    const priority = category.parent_id ? 0.6 : 0.7

    return {
      url: `${baseUrl}/posts?category=${encodeURIComponent(category.name.toLowerCase())}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority,
    }
  }) || []

  // Fetch unique cities for city-based pages (SEO goldmine!)
  const { data: cities } = await supabase
    .from('posts')
    .select('city')
    .eq('status', 'active')
    .eq('is_deleted', false)
    .not('city', 'is', null)

  // Get unique cities
  const uniqueCities = [...new Set(cities?.map(p => p.city).filter(Boolean))]

  const cityRoutes: MetadataRoute.Sitemap = uniqueCities.map((city) => ({
    url: `${baseUrl}/posts?city=${encodeURIComponent(city)}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.75, // Miasta są ważne dla local SEO!
  }))

  // City + Category combinations (top 50 combinations for deep SEO)
  const cityCategory: MetadataRoute.Sitemap = []
  if (categories && categories.length > 0 && uniqueCities.length > 0) {
    // Top 10 largest cities
    const topCities = uniqueCities.slice(0, 10)
    // Top 5 most popular categories (główne kategorie)
    const topCategories = categories.filter(c => !c.parent_id).slice(0, 5)

    for (const city of topCities) {
      for (const category of topCategories) {
        cityCategory.push({
          url: `${baseUrl}/posts?city=${encodeURIComponent(city)}&category=${encodeURIComponent(category.name.toLowerCase())}`,
          lastModified: new Date(),
          changeFrequency: 'daily' as const,
          priority: 0.65,
        })
      }
    }
  }

  return [...staticRoutes, ...postRoutes, ...categoryRoutes, ...cityRoutes, ...cityCategory]
}
