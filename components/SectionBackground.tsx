'use client'

import { useEffect, useRef, useState } from 'react'

interface SectionBackgroundProps {
  children: React.ReactNode
  color: string
  onEnter?: () => void
}

export function SectionBackground({ children, color, onEnter }: SectionBackgroundProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
        if (entry.isIntersecting && onEnter) {
          onEnter()
        }
      },
      {
        threshold: 0.3,
        rootMargin: '-10% 0px -10% 0px',
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [onEnter])

  return (
    <div ref={ref}>
      {children}
    </div>
  )
}
