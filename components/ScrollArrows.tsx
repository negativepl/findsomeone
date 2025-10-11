'use client'

import { useRef } from 'react'
import { Button } from '@/components/ui/button'

interface ScrollArrowsProps {
  containerId: string
}

export function ScrollArrows({ containerId }: ScrollArrowsProps) {
  const scrollLeft = () => {
    const container = document.getElementById(containerId)
    if (container) {
      // Scroll by the width of the visible container
      const scrollAmount = container.clientWidth
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    const container = document.getElementById(containerId)
    if (container) {
      // Scroll by the width of the visible container
      const scrollAmount = container.clientWidth
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <div className="hidden md:flex gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={scrollLeft}
        className="rounded-full border-2 border-black/10 hover:border-black/30 hover:bg-black/5 h-10 w-10"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={scrollRight}
        className="rounded-full border-2 border-black/10 hover:border-black/30 hover:bg-black/5 h-10 w-10"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Button>
    </div>
  )
}
