'use client'

import { HomepageSection } from '@/lib/homepage-sections/types'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface FAQSectionProps {
  section: HomepageSection
}

export function FAQSection({ section }: FAQSectionProps) {
  const config = section.config as any
  const items = config.items || []
  const layout = config.layout || 'accordion'
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  if (items.length === 0) {
    return (
      <section className="py-12 md:py-14">
        <div className="container mx-auto px-6">
          <div className="text-center text-foreground/40 py-12 border-2 border-dashed border-black/10 rounded-2xl">
            Brak pytań FAQ. Dodaj pytania w konfiguracji sekcji.
          </div>
        </div>
      </section>
    )
  }

  if (layout === 'accordion') {
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

          <div className="max-w-3xl mx-auto space-y-4">
            {items.map((item: any, index: number) => {
              const isOpen = openIndex === index

              return (
                <div
                  key={index}
                  className="bg-card border border-border rounded-2xl overflow-hidden hover:border-brand/30 transition-all"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left"
                  >
                    <span className="font-semibold text-foreground text-lg">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-brand transition-transform flex-shrink-0 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-5 text-foreground/70 leading-relaxed">
                      {item.answer}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>
    )
  }

  // Grid layout
  const columns = config.columns || 2
  const columnClasses = {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3'
  }
  const gridClass = columnClasses[columns as keyof typeof columnClasses] || columnClasses[2]

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

        <div className={`grid grid-cols-1 ${gridClass} gap-6`}>
          {items.map((item: any, index: number) => (
            <div
              key={index}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <h3 className="font-semibold text-foreground text-lg mb-3">
                {item.question}
              </h3>
              <p className="text-foreground/70 leading-relaxed">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
