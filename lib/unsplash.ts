// Unsplash API helper for fetching placeholder images
// Free tier: 50 requests per hour

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || ''

export interface UnsplashImage {
  url: string
  downloadUrl: string
  photographer: string
  photographerUrl: string
}

/**
 * Fetch a random image from Unsplash based on category
 * @param categoryName - Category name to search for
 * @returns Image URL or null if not found
 */
export async function getUnsplashImageForCategory(
  categoryName: string
): Promise<string | null> {
  if (!UNSPLASH_ACCESS_KEY) {
    console.warn('UNSPLASH_ACCESS_KEY not set, skipping image fetch')
    return null
  }

  try {
    // Map Polish category names to English search terms
    const searchTerm = mapCategoryToSearchTerm(categoryName)

    // Add random seed to ensure different images each time
    // This prevents Unsplash from returning the same images for rapid sequential requests
    const randomSeed = Math.random().toString(36).substring(7)

    const response = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(searchTerm)}&orientation=landscape&content_filter=high&count=1`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
        // Disable cache to get truly random images each time
        cache: 'no-store'
      }
    )

    if (!response.ok) {
      const errorBody = await response.text()
      console.error('Unsplash API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody,
        headers: {
          'X-Ratelimit-Limit': response.headers.get('X-Ratelimit-Limit'),
          'X-Ratelimit-Remaining': response.headers.get('X-Ratelimit-Remaining'),
        }
      })
      return null
    }

    const data = await response.json()

    // Log rate limit info for monitoring
    const rateLimit = {
      limit: response.headers.get('X-Ratelimit-Limit'),
      remaining: response.headers.get('X-Ratelimit-Remaining'),
    }
    console.log(`Unsplash API - Rate limit: ${rateLimit.remaining}/${rateLimit.limit} remaining for "${searchTerm}"`)

    // When using count=1, Unsplash returns an array with single item
    const photo = Array.isArray(data) ? data[0] : data

    if (!photo) {
      console.warn(`No image found for search term: "${searchTerm}" (category: "${categoryName}")`)
      return null
    }

    // Return regular size image URL (better quality than thumbnail)
    return photo?.urls?.regular || photo?.urls?.small || null
  } catch (error) {
    console.error('Error fetching Unsplash image:', error)
    return null
  }
}

/**
 * Map Polish category names to English search terms for Unsplash
 */
function mapCategoryToSearchTerm(categoryName: string): string {
  const categoryMap: Record<string, string> = {
    // Wynajem i wypożyczalnia
    'Wynajem i wypożyczalnia': 'rental equipment tools',
    'Sprzęt budowlany': 'construction equipment',
    'Elektronarzędzia': 'power tools workshop',
    'Sprzęt ogrodniczy': 'gardening equipment lawn mower',
    'Transport i pojazdy': 'vehicles transportation truck',
    'Sprzęt eventowy': 'event equipment party',
    'Sprzęt sportowy': 'sports equipment fitness',
    'Narzędzia specjalistyczne': 'professional tools equipment',

    // Dom i ogród
    'Dom i ogród': 'home garden house',
    'Usługi remontowe': 'renovation construction work',
    'Elektryka': 'electrician electrical work',
    'Hydraulika': 'plumber plumbing pipes',
    'Malowanie': 'painting painter wall',
    'Stolarstwo': 'carpentry woodwork furniture',
    'Ogrodnictwo': 'gardening plants landscaping',
    'Czyszczenie': 'cleaning service housework',
    'Przeprowadzki': 'moving boxes truck',

    // Sport i hobby
    'Sport i hobby': 'sports hobby fitness',
    'Trener personalny': 'personal trainer fitness coach',
    'Instruktor jogi': 'yoga instructor meditation',
    'Instruktor tańca': 'dance instructor studio',
    'Instruktor pływania': 'swimming instructor pool',
    'Korepetycje sportowe': 'sports coaching training',

    // Muzyka i edukacja
    'Muzyka i edukacja': 'music education learning',
    'Nauka gry na instrumencie': 'music instrument lesson',
    'Lekcje śpiewu': 'singing lesson voice',
    'Korepetycje szkolne': 'tutoring student books',
    'Nauka języków obcych': 'language learning foreign',
    'Kursy komputerowe': 'computer course programming',
    'Korepetycje matematyka': 'math tutoring student',

    // Zdrowie i uroda
    'Zdrowie i uroda': 'health beauty wellness',
    'Fryzjerstwo': 'hairdresser salon hair',
    'Kosmetyka': 'cosmetics beauty treatment',
    'Masaż': 'massage therapy spa',
    'Dietetyka': 'dietitian nutrition healthy food',
    'Fizjoterapia': 'physiotherapy rehabilitation',
    'Manicure pedicure': 'manicure pedicure nails',

    // Motoryzacja
    'Motoryzacja': 'automotive car mechanic',
    'Mechanika samochodowa': 'car mechanic garage',
    'Blacharstwo lakiernictwo': 'auto body paint shop',
    'Diagnostyka komputerowa': 'car diagnostic computer',
    'Serwis klimatyzacji': 'car air conditioning service',
    'Wulkanizacja': 'tire service wheel',

    // Usługi dla zwierząt
    'Usługi dla zwierząt': 'pet services animals',
    'Psi fryzjer': 'dog grooming pet',
    'Weterynarz': 'veterinarian animal clinic',
    'Wyprowadzanie psów': 'dog walking pet',
    'Hotel dla zwierząt': 'pet hotel boarding',
    'Trening psów': 'dog training pet',

    // IT i technologia
    'IT i technologia': 'technology computer programming',
    'Naprawa komputerów': 'computer repair technician',
    'Tworzenie stron www': 'web development programming',
    'Administracja sieciami': 'network administration server',
    'Pomoc IT': 'IT support help desk',
    'Grafika komputerowa': 'graphic design computer',

    // Fotografia i wideo
    'Fotografia i wideo': 'photography video camera',
    'Fotografia ślubna': 'wedding photography bride',
    'Fotografia produktowa': 'product photography studio',
    'Nagrywanie wideo': 'video recording camera',
    'Montaż wideo': 'video editing computer',
    'Fotografia eventowa': 'event photography party',

    // Prawne i księgowe
    'Prawne i księgowe': 'legal accounting office',
    'Doradztwo prawne': 'legal advice lawyer',
    'Księgowość': 'accounting bookkeeping',
    'Doradztwo podatkowe': 'tax consulting finance',
    'Tłumaczenia prawnicze': 'legal translation document',

    // Organizacja eventów
    'Organizacja eventów': 'event planning party',
    'DJ na wesele': 'wedding DJ party music',
    'Catering': 'catering food party',
    'Dekoracje eventowe': 'event decoration flowers',
    'Animacje dla dzieci': 'children entertainment party',
  }

  return categoryMap[categoryName] || categoryName
}

/**
 * Trigger a download ping to Unsplash (required by their API terms)
 * Call this when an image is actually used
 */
export async function triggerUnsplashDownload(downloadUrl: string): Promise<void> {
  if (!UNSPLASH_ACCESS_KEY || !downloadUrl) return

  try {
    await fetch(downloadUrl, {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    })
  } catch (error) {
    // Silent fail - this is just for attribution
    console.error('Error triggering Unsplash download:', error)
  }
}
