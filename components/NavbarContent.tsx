'use client'

import { useEffect, useState } from 'react'

interface NavbarContentProps {
  children: React.ReactNode
}

export function NavbarContent({ children }: NavbarContentProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)

  useEffect(() => {
    setMounted(true)
    setIsDesktop(window.innerWidth >= 768)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [mounted])

  return (
    <div
      className="navbar-inner px-4 md:px-6 py-4 md:py-6 grid grid-cols-3 items-center gap-4"
      style={{
        paddingTop: mounted && isScrolled && isDesktop ? '0.875rem' : undefined,
        paddingBottom: mounted && isScrolled && isDesktop ? '0.875rem' : undefined,
        paddingLeft: mounted && isScrolled && isDesktop ? '1.5rem' : undefined,
        paddingRight: mounted && isScrolled && isDesktop ? '1.5rem' : undefined,
        transition: 'padding 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)',
      }}
    >
      {children}
    </div>
  )
}
