'use client'

import { useEffect, useState } from 'react'

interface Shape {
  id: number
  type: 'circle' | 'square' | 'triangle'
  x: number
  y: number
  size: number
  rotation: number
  speed: number
  color: string
  opacity: number
}

interface GeometricShapesProps {
  theme?: 'light' | 'dark' | 'accent'
  density?: 'low' | 'medium' | 'high'
  animated?: boolean
}

export function GeometricShapes({
  theme = 'light',
  density = 'medium',
  animated = true
}: GeometricShapesProps) {
  const [shapes, setShapes] = useState<Shape[]>([])

  useEffect(() => {
    const shapeCount = density === 'low' ? 3 : density === 'medium' ? 5 : 8

    // Get CSS variable colors from computed styles
    const root = document.documentElement
    const brandColor = getComputedStyle(root).getPropertyValue('--brand').trim()

    const colors = {
      light: [`oklch(from ${brandColor} l c h / 0.05)`, `oklch(from ${brandColor} l c h / 0.08)`, `oklch(from ${brandColor} l c h / 0.03)`],
      dark: [`oklch(from ${brandColor} l c h / 0.15)`, `oklch(from ${brandColor} l c h / 0.20)`, 'rgba(255, 255, 255, 0.05)'],
      accent: [`oklch(from ${brandColor} l c h / 0.25)`, `oklch(from ${brandColor} l c h / 0.20)`, 'rgba(255, 255, 255, 0.08)']
    }

    const newShapes: Shape[] = Array.from({ length: shapeCount }, (_, i) => ({
      id: i,
      type: ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)] as Shape['type'],
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 100 + Math.random() * 300,
      rotation: Math.random() * 360,
      speed: 0.5 + Math.random() * 1,
      color: colors[theme][Math.floor(Math.random() * colors[theme].length)],
      opacity: 0.3 + Math.random() * 0.4
    }))

    setShapes(newShapes)
  }, [theme, density])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {shapes.map((shape) => (
        <div
          key={shape.id}
          className={`absolute ${animated ? 'animate-float-slow' : ''}`}
          style={{
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            width: `${shape.size}px`,
            height: `${shape.size}px`,
            transform: `rotate(${shape.rotation}deg)`,
            animationDelay: `${shape.id * 0.5}s`,
            animationDuration: `${15 + shape.speed * 10}s`,
            opacity: shape.opacity
          }}
        >
          {shape.type === 'circle' && (
            <div
              className="w-full h-full rounded-full blur-2xl"
              style={{ backgroundColor: shape.color }}
            />
          )}
          {shape.type === 'square' && (
            <div
              className="w-full h-full blur-2xl"
              style={{
                backgroundColor: shape.color,
                borderRadius: '30%'
              }}
            />
          )}
          {shape.type === 'triangle' && (
            <div
              className="w-full h-full blur-2xl"
              style={{
                background: `conic-gradient(from 0deg, ${shape.color}, transparent 120deg, ${shape.color} 240deg, transparent)`,
                borderRadius: '40%'
              }}
            />
          )}
        </div>
      ))}
    </div>
  )
}
