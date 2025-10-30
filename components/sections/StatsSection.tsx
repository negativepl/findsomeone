'use client'

import { HomepageSection } from '@/lib/homepage-sections/types'
import { useEffect, useState, useRef } from 'react'
import * as LucideIcons from 'lucide-react'

interface StatsSectionProps {
  section: HomepageSection
}

export function StatsSection({ section }: StatsSectionProps) {
  const config = section.config as any
  const stats = config.stats || []
  const layout = config.layout || 'horizontal'
  const columns = config.columns || 4
  const animate = config.animate !== false
  const [counts, setCounts] = useState<number[]>([])
  const [hasAnimated, setHasAnimated] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCounts(stats.map(() => 0))
  }, [stats])

  useEffect(() => {
    if (!animate || hasAnimated) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setHasAnimated(true)
            stats.forEach((stat: any, index: number) => {
              const target = stat.number
              const duration = 2000
              const steps = 60
              const increment = target / steps
              let current = 0

              const timer = setInterval(() => {
                current += increment
                if (current >= target) {
                  setCounts((prev) => {
                    const newCounts = [...prev]
                    newCounts[index] = target
                    return newCounts
                  })
                  clearInterval(timer)
                } else {
                  setCounts((prev) => {
                    const newCounts = [...prev]
                    newCounts[index] = Math.floor(current)
                    return newCounts
                  })
                }
              }, duration / steps)
            })
          }
        })
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [stats, animate, hasAnimated])

  if (stats.length === 0) {
    return (
      <section className="py-12 md:py-14">
        <div className="container mx-auto px-6">
          <div className="text-center text-black/40 py-12 border-2 border-dashed border-black/10 rounded-2xl">
            Brak statystyk. Dodaj statystyki w konfiguracji sekcji.
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

  const gridClass = columnClasses[columns as keyof typeof columnClasses] || columnClasses[4]

  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName]
    if (IconComponent) {
      return <IconComponent className="w-8 h-8 text-[#C44E35]" />
    }
    return null
  }

  return (
    <section ref={sectionRef} className="py-12 md:py-14">
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

        {layout === 'horizontal' ? (
          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            {stats.map((stat: any, index: number) => (
              <div
                key={index}
                className="text-center flex-shrink-0"
              >
                {stat.icon && (
                  <div className="flex justify-center mb-3">
                    {getIcon(stat.icon)}
                  </div>
                )}

                <div className="text-4xl md:text-5xl font-bold text-[#C44E35] mb-2">
                  {stat.prefix}
                  {animate ? counts[index] : stat.number}
                  {stat.suffix}
                </div>

                <div className="text-lg text-black/70 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`grid grid-cols-2 ${gridClass} gap-8`}>
            {stats.map((stat: any, index: number) => (
              <div
                key={index}
                className="text-center"
              >
                {stat.icon && (
                  <div className="flex justify-center mb-3">
                    {getIcon(stat.icon)}
                  </div>
                )}

                <div className="text-4xl md:text-5xl font-bold text-[#C44E35] mb-2">
                  {stat.prefix}
                  {animate ? counts[index] : stat.number}
                  {stat.suffix}
                </div>

                <div className="text-lg text-black/70 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
