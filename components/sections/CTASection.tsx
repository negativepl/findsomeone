import { HomepageSection } from '@/lib/homepage-sections/types'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface CTASectionProps {
  section: HomepageSection
}

export function CTASection({ section }: CTASectionProps) {
  const config = section.config as any
  const heading = config.heading || 'Gotowy żeby zacząć?'
  const subheading = config.subheading
  const description = config.description
  const buttonText = config.button_text || 'Rozpocznij teraz'
  const buttonLink = config.button_link || '/dashboard/my-posts/new'
  const buttonTextSecondary = config.button_text_secondary
  const buttonLinkSecondary = config.button_link_secondary
  const textAlignment = config.text_alignment || 'center'

  // Button colors
  const buttonColor = config.button_color || 'hsl(var(--brand))'
  const buttonTextColor = config.button_text_color || '#FFFFFF'
  const buttonColorSecondary = config.button_color_secondary || '#000000'
  const buttonTextColorSecondary = config.button_text_color_secondary || '#FFFFFF'

  const alignmentClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end'
  }

  const alignClass = alignmentClasses[textAlignment as keyof typeof alignmentClasses] || alignmentClasses.center

  return (
    <section className="py-3 md:py-20">
      <div className="container mx-auto px-6">
        <div className={`flex flex-col gap-6 ${alignClass}`}>
          {subheading && (
            <p className="text-sm md:text-base font-medium text-brand uppercase tracking-wide">
              {subheading}
            </p>
          )}

          <h2 className="text-3xl md:text-5xl font-bold text-black">
            {heading}
          </h2>

          {description && (
            <p className="text-lg text-black/60 max-w-2xl">
              {description}
            </p>
          )}

          <div className="flex flex-wrap gap-4 mt-4">
            <Button
              asChild
              size="lg"
              className="rounded-full px-8"
              style={{
                backgroundColor: buttonColor,
                color: buttonTextColor
              }}
            >
              <Link href={buttonLink}>
                {buttonText}
              </Link>
            </Button>

            {buttonTextSecondary && buttonLinkSecondary && (
              <Button
                asChild
                size="lg"
                className="rounded-full px-8"
                style={{
                  backgroundColor: buttonColorSecondary,
                  color: buttonTextColorSecondary
                }}
              >
                <Link href={buttonLinkSecondary}>
                  {buttonTextSecondary}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
