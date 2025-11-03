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
    const megaphoneSvg = (
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="none" viewBox="0 0 430 430">
        <g strokeLinejoin="round" strokeWidth="12">
          <path stroke="currentColor" strokeLinecap="round" d="m134.545 255 27.146 99.535c4.185 15.343-7.365 30.465-23.269 30.465a24.12 24.12 0 0 1-23.269-17.773L84.307 254.125"/>
          <path stroke="#c44e35" strokeLinecap="round" d="M340 150h25c22.091 0 40 17.909 40 40s-17.909 40-40 40h-25"/>
          <path stroke="currentColor" strokeLinecap="round" d="M165 125H95c-35.898 0-65 29.101-65 65s29.102 65 65 65h70"/>
          <path stroke="currentColor" d="m165 125 175-70v270l-175-70z"/>
          <path stroke="#c44e35" strokeLinecap="round" d="M96 169h35m-35 40h35"/>
        </g>
      </svg>
    )

    const heartSvg = (
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="none" viewBox="0 0 430 430">
        <g strokeLinecap="round" strokeLinejoin="round" strokeWidth="12">
          <path stroke="currentColor" strokeMiterlimit="14" d="M359.9 230c20-20 30-46.2 30-72.4s-10-52.4-30-72.4c-17-17.2-38.6-26.9-60.9-29.4-29.9-3.4-61 6.4-83.9 29.4l-.1.1-.1-.1c-20-20-46.2-30-72.4-30s-52.4 10-72.4 30C30 125.1 30 190 70 230l145 145z"/>
          <path stroke="#c44e35" strokeMiterlimit="10.92" d="M178.4 91c-11.1-5.6-22.4-9.5-31.4-9.5-20.5 0-40.9 7.8-56.5 23.4-11.2 11.2-18.4 24.8-21.5 39.2"/>
        </g>
      </svg>
    )

    const consultationSvg = (
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="none" viewBox="0 0 430 430">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="12" d="M130 290c16.569 0 30-13.431 30-30s-13.431-30-30-30-30 13.431-30 30 13.431 30 30 30"/>
        <path stroke="currentColor" strokeLinejoin="round" strokeWidth="12" d="M65 360c0-24.853 20.147-45 45-45h40c24.853 0 45 20.147 45 45v15H65z"/>
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="12" d="M300 290c16.569 0 30-13.431 30-30s-13.431-30-30-30-30 13.431-30 30 13.431 30 30 30"/>
        <path stroke="currentColor" strokeLinejoin="round" strokeWidth="12" d="M235 360c0-24.853 20.147-45 45-45h40c24.853 0 45 20.147 45 45v15H235z"/>
        <mask id="hJyYVEpUoTa" width="215" height="173" x="41" y="27" maskUnits="userSpaceOnUse" style={{maskType:'alpha'}}>
          <path fill="#D9D9D9" d="M255.158 27.934H41.376v171.492h213.782v-30.987L250 165h-45c-11.046 0-20-8.954-20-20V90c0-11.046 8.954-20 20-20h50.158z"/>
        </mask>
        <g mask="url(#hJyYVEpUoTa)">
          <path stroke="#c44e35" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="12" d="M75 45c-11.046 0-20 8.954-20 20v60c0 11.046 8.954 20 20 20h45v40l60-40h45c11.046 0 20-8.954 20-20V65c0-11.046-8.954-20-20-20z"/>
        </g>
        <path stroke="#c44e35" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="12" d="M205 70c-11.046 0-20 8.954-20 20v55c0 11.046 8.954 20 20 20h45l60 40v-40h45c11.046 0 20-8.954 20-20V90c0-11.046-8.954-20-20-20z"/>
      </svg>
    )

    const reviewSvg = (
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="none" viewBox="0 0 430 430">
        <g strokeLinejoin="round" strokeWidth="12">
          <path stroke="#c44e35" strokeLinecap="round" d="m90 300 14.548 24.977 28.25 6.117-19.259 21.554 2.911 28.758L90 369.75l-26.45 11.656 2.911-28.758-19.258-21.554 28.25-6.117zm125 0 14.548 24.977 28.25 6.117-19.259 21.554 2.911 28.758L215 369.75l-26.45 11.656 2.911-28.758-19.259-21.554 28.25-6.117zm125 0 14.548 24.977 28.25 6.117-19.259 21.554 2.911 28.758L340 369.75l-26.45 11.656 2.911-28.758-19.259-21.554 28.25-6.117z"/>
          <path stroke="currentColor" d="M91 111h60v134H91zm60 122.636L199.06 255h99.785c13.235 0 24.473-9.697 26.412-22.791l13.449-90.795c2.39-16.131-10.107-30.619-26.412-30.619h-54.493V54.742c0-19.188-15.552-34.742-34.736-34.742-7.586 0-13.958 5.705-14.796 13.245l-4.861 43.753c-2.813 25.322-24.216 44.479-49.694 44.479H151"/>
        </g>
      </svg>
    )

    switch (iconType) {
      case 'megaphone':
        return {
          animationPathLight: '/animations/megaphone-light.json',
          animationPathDark: '/animations/megaphone-dark.json',
          fallbackSvgLight: megaphoneSvg,
          fallbackSvgDark: megaphoneSvg
        }
      case 'heart':
        return {
          animationPathLight: '/animations/heart-favorite-light.json',
          animationPathDark: '/animations/heart-favorite-dark.json',
          fallbackSvgLight: heartSvg,
          fallbackSvgDark: heartSvg
        }
      case 'messages':
        return {
          animationPathLight: '/animations/consultation-light.json',
          animationPathDark: '/animations/consultation-dark.json',
          fallbackSvgLight: consultationSvg,
          fallbackSvgDark: consultationSvg
        }
      case 'review':
        return {
          animationPathLight: '/animations/review-light.json',
          animationPathDark: '/animations/review-dark.json',
          fallbackSvgLight: reviewSvg,
          fallbackSvgDark: reviewSvg
        }
    }
  }

  const iconConfig = getIconConfig()

  return (
    <Link href={href}>
      <Card
        className="border border-border rounded-3xl bg-card hover:bg-muted/50 transition-all cursor-pointer h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-3 md:p-6">
          <div className="flex items-center gap-2 md:gap-4 h-full min-h-[80px] md:min-h-[100px]">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-brand/10 flex items-center justify-center flex-shrink-0">
              <LottieIcon
                animationPathLight={iconConfig.animationPathLight}
                animationPathDark={iconConfig.animationPathDark}
                fallbackSvgLight={iconConfig.fallbackSvgLight}
                fallbackSvgDark={iconConfig.fallbackSvgDark}
                className="w-6 h-6 md:w-8 md:h-8"
                isHovered={isHovered}
              />
            </div>
            <div className="flex-1 flex flex-col justify-center gap-1">
              <p className="text-xs md:text-sm text-muted-foreground mb-1">{title}</p>
              <div>
                <p className="text-xl md:text-3xl font-bold text-foreground leading-none">{count}</p>
                {subtitle && (
                  <p className="text-[10px] md:text-xs text-muted-foreground mt-1">{subtitle}</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
