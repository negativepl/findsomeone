'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CategoryIcon } from '@/lib/category-icons'
import { ScrollArrows } from '@/components/ScrollArrows'
import { ScrollGradients } from '@/components/ScrollGradients'
import { ScrollIndicator } from '@/components/ScrollIndicator'

interface Category {
  id: string
  name: string
  slug: string
  icon: string
  post_count: number
}

interface CategoryHoverCardCarouselProps {
  categories: Category[]
  sectionId: string
}

export function CategoryHoverCardCarousel({ categories, sectionId }: CategoryHoverCardCarouselProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const containerId = `section-${sectionId}-scroll`

  return (
    <div className="relative -mx-6 md:-mx-8">
      <div className="hidden md:block">
        <ScrollArrows containerId={containerId} />
      </div>
      <ScrollGradients containerId={containerId} />

      <div id={containerId} className="overflow-x-auto overflow-y-visible scrollbar-hide snap-x snap-mandatory">
        <div className="horizontal-scroll-padding-mobile flex gap-4 pb-2">
          {categories.map((category: any, index: number) => (
            <Link
              key={category.id}
              href={`/results?category=${category.slug}`}
              className="flex-shrink-0 snap-center relative group"
              style={{ width: '280px' }}
              onMouseEnter={() => setHoveredId(category.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.05,
                  ease: [0.16, 1, 0.3, 1]
                }}
                className="relative h-full rounded-2xl border border-border bg-muted hover:bg-accent transition-colors p-6"
              >
                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center text-center min-h-[140px]">
                  {/* Icon with hover effect */}
                  <div
                    className={`relative w-16 h-16 mb-4 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      hoveredId === category.id
                        ? 'bg-brand ring-4 ring-brand/20 shadow-lg scale-110'
                        : 'bg-brand/10 shadow-sm'
                    }`}
                  >
                    <CategoryIcon
                      iconName={category.icon}
                      className={`w-8 h-8 transition-all duration-300 ${
                        hoveredId === category.id ? 'text-brand-foreground scale-110' : 'text-brand'
                      }`}
                    />
                  </div>

                  <h4 className={`text-lg font-bold mb-2 transition-colors duration-300 ${
                    hoveredId === category.id ? 'text-brand' : 'text-foreground'
                  }`}>
                    {category.name}
                  </h4>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-foreground">
                    {category.post_count} ogłoszeń
                  </span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
      <ScrollIndicator containerId={containerId} />
    </div>
  )
}
