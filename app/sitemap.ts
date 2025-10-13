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
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/how-it-works`,
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

  // Fetch all categories for category pages
  const { data: categories } = await supabase
    .from('categories')
    .select('name, slug')
    .is('parent_id', null)
    .order('name')

  const categoryRoutes: MetadataRoute.Sitemap = categories?.map((category) => ({
    url: `${baseUrl}/posts?category=${encodeURIComponent(category.name.toLowerCase())}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  })) || []

  return [...staticRoutes, ...postRoutes, ...categoryRoutes]
}
