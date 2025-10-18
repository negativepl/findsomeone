// Component registry for homepage sections
import { HomepageSection } from './types'
import { Suspense } from 'react'

// Import existing section components (we'll adapt them)
import { CityBasedPosts } from '@/components/CityBasedPosts'
import { RecentlyViewedPosts } from '@/components/RecentlyViewedPosts'
import { CustomContentSection as CustomContentComponent } from '@/components/sections/CustomContentSection'

// Props interface for section components
export interface SectionComponentProps {
  section: HomepageSection
  userFavorites: string[]
  userId?: string
}

// Wrapper components for existing sections
function SeekingHelpSection({ section, userFavorites }: SectionComponentProps) {
  const config = section.config as any
  const limit = config.limit || 8
  const showButton = config.show_see_all_button !== false

  // This will be rendered server-side with actual data
  // For now, just return a placeholder that will be replaced
  return (
    <div data-section-type="seeking_help" data-section-id={section.id}>
      {/* Server component will inject the actual content */}
    </div>
  )
}

function OfferingHelpSection({ section, userFavorites }: SectionComponentProps) {
  const config = section.config as any
  const limit = config.limit || 8
  const showButton = config.show_see_all_button !== false

  return (
    <div data-section-type="offering_help" data-section-id={section.id}>
      {/* Server component will inject the actual content */}
    </div>
  )
}

function NewestPostsSection({ section, userFavorites }: SectionComponentProps) {
  const config = section.config as any

  return (
    <div data-section-type="newest_posts" data-section-id={section.id}>
      {/* Server component will inject the actual content */}
    </div>
  )
}

function CityBasedSection({ section, userFavorites }: SectionComponentProps) {
  return (
    <CityBasedPosts userFavorites={userFavorites} />
  )
}

function PopularCategoriesSection({ section }: SectionComponentProps) {
  const config = section.config as any

  return (
    <div data-section-type="popular_categories" data-section-id={section.id}>
      {/* Server component will inject the actual content */}
    </div>
  )
}

function RecentlyViewedSection({ section, userFavorites, userId }: SectionComponentProps) {
  return (
    <RecentlyViewedPosts userFavorites={userFavorites} userId={userId} />
  )
}

function CustomHTMLSection({ section }: SectionComponentProps) {
  const config = section.config as any
  const htmlContent = config.html_content || ''
  const cssClasses = config.css_classes || ''

  // Note: dangerouslySetInnerHTML should only be used with trusted content
  // In production, you might want to sanitize this
  return (
    <div
      className={cssClasses}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  )
}

// Use the imported CustomContentSection component
function CustomContentSection({ section }: SectionComponentProps) {
  return <CustomContentComponent section={section} />
}

// Component registry map
export const SECTION_COMPONENTS: Record<string, React.ComponentType<SectionComponentProps>> = {
  seeking_help: SeekingHelpSection,
  offering_help: OfferingHelpSection,
  newest_posts: NewestPostsSection,
  city_based: CityBasedSection,
  popular_categories: PopularCategoriesSection,
  recently_viewed: RecentlyViewedSection,
  custom_html: CustomHTMLSection,
  custom_content: CustomContentSection
}

// Helper to render a section
export function renderSection(
  section: HomepageSection,
  userFavorites: string[],
  userId?: string
) {
  const Component = SECTION_COMPONENTS[section.type]

  if (!Component) {
    console.warn(`Unknown section type: ${section.type}`)
    return null
  }

  return (
    <Suspense key={section.id} fallback={<div className="h-96 animate-pulse bg-gray-100 rounded-3xl" />}>
      <Component section={section} userFavorites={userFavorites} userId={userId} />
    </Suspense>
  )
}
