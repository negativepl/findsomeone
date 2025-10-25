'use client'

import { useEffect, useState, useRef } from 'react'

interface ScrollIndicatorProps {
  containerId: string
}

export function ScrollIndicator({ containerId }: ScrollIndicatorProps) {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [totalDots, setTotalDots] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)
  const [initialDotsCalculated, setInitialDotsCalculated] = useState(false)

  const checkScroll = () => {
    const container = document.getElementById(containerId)
    if (container) {
      const scrollWidth = container.scrollWidth - container.clientWidth
      const scrolled = container.scrollLeft
      const progress = scrollWidth > 0 ? (scrolled / scrollWidth) * 100 : 0
      setScrollProgress(progress)

      // Calculate number of dots based on content width
      // Each "page" is roughly the visible width
      const pages = Math.ceil(container.scrollWidth / container.clientWidth)
      const newTotalDots = Math.min(pages, 10) // Max 10 dots

      // Update totalDots
      setTotalDots(newTotalDots)

      // Mark as calculated on first successful check
      if (!initialDotsCalculated && newTotalDots > 0) {
        setInitialDotsCalculated(true)
      }
    }
  }

  useEffect(() => {
    const container = document.getElementById(containerId)
    if (container) {
      // Check immediately
      checkScroll()

      // Check after delays for image loading
      const timeouts = [50, 100, 200, 500].map(delay =>
        setTimeout(checkScroll, delay)
      )

      // Add listeners
      container.addEventListener('scroll', checkScroll)
      window.addEventListener('resize', checkScroll)

      const resizeObserver = new ResizeObserver(checkScroll)
      resizeObserver.observe(container)

      // Listen to image loads
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

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault() // Prevent default touch behavior
    setIsDragging(true)
    handleDrag(e)
  }

  const handleDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (!trackRef.current) return

    // Prevent scrolling on touch devices
    if ('touches' in e) {
      e.preventDefault()
    }

    const track = trackRef.current
    const rect = track.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const x = clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))

    // Scroll container to this position
    const container = document.getElementById(containerId)
    if (container) {
      const scrollWidth = container.scrollWidth - container.clientWidth
      container.scrollLeft = (percentage / 100) * scrollWidth
    }
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => handleDrag(e as any)
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault() // Prevent scrolling while dragging
      handleDrag(e as any)
    }
    const handleUp = () => handleDragEnd()

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('mouseup', handleUp)
    window.addEventListener('touchend', handleUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('mouseup', handleUp)
      window.removeEventListener('touchend', handleUp)
    }
  }, [isDragging, containerId])

  // Don't show if not yet calculated or only 1 page
  if (!initialDotsCalculated || totalDots <= 1) {
    return null
  }

  // Track bar width - proportional to number of pages
  const trackWidth = Math.min(totalDots * 20, 200) // Max 200px
  const indicatorWidth = trackWidth / totalDots // Each page gets equal space

  return (
    <div className="flex justify-center mt-6">
      {/* Track container wrapper with larger hit area */}
      <div
        className="relative cursor-pointer select-none"
        style={{
          width: `${trackWidth}px`,
          padding: '12px 0', // Larger vertical hit area
        }}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      >
        {/* Visible track - shows total length */}
        <div
          ref={trackRef}
          className="relative bg-black/10 rounded-full pointer-events-none"
          style={{
            width: `${trackWidth}px`,
            height: isDragging ? '8px' : '4px',
            transition: 'height 200ms ease-out'
          }}
        >
          {/* Active indicator - slides smoothly inside track */}
          <div
            className="absolute top-0 h-full rounded-full"
            style={{
              left: `${scrollProgress}%`,
              width: `${indicatorWidth}px`,
              background: '#C44E35',
              transform: 'translateX(-50%)',
              boxShadow: isDragging ? '0 0 0 4px rgba(196, 78, 53, 0.2)' : 'none',
              transition: 'box-shadow 200ms ease-out'
            }}
          />
        </div>
      </div>
    </div>
  )
}
