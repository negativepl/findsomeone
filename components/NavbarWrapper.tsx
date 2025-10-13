'use client'

import { useEffect, useState } from 'react'

interface NavbarWrapperProps {
  children: React.ReactNode
  alwaysVisible?: boolean
}

export function NavbarWrapper({ children, alwaysVisible = false }: NavbarWrapperProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // If always visible, don't attach scroll listener
    if (alwaysVisible) {
      setIsVisible(true)
      return
    }

    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY

          // Show navbar when scrolling up or at the top
          if (currentScrollY < lastScrollY || currentScrollY < 10) {
            setIsVisible(true)
          }
          // Hide navbar when scrolling down and not at the top
          else if (currentScrollY > lastScrollY && currentScrollY > 100) {
            setIsVisible(false)
          }

          setLastScrollY(currentScrollY)
          ticking = false
        })

        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [lastScrollY, alwaysVisible])

  // Prevent hydration mismatch by rendering static on server
  if (!mounted) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50">
        {children}
      </div>
    )
  }

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      {children}
    </div>
  )
}
