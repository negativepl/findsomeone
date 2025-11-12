import { HomepageSection } from './types'
import { PostsSection } from '@/components/sections/PostsSection'
import { PopularCategoriesSection } from '@/components/sections/PopularCategoriesSection'
import { HeroBannerSection } from '@/components/sections/HeroBannerSection'
import { CityBasedPosts } from '@/components/CityBasedPosts'
import { RecentlyViewedPosts } from '@/components/RecentlyViewedPosts'
import { TestimonialsSection } from '@/components/sections/TestimonialsSection'
import { FAQSection } from '@/components/sections/FAQSection'
import { StatsSection } from '@/components/sections/StatsSection'
import { FeaturesSection } from '@/components/sections/FeaturesSection'
import { CTASection } from '@/components/sections/CTASection'
import { ImageGallerySection } from '@/components/sections/ImageGallerySection'
import { SpacerSection } from '@/components/sections/SpacerSection'
import { CustomContentSection } from '@/components/sections/CustomContentSection'
import { AnimatedSection } from '@/components/AnimatedSection'

interface SectionRendererProps {
  section: HomepageSection
  userFavorites: string[]
  userId?: string
  preloadedPostsData?: any[]
}

export function SectionRenderer({ section, userFavorites, userId, preloadedPostsData }: SectionRendererProps) {
  // Check visibility based on device
  const visibilityClasses: string[] = []
  if (!section.visible_on_mobile) visibilityClasses.push('hidden md:block')
  if (!section.visible_on_desktop) visibilityClasses.push('block md:hidden')

  // Container width classes
  const containerWidthClasses = {
    full: 'w-full',
    boxed: 'container mx-auto',
    narrow: 'max-w-4xl mx-auto'
  }

  const containerClass = section.container_width
    ? containerWidthClasses[section.container_width as keyof typeof containerWidthClasses]
    : ''

  // Prepare inline styles with all new options
  const sectionStyles: React.CSSProperties = {}

  // Colors
  if (section.background_color) sectionStyles.backgroundColor = section.background_color
  if (section.text_color) sectionStyles.color = section.text_color

  // Spacing
  if (section.padding_top !== undefined) sectionStyles.paddingTop = `${section.padding_top}px`
  if (section.padding_bottom !== undefined) sectionStyles.paddingBottom = `${section.padding_bottom}px`
  if (section.padding_left !== undefined) sectionStyles.paddingLeft = `${section.padding_left}px`
  if (section.padding_right !== undefined) sectionStyles.paddingRight = `${section.padding_right}px`
  if (section.margin_top !== undefined) sectionStyles.marginTop = `${section.margin_top}px`
  if (section.margin_bottom !== undefined) sectionStyles.marginBottom = `${section.margin_bottom}px`

  // Border & Shadow
  if (section.border_width !== undefined && section.border_width > 0) {
    sectionStyles.borderWidth = `${section.border_width}px`
    sectionStyles.borderStyle = 'solid'
    if (section.border_color) sectionStyles.borderColor = section.border_color
  }
  if (section.border_radius !== undefined) sectionStyles.borderRadius = `${section.border_radius}px`
  if (section.box_shadow) sectionStyles.boxShadow = section.box_shadow

  // Background Image
  if (section.background_image_url) {
    sectionStyles.backgroundImage = `url('${section.background_image_url}')`
    sectionStyles.backgroundSize = section.background_size || 'cover'
    sectionStyles.backgroundPosition = section.background_position || 'center'
    sectionStyles.position = 'relative'
  }

  // Wrapper for applying styles and visibility - always render consistently to avoid hydration issues
  const WrapperComponent = ({ children }: { children: React.ReactNode }) => {
    // Normalize values to prevent hydration mismatches from null/undefined/empty string differences
    const hasBackgroundImage = Boolean(section.background_image_url)
    const hasTextColor = Boolean(section.text_color)
    const hasContainerClass = Boolean(containerClass)
    const hasVisibilityClasses = visibilityClasses.length > 0
    const hasSectionStyles = Object.keys(sectionStyles).length > 0

    // Determine if we need any wrapper at all
    const hasAnyCustomization =
      hasVisibilityClasses ||
      hasSectionStyles ||
      hasContainerClass ||
      hasBackgroundImage ||
      hasTextColor

    // If no customization, return children directly
    if (!hasAnyCustomization) {
      return <>{children}</>
    }

    const sectionId = `section-${section.id}`
    const classNames = [containerClass, ...visibilityClasses].filter(Boolean).join(' ')
    const hasBackgroundOverlay = hasBackgroundImage && typeof section.background_overlay_opacity === 'number'

    return (
      <div
        id={sectionId}
        className={classNames || undefined}
        style={hasSectionStyles ? sectionStyles : undefined}
      >
        {/* Background overlay for background images */}
        {hasBackgroundOverlay && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: section.background_overlay_color || '#000000',
              opacity: (section.background_overlay_opacity ?? 0) / 100,
              pointerEvents: 'none',
              zIndex: 0
            }}
          />
        )}

        {/* Always wrap content if we have background image or text color to maintain consistent structure */}
        {(hasBackgroundImage || hasTextColor) ? (
          <div style={{ position: 'relative', zIndex: 1 }}>
            {hasTextColor && (
              <style dangerouslySetInnerHTML={{
                __html: `
                  #${sectionId} h1,
                  #${sectionId} h2,
                  #${sectionId} h3,
                  #${sectionId} h4,
                  #${sectionId} h5,
                  #${sectionId} h6,
                  #${sectionId} p,
                  #${sectionId} span,
                  #${sectionId} a,
                  #${sectionId} label,
                  #${sectionId} div {
                    color: ${section.text_color} !important;
                  }
                `
              }} />
            )}
            {children}
          </div>
        ) : (
          children
        )}
      </div>
    )
  }

  // Map section types to components
  const content = (() => {
    switch (section.type) {
    case 'seeking_help':
    case 'offering_help':
    case 'newest_posts':
      return <PostsSection section={section} userFavorites={userFavorites} preloadedPostsData={preloadedPostsData} />

    case 'popular_categories':
      return <PopularCategoriesSection section={section} />

    case 'city_based':
      return <CityBasedPosts userFavorites={userFavorites} />

    case 'recently_viewed':
      return <RecentlyViewedPosts userFavorites={userFavorites} userId={userId} />

    case 'hero_banner':
      return <HeroBannerSection section={section} />

    case 'custom_html': {
      const config = section.config as any
      const htmlContent = config.html_content || ''
      const cssClasses = config.css_classes || ''

      return (
        <section className="py-3 md:py-14">
          <div className="container mx-auto px-6">
            {section.title && (
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-black mb-3">
                  {section.title}
                </h2>
                {section.subtitle && (
                  <p className="text-lg text-black/60">
                    {section.subtitle}
                  </p>
                )}
              </div>
            )}
            <div
              className={cssClasses}
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </div>
        </section>
      )
    }

    case 'custom_content':
      return <CustomContentSection section={section} />

    case 'testimonials':
      return <TestimonialsSection section={section} />

    case 'faq':
      return <FAQSection section={section} />

    case 'stats':
      return <StatsSection section={section} />

    case 'features':
      return <FeaturesSection section={section} />

    case 'cta':
      return <CTASection section={section} />

    case 'image_gallery':
      return <ImageGallerySection section={section} />

    case 'spacer':
      return <SpacerSection section={section} />

      default:
        console.warn(`Unknown section type: ${section.type}`)
        return null
    }
  })()

  // Skip animation for certain section types
  const skipAnimation = ['spacer', 'hero_banner'].includes(section.type)

  if (skipAnimation) {
    return <WrapperComponent>{content}</WrapperComponent>
  }

  return (
    <AnimatedSection>
      <WrapperComponent>{content}</WrapperComponent>
    </AnimatedSection>
  )
}
