'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { LottieIcon } from './LottieIcon'

interface DashboardStatsCardProps {
  href: string
  title: string
  count: number | string
  subtitle?: string
  iconType: 'megaphone' | 'heart' | 'messages' | 'review'
}

export function DashboardStatsCard({ href, title, count, subtitle, iconType }: DashboardStatsCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getIconConfig = () => {
    switch (iconType) {
      case 'megaphone':
        return {
          animationPath: '/animations/megaphone.json',
          fallbackSvg: <img src="/icons/megaphone.svg" alt="Megaphone" className="w-full h-full" />
        }
      case 'heart':
        return {
          animationPath: '/animations/heart-favorite.json',
          fallbackSvg: <img src="/icons/heart-favorite.svg" alt="Heart" className="w-full h-full" />
        }
      case 'messages':
        return {
          animationPath: '/animations/conversation.json',
          fallbackSvg: <img src="/icons/conversation.svg" alt="Messages" className="w-full h-full" />
        }
      case 'review':
        return {
          animationPath: '/animations/review.json',
          fallbackSvg: <img src="/icons/review.svg" alt="Review" className="w-full h-full" />
        }
    }
  }

  const iconConfig = getIconConfig()

  return (
    <Link href={href}>
      <Card
        className="border-0 rounded-3xl bg-white hover:bg-[#F5F1E8] transition-all cursor-pointer h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between h-full">
            <div className="flex-1 min-h-[80px] flex flex-col justify-between">
              <p className="text-sm text-black/60 mb-2">{title}</p>
              <div>
                <p className="text-3xl font-bold text-black leading-none">{count}</p>
                {subtitle && (
                  <p className="text-xs text-black/60 mt-1">{subtitle}</p>
                )}
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center flex-shrink-0 ml-4">
              <LottieIcon
                animationPath={iconConfig.animationPath}
                fallbackSvg={iconConfig.fallbackSvg}
                className="w-6 h-6 text-[#C44E35]"
                isHovered={isHovered}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
