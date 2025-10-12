'use client'

import { useEffect, useRef, useState } from 'react'

interface FloatingElementProps {
  children: React.ReactNode
  delay?: number
  duration?: number
}

export function FloatingElement({ children, delay = 0, duration = 3 }: FloatingElementProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true)
          }, delay)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px',
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
  }, [delay])

  return (
    <div
      ref={ref}
      className={`transition-all ${
        isVisible
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-12 scale-95'
      }`}
      style={{
        transitionDuration: `${duration}s`,
        transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      {children}
    </div>
  )
}
