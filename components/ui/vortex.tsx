'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface VortexProps {
  children?: React.ReactNode
  className?: string
  containerClassName?: string
  particleCount?: number
  baseHue?: number
  backgroundColor?: string
  rangeSpeed?: number
  baseRadius?: number
}

export function Vortex({
  children,
  className,
  containerClassName,
  particleCount = 500,
  baseHue = 15, // Orange hue for #C44E35
  backgroundColor = '#1A1A1A',
  rangeSpeed = 1.5,
  baseRadius = 1,
}: VortexProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let particles: Particle[] = []

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    class Particle {
      x!: number
      y!: number
      radius!: number
      speed!: number
      angle!: number
      angleSpeed!: number
      hue!: number
      opacity!: number

      constructor() {
        this.reset()
      }

      reset() {
        this.x = Math.random() * canvas!.width
        this.y = Math.random() * canvas!.height
        this.radius = baseRadius + Math.random() * 2
        this.speed = 0.2 + Math.random() * rangeSpeed
        this.angle = Math.random() * Math.PI * 2
        this.angleSpeed = (Math.random() - 0.5) * 0.02
        this.hue = baseHue + Math.random() * 30 - 15 // Vary hue slightly
        this.opacity = 0.3 + Math.random() * 0.4
      }

      update() {
        // Move in a swirling pattern
        this.angle += this.angleSpeed
        const dx = Math.cos(this.angle) * this.speed
        const dy = Math.sin(this.angle) * this.speed

        this.x += dx
        this.y += dy

        // Reset if out of bounds
        if (
          this.x < -50 ||
          this.x > canvas!.width + 50 ||
          this.y < -50 ||
          this.y > canvas!.height + 50
        ) {
          this.reset()
        }
      }

      draw() {
        if (!ctx) return
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${this.hue}, 70%, 50%, ${this.opacity})`
        ctx.fill()
      }
    }

    const init = () => {
      particles = []
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle())
      }
    }

    const animate = () => {
      if (!ctx || !canvas) return

      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        particle.update()
        particle.draw()
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    resizeCanvas()
    init()
    animate()

    window.addEventListener('resize', () => {
      resizeCanvas()
      init()
    })

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [particleCount, baseHue, backgroundColor, rangeSpeed, baseRadius])

  return (
    <div className={cn('relative w-full h-full overflow-hidden', containerClassName)}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ background: backgroundColor }}
      />
      {children && (
        <div className={cn('relative z-10', className)}>{children}</div>
      )}
    </div>
  )
}
