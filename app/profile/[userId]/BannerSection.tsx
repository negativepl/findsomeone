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
  const [mounted, setMounted] = useState(false)

  // Fix hydration mismatch by only applying transform after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Convert position (0-100) to CSS object-position value
  const getObjectPosition = (pos: number) => {
    return `center ${pos}%`
  }

  return (
    <div className="w-full aspect-[3/1] relative bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
      <div
        style={{
          transform: mounted ? `scale(${scale / 100})` : 'scale(1)',
          transformOrigin: getObjectPosition(position),
          width: '100%',
          height: '100%',
          position: 'relative',
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
