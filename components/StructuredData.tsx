import Script from 'next/script'

interface BreadcrumbItem {
  name: string
  url: string
}

interface StructuredDataProps {
  type: 'breadcrumb' | 'service' | 'local-business' | 'collection-page'
  breadcrumbs?: BreadcrumbItem[]
  serviceName?: string
  serviceDescription?: string
  city?: string
  category?: string
}

export function StructuredData({ type, breadcrumbs, serviceName, serviceDescription, city, category }: StructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://findsomeone.app'

  let structuredData: any = {}

  switch (type) {
    case 'breadcrumb':
      if (breadcrumbs && breadcrumbs.length > 0) {
        structuredData = {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: breadcrumbs.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
          })),
        }
      }
      break

    case 'service':
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: serviceName || 'Usługi lokalne',
        description: serviceDescription || 'Lokalne usługi i ogłoszenia',
        provider: {
          '@type': 'Organization',
          name: 'FindSomeone',
          url: baseUrl,
        },
        areaServed: city ? {
          '@type': 'City',
          name: city,
        } : {
          '@type': 'Country',
          name: 'Polska',
        },
        serviceType: category || 'Usługi lokalne',
      }
      break

    case 'local-business':
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'FindSomeone',
        description: 'Darmowa platforma lokalnych ogłoszeń łącząca ludzi w mieście',
        url: baseUrl,
        telephone: '',
        priceRange: '$$',
        areaServed: {
          '@type': 'Country',
          name: 'Polska',
        },
        sameAs: [
          // Add social media links if you have them
        ],
      }
      break

    case 'collection-page':
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${category ? category + ' - ' : ''}${city || 'Polska'}`,
        description: serviceDescription || `Przeglądaj lokalne usługi ${category ? 'w kategorii ' + category : ''} ${city ? 'w ' + city : ''}`,
        url: `${baseUrl}/posts`,
        isPartOf: {
          '@type': 'WebSite',
          name: 'FindSomeone',
          url: baseUrl,
        },
      }
      break
  }

  if (Object.keys(structuredData).length === 0) {
    return null
  }

  return (
    <Script
      id={`structured-data-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
