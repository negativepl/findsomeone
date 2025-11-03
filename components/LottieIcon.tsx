'use client'

import { useEffect, useRef, useState } from 'react'
import Lottie from 'lottie-react'
import { useTheme } from '@/contexts/ThemeContext'

interface LottieIconProps {
  animationPath?: string // Legacy support - for single animation
  animationPathLight?: string // Animation for light mode
  animationPathDark?: string // Animation for dark mode
  fallbackSvg?: React.ReactNode // Legacy support
  fallbackSvgLight?: React.ReactNode // SVG for light mode
  fallbackSvgDark?: React.ReactNode // SVG for dark mode
  className?: string
  isHovered?: boolean
}

export function LottieIcon({
  animationPath,
  animationPathLight,
  animationPathDark,
  fallbackSvg,
  fallbackSvgLight,
  fallbackSvgDark,
  className,
  isHovered = false
}: LottieIconProps) {
  const lottieRef = useRef<any>(null)
  const [animationData, setAnimationData] = useState<any>(null)
  const [hasHovered, setHasHovered] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light')
  const prevHoveredRef = useRef(false)
  const { theme } = useTheme()

  // Mount detection
  useEffect(() => {
    setMounted(true)
    // Also set initial theme from DOM
    const isDark = document.documentElement.classList.contains('dark')
    setCurrentTheme(isDark ? 'dark' : 'light')
  }, [])

  // Detect theme changes for animation loading
  useEffect(() => {
    if (!mounted) return
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setCurrentTheme(isDark ? 'dark' : 'light')
  }, [theme, mounted])

  // Determine which animation path to use based on theme
  const currentAnimationPath = animationPathLight && animationPathDark
    ? (currentTheme === 'dark' ? animationPathDark : animationPathLight)
    : animationPath // Fallback to legacy single path

  const currentFallbackSvg = fallbackSvgLight && fallbackSvgDark
    ? (currentTheme === 'dark' ? fallbackSvgDark : fallbackSvgLight)
    : fallbackSvg // Fallback to legacy single SVG

  useEffect(() => {
    // Only load animation after first hover (lazy loading)
    if (isHovered && !hasHovered && currentAnimationPath) {
      setHasHovered(true)
      fetch(currentAnimationPath)
        .then(response => response.json())
        .then(data => {
          setAnimationData(data)
          // Auto-play animation after loading if still hovered
          setTimeout(() => {
            if (lottieRef.current && isHovered) {
              lottieRef.current.play()
              setIsPlaying(true)
            }
          }, 50)
        })
        .catch(error => console.error('Error loading animation:', error))
    }
  }, [isHovered, currentAnimationPath, hasHovered])

  // Reload animation when theme changes (if already hovered)
  useEffect(() => {
    if (hasHovered && currentAnimationPath) {
      fetch(currentAnimationPath)
        .then(response => response.json())
        .then(data => {
          setAnimationData(data)
          if (lottieRef.current) {
            lottieRef.current.goToAndStop(0)
          }
          setIsPlaying(false)
        })
        .catch(error => console.error('Error loading animation:', error))
    }
  }, [theme, currentAnimationPath, hasHovered])

  useEffect(() => {
    // Only play when transitioning from not-hovered to hovered
    const justHovered = isHovered && !prevHoveredRef.current

    if (lottieRef.current && animationData && justHovered && !isPlaying) {
      // Reset to beginning and start animation
      lottieRef.current.goToAndPlay(0)
      setIsPlaying(true)
    }

    // Update previous hover state
    prevHoveredRef.current = isHovered
  }, [isHovered, animationData, isPlaying])

  // Handle animation complete
  const handleComplete = () => {
    setIsPlaying(false)
    // Reset animation to beginning when complete
    if (lottieRef.current) {
      lottieRef.current.goToAndStop(0)
    }
  }

  // Show SVG fallback if animation not loaded yet
  if (!animationData) {
    // Show nothing until mounted to avoid flash
    if (!mounted) {
      return <div className={className} />
    }
    // Render only the appropriate SVG based on current theme
    return <div className={className}>{currentFallbackSvg}</div>
  }

  return (
    <div className={className}>
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={false}
        autoplay={false}
        onComplete={handleComplete}
      />
    </div>
  )
}
