'use client'

import { useEffect, useState } from 'react'

interface ScrollGradientsProps {
  containerId: string
}

export function ScrollGradients({ containerId }: ScrollGradientsProps) {
  const [showLeftGradient, setShowLeftGradient] = useState(false)
  const [showRightGradient, setShowRightGradient] = useState(true) // Start with true - assume scrollable

  const checkScroll = () => {
    const container = document.getElementById(containerId)
    if (container) {
      // Show left gradient if we can scroll left
      setShowLeftGradient(container.scrollLeft > 0)

      // Show right gradient if we can scroll right
      const canScrollRight = container.scrollLeft < container.scrollWidth - container.clientWidth - 1
      setShowRightGradient(canScrollRight)
    }
  }

  useEffect(() => {
    const container = document.getElementById(containerId)
    if (container) {
      // Check immediately
      checkScroll()

      // Also check after short delays to catch image loading
      const timeouts = [50, 100, 200, 500].map(delay =>
        setTimeout(checkScroll, delay)
      )

      // Add scroll listener
      container.addEventListener('scroll', checkScroll)

      // Add resize listener to recheck on window resize
      window.addEventListener('resize', checkScroll)

      // Use ResizeObserver to detect when container size changes
      const resizeObserver = new ResizeObserver(checkScroll)
      resizeObserver.observe(container)

      // Also observe all images inside to detect when they load
      const images = container.querySelectorAll('img')
      images.forEach(img => {
        if (!img.complete) {
          img.addEventListener('load', checkScroll)
        }
      })

      return () => {
        timeouts.forEach(clearTimeout)
        container.removeEventListener('scroll', checkScroll)
        window.removeEventListener('resize', checkScroll)
        resizeObserver.disconnect()
        images.forEach(img => {
          img.removeEventListener('load', checkScroll)
        })
      }
    }
  }, [containerId])

  return (
    <>
      {/* Left gradient */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-16 md:w-24 pointer-events-none z-20 transition-opacity duration-300 ${
          showLeftGradient ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: 'linear-gradient(to right, rgb(255, 255, 255) 0%, rgba(255, 255, 255, 0.5) 50%, transparent 100%)'
        }}
      />

      {/* Right gradient */}
      <div
        className={`absolute right-0 top-0 bottom-0 w-16 md:w-24 pointer-events-none z-20 transition-opacity duration-300 ${
          showRightGradient ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: 'linear-gradient(to left, rgb(255, 255, 255) 0%, rgba(255, 255, 255, 0.5) 50%, transparent 100%)'
        }}
      />
    </>
  )
}
