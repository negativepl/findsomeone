'use client'

import { useState, useEffect, useRef } from 'react'

interface PostDetailClientWrapperProps {
  children: React.ReactNode
  postTitle: string
}

export function PostDetailClientWrapper({ children, postTitle }: PostDetailClientWrapperProps) {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [showLeftGradient, setShowLeftGradient] = useState(false)
  const [showRightGradient, setShowRightGradient] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Handle scroll to show/hide header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down & past threshold
        setIsHeaderVisible(false)
      } else {
        // Scrolling up
        setIsHeaderVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  // Handle horizontal scroll to show/hide gradients
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const updateGradients = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container
      setShowLeftGradient(scrollLeft > 0)
      setShowRightGradient(scrollLeft < scrollWidth - clientWidth - 1)
    }

    // Initial check
    updateGradients()

    // Check on scroll
    container.addEventListener('scroll', updateGradients)

    // Check on resize
    const resizeObserver = new ResizeObserver(updateGradients)
    resizeObserver.observe(container)

    return () => {
      container.removeEventListener('scroll', updateGradients)
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <>
      {/* Title below navbar - Mobile only */}
      <div className={`md:hidden fixed top-[60px] left-0 right-0 z-30 transition-transform duration-300 ${
        isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        {/* White background extending to the top */}
        <div className="absolute inset-0 -top-[60px] bg-card" />

        {/* Content */}
        <div className="relative bg-card border-b border-border pt-5 pb-4">
          <div ref={scrollContainerRef} className="overflow-x-auto scrollbar-hide">
            <h1 className="text-base font-bold text-foreground leading-tight whitespace-nowrap px-4 inline-block min-w-full">{postTitle}</h1>
          </div>
          {/* Left gradient */}
          <div className={`absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-card to-transparent pointer-events-none transition-opacity duration-300 ${
            showLeftGradient ? 'opacity-100' : 'opacity-0'
          }`} />
          {/* Right gradient */}
          <div className={`absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card to-transparent pointer-events-none transition-opacity duration-300 ${
            showRightGradient ? 'opacity-100' : 'opacity-0'
          }`} />
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div className="md:hidden h-[60px]" />

      {children}
    </>
  )
}
