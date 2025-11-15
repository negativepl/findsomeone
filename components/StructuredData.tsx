import Script from 'next/script'

interface BreadcrumbItem {
  name: string
  url: string
}

interface Review {
  id: string
  rating: number
  comment: string
  created_at: string
  reviewer: {
    full_name: string
  } | null
}

interface StructuredDataProps {
  type: 'breadcrumb' | 'service' | 'local-business' | 'collection-page' | 'about-page' | 'person' | 'profile-with-reviews'
  breadcrumbs?: BreadcrumbItem[]
  serviceName?: string
  serviceDescription?: string
  city?: string
  category?: string
  personName?: string
  personJobTitle?: string
  personEmail?: string
  personImage?: string
  rating?: number
  totalReviews?: number
  reviews?: Review[]
}

export function StructuredData({ type, breadcrumbs, serviceName, serviceDescription, city, category, personName, personJobTitle, personEmail, personImage, rating, totalReviews, reviews }: StructuredDataProps) {
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

    case 'about-page':
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: 'O nas - FindSomeone',
        description: serviceDescription || 'Poznaj historię FindSomeone - platformy łączącej ludzi lokalnie. Nasza misja to tworzenie pięknego i funkcjonalnego UX dla społeczności.',
        url: `${baseUrl}/about`,
        mainEntity: {
          '@type': 'Organization',
          name: 'FindSomeone',
          url: baseUrl,
          description: 'Darmowa platforma lokalnych ogłoszeń łącząca ludzi w mieście',
          foundingDate: '2025',
          founder: {
            '@type': 'Person',
            name: personName || 'Marcin Baszewski',
            jobTitle: personJobTitle || 'Founder & Designer',
          },
        },
      }
      break

    case 'person':
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: personName || 'Marcin Baszewski',
        jobTitle: personJobTitle || 'Founder & Designer',
        email: personEmail || 'mbaszewski@findsomeone.app',
        image: personImage || `${baseUrl}/images/mbaszewski.webp`,
        worksFor: {
          '@type': 'Organization',
          name: 'FindSomeone',
          url: baseUrl,
        },
        sameAs: [
          // Add social media profiles if available
        ],
      }
      break

    case 'profile-with-reviews':
      const personData: any = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: personName || 'User',
        image: personImage,
      }

      // Add aggregate rating if available
      if (rating && totalReviews && totalReviews > 0) {
        personData.aggregateRating = {
          '@type': 'AggregateRating',
          ratingValue: rating.toFixed(1),
          reviewCount: totalReviews,
          bestRating: '5',
          worstRating: '1',
        }
      }

      // Add individual reviews if available
      if (reviews && reviews.length > 0) {
        personData.review = reviews.map((review) => ({
          '@type': 'Review',
          reviewRating: {
            '@type': 'Rating',
            ratingValue: review.rating,
            bestRating: '5',
            worstRating: '1',
          },
          reviewBody: review.comment,
          datePublished: review.created_at,
          author: {
            '@type': 'Person',
            name: review.reviewer?.full_name || 'Anonymous',
          },
        }))
      }

      structuredData = personData
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
