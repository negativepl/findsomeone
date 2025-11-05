'use client'

import { useEffect, useRef, useState } from 'react'

interface AnimatedUnderlineProps {
  children: React.ReactNode
  delay?: number
  lightMode?: boolean
}

export function AnimatedUnderline({ children, delay = 0, lightMode = false }: AnimatedUnderlineProps) {
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
      className={`relative inline-block font-semibold ${lightMode ? 'text-white' : 'text-black'}`}
    >
      {children}
      <span
        className={`absolute bottom-0 left-0 h-[3px] ${
          lightMode
            ? 'bg-gradient-to-r from-white to-accent'
            : 'bg-gradient-to-r from-brand to-accent'
        } transition-all duration-1000 ease-out ${
          isVisible ? 'w-full' : 'w-0'
        }`}
      />
    </span>
  )
}
