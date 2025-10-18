import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://findsomeone.app'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/admin/',
          '/auth/',
          '/signup',
          '/login',
          '/*?*utm_*', // Don't index UTM tracking URLs
        ],
        crawlDelay: 1, // Be nice to servers
      },
      // Special rules for Google
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/admin/',
          '/auth/',
        ],
      },
      // Special rules for Bing
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/admin/',
          '/auth/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
