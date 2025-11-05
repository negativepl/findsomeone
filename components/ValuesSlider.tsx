'use client'

import { useEffect } from 'react'

export function ValuesSlider() {
  useEffect(() => {
    const slider = document.getElementById('values-slider')
    if (!slider) return

    const updateDots = () => {
      const scrollLeft = slider.scrollLeft
      const itemWidth = slider.scrollWidth / 3
      const currentIndex = Math.round(scrollLeft / itemWidth)

      // Update dots
      for (let i = 1; i <= 3; i++) {
        const dot = document.getElementById(`dot-${i}`)
        if (dot) {
          if (i === currentIndex + 1) {
            dot.style.backgroundColor = 'hsl(var(--brand))'
          } else {
            dot.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
          }
        }
      }
    }

    slider.addEventListener('scroll', updateDots)
    updateDots() // Initial state

    return () => {
      slider.removeEventListener('scroll', updateDots)
    }
  }, [])

  return null
}
