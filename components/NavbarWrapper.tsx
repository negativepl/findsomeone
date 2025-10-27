'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'

interface NavbarWrapperProps {
  children: React.ReactNode
}

export function NavbarWrapper({ children }: NavbarWrapperProps) {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)

  useEffect(() => {
    setMounted(true)
    setIsDesktop(window.innerWidth >= 768)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      // Interpolate from 0 to 1 between 0px and 100px scroll
      const progress = Math.min(scrollY / 100, 1)
      setScrollProgress(progress)
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
  }, [])

  if (!mounted) {
    return (
      <div className="fixed top-0 left-0 right-0" style={{ zIndex: 10000 }}>
        <div className="relative w-full" style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}>
          <div className="absolute inset-0" style={{ background: 'rgba(255, 255, 255, 1)', zIndex: 0 }} />
          <div className="relative" style={{ zIndex: 1 }}>{children}</div>
        </div>
      </div>
    )
  }

  const navbarContent = (
    <>
      <style jsx global>{`
        .user-name-text {
          display: inline-block;
          white-space: nowrap;
          overflow: hidden;
        }
      `}</style>
      <div
        className="fixed top-0 left-0 right-0"
        style={{
          zIndex: 10000,
          paddingTop: isDesktop ? `${scrollProgress * 12}px` : '0px',
          paddingLeft: isDesktop ? `${scrollProgress * 16}px` : '0px',
          paddingRight: isDesktop ? `${scrollProgress * 16}px` : '0px',
        }}
      >
      <div
        className="relative w-full"
        style={{
          borderRadius: isDesktop
            ? `${scrollProgress * 24}px ${scrollProgress * 24}px 24px 24px`
            : '0 0 24px 24px',
          maxWidth: isDesktop
            ? `calc(100vw - ${scrollProgress * 100}vw + ${scrollProgress * 1488}px)`
            : '100%',
          borderBottom: scrollProgress > 0.5 && isDesktop ? 'none' : '1px solid rgba(0, 0, 0, 0.05)',
          boxShadow: isDesktop
            ? `0 ${10 * scrollProgress}px ${40 - 8 * scrollProgress}px -${8 * scrollProgress}px rgba(0, 0, 0, ${0.1 * scrollProgress}), 0 ${6 * scrollProgress}px ${20 - 4 * scrollProgress}px -${4 * scrollProgress}px rgba(0, 0, 0, ${0.06 * scrollProgress}), 0 ${2 * scrollProgress}px ${10 - 2 * scrollProgress}px -${2 * scrollProgress}px rgba(0, 0, 0, ${0.04 * scrollProgress})`
            : 'none',
          transformOrigin: 'top center',
          marginLeft: 'auto',
          marginRight: 'auto',
          overflow: 'visible',
          transform: 'translateZ(0)',
          willChange: 'transform',
          backfaceVisibility: 'hidden',
        }}
      >
        {/* Background layer */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: '#ffffff',
            borderRadius: isDesktop
              ? `${scrollProgress * 24}px ${scrollProgress * 24}px 24px 24px`
              : '0 0 24px 24px',
            zIndex: 0,
            transform: 'translateZ(0)',
          }}
        />
        {/* Content */}
        <div
          className="relative navbar-content"
          data-scrolled={scrollProgress > 0.5}
          style={{
            zIndex: 1,
            '--scroll-progress': scrollProgress,
          } as React.CSSProperties}
        >
          {children}
        </div>
      </div>
    </div>
    </>
  )

  if (!mounted || typeof window === 'undefined') {
    return navbarContent
  }

  return createPortal(navbarContent, document.body)
}
