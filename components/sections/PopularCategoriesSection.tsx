import Link from 'next/link'
import { ScrollArrows } from '@/components/ScrollArrows'
import { ScrollGradients } from '@/components/ScrollGradients'
import { ScrollIndicator } from '@/components/ScrollIndicator'
import { createClient } from '@/lib/supabase/server'
import { HomepageSection } from '@/lib/homepage-sections/types'
import { CategoryIcon } from '@/lib/category-icons'
import { CategoryHoverCardGrid } from '@/components/CategoryHoverCardGrid'
import { CategoryHoverCardCarousel } from '@/components/CategoryHoverCardCarousel'

interface PopularCategoriesSectionProps {
  section: HomepageSection
}

export async function PopularCategoriesSection({ section }: PopularCategoriesSectionProps) {
  const supabase = await createClient()
  const config = section.config as any

  const limit = config.limit || 8
  // Support for new layout_mobile and layout_desktop, fallback to old layout
  const layoutMobile = config.layout_mobile || config.layout || 'carousel'
  const layoutDesktop = config.layout_desktop || config.layout || 'grid'

  const { data: categories, error } = await supabase
    .rpc('get_popular_categories', { limit_count: limit })

  if (error) {
    console.error('Error fetching popular categories:', error)
    return null
  }

  if (!categories || categories.length === 0) {
    return null
  }

  const title = section.title || 'Popularne kategorie'
  const subtitle = section.subtitle || 'Najpopularniejsze kategorie ogłoszeń'

  // Render both layouts with responsive visibility classes
  const showBothLayouts = layoutMobile !== layoutDesktop

  // Render carousel layout
  const renderCarousel = (className = '') => (
    <div className={className}>
      <CategoryHoverCardCarousel categories={categories} sectionId={section.id} />
    </div>
  )

  // Render grid layout
  const renderGrid = (className = '') => (
    <div className={className}>
      <CategoryHoverCardGrid categories={categories} />
    </div>
  )

  if (showBothLayouts) {
    // Render both layouts with appropriate visibility classes
    return (
      <section className="container mx-auto px-6 py-6 md:py-14">
        {/* Mobile: flat design without card */}
        <div className="md:hidden">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-black mb-2">{title}</h3>
            <p className="text-sm text-black/60">{subtitle}</p>
          </div>
          {layoutMobile === 'carousel' ? renderCarousel() : renderGrid()}
        </div>

        {/* Desktop: card design */}
        <div className="hidden md:block bg-white rounded-3xl p-8 shadow-sm group/section">
          <div className="mb-12">
            <h3 className="text-4xl font-bold text-black mb-2">{title}</h3>
            <p className="text-lg text-black/60">{subtitle}</p>
          </div>
          {layoutDesktop === 'carousel' ? renderCarousel() : renderGrid()}
        </div>
      </section>
    )
  }

  // Same layout for both mobile and desktop
  return (
    <section className="container mx-auto px-6 py-6 md:py-14">
      {/* Mobile: flat design */}
      <div className="md:hidden">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-black mb-2">{title}</h3>
          <p className="text-sm text-black/60">{subtitle}</p>
        </div>
        {layoutMobile === 'carousel' ? renderCarousel() : renderGrid()}
      </div>

      {/* Desktop: card design */}
      <div className="hidden md:block bg-white rounded-3xl p-8 shadow-sm group/section">
        <div className="mb-12">
          <h3 className="text-4xl font-bold text-black mb-2">{title}</h3>
          <p className="text-lg text-black/60">{subtitle}</p>
        </div>
        {layoutMobile === 'carousel' ? renderCarousel() : renderGrid()}
      </div>
    </section>
  )
}
