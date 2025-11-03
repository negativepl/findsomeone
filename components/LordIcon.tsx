'use client'

import Lottie from 'lottie-react'
import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

interface LordIconProps {
  src?: string // Legacy support - for single animation
  srcLight?: string // Animation for light mode
  srcDark?: string // Animation for dark mode
  size?: number
  className?: string
}

export interface LordIconRef {
  trigger: () => void
}

export const LordIcon = forwardRef<LordIconRef, LordIconProps>(
  ({ src, srcLight, srcDark, size = 20, className = '' }, ref) => {
    const [animationData, setAnimationData] = useState<any>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const lottieRef = useRef<any>(null)
    const prevHoveredRef = useRef(false)
    const { theme } = useTheme()

    // Determine which animation path to use based on theme
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    const currentSrc = srcLight && srcDark
      ? (isDark ? srcDark : srcLight)
      : src // Fallback to legacy single path

    useEffect(() => {
      if (currentSrc) {
        fetch(currentSrc)
          .then(res => res.json())
          .then(data => {
            setAnimationData(data)
            // Reset animation when theme changes
            if (lottieRef.current) {
              lottieRef.current.goToAndStop(0)
            }
            setIsPlaying(false)
            prevHoveredRef.current = false
          })
          .catch(err => console.error('Failed to load animation:', err))
      }
    }, [currentSrc])

    useImperativeHandle(ref, () => ({
      trigger: () => {
        // Only trigger if not already playing and not recently triggered
        if (lottieRef.current && !isPlaying && !prevHoveredRef.current) {
          lottieRef.current.goToAndPlay(0, true)
          setIsPlaying(true)
          prevHoveredRef.current = true
        }
      }
    }))

    const handleComplete = () => {
      setIsPlaying(false)
      if (lottieRef.current) {
        lottieRef.current.goToAndStop(0)
      }
      // Reset hover state after a small delay to allow re-triggering
      setTimeout(() => {
        prevHoveredRef.current = false
      }, 100)
    }

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
            onComplete={handleComplete}
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
