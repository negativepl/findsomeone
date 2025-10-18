import { HomepageSection } from '@/lib/homepage-sections/types'
import * as LucideIcons from 'lucide-react'

interface FeaturesSectionProps {
  section: HomepageSection
}

export function FeaturesSection({ section }: FeaturesSectionProps) {
  const config = section.config as any
  const features = config.features || []
  const layout = config.layout || 'grid'
  const columns = config.columns || 3

  if (features.length === 0) {
    return (
      <section className="py-12 md:py-14">
        <div className="container mx-auto px-6">
          <div className="text-center text-black/40 py-12 border-2 border-dashed border-black/10 rounded-2xl">
            Brak cech/funkcji. Dodaj funkcje w konfiguracji sekcji.
          </div>
        </div>
      </section>
    )
  }

  const columnClasses = {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4'
  }

  const gridClass = columnClasses[columns as keyof typeof columnClasses] || columnClasses[3]

  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName]
    if (IconComponent) {
      return <IconComponent className="w-8 h-8 text-[#C44E35]" />
    }
    return null
  }

  return (
    <section className="py-12 md:py-14">
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

        {layout === 'list' ? (
          <div className="space-y-6 max-w-3xl mx-auto">
            {features.map((feature: any, index: number) => (
              <div
                key={index}
                className="flex gap-4 p-6 rounded-2xl border-2 border-black/5 hover:border-black/10 transition-colors"
              >
                {feature.icon && (
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(feature.icon)}
                  </div>
                )}

                <div className="flex-1">
                  <h3 className="text-xl font-bold text-black mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-black/70 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`grid grid-cols-1 ${gridClass} gap-8`}>
            {features.map((feature: any, index: number) => (
              <div
                key={index}
                className="text-center"
              >
                {feature.icon && (
                  <div className="flex justify-center mb-4">
                    {getIcon(feature.icon)}
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold text-black mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-black/70 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
