'use client'

import { useEffect, useRef, ReactNode } from 'react'

interface ScrollZoomProps {
  children: ReactNode
  direction?: 'in' | 'out'
  className?: string
}

export function ScrollZoom({ children, direction = 'in', className = '' }: ScrollZoomProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            element.classList.add(direction === 'in' ? 'animate-zoom-in' : 'animate-zoom-out')
          }
        })
      },
      {
        threshold: 0.2,
        rootMargin: '0px',
      }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [direction])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
