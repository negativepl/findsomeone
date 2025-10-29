'use client'

import { useEffect, useRef, useState } from 'react'
import Lottie from 'lottie-react'

interface LottieIconProps {
  animationPath: string
  fallbackSvg: React.ReactNode
  className?: string
  isHovered?: boolean
}

export function LottieIcon({ animationPath, fallbackSvg, className, isHovered = false }: LottieIconProps) {
  const lottieRef = useRef<any>(null)
  const [animationData, setAnimationData] = useState<any>(null)
  const [hasHovered, setHasHovered] = useState(false)

  useEffect(() => {
    // Only load animation after first hover (lazy loading)
    if (isHovered && !hasHovered) {
      setHasHovered(true)
      fetch(animationPath)
        .then(response => response.json())
        .then(data => {
          setAnimationData(data)
          // Auto-play animation after loading if still hovered
          setTimeout(() => {
            if (lottieRef.current && isHovered) {
              lottieRef.current.play()
            }
          }, 50)
        })
        .catch(error => console.error('Error loading animation:', error))
    }
  }, [isHovered, animationPath, hasHovered])

  useEffect(() => {
    if (lottieRef.current && animationData) {
      if (isHovered) {
        lottieRef.current.play()
      } else {
        lottieRef.current.stop()
      }
    }
  }, [isHovered, animationData])

  // Show SVG fallback if animation not loaded yet
  if (!animationData) {
    return <div className={className}>{fallbackSvg}</div>
  }

  return (
    <div className={className}>
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={false}
        autoplay={false}
      />
    </div>
  )
}
