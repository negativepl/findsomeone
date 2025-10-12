'use client'

import { useEffect, useRef, useState } from 'react'

interface ParallaxBackgroundProps {
  speed?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  className?: string
  children?: React.ReactNode
}

export function ParallaxBackground({
  speed = 0.5,
  direction = 'up',
  className = '',
  children
}: ParallaxBackgroundProps) {
  const [offset, setOffset] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return

      const rect = ref.current.getBoundingClientRect()
      const scrollProgress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height)

      if (scrollProgress >= 0 && scrollProgress <= 1) {
        const movement = scrollProgress * 100 * speed
        setOffset(movement)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed])

  const getTransform = () => {
    switch (direction) {
      case 'up':
        return `translateY(-${offset}px)`
      case 'down':
        return `translateY(${offset}px)`
      case 'left':
        return `translateX(-${offset}px)`
      case 'right':
        return `translateX(${offset}px)`
      default:
        return 'none'
    }
  }

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transform: getTransform(),
        transition: 'transform 0.1s ease-out',
      }}
    >
      {children}
    </div>
  )
}
