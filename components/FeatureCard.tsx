'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { LottieIcon } from '@/components/LottieIcon'

interface FeatureCardProps {
  animationPath: string
  title: string
  description: string
}

export function FeatureCard({ animationPath, title, description }: FeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Card
      className="border-0 rounded-3xl bg-white shadow-sm"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-8 text-center">
        <div className="flex flex-col items-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center flex-shrink-0 mb-3">
            <LottieIcon animationPath={animationPath} className="w-7 h-7" isHovered={isHovered} />
          </div>
          <h3 className="text-2xl font-bold text-black">{title}</h3>
        </div>
        <p className="text-black/60 leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  )
}
