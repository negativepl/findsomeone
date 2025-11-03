'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CategoryIcon } from '@/lib/category-icons'

interface Category {
  id: string
  name: string
  slug: string
  icon: string
  post_count: number
}

interface CategoryHoverCardGridProps {
  categories: Category[]
}

export function CategoryHoverCardGrid({ categories }: CategoryHoverCardGridProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-3 lg:gap-4">
      {categories.map((category, index) => (
        <Link
          key={category.id}
          href={`/posts?category=${category.slug}`}
          className="relative group"
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
            className="relative h-full rounded-2xl border-2 border-border bg-card p-6 md:p-4 lg:p-6"
          >
            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center min-h-[140px] md:min-h-[110px] lg:min-h-[140px]">
              {/* Icon with hover effect */}
              <div
                className={`relative w-16 h-16 md:w-12 md:h-12 lg:w-16 lg:h-16 mb-4 md:mb-3 lg:mb-4 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  hoveredId === category.id
                    ? 'bg-[#C44E35] ring-4 ring-[#C44E35]/20 shadow-lg scale-110'
                    : 'bg-[#C44E35]/10 shadow-sm'
                }`}
              >
                <CategoryIcon
                  iconName={category.icon}
                  className={`w-8 h-8 md:w-6 md:h-6 lg:w-8 lg:h-8 transition-all duration-300 ${
                    hoveredId === category.id ? 'text-white scale-110' : 'text-[#C44E35]'
                  }`}
                />
              </div>

              <h4 className={`text-lg md:text-base lg:text-lg font-bold mb-2 md:mb-1.5 lg:mb-2 transition-colors duration-300 ${
                hoveredId === category.id ? 'text-[#C44E35]' : 'text-foreground'
              }`}>
                {category.name}
              </h4>
              <span className="inline-flex items-center px-2.5 py-1 md:px-2 md:py-0.5 lg:px-2.5 lg:py-1 rounded-full text-xs md:text-[11px] lg:text-xs font-medium bg-muted text-muted-foreground">
                {category.post_count} ogłoszeń
              </span>
            </div>
          </motion.div>
        </Link>
      ))}
    </div>
  )
}
