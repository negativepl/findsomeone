'use client'

import { useEffect, useRef, useState } from 'react'

interface AnimatedGradientProps {
  children: React.ReactNode
  delay?: number
}

export function AnimatedGradient({ children, delay = 0 }: AnimatedGradientProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

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
        threshold: 0.5,
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
    <span
      ref={ref}
      className={`inline-block font-semibold transition-all duration-1000 ease-out ${
        isVisible
          ? 'bg-gradient-to-r from-[#1A1A1A] to-[#C44E35] bg-clip-text text-transparent'
          : 'text-black/70'
      }`}
      style={{
        backgroundSize: isVisible ? '100% 100%' : '0% 100%',
        backgroundPosition: 'left center',
      }}
    >
      {children}
    </span>
  )
}
