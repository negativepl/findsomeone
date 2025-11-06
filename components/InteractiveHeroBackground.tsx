'use client'

import { useEffect, useRef, useState } from 'react'

export function InteractiveHeroBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isInitialized, setIsInitialized] = useState(false)
  const [particles, setParticles] = useState<Array<{ x: number; y: number; id: number; opacity: number }>>([])
  const particleIdRef = useRef(0)

  // Set initial position to center on mount
  useEffect(() => {
    setMousePosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    })
  }, [])

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })

      // Mark as initialized on first mouse move
      if (!isInitialized) {
        setIsInitialized(true)
      }

      // Create particle trail with random spread
      const spread = 80 // pixels of random spread
      const newParticle = {
        x: e.clientX + (Math.random() - 0.5) * spread,
        y: e.clientY + (Math.random() - 0.5) * spread,
        id: particleIdRef.current++,
        opacity: 1
      }

      setParticles(prev => [...prev, newParticle].slice(-40)) // Keep last 40 particles
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [isInitialized])

  // Fade out particles
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev =>
        prev
          .map(p => ({ ...p, opacity: p.opacity - 0.05 }))
          .filter(p => p.opacity > 0)
      )
    }, 50)

    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {/* Background gradient orbs - absolute full width */}
      <div className="absolute inset-0 left-0 right-0 -top-20 bottom-0 w-full h-[calc(100%+5rem)] pointer-events-none overflow-hidden">
        <div className="absolute top-40 left-1/4 w-[800px] h-[800px] bg-brand/20 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-brand/15 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />

        {/* Mouse-following gradient */}
        <div
          className={`absolute w-[500px] h-[500px] bg-brand/15 rounded-full blur-[120px] ${!isInitialized ? 'opacity-0' : 'opacity-100 transition-opacity duration-500'}`}
          style={{
            left: `${mousePosition.x}px`,
            top: `${mousePosition.y}px`,
            transform: 'translate(-50%, -50%)',
            willChange: 'transform',
          }}
        />

        {/* Particle trail */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-brand/70 rounded-full"
            style={{
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              opacity: particle.opacity,
              transform: 'translate(-50%, -50%)',
              boxShadow: `0 0 ${15 * particle.opacity}px ${6 * particle.opacity}px hsl(var(--brand) / ${particle.opacity * 0.3})`,
              filter: `blur(${0.5 + (1 - particle.opacity)}px)`,
            }}
          />
        ))}

        {/* Gradient fade to background at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-b from-transparent to-background" />
      </div>
    </>
  )
}
