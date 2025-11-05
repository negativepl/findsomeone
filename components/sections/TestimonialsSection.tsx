import { HomepageSection } from '@/lib/homepage-sections/types'
import { Star } from 'lucide-react'

interface TestimonialsSectionProps {
  section: HomepageSection
}

export function TestimonialsSection({ section }: TestimonialsSectionProps) {
  const config = section.config as any
  const testimonials = config.testimonials || []
  const layout = config.layout || 'grid'
  const showRatings = config.show_ratings !== false
  const columns = config.columns || 3

  if (testimonials.length === 0) {
    return (
      <section className="py-12 md:py-14">
        <div className="container mx-auto px-6">
          <div className="text-center text-foreground/40 py-12 border border-dashed border-black/10 rounded-2xl">
            Brak opinii. Dodaj opinie w konfiguracji sekcji.
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

  return (
    <section className="py-12 md:py-14">
      <div className="container mx-auto px-6">
        {section.title && (
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-3">
              {section.title}
            </h2>
            {section.subtitle && (
              <p className="text-sm md:text-lg text-muted-foreground">
                {section.subtitle}
              </p>
            )}
          </div>
        )}

        {layout === 'list' ? (
          <div className="space-y-6 max-w-3xl mx-auto">
            {testimonials.map((testimonial: any, index: number) => (
              <div
                key={index}
                className="bg-card border border-border rounded-2xl p-6 hover:border-brand/30 transition-all"
              >
                <div className="flex gap-4">
                  {testimonial.avatar_url && (
                    <img
                      src={testimonial.avatar_url}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold text-foreground text-lg">
                          {testimonial.name}
                        </div>
                        {(testimonial.role || testimonial.company) && (
                          <div className="text-sm text-muted-foreground">
                            {testimonial.role}
                            {testimonial.role && testimonial.company && ', '}
                            {testimonial.company}
                          </div>
                        )}
                      </div>
                      {showRatings && testimonial.rating && (
                        <div className="flex gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < testimonial.rating
                                  ? 'fill-brand text-brand'
                                  : 'text-foreground/20'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-foreground leading-relaxed">
                      &ldquo;{testimonial.text}&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : layout === 'carousel' ? (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-6 min-w-min">
              {testimonials.map((testimonial: any, index: number) => (
                <div
                  key={index}
                  className="bg-card border border-border rounded-2xl p-6 hover:border-brand/30 transition-all w-[350px] flex-shrink-0"
                >
                  {showRatings && testimonial.rating && (
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < testimonial.rating
                              ? 'fill-brand text-brand'
                              : 'text-foreground/20'
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  <p className="text-foreground mb-6 leading-relaxed">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>

                  <div className="flex items-center gap-3">
                    {testimonial.avatar_url && (
                      <img
                        src={testimonial.avatar_url}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <div className="font-semibold text-foreground">
                        {testimonial.name}
                      </div>
                      {(testimonial.role || testimonial.company) && (
                        <div className="text-sm text-muted-foreground">
                          {testimonial.role}
                          {testimonial.role && testimonial.company && ', '}
                          {testimonial.company}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={`grid grid-cols-1 ${gridClass} gap-6`}>
            {testimonials.map((testimonial: any, index: number) => (
              <div
                key={index}
                className="bg-card border border-border rounded-2xl p-6 hover:border-brand/30 transition-all"
              >
                {showRatings && testimonial.rating && (
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < testimonial.rating
                            ? 'fill-brand text-brand'
                            : 'text-foreground/20'
                        }`}
                      />
                    ))}
                  </div>
                )}

                <p className="text-foreground mb-6 leading-relaxed">
                  &ldquo;{testimonial.text}&rdquo;
                </p>

                <div className="flex items-center gap-3">
                  {testimonial.avatar_url && (
                    <img
                      src={testimonial.avatar_url}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <div className="font-semibold text-foreground">
                      {testimonial.name}
                    </div>
                    {(testimonial.role || testimonial.company) && (
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role}
                        {testimonial.role && testimonial.company && ', '}
                        {testimonial.company}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
