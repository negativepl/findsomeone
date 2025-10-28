'use client'

import { useEffect, useRef, useState } from 'react'
import Lottie from 'lottie-react'

interface LottieIconProps {
  animationPath: string
  className?: string
  isHovered?: boolean
}

export function LottieIcon({ animationPath, className, isHovered = false }: LottieIconProps) {
  const lottieRef = useRef<any>(null)
  const [animationData, setAnimationData] = useState<any>(null)

  useEffect(() => {
    // Load animation data
    fetch(animationPath)
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(error => console.error('Error loading animation:', error))
  }, [animationPath])

  useEffect(() => {
    if (lottieRef.current) {
      if (isHovered) {
        lottieRef.current.play()
      } else {
        lottieRef.current.stop()
      }
    }
  }, [isHovered])

  if (!animationData) {
    return <div className={className} />
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
