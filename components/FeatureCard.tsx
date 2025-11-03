'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { LottieIcon } from '@/components/LottieIcon'

interface FeatureCardProps {
  animationPath?: string // Legacy support
  animationPathLight?: string
  animationPathDark?: string
  fallbackSvg?: React.ReactNode // Legacy support
  fallbackSvgLight?: React.ReactNode
  fallbackSvgDark?: React.ReactNode
  title: string
  description: string
}

export function FeatureCard({ 
  animationPath, 
  animationPathLight,
  animationPathDark,
  fallbackSvg, 
  fallbackSvgLight,
  fallbackSvgDark,
  title, 
  description 
}: FeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Card
      className="border border-border rounded-3xl bg-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-8 text-center">
        <div className="flex flex-col items-center mb-4">
          <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center flex-shrink-0 mb-5">
            <LottieIcon 
              animationPath={animationPath}
              animationPathLight={animationPathLight}
              animationPathDark={animationPathDark}
              fallbackSvg={fallbackSvg}
              fallbackSvgLight={fallbackSvgLight}
              fallbackSvgDark={fallbackSvgDark}
              className="w-12 h-12" 
              isHovered={isHovered} 
            />
          </div>
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  )
}
