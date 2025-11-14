'use client'

import { useEffect, useRef, useState } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
}

export function FullInteractiveBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const lastParticleTime = useRef(0)

  // Trigger fade-in on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        })

        // Add particle trail (throttled)
        const now = Date.now()
        if (now - lastParticleTime.current > 50) {
          lastParticleTime.current = now
          setParticles(prev => [
            ...prev.slice(-20), // Keep only last 20 particles
            {
              x: e.clientX - rect.left,
              y: e.clientY - rect.top,
              vx: (Math.random() - 0.5) * 2,
              vy: (Math.random() - 0.5) * 2,
              life: 1,
            },
          ])
        }
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Animate particles
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev =>
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vx: p.vx * 0.95,
            vy: p.vy * 0.95,
            life: p.life - 0.02,
          }))
          .filter(p => p.life > 0)
      )
    }, 16)

    return () => clearInterval(interval)
  }, [])

  // Generate random particles automatically
  useEffect(() => {
    const generateRandomParticle = () => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const x = Math.random() * rect.width
      const y = Math.random() * rect.height

      setParticles(prev => [
        ...prev.slice(-30), // Keep only last 30 particles
        {
          x,
          y,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          life: 1,
        },
      ])
    }

    const interval = setInterval(generateRandomParticle, 200) // New particle every 200ms

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 left-0 right-0 -top-20 bottom-0 w-full h-[calc(100%+5rem)] pointer-events-none overflow-hidden transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* Background gradient orbs */}
      <div className="absolute top-40 left-1/4 w-[800px] h-[800px] bg-brand/20 rounded-full blur-[150px] animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-brand/15 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Mouse-following gradient */}
      <div
        className="absolute w-[600px] h-[600px] bg-brand/30 rounded-full blur-[120px]"
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Particle trail */}
      {particles.map((particle, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-brand/50 rounded-full"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            opacity: particle.life,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}

      {/* Gradient fade to background at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-b from-transparent to-background" />
    </div>
  )
}
