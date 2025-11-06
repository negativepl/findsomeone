'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

// Lazy load motion dla lepszej wydajności - motion.div ładowany tylko gdy komponent jest używany
const MotionDiv = dynamic(() => import('motion/react').then(mod => mod.motion.div), { ssr: true })

interface AnimatedSectionProps {
  children: React.ReactNode
  delay?: number
  className?: string
}

export function AnimatedSection({ children, delay = 0, className }: AnimatedSectionProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 } // Trigger when 10% visible
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <MotionDiv
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{
        duration: 0.5,
        delay: delay / 1000,
        ease: "easeOut",
      }}
      className={className}
    >
      {children}
    </MotionDiv>
  )
}
