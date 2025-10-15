'use client'

import { useState, useEffect } from 'react'

interface PostDetailClientWrapperProps {
  children: React.ReactNode
  postTitle: string
}

export function PostDetailClientWrapper({ children, postTitle }: PostDetailClientWrapperProps) {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

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

  return (
    <>
      {/* Title below navbar - Mobile only */}
      <div className={`md:hidden fixed top-[60px] left-0 right-0 z-30 transition-transform duration-300 ${
        isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        {/* White background extending to the top */}
        <div className="absolute inset-0 -top-[60px] bg-white" />

        {/* Content */}
        <div className="relative bg-white border-b border-black/5 px-4 pt-6 pb-4">
          <h1 className="text-lg font-bold text-black leading-tight">{postTitle}</h1>
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div className="md:hidden h-[60px]" />

      {children}
    </>
  )
}
