'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

interface ScrollArrowsProps {
  containerId: string
}

export function ScrollArrows({ containerId }: ScrollArrowsProps) {
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = () => {
    const container = document.getElementById(containerId)
    if (container) {
      const canLeft = container.scrollLeft > 0
      const canRight = container.scrollLeft < container.scrollWidth - container.clientWidth - 1

      setCanScrollLeft(canLeft)
      setCanScrollRight(canRight)
    }
  }

  useEffect(() => {
    const container = document.getElementById(containerId)
    if (!container) return

    // Check initial state
    checkScroll()

    // Add scroll listener
    container.addEventListener('scroll', checkScroll)

    // Add resize listener to recheck on window resize
    window.addEventListener('resize', checkScroll)

    return () => {
      container.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [containerId])

  const scrollLeft = () => {
    const container = document.getElementById(containerId)
    if (container) {
      const scrollAmount = container.clientWidth
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    const container = document.getElementById(containerId)
    if (container) {
      const scrollAmount = container.clientWidth
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={scrollLeft}
        className={`hidden md:flex absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 rounded-full border-2 border-border hover:border-border hover:bg-card bg-card/90 backdrop-blur-sm shadow-lg h-12 w-12 transition-all duration-300 ${
          canScrollLeft ? 'opacity-0 group-hover/section:opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-label="Przewiń w lewo"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={scrollRight}
        className={`hidden md:flex absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-20 rounded-full border-2 border-border hover:border-border hover:bg-card bg-card/90 backdrop-blur-sm shadow-lg h-12 w-12 transition-all duration-300 ${
          canScrollRight ? 'opacity-0 group-hover/section:opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-label="Przewiń w prawo"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Button>
    </>
  )
}
