'use client'

import { useEffect, useRef, ReactNode } from 'react'

interface ScrollZoomBigProps {
  children: ReactNode
  delay?: number
  className?: string
}

export function ScrollZoomBig({ children, delay = 0, className = '' }: ScrollZoomBigProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              element.classList.add('animate-zoom-in-big')
            }, delay)
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px',
      }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [delay])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
