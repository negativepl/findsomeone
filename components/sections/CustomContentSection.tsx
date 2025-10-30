import { HomepageSection } from '@/lib/homepage-sections/types'

interface CustomContentSectionProps {
  section: HomepageSection
}

export function CustomContentSection({ section }: CustomContentSectionProps) {
  const config = section.config as any
  const content = config.content || ''
  const contentColumn2 = config.content_column_2 || ''
  const contentColumn3 = config.content_column_3 || ''
  const layout = config.layout || 'single'
  const textAlignment = config.text_alignment || 'left'

  // Map alignment values to Tailwind classes
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }
  const alignmentClass = alignmentClasses[textAlignment as keyof typeof alignmentClasses] || alignmentClasses.left

  return (
    <section className="py-12 md:py-14">
      <div className="container mx-auto px-6">
        {section.title && (
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-black mb-3">
              {section.title}
            </h2>
            {section.subtitle && (
              <p className="text-sm md:text-lg text-black/60">
                {section.subtitle}
              </p>
            )}
          </div>
        )}

        {layout === 'single' ? (
          <div className="max-w-4xl mx-auto">
            <div className={`prose prose-lg max-w-none ${alignmentClass}`}>
              <p className="text-black/80 leading-relaxed whitespace-pre-wrap">
                {content}
              </p>
            </div>
          </div>
        ) : layout === 'two-column' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className={`prose max-w-none ${alignmentClass}`}>
              <p className="text-black/80 leading-relaxed whitespace-pre-wrap">
                {content}
              </p>
            </div>
            <div className={`prose max-w-none ${alignmentClass}`}>
              <p className="text-black/80 leading-relaxed whitespace-pre-wrap">
                {contentColumn2}
              </p>
            </div>
          </div>
        ) : layout === 'three-column' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className={`prose max-w-none ${alignmentClass}`}>
              <p className="text-black/80 leading-relaxed whitespace-pre-wrap">
                {content}
              </p>
            </div>
            <div className={`prose max-w-none ${alignmentClass}`}>
              <p className="text-black/80 leading-relaxed whitespace-pre-wrap">
                {contentColumn2}
              </p>
            </div>
            <div className={`prose max-w-none ${alignmentClass}`}>
              <p className="text-black/80 leading-relaxed whitespace-pre-wrap">
                {contentColumn3}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
