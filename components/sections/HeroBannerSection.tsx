import Link from 'next/link'
import { HomepageSection } from '@/lib/homepage-sections/types'
import { Button } from '@/components/ui/button'

interface HeroBannerSectionProps {
  section: HomepageSection
}

export function HeroBannerSection({ section }: HeroBannerSectionProps) {
  const config = section.config as any

  const title = config.title || 'Tytuł banera'
  const subtitle = config.subtitle
  const description = config.description
  const backgroundImageUrl = config.background_image_url
  const backgroundAttachment = config.background_attachment || 'scroll'
  const containerWidth = config.container_width || 'full'
  const overlayOpacity = config.overlay_opacity !== undefined ? config.overlay_opacity : 50
  const overlayColor = config.overlay_color || '#000000'
  const overlayBlur = config.overlay_blur !== undefined ? config.overlay_blur : 0
  const borderWidth = config.border_width !== undefined ? config.border_width : 0
  const borderColor = config.border_color || '#000000'
  const borderRadius = config.border_radius !== undefined ? config.border_radius : 0
  const buttonText = config.button_text
  const buttonLink = config.button_link
  const buttonColor = config.button_color || '#C44E35'
  const buttonTextColor = config.button_text_color || '#FFFFFF'
  const buttonTextSecondary = config.button_text_secondary
  const buttonLinkSecondary = config.button_link_secondary
  const buttonColorSecondary = config.button_color_secondary || '#FFFFFF'
  const buttonTextColorSecondary = config.button_text_color_secondary || '#000000'
  const height = config.height || 'medium'
  const textAlignment = config.text_alignment || 'center'

  // Check if only one button exists
  const hasOnlyOneButton = (buttonText && buttonLink && !buttonTextSecondary) || (!buttonText && buttonTextSecondary && buttonLinkSecondary)

  // Container width classes matching project's exact measurements
  const containerWidthClasses = {
    full: 'w-full',
    container: 'container mx-auto px-6',  // Project's standard responsive container with padding
    '7xl': 'max-w-7xl mx-auto px-6',      // 1280px
    '6xl': 'max-w-6xl mx-auto px-6',      // 1152px
    '5xl': 'max-w-5xl mx-auto px-6',      // 1024px
    '4xl': 'max-w-4xl mx-auto px-6',      // 896px
    '3xl': 'max-w-3xl mx-auto px-6'       // 768px
  }
  const containerClass = containerWidthClasses[containerWidth as keyof typeof containerWidthClasses] || containerWidthClasses.full

  const heightClasses = {
    small: 'h-[300px]',
    medium: 'h-[500px]',
    large: 'h-[700px]',
    full: 'min-h-screen'
  }

  const alignmentClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end'
  }

  // Determine if we should use direct background or separate div
  const useDirectBackground = backgroundAttachment === 'fixed' || backgroundAttachment === 'parallax'

  // Section styles (for fixed/parallax)
  const getSectionStyles = (): React.CSSProperties => {
    const styles: React.CSSProperties = {
      borderWidth: borderWidth > 0 ? `${borderWidth}px` : undefined,
      borderStyle: borderWidth > 0 ? 'solid' : undefined,
      borderColor: borderWidth > 0 ? borderColor : undefined,
      borderRadius: borderRadius > 0 ? `${borderRadius}px` : undefined
    }

    if (useDirectBackground && backgroundImageUrl) {
      styles.backgroundImage = `url(${backgroundImageUrl})`
      styles.backgroundSize = 'cover'
      styles.backgroundPosition = 'center'
      styles.backgroundRepeat = 'no-repeat'
      styles.backgroundAttachment = 'fixed'
    }

    return styles
  }

  // Background div styles (for scroll mode)
  const getBackgroundDivStyles = (): React.CSSProperties => {
    if (!backgroundImageUrl || useDirectBackground) return {}

    return {
      backgroundImage: `url(${backgroundImageUrl})`,
      filter: overlayBlur > 0 ? `blur(${overlayBlur}px)` : 'none',
      transform: overlayBlur > 0 ? 'scale(1.1)' : 'none'
    }
  }

  return (
    <div className={containerClass}>
      <section
        className={`relative overflow-hidden ${heightClasses[height as keyof typeof heightClasses] || heightClasses.medium}`}
        style={getSectionStyles()}
      >
        {/* Background Image (for scroll mode only) */}
        {backgroundImageUrl && !useDirectBackground && (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={getBackgroundDivStyles()}
          />
        )}

        {/* Blur overlay for fixed/parallax mode */}
        {useDirectBackground && overlayBlur > 0 && (
          <div
            className="absolute inset-0"
            style={{
              backdropFilter: `blur(${overlayBlur}px)`,
              WebkitBackdropFilter: `blur(${overlayBlur}px)`
            }}
          />
        )}

        {/* Overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: overlayColor,
            opacity: overlayOpacity / 100
          }}
        />

        {/* Content */}
        <div className={`relative z-10 container mx-auto px-6 h-full flex flex-col justify-center ${alignmentClasses[textAlignment as keyof typeof alignmentClasses] || alignmentClasses.center}`}>
        <div className="max-w-4xl">
          {/* Section Title and Subtitle from "Podstawowe ustawienia" */}
          {section.title && (
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                {section.title}
              </h2>
              {section.subtitle && (
                <p className="text-base md:text-lg text-white/80">
                  {section.subtitle}
                </p>
              )}
            </div>
          )}

          {/* Banner content from config */}
          {subtitle && (
            <p className="text-lg md:text-xl text-white/90 mb-4 font-medium">
              {subtitle}
            </p>
          )}

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            {title}
          </h1>

          {description && (
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl leading-relaxed">
              {description}
            </p>
          )}

          {(buttonText || buttonTextSecondary) && (
            <div className={`flex flex-col md:flex-row gap-4 md:gap-6 items-stretch md:items-center w-full md:w-auto ${hasOnlyOneButton && textAlignment === 'center' ? 'justify-center' : ''}`}>
              {buttonText && buttonLink && (
                <Button
                  asChild
                  size="lg"
                  className="w-full md:w-auto text-lg px-12 py-8 rounded-full border-0 transition-all min-h-[56px]"
                  style={{
                    backgroundColor: buttonColor,
                    color: buttonTextColor
                  }}
                >
                  <Link href={buttonLink} className="w-full md:w-auto">
                    {buttonText}
                  </Link>
                </Button>
              )}

              {buttonTextSecondary && buttonLinkSecondary && (
                <Button
                  asChild
                  size="lg"
                  className="w-full md:w-auto text-lg px-12 py-8 rounded-full border transition-all min-h-[56px]"
                  style={{
                    backgroundColor: buttonColorSecondary,
                    color: buttonTextColorSecondary,
                    borderColor: buttonTextColorSecondary
                  }}
                >
                  <Link href={buttonLinkSecondary} className="w-full md:w-auto">
                    {buttonTextSecondary}
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
      </section>
    </div>
  )
}
