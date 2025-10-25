import Link from 'next/link'
import { ScrollArrows } from '@/components/ScrollArrows'
import { ScrollGradients } from '@/components/ScrollGradients'
import { ScrollIndicator } from '@/components/ScrollIndicator'
import { createClient } from '@/lib/supabase/server'
import { HomepageSection } from '@/lib/homepage-sections/types'
import { CategoryIcon } from '@/lib/category-icons'

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
      <div className="relative -mx-6 md:-mx-8">
        <div className="hidden md:block">
          <ScrollArrows containerId={`section-${section.id}-scroll`} />
        </div>
        <ScrollGradients containerId={`section-${section.id}-scroll`} />

        <div id={`section-${section.id}-scroll`} className="overflow-x-auto overflow-y-visible scrollbar-hide snap-x snap-mandatory">
          <div className="horizontal-scroll-padding-mobile flex gap-4 pb-2">
            {categories.map((category: any) => (
              <Link
                key={category.id}
                href={`/posts?category=${category.slug}`}
                className="flex-shrink-0 snap-center"
                style={{ width: '280px' }}
              >
                <div className="border-0 rounded-3xl bg-white hover:bg-[#F5F1E8] transition-all p-6 cursor-pointer h-full flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-[#C44E35]/10 flex items-center justify-center mb-4">
                    <CategoryIcon iconName={category.icon} className="w-8 h-8 text-[#C44E35]" />
                  </div>
                  <h4 className="text-lg font-bold text-black mb-2">{category.name}</h4>
                  <p className="text-sm text-black/60">{category.post_count} ogłoszeń</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <ScrollIndicator containerId={`section-${section.id}-scroll`} />
      </div>
    </div>
  )

  // Render grid layout
  const renderGrid = (className = '') => (
    <div className={className}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((category: any) => (
          <Link
            key={category.id}
            href={`/posts?category=${category.slug}`}
            className="border-0 rounded-3xl bg-[#F5F1E8] hover:bg-[#E5E1D8] transition-all p-6 cursor-pointer flex flex-col items-center justify-center text-center min-h-[160px]"
          >
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4">
              <CategoryIcon iconName={category.icon} className="w-8 h-8 text-[#C44E35]" />
            </div>
            <h4 className="text-lg font-bold text-black mb-2">{category.name}</h4>
            <p className="text-sm text-black/60">{category.post_count} ogłoszeń</p>
          </Link>
        ))}
      </div>
    </div>
  )

  if (showBothLayouts) {
    // Render both layouts with appropriate visibility classes
    return (
      <section className="container mx-auto px-6 py-12 md:py-14">
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm group/section">
          <div className="mb-8 md:mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-black mb-2">{title}</h3>
            <p className="text-lg text-black/60">{subtitle}</p>
          </div>

          {/* Mobile layout */}
          {layoutMobile === 'carousel' ? renderCarousel('md:hidden') : renderGrid('md:hidden')}

          {/* Desktop layout */}
          {layoutDesktop === 'carousel' ? renderCarousel('hidden md:block') : renderGrid('hidden md:block')}
        </div>
      </section>
    )
  }

  // Same layout for both mobile and desktop
  return (
    <section className="container mx-auto px-6 py-12 md:py-14">
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm group/section">
        <div className="mb-8 md:mb-12">
          <h3 className="text-3xl md:text-4xl font-bold text-black mb-2">{title}</h3>
          <p className="text-lg text-black/60">{subtitle}</p>
        </div>

        {layoutMobile === 'carousel' ? renderCarousel() : renderGrid()}
      </div>
    </section>
  )
}
