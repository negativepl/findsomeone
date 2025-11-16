'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { BannerPositionEditor } from './BannerPositionEditor'

interface BannerSectionProps {
  bannerUrl: string
  initialPosition: number
  initialScale: number
  userId: string
  isOwnProfile: boolean
}

export function BannerSection({ bannerUrl, initialPosition, initialScale, userId, isOwnProfile }: BannerSectionProps) {
  const [position, setPosition] = useState(initialPosition)
  const [scale, setScale] = useState(initialScale)

  // Update state when initial values change (e.g., after data fetch)
  useEffect(() => {
    setPosition(initialPosition)
    setScale(initialScale)
  }, [initialPosition, initialScale])

  // Convert position (0-100) to CSS object-position value
  const getObjectPosition = (pos: number) => {
    return `center ${pos}%`
  }

  return (
    <div className="w-full relative bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden h-[280px] md:h-[360px]">
      <div
        style={{
          transform: `scale(${scale / 100})`,
          transformOrigin: getObjectPosition(position),
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          transition: 'transform 0.2s ease-out'
        }}
      >
        <Image
          src={bannerUrl}
          alt="Profile banner"
          fill
          className="object-cover"
          style={{ objectPosition: getObjectPosition(position) }}
          sizes="100vw"
          quality={90}
          priority
          unoptimized={process.env.NODE_ENV === 'development'}
        />
      </div>

      {isOwnProfile && (
        <BannerPositionEditor
          userId={userId}
          initialPosition={initialPosition}
          initialScale={initialScale}
          onPositionChange={setPosition}
          onScaleChange={setScale}
        />
      )}
    </div>
  )
}
