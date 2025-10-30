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
        <CardContent className="p-3 md:p-6">
          <div className="flex items-center gap-2 md:gap-4 h-full min-h-[80px] md:min-h-[100px]">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-[#C44E35]/10 flex items-center justify-center flex-shrink-0">
              <LottieIcon
                animationPath={iconConfig.animationPath}
                fallbackSvg={iconConfig.fallbackSvg}
                className="w-6 h-6 md:w-8 md:h-8 text-[#C44E35]"
                isHovered={isHovered}
              />
            </div>
            <div className="flex-1 flex flex-col justify-center gap-1">
              <p className="text-xs md:text-sm text-black/60 mb-1">{title}</p>
              <div>
                <p className="text-xl md:text-3xl font-bold text-black leading-none">{count}</p>
                {subtitle && (
                  <p className="text-[10px] md:text-xs text-black/60 mt-1">{subtitle}</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
