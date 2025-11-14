'use client'

import { useEffect, useState } from 'react'

export function InteractiveHeroBackground() {
  const [isVisible, setIsVisible] = useState(false)

  // Trigger fade-in on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      {/* Background gradient orbs - absolute full width */}
      <div className={`absolute inset-0 left-0 right-0 -top-20 bottom-0 w-full h-[calc(100%+5rem)] pointer-events-none overflow-hidden transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute top-40 left-1/4 w-[800px] h-[800px] bg-brand/20 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-brand/15 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />

        {/* Gradient fade to background at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-b from-transparent to-background" />
      </div>
    </>
  )
}
