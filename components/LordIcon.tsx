'use client'

import Lottie from 'lottie-react'
import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'

interface LordIconProps {
  src: string
  size?: number
  className?: string
}

export interface LordIconRef {
  trigger: () => void
}

export const LordIcon = forwardRef<LordIconRef, LordIconProps>(
  ({ src, size = 20, className = '' }, ref) => {
    const [animationData, setAnimationData] = useState<any>(null)
    const lottieRef = useRef<any>(null)

    useEffect(() => {
      fetch(src)
        .then(res => res.json())
        .then(data => setAnimationData(data))
        .catch(err => console.error('Failed to load animation:', err))
    }, [src])

    useImperativeHandle(ref, () => ({
      trigger: () => {
        if (lottieRef.current) {
          lottieRef.current.goToAndPlay(0, true)
        }
      }
    }))

    return (
      <div
        className={`inline-flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        {animationData ? (
          <Lottie
            lottieRef={lottieRef}
            animationData={animationData}
            loop={false}
            autoplay={false}
            style={{ width: size, height: size }}
          />
        ) : (
          // Placeholder during loading - invisible but maintains space
          <div style={{ width: size, height: size, opacity: 0 }} />
        )}
      </div>
    )
  }
)

LordIcon.displayName = 'LordIcon'
